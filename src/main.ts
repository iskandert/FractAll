import { createApp } from 'vue';
import App from '@/app.vue';
import { router } from '@/router';

// PrimeVue
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

// Иконки PrimeVue
import 'primeicons/primeicons.css';

// Наши стили
import '@/assets/styles/main.css';

const app = createApp(App);

// Подключение router
app.use(router);

// Подключение PrimeVue с темой Aura (unstyled mode with preset)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.dark-mode',
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities',
            },
        },
    },
});

app.mount('#app');
