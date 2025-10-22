# Этапы развития проекта (каждый — рабочий MVP)

1. **Этап 0 — infra & skeleton**
    - Инициализация репо, сборка, lint, tsconfig, базовый Vue skeleton.
    - _MVP:_ пустой runnable app.

2. **Этап 1 — Domain core (pure functions)**
    - `generatePattern`, `patternToCommands`, типы, unit-тесты.
    - _MVP:_ CLI/тест: генерируется pattern и команды (консольный вывод).

3. **Этап 2 — Sync UI + Canvas (end-to-end локально)**
    - `Form.vue`, `GeometryView.vue`, `geometryBuilder` → `VerticesArray`, Canvas renderer.
    - _MVP:_ форма → Apply → рисуется изображение (main thread).

4. **Этап 3 — Pinia store + persistence**
    - Central store (shallowRef для результатов), actions apply/preview/cancel, import/export settings.
    - _MVP:_ состояния и результаты сохраняются/восстанавливаются; UI через store.

5. **Этап 4 — WebWorker integration (performance)**
    - `worker-client` + `lsystem.worker.ts`, chunked generation, progress, cancel, transfer Float32Array.
    - _MVP:_ тяжёлые задачи выполняются в воркере; UI отзывчив, есть progress и cancel.

6. **Этап 5 — FlatBuffers & fast renderer**
    - `geometryBuilder` генерирует `FlatVertices`; `CanvasPolylineRenderer` рисует напрямую из буфера.
    - _MVP:_ большие паттерны рендерятся эффективно без создания миллиондов объектов.

7. **Этап 6 — ViewsGallery, presets, export/import**
    - Пресеты, экспорт/импорт настроек и результатов.
    - _MVP:_ сохранять и просматривать несколько результатов.

8. **Этап 7 — i18n, accessibility, CI/tests**
    - Локали, ARIA, покрытие тестами, CI pipeline.
    - _MVP:_ стабильная сборка с тестами и локализацией.

9. **Этап 8 — Extensibility & advanced (опционально)**
    - Handler registry, plugin API, WebGL renderer, streaming animation.
    - _MVP:_ плагины/расширения и анимация доступны.

---
