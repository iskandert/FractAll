# FractAll — Генератор фракталов на L-системах

Веб-приложение для генерации и визуализации L-систем (фракталов).

**Текущий этап:** Этап 1 — Domain Core (Pure Functions)

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Тестирование L-системы через CLI
npm run dev:cli

# Запуск тестов
npm run test

# Веб-приложение (на этапе 1 - заглушка)
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
2. 🚧 **Этап 1** — Domain core (текущий)
3. ⏳ **Этап 2** — Sync UI + Canvas
4. ⏳ **Этап 3** — Pinia store + persistence
5. ⏳ **Этап 4** — WebWorker integration
6. ⏳ **Этап 5** — FlatBuffers & fast renderer
7. ⏳ **Этап 6** — ViewsGallery, presets, export/import
8. ⏳ **Этап 7** — i18n, accessibility, CI/tests
9. ⏳ **Этап 8** — Extensibility & advanced

## Лицензия

См. [LICENSE](LICENSE)
