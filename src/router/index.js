import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AddSpot from '../views/AddSpot.vue'

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
    path: '/myspots/add',
    name: 'AddSpot',
    component: AddSpot
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
