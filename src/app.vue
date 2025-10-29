<template>
    <div id="app-root">
        <RouterView />
    </div>
</template>

<script setup lang="ts">
/**
 * Корневой компонент приложения
 *
 * Использует Vue Router для навигации между страницами
 */
</script>

<style>
/* Глобальные стили и сброс */
#app-root {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
