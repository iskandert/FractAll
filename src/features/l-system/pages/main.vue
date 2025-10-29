<template>
    <div class="lsystem-page">
        <div class="lsystem-layout">
            <!-- Левая панель: форма с настройками -->
            <aside class="lsystem-sidebar">
                <div class="sidebar-content">
                    <h2 class="page-title">L-System Generator</h2>
                    <p class="page-description">
                        Настройте параметры L-системы и создайте фрактальные паттерны
                    </p>
                    <!-- Форма будет добавлена на следующем подэтапе -->
                    <div class="form-placeholder">
                        <p>Форма настроек (будет реализована на этапе 2.4)</p>
                    </div>
                </div>
            </aside>

            <!-- Правая панель: canvas для визуализации -->
            <main class="lsystem-main">
                <div class="geometry-container">
                    <!-- Canvas компонент будет добавлен на этапе 2.3 -->
                    <div class="canvas-placeholder">
                        <p>Область визуализации (будет реализована на этапе 2.3)</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Страница генератора L-системы
 *
 * Этап 2.1: Базовый layout с контейнерами
 * Этап 2.3: Добавится GeometryView компонент
 * Этап 2.4: Добавится Form компонент
 * Этап 2.5: Интеграция с синхронной генерацией
 */

// На текущем этапе только структура layout
// Reactive state и логика будут добавлены на этапе 2.5
</script>

<style scoped>
.lsystem-page {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.lsystem-layout {
    display: flex;
    width: 100%;
    height: 100%;
}

/* Левая панель с формой */
.lsystem-sidebar {
    width: 400px;
    min-width: 320px;
    max-width: 500px;
    height: 100%;
    overflow-y: auto;
    background: var(--surface-ground, #f8f9fa);
    border-right: 1px solid var(--surface-border, #dee2e6);
}

.sidebar-content {
    padding: 1.5rem;
}

.page-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color, #212529);
}

.page-description {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
    color: var(--text-color-secondary, #6c757d);
    line-height: 1.5;
}

.form-placeholder {
    padding: 2rem;
    background: var(--surface-card, #ffffff);
    border: 2px dashed var(--surface-border, #dee2e6);
    border-radius: 8px;
    text-align: center;
    color: var(--text-color-secondary, #6c757d);
}

/* Правая панель с canvas */
.lsystem-main {
    flex: 1;
    height: 100%;
    overflow: hidden;
    background: var(--surface-card, #ffffff);
}

.geometry-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.canvas-placeholder {
    padding: 2rem;
    background: var(--surface-ground, #f8f9fa);
    border: 2px dashed var(--surface-border, #dee2e6);
    border-radius: 8px;
    text-align: center;
    color: var(--text-color-secondary, #6c757d);
}

/* Responsive для мобильных устройств */
@media (max-width: 768px) {
    .lsystem-layout {
        flex-direction: column;
    }

    .lsystem-sidebar {
        width: 100%;
        max-width: 100%;
        height: auto;
        max-height: 50vh;
        border-right: none;
        border-bottom: 1px solid var(--surface-border, #dee2e6);
    }

    .lsystem-main {
        height: 50vh;
    }
}
</style>

