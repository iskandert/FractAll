# FractAll — Генератор фракталов на L-системах

Веб-приложение для генерации и визуализации L-систем (фракталов).

**Текущий статус:** ⏳ Этап 2 в процессе — UI + Canvas Renderer (2.1 и 2.2 завершены)

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Тестирование L-системы через CLI
npm run dev:cli

# Запуск тестов
npm run test

# Веб-приложение
npm run dev
```

## Скрипты

- `npm run dev` — веб-приложение (dev-сервер)
- `npm run dev:cli` — CLI для тестирования L-систем
- `npm run test` — unit-тесты
- `npm run test:ui` — UI для vitest
- `npm run build` — сборка продакшн бандла
- `npm run typecheck` — проверка типов TypeScript
- `npm run lint` / `lint:fix` — линтинг
- `npm run format` — форматирование кода

## Стек

- **Core:** Vue 3, TypeScript, Vite
- **UI:** PrimeVue, Vue Router
- **Валидация:** Zod
- **Тесты:** Vitest
- **Code Quality:** ESLint, Prettier

## Документация

- [CONTEXT.md](docs/context/CONTEXT.md) - архитектура и структура проекта
- [ROADMAP.md](docs/context/ROADMAP.md) - план развития проекта
- [TYPES_REFERENCE.md](docs/context/TYPES_REFERENCE.md) - справочник типов
- [USER_FLOW.md](docs/context/USER_FLOW.md) - пользовательские сценарии

## Этапы развития

1. ✅ **Этап 0** — Infra & skeleton
2. ✅ **Этап 1** — Domain core 
   - ✅ generatePattern (L-system переписывание)
   - ✅ patternToCommands (паттерн → команды)
   - ✅ CommandFactory и утилиты команд
   - ✅ generateGeometry (команды → геометрия с BBox)
   - ✅ Unit-тесты для всех модулей
3. ⏳ **Этап 2** — Sync UI + Canvas (в процессе)
   - ✅ 2.1: Router и страничная структура
   - ✅ 2.2: Renderer инфраструктура (IRenderer, CanvasPolylineRenderer)
   - ⏳ 2.3: GeometryView компонент (следующий)
4. ⏳ **Этап 3** — Pinia store + persistence
5. ⏳ **Этап 4** — WebWorker integration
6. ⏳ **Этап 5** — FlatBuffers & fast renderer
7. ⏳ **Этап 6** — ViewsGallery, presets, export/import
8. ⏳ **Этап 7** — i18n, accessibility, CI/tests
9. ⏳ **Этап 8** — Extensibility & advanced

## Лицензия

См. [LICENSE](LICENSE)
