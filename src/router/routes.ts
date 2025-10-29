import type { RouteRecordRaw } from 'vue-router';

/**
 * Маршруты приложения
 */
export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/lsystem',
    },
    {
        path: '/lsystem',
        name: 'lsystem',
        component: () => import('@/features/l-system/pages/main.vue'),
        meta: {
            title: 'L-System Generator',
        },
    },
];

