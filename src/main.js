import './style.css'

window.addEventListener('load', () => {
  console.log(document.body.innerHTML);
});

import {createApp} from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
