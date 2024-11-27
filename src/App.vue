<script setup>
import KiteSpots from './components/KiteSpots.vue';
import {useFetchInterval} from "./useFetchInterval.js";
import { ref, onMounted, watch } from 'vue';

const windThreshold = ref(Number(localStorage.getItem('windThreshold')) || 20);

watch(windThreshold, (newValue) => {
  localStorage.setItem('windThreshold', newValue);
});

const { report, error } = useFetchInterval(windThreshold);
const showSettings = ref(false);

const openSettings = () => {
  showSettings.value = true;
}

const closeSettings = () => {
  showSettings.value = false;
}
</script>

<template>
  <div class="p-8 roboto-medium">
    <p>Showing wind above {{ windThreshold }} knots</p>
    <p class="font-light">
      <a href="#" class="hover:underline" @click.prevent="openSettings">Customise</a>
    </p>
    <div v-if="showSettings" class="flex">
      <label class="block text-sm font-bold mb-2" for="windThreshold">KNTS</label>
      <input 
          id="windThreshold"
          type="range" 
          v-model="windThreshold"
          min="10"
          max="30"
          step="1"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline inline-block"
        >
    </div>
  </div>
  <KiteSpots :spots="report"/>
  <pre class="m-3" v-if="error">Failed to load latest wind data: {{error}}</pre>
</template>
