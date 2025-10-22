# Проект

**Цель:** веб-приложение с модулем для генерации L-систем (строковые переписывания) и их визуализации на холсте. Архитектура: _чистые функции + «команды как данные»_, воркер-пайплайн для тяжёлых расчётов, flat-буферы для производительного рендеринга, Pinia для сериализуемого состояния (shallowRef для больших буферов).

**Стек:** Vue 3, TypeScript, Pinia, Vite, ESLint, Prettier, zod (валидация), vue-i18n, Web Worker. Рендеры: Canvas (основной), опционально WebGL/SVG (заглушки).

---

# Дерево проекта

Ниже — подробное дерево файлов/папок проекта с комментариями **где что лежит и зачем**. Дерево отражает выбранную архитектуру: **чистые функции + «команды как данные»**, воркер-пайплайн, flat-буферы для heavy задач, Pinia с `shallowRef` и чёткими TS-контрактами/валидаторами.

```
/package.json
/tsconfig.json
/.eslintrc.js
/.prettierrc
/.gitignore
/README.md
/src/
  main.ts
  app.vue
  router/
    index.ts
    routes.ts
  features/
    l-system/
      index.ts                              # точка экспорта feature (service factory)
      pages/
        LSystemPage.vue
      components/
        Form.vue
        GeometryView.vue
        ViewsGallery.vue
        RendererToggle.vue
        SettingsPresetPicker.vue
      composables/
        useFormState.ts                      # локальное управление формой + validation (zod)
        useGeometryDrawer.ts                 # thin adapter между store/ref и renderer
      services/
        lsystem-service.ts                   # high-level facade: decide worker vs sync, caching
        worker-client.ts                     # клиент-обёртка для WebWorker (requestId, cancel, progress)
        migration.ts                         # миграции настроек версий
      domain/
        core/
          generatePattern.ts                 # pure function: pattern generation (chunked, abortable)
          patternToCommands.ts               # pure function: interprets pattern -> Command[]
          commands.ts                        # фабрики/утилиты работы с командами
          geometryBuilder.ts                 # pure function(s) to build flat buffer or arrays (chunked)
          normalizer.ts                       # bbox calc, normalization helpers
        types.ts                             # TS контракты (Command, LSystemSettings, FlatVertices...)
        schemas.ts                           # zod schemas, валидаторы соответствующих DTO
      workers/
        lsystem.worker.ts                    # сам воркер (entry) — принимает запросы, отвечает transferables
        worker-utils.ts                      # helpers для воркера (serialize/deserialize, chunking)
      store/
        index.ts                             # pinia module (actions call services, state uses shallowRef)
      i18n/
        en.ts
        ru.ts
  shared/
    types/
      index.ts                               # общие типы, переиспользуемые (Point, BBox...)
    utils/
      uid.ts                                 # uuid helper
      math.ts                                # точечные util функции (deg->rad и пр.)
      buffer-utils.ts                        # helpers для FlatVertices / transfers
    renderers/
      IRenderer.ts                           # интерфейс рендерера (render/reset/resize)
      canvas/
        CanvasPolylineRenderer.ts            # реализация для canvas (consumes FlatVertices or VerticesArray)
      webgl/
        WebGLRenderer.ts                      # (опционально) webgl renderer
      svg/
        SVGRenderer.ts                        # svg exporter / renderer (for export + thumbnails)
  common/
    i18n/
      index.ts                               # инициализация i18n (vue-i18n)
    api/
      export.ts                              # экспорт/импорт JSON (migrations applied)
  assets/
    styles/
      main.css
  tests/
    domain/
      generatePattern.test.ts
      geometryBuilder.test.ts
    integration/
      worker.integration.test.ts
  tools/
    scripts/
      build-worker.sh
  docs/
    architecture.md
    api-types.md
    developer-guide.md
```

---

# Пояснения по ключевым элементам (папки/файлы)

## `src/features/l-system/` — фича-модуль

Содержит всю логику L-системы, UI-компоненты и glue-code (services). Фича-ориентированная организация делает легко добавлять новые модули.

### `pages/LSystemPage.vue`

Страница/роут для модуля. Собирает `Form`, `GeometryView`, `ViewsGallery`. Не содержит доменной логики.

### `components/Form.vue`

UI формы. Локальная форма (reactive) + валидация через `zod`/`schemas.ts`. На `Apply` вызывает action в Pinia, передавая валидный `LSystemSettings`.

### `components/GeometryView.vue`

Только отображает переданный `FlatVertices` или `VerticesArray`. Ничего не вычисляет — renderer-адаптер (useGeometryDrawer) делает привязку.

### `composables/useFormState.ts`

Локальный state + `zod`-валидация + preview helper. Возвращает DTO `LSystemSettings` и методы `apply()`, `preview()`, `reset()`.

### `services/lsystem-service.ts`

High-level фасад:

- Решает запускать ли генерацию синхронно (малые задачи) или через воркер (heavy).
- Отвечает за caching (по hash(settings)), retry, и polling progress.
- Переходит на `worker-client` для heavy задач.
  **Почему здесь:** централизует политику (worker vs sync), упрощает store.

### `services/worker-client.ts`

Обёртка над `new Worker(...)`, реализует:

- `generate(settings): Promise<requestId>`
- `cancel(requestId)`
- Поддержка `onProgress(id, callback)`, `onResult(id, callback)` и корректной передачи Transferable buffers.
  **Важно:** имеет маппинг id→resolve/reject и обрабатывает неожиданные ошибки.

### `services/migration.ts`

Функции миграции старых `LSystemSettings` → актуальной версии. Вызывается при импорте/приёме данных.

---

## `src/features/l-system/domain/` — чистая логика (pure functions)

