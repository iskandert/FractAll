import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import App from '@/app.vue';
import '@/assets/styles/main.css';
import 'primeicons/primeicons.css';

const app = createApp(App);

app.use(PrimeVue, {
    ripple: true,
});

app.mount('#app');
