import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
    { path: "/login", name: "login", component: () => import("@/views/LoginView.vue"), meta: { guestOnly: true } },
    { path: "/cadastro", name: "cadastro", component: () => import("@/views/CadastroView.vue"), meta: { guestOnly: true } },
    { path: "/simulados", name: "simulados", component: () =>  import("@/views/SimuladosView.vue"), meta: { requiresAuth: true }}
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.ensureSessionRestored()

  if(to.meta.guestOnly && auth.isAuthenticated) {
    return {name: 'home'}
  }

  if(to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath, aviso: 'login-necessario' } //redirect: to.fullPath é para poder redirecionar o usuário direto para a página que ele queria acessar, mas foi negado pq não tá logado
    }
  }
})