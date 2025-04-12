import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import EditSpots from '../views/EditSpots.vue'

const routes = [
  {
    path: '/:region?',
    name: 'Home',
    component: Home,
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/myspots/edit',
    name: 'EditSpots',
    component: EditSpots
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
