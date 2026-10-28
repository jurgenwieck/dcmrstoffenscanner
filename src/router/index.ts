import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthGuard } from './authGuard'
import AuthVieuw from '../views/AuthVieuw.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/app/home'
        },
        {
            path: '/auth',
            name: 'Auth',
            component: AuthVieuw
        },
        {
            path: '/app/',
            beforeEnter: useAuthGuard,
            children: [
                {
                    path: 'home',
                    name: 'Home',
                    component: HomeView,
                },
                {
                    path: 'scan-poc',
                    name: 'ScanPOC',
                    component: () => import('../views/ScanPOC.vue'),
                },
                {
                    path: 'substance-scan',
                    name: 'SubstanceScan',
                    component: () => import('../views/SubstanceScan.vue'),
                },
                {
                    path: 'inspection',
                    name: 'InspectionSession',
                    component: () => import('../views/InspectionSession.vue'),
                },
                {
                    path: 'inspection/overview',
                    name: 'InspectionOverview',
                    component: () => import('../views/InspectionOverview.vue'),
                },
                {
                    path: 'inspection/report',
                    name: 'InspectionReport',
                    component: () => import('../views/InspectionReportView.vue'),
                },
            ]
        },
    ],
})

export default router
