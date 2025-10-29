import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';

/**
 * Vue Router инстанс с browser history mode
 */
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

/**
 * Navigation guard для установки title страницы
 */
router.beforeEach((to) => {
    const defaultTitle = 'FractAll';
    document.title = (to.meta.title as string) || defaultTitle;
});

