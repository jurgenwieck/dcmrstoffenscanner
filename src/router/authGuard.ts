import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export const useAuthGuard = async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): Promise<void> => {
    const authStore = useAuthStore();
    const user = authStore.user || await authStore.loadUser();

    if (user) {
        next();
    } else {
        next({ name: 'Auth' });
    }
};
