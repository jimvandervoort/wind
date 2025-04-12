import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import EditSpots from '../views/EditSpots.vue'
import { inject } from 'vue'

const requireAuth = (to, from, next) => {
  const auth = inject('auth');
  auth.getSession().then(({ data: { session } }) => {
    if (session) {
      next();
    } else {
      next('/login');
    }
  });
};

const routes = [
  {
    path: '/:region?',
    name: 'Home',
    component: Home,
    props: true,
    beforeEnter: (to, from, next) => {
      if (to.params.region === 'myspots') {
        requireAuth(to, from, next);
      } else {
        next();
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/myspots/edit',
    name: 'EditSpots',
    component: EditSpots,
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
