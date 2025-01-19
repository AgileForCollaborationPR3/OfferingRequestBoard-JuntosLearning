import { defineRouter } from "#q-app/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthCommunityStore } from "../stores/auth-community-store";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to) => {
    const authStore = useAuthCommunityStore();

    // Ensure the session is updated
    await authStore.getSession();

    // Redirect unauthenticated users to /login
    if (!authStore.user && !["/login", "/register"].includes(to.path)) {
      return { path: "/login" };
    }

    // Redirect authenticated users without an active community to /community
    if (
      authStore.user &&
      !authStore.profile?.currentCommunityId &&
      to.path !== "/community"
    ) {
      return { path: "/community" };
    }

    // Redirect authenticated users away from login/register pages
    if (
      authStore.user &&
      ["/login", "/register"].includes(to.path) // Only redirect for login/register
    ) {
      return { path: "/" };
    }

    return true; // Allow navigation for other routes
  });

  return Router;
});
