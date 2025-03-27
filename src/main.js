import './style.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import authPlugin from './plugins/auth'

const app = createApp(App)
app.use(router)
app.use(authPlugin)
app.mount('#app')
