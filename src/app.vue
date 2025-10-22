<template>
    <main class="app-root">
        <h1>FractAll</h1>
        <p>Базовый skeleton приложения. Этап 0.</p>
        <Button
            label="Тест PrimeVue"
            icon="pi pi-check"
            severity="success"
        />
    </main>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
</script>

<style scoped>
.app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
</style>
