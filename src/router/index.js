import { createRouter, createWebHistory } from 'vue-router'
import Region from '../views/Region.vue'
import RegionSelect from '../views/RegionSelect.vue'
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
  }).catch((error) => {
    console.error('Auth check failed:', error);
    next('/login');
  });
};

const routes = [
  {
    path: '/',
    name: 'RegionSelect',
    component: RegionSelect,
    beforeEnter: (to, from, next) => {
      const lastRegion = localStorage.getItem('lastRegion');
      if (lastRegion) {
        next(`/${lastRegion}`);
      } else {
        next();
      }
    }
  },
  {
    path: '/:region?',
    name: 'Region',
    component: Region,
    props: true,
    beforeEnter: (to, from, next) => {
      ['capetown', 'tarifa', 'holland', 'myspots'].includes(to.params.region) && localStorage.setItem('lastRegion', to.params.region);
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