Тут находятся все pure функции, тестируемые без Vue:

### `generatePattern.ts`

- Реализует алгоритм переписывания строк (L-system rewriting).
- Должен поддерживать AbortSignal и chunked execution (опция `maxChunkMs`) — чтобы можно было прерывать и отправлять прогресс.
- Возвращает `{ pattern: string, history?: string[] }` или стрим/итератор для больших задач.

### `patternToCommands.ts`

- Интерпретирует символы финального паттерна в массив `Command[]` (discriminated union).
- Не выполняет геометрию — только создаёт команды как данные.
- Валидируемая, чистая функция (с тестами).

### `commands.ts`

- Утилиты: фабрики команд, сериализация команд, хеширование, sane defaults.
- Полезно экспортировать `CommandFactory` для UI (Form -> preview).

### `geometryBuilder.ts`

- Функция(и) принимающие `Command[]` (или stream of commands) и возвращающие:
    - `VerticesArray` (удобный формат) или
    - `FlatVertices` (coords Float32Array + offsets Uint32Array).

- Работает chunked; поддерживает `maxPoints` и AbortSignal.
- Оптимизирована для минимизации аллокаций: заполняет заранее выделенный `Float32Array` при необходимости.

### `normalizer.ts`

- Калькуляция BBox, нормализация координат под viewport. Нужно чтобы renderer применял transform (renderer decides final mapping).

---

## `src/features/l-system/domain/types.ts`

Центральный файл с TS контрактами:

- `LSystemSettings`, `Alias`, `HandlerDef`
- `Command` discriminated union
- `FlatVertices`, `VerticesArray`, `LSystemResult`, `WorkerRequest/Response` types
  **Комментарий:** эти типы импортируются и в воркер, и в main thread, и в Pinia — это единая правда. Сделайте файл маленьким и экспортируемым.

---

## `src/features/l-system/domain/schemas.ts`

Zod-схемы, зеркалящие TS-типы. Используются:

- для валидации входа от Form
- для валидации сообщений в воркере (defensive)
- для десериализации при импорте JSON

---

## `src/features/l-system/workers/lsystem.worker.ts`

Файл воркера (entry). Что делает:

- слушает `onmessage`, обрабатывает `generate`/`cancel`/`ping`.
- вызывает `generatePattern`, `patternToCommands`, `geometryBuilder` chunked.
- при готовности отправляет `postMessage({type:'result_flat', id, meta})` + transfer `coords.buffer`, `offsets.buffer`.
- отправляет `progress` сообщения регулярно.
  **Комментарий:** отдельный ts файл билдится отдельным билд-скриптом (tools/scripts/build-worker.sh) в отдельный JS bundle, чтобы не тянуть весь основной бандл.

---

## `src/features/l-system/store/index.ts` (Pinia)

State design:

```ts
state: {
  settings: null as LSystemSettings | null,
  status: 'idle' as LSystemStatus,
  progress: 0,
  lastError: null as string | null,
  result: null as LSystemResult | null, // но будет shallowRef for heavy buffers
  flatRef: shallowRef<FlatVertices | null>(null)
}
```

Actions:

- `apply(settings)` → вызывает `lsystem-service.generate(settings)`; сохраняет requestId; listens progress/result.
- `cancel()` → вызывает `workerClient.cancel(requestId)`.
  **Почему shallowRef:** чтобы Vue не пытался рекурсивно делать реактивными большие буферы (Float32Array).

---

## `src/shared/renderers/` — абстракция и реализации

`IRenderer.ts` — контракт

- `CanvasPolylineRenderer.ts` — реализация, которая принимает `FlatVertices` и отрисовывает через `moveTo/lineTo` без создания объекты `{x,y}`.
- `WebGLRenderer.ts` — заглушка; работает напрямую с `Float32Array`.
- `SVGRenderer.ts` — заглушка.

---

## `src/common/api/export.ts`

Экспорт/импорт результатов и настроек:

- экспортирует JSON с `version` и `settings` и, если нужно, base64-представление `FlatVertices` (но лучше хранить в отдельных файлах).
- при импорте вызывает `migration.ts` если версия отличается.

---

## `src/shared/types` и `src/features/l-system/domain/types.ts`

`shared/types` — общие сущности проекта (Point, BBox), `domain/types.ts` — feature-specific. Это уменьшит дублирование.

---

## `src/tests/` — тесты

- `domain/generatePattern.test.ts` — unit tests for rewriting rules, edge cases.
- `domain/geometryBuilder.test.ts` — tests for flat buffer output, offsets correctness.
- `integration/worker.integration.test.ts` — mocks for worker messages + transferables (node worker threads or jsdom worker mocks).
- CI запускает unit+integration tests.

---

## `tools/` и `docs/`

- `tools/scripts/build-worker.sh` — сборка воркера в отдельный bundle (Rollup/ESBuild), чтобы исключить размер основного бандла и избежать inline worker преобразований.
- `docs/architecture.md` — поясняет design decisions, формат команд, trade-offs.
- `docs/api-types.md` — автогенерируемая документация типов (можно генерить из TS types).

---

# Указания по именованию и имплементации файлов

- `*.ts` в `domain/` — только pure functions, никакого доступа к DOM или Vue.
- `workers/lsystem.worker.ts` — внутри импортирует `domain/*` модули — они должны быть чистыми и не тянуть DOM.
- Файлы, которые должны быть serializable (settings, command factories), держать как plain objects / POJO — без функций внутри.
- `schemas.ts` использовать рядом с типом: `export const LSystemSettingsSchema = z.object({...})` и `type LSystemSettings = z.infer<typeof LSystemSettingsSchema>` — это держит TS и runtime-схему согласованными.

---
