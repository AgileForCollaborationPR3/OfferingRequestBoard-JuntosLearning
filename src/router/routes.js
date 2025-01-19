const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "people", component: () => import("pages/PeoplePage.vue") },
      { path: "messages", component: () => import("pages/MessagesPage.vue") },
      {
        path: "/add/:isRequest",
        name: "add",
        component: () => import("pages/AddPage.vue"),
        props: (route) => ({ isRequest: route.params.isRequest === "true" }),
      },
      { path: "profile", component: () => import("pages/ProfilePage.vue") },
      {
        path: "browselearnings",
        component: () => import("pages/SearchPage.vue"),
      },
      {
        path: "/user/:id",
        name: "UserDetails",
        component: () => import("pages/PeoplePageDetails.vue"),
        props: true,
      },
      {
        path: "/mylearnings",
        name: "Learnings",
        component: () => import("pages/LearningsPage.vue"),
      },
      {
        path: "learning/:id",
        name: "learningDetails",
        component: () => import("pages/LearningsPageDetails.vue"),
        props: true,
      },
      {
        path: "/accept/:id",
        name: "acceptLearning",
        component: () => import("../pages/AcceptLearningPage.vue"),
        props: true,
      },
    ],
  },
  {
    path: "/community",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      {
        path: "",
        name: "community",
        component: () => import("src/pages/AuthRegisterCommunityPage.vue"),
      },
    ],
  },
  {
    path: "/register",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      {
        path: "",
        name: "register",
        component: () => import("src/pages/AuthRegisterPage.vue"),
      },
    ],
  },
  {
    path: "/login",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      {
        path: "",
        name: "login",
        component: () => import("src/pages/AuthLoginPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
