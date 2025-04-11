<script setup>
import { ref, computed, watch } from 'vue';
import KiteSpots from './KiteSpots.vue';
import { mapRangeClamp } from '../range';
import { useFetchInterval } from '../useFetchInterval';

const props = defineProps({
  region: {
    type: String,
    required: true
  },
});

const isCustomisable = computed(() => props.region === 'myspots');
const windThreshold = ref(Number(localStorage.getItem('windThreshold')) || 20);
const roundedWindThreshold = ref(Math.round(windThreshold.value));
const showSettings = ref(false);

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
}

watch(windThreshold, (newValue) => {
  localStorage.setItem('windThreshold', Math.round(newValue));
  roundedWindThreshold.value = Math.round(newValue);
});

const { report, error } = useFetchInterval(roundedWindThreshold);
</script>

<template>
  <div class="pt-4 pb-5 pl-8 pr-8 roboto-medium max-w-2xl">
    <h1 class="inline">
      <a href="/" @click.prevent="toggleSettings">
        Forecast for
        <span class="fira-code">{{ roundedWindThreshold }}</span>
        knots and up.
        <span class="font-light hover:underline">
          Customise&nbsp;»
        </span>
      </a>
    </h1>
    <div v-if="showSettings">
      <div class="flex mt-8 mb-8 fira-code items-center">
        <span class="text-2xl font-bold pr-4">10</span>
        <input id="windThreshold" type="range" :style="`--scale: ${mapRangeClamp(windThreshold, 10, 30, 2.5, 5)}rem`" v-model="windThreshold" min="10" max="30" step="1" class="slider">
        <span class="text-2xl font-bold pl-4">30</span>
      </div>
    </div>
  </div>

  <KiteSpots :report="report" />

  <div class="flex flex-col p-8 gap-4" v-if="isCustomisable">
    <div class="flex flex-col max-w-md">
      <a href="/myspots/add" class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-white fira-code">
        <span class="text-xl font-bold">+</span>
        <span>Add Spot</span>
      </a>
    </div>
    <p class="pt-0 fira-code" v-if="error">Failed to load latest wind data. Please make sure you're connected to the internet.</p>
    <p class="pt-0 fira-code" v-if="report">Let me know what you think 😊 <a href="mailto:wind@jim.computer" class="underline hover:text-blue-300">wind@jim.computer</a></p>
  </div>
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
  width: var(--scale);
  height: var(--scale);
  background: url('../assets/george.png') no-repeat center center;
  background-size: cover;
}

.slider::-moz-range-thumb {
  appearance: none;
  border: none;
  width: var(--scale);
  height: var(--scale);
  background: url('../assets/george.png') no-repeat center center;
  background-size: cover;
}
</style>
