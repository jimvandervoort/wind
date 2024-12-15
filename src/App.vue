<script setup>
import KiteSpots from './components/KiteSpots.vue';
import { useFetchInterval } from "./useFetchInterval.js";
import { ref, watch } from 'vue';

const windThreshold = ref(Number(localStorage.getItem('windThreshold')) || 20);

watch(windThreshold, (newValue) => {
  localStorage.setItem('windThreshold', newValue);
});

const { report, error } = useFetchInterval(windThreshold);
const showSettings = ref(false);

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
}
</script>

<template>
  <div class="pt-8 pl-8 pr-8 roboto-medium max-w-2xl">
    <h1 class="inline">
      <a href="/" @click.prevent="toggleSettings">
        Forecast for
        <span class="fira-code">{{ windThreshold }}</span>
        knots and up.
        <span class="font-light hover:underline">
          Customise&nbsp;»
        </span>
      </a>
    </h1>
    <div v-if="showSettings">
      <div class="flex mt-8 fira-code items-center">
        <span class="text-2xl font-bold pr-3">10</span>
        <input id="windThreshold" type="range" v-model="windThreshold" min="10" max="30" step="1" class="slider">
        <span class="text-2xl font-bold pl-3">30</span>
      </div>
      <p class="pt-8">Wind threshold will be saved for next visit 🤙</p>
    </div>
  </div>
  <KiteSpots :spots="report" />
  <p class="p-8 pt-0 fira-code" v-if="error">Failed to load latest wind data: {{ error }}</p>
  <p class="p-8 pt-0 fira-code" v-if="report">Let me know what you think 😊 <a href="mailto:wind@jim.computer" class="hover:underline">wind@jim.computer</a></p>
</template>

<style>
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: .4rem;

  background: none;
  border: 2px solid #ccc;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 4rem;
  height: 4rem;
  background: url('./assets/george.png') no-repeat center center;
  background-size: cover;
}

.slider::-moz-range-thumb {
  width: 4rem;
  height: 4rem;
  background: url('./assets/george.png') no-repeat center center;
  background-size: cover;
  border: none;
}
</style>
