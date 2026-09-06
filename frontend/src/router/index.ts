import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
    { path: "/login", name: "login", component: () => import("@/views/LoginView.vue"), meta: {guestOnly: true} },
    { path: "/cadastro", name: "cadastro", component: () => import("@/views/CadastroView.vue"), meta: {guestOnly: true} }
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.ensureSessionRestored()

  if(to.meta.guestOnly && auth.isAuthenticated) {
    return {name: 'home'}
  }

  if(to.meta.requiresAuth && !auth.isAuthenticated) {
    return {name: 'login'}
  }
})