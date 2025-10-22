# Паттерны взаимодействия в проекте (коротко)

- UI (Form.vue) → validate(settings) → store.apply(settings)
- store.apply → lsystem-service decides worker vs sync
- if worker → worker-client.postMessage(generate settings)
- worker → chunked generation → postMessage(progress) → postMessage(result_flat + transferables)
- worker-client → store.commit result (shallowRef flat buffer)
- GeometryView.vue reads shallowRef.flat → renderer.renderFlat(flat)

---

# Пайплайн юзер-флоу подробный, пошагово

Ниже — логическое и практическое описание полного пути данных от формы до рендерера и обратно (включая воркер, abort, progress, сериализацию). Для каждого шага — что делаем, какие типы, и рекомендации по реализации.

---

## A. Пользовательский уровень (UI / Form.vue)

1. Пользователь редактирует форму (axiom, aliases, handlers, iterations, maxPoints).
2. Локально собирается DTO `LSystemSettings` (plain JS object).
   — **Валидация:** run `zod` схема — проверка: уникальность alias.symbol, корректность числовых полей, диапазон углов, iterations >=0 и т.д.
   — **Тип:** `LSystemSettings`.
3. UI предлагает два действия:
    - _Preview_: вызывает `store.preview(settings)` или `service.preview(settings)` (preview делает быстрый run, малое число итераций, без heavy buffers и расчетов промежуточных итераций).
    - _Apply_ (full): вызывает `store.apply(settings)` — запускает generation (в main thread для малых задач или в worker для heavy, с просчетом списка команд для каждого элемента истории).

**Рекомендации:**

- Для preview — используйте debounce (300ms). Preview выполняется либо в main thread (если iterations мало) либо в worker with `options.useFlat=false`.
- Всегда включайте `settings.version = CURRENT_SCHEMA_VERSION`.

---

## B. Store action / Service (Pinia action → LSystemService)

4. Pinia `action` принимает `settings`:
    - ставит `status = 'running'` и `progress = 0`.
    - генерирует `requestId = uuid()` и сохраняет (для cancel/track).
    - создает/реиспользует `WorkerClient` (см. ниже).
    - если задача маленькая (heuristic: iterations < 4 && expected points < N), можно вызвать `core.generatePatternSync(settings)` (pure function) прямо в main thread and set result immediately.
    - иначе — отправляет `WorkerRequestGenerate` в воркер: `{type:'generate', id, settings, options:{useFlat:true}}`.

**Pinia storage policy:**

- _Не кладите в store прямые большие массивы реактивно._ Вместо этого храните `shallowRef` на `FlatVertices` или храните только meta+pattern and a pointer to buffers in a service holder`.

---

## C. WorkerClient / Worker (lifecycle)

5. WorkerClient (wrapper) ensures:
    - создаёт WebWorker при первом вызове.
    - поддерживает очередь запросов и маппинг `id -> resolve/reject`.
    - поддерживает AbortController semantics: при cancel отправляет `{type:'cancel', id}` в воркер и помечает локально.
    - подписывается на `onmessage` от worker и диспатчит Pinia actions (progress/result/error).
    - при получении `result_flat` принимает transferables (ArrayBuffer), пересылает их в store через shallowRef (без копирования) — используйте `postMessage` в worker с передачей `.buffer` в transfer list.

6. Worker (на стороне воркера) — реализует итеративный pipeline:
    - получив `generate`:
        - валидирует `settings` (zod) + версия. Если несовместимость — посылает `error`.
        - запускает генерацию pattern:
            1. `pattern = generatePattern(settings.axiom, settings.aliases, settings.iterations, settings.maxPoints, abortSignal)` — pure function, chunked.
            2. После каждой итерации или каждых N команд — `postMessage({type:'progress', id, iteration, percent})`.
            3. Если abortSignal set — прерывает и постит `error`/`cancelled`.

        - интерпретирует `pattern -> commands[]` (каждый alias → command or sequence of commands). Можно не сохранять полный `commands[]` если они огромны; можно генерировать и сразу feed в geometry builder chunkwise.
        - Geometry building: `geometryBuilder.applyCommands(commandsChunk)` — builder заполняет flat buffers (Float32Array coords, offsets).
          • Builder должен работать chunked: проверять после каждой chunk, respects `maxPoints` and abort.
        - Normalization/Bounding box: compute `bbox`.
        - Финализирует buffers и posts result:
            - если `useFlat` true: `postMessage({type:'result_flat', id, resultMeta}, [coords.buffer, offsets.buffer])`
            - else: `postMessage({type:'result', id, result})` where result contains small vertices representation.

    - Worker всегда удаляет / revokes heavy temporary buffers after posting.

**Рекомендации:**

- Генерация должна быть chunked: `for each iteration { process; if(chunkTime>maxChunkMs) { postProgress; yield; checkAbort } }`.
- Не храните огромные объекты в scope долго — собирайте и отдавайте.

---

## D. Main thread: получение результатов и обновление store

7. WorkerClient получает message:
    - `progress`: обновить Pinia `progress` (calculate percent).
    - `result_flat`: worker returns separate buffers as transferables; WorkerClient создает `Float32Array(coordsBuffer)` и `Uint32Array(offsetsBuffer)` and then:
        - store.commit `status='ready'`, `progress=100`, `lastError=null`.
        - store sets `result.flat = { coords, offsets, bbox, meta }` BUT хранит через `shallowRef` (чтобы Vue не глубоко отслеживал большой массив).

    - `result` (non-flat): store sets `result.vertices` normally (use shallowRef for top-level too).
    - `error`: store sets `status='error'` and `lastError`.

**Нюанс:** обязательно пересылайте ownership буфера (transfer list) из воркера — тогда основная память не копируется.

---

## E. Renderer (GeometryView.vue и CanvasPolylineRenderer)

8. GeometryView.vue получает `props`/`computed` из store:
    - recompute `renderReady` via a small adapter:
        - if `flat` present: pass `flat` directly to renderer (fast path).
        - else: if `vertices` present: pass arrays to renderer.

9. Renderer выполняет:
    - принимает `FlatVertices`:
        - normalizes coords to viewport using `bbox` (or renderer can apply a transform matrix on draw).
        - draws using `requestAnimationFrame` for canvas; for WebGL — upload coords to GPU buffer once and draw.

    - For animated preview: renderer can read incremental updates (if worker posts partial results) — treat svg/canvas double buffering.

**Рекомендации:**

- Для Canvas: do not iterate over Float32Array and create new objects per point; draw directly using moveTo/lineTo with numeric indices.
- Для Vue reactivity: pass buffer via `:flat="flatRef"` where `flatRef` is a shallowRef — component update when ref changes, but not when contents are changed.

---

## F. ViewsGallery, Pagination

10. Если ViewsGallery хранит несколько snapshots:
    - Pagination state remains local to ViewsGallery, но содержимое (список результатов meta + pointers) — храните в store as light DTO.

---

## G. Cancel / Abort / Lifecycle

11. Cancel flow:
    - UI calls `store.cancel(requestId)` → store tells WorkerClient to `postMessage({type:'cancel', id})` and sets status `'cancelling'`.
    - Worker must listen for cancel and stop chunk processing asap; free buffers and `postMessage({type:'error' or 'cancelled', id})`.
    - WorkerClient resolves promise and store sets status `'idle'` or `'error'` accordingly.

---

## H. Cache / Memoization / Incremental recomputation

12. Cache opportunities:
    - Cache pattern → commands mapping keyed by `hash(settings.axiom + aliases + iterations)` if same grammar reused.
    - Cache commands → flat buffers for identical inputs (aggressive caching).
    - For small changes (tweak handler param) — try incremental recompute only the final interpretation phase if pattern unchanged.

**Note:** caching must respect `version` and `seed`.

---

## I. Validation & Schema migration (versioning)

13. On ingress (Form → store) and in worker, always validate incoming DTO with `zod` or `io-ts`.
14. Include `settings.version` and `message.version`. On mismatch, run migration function `migrateSettings(old)`.

---

## J. Debugging & Diagnostics

15. Provide debug modes:

- `options.debug = true` in request: worker returns `commands` snapshot for first N iterations.
- Logging: worker can return a sample of first 1000 commands as JSON (helpful for dev).
- Make sure debug info is optional (not sent in production heavy runs).

---

# Дополнительные практические замечания по типизации и имплементации

- **Discriminated unions** (поле `type`) — это must. TS тогда корректно сузит типы при switch.
- **Используйте `as const`** при конструировании литералов в tests/factories, чтобы TS сохранил literal types.
- **FlatVertices**: обязательно укажите в типе `coords: Float32Array` — удобна для Transferable; при сериализации JSON эти буферы не проходят — поэтому используйте postMessage transfer.
- **Pinia**: используйте `shallowRef` (или `ref` на объект с ссылкой) для хранения больших ресурсов, чтобы Vue не тратила время на рекурсивную реактивность.
- **WorkerMessage types**: проверяйте на входе (zod) — это защитит от несовместимости версий.

---
