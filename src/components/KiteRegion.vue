<script setup>
import { ref, computed, watch } from 'vue';
import KiteSpots from './KiteSpots.vue';
import { mapRangeClamp } from '../range';
import { useFetchInterval } from '../useFetchInterval';
import { PlusIcon, PencilIcon } from '@heroicons/vue/24/outline';

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
  <div v-if="report && report.length > 0" class="pt-4 pb-5 pl-8 pr-8 roboto-medium max-w-2xl">
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

  <KiteSpots v-if="report && report.length > 0" :report="report" />

  <div v-if="report && report.length === 0" class="text-center p-8 pb-0 flex flex-col gap-1">
    <!-- <h1 class="pt-8 text-2xl font-bold">New!<br/>You can now add your own spots! 🤩</h1> -->
    <h1 class="text-xl font-bold max-w-md mx-auto">
      Looking pretty empty here!
    </h1>
    <p class="text-xl max-w-md mx-auto">
      Add your first spots 👇
    </p>
  </div>

  <div class="flex flex-col p-8 gap-4" v-if="isCustomisable">
    <div class="flex flex-col max-w-md">
      <router-link to="/myspots/edit" class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg fira-code" :class="{ 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white': report && report.length === 0, 'border-2 border-white': report && report.length > 0 }">
        <span v-if="report && report.length === 0" class="font-semibold text-2xl">+</span>
        <PencilIcon v-else class="h-5 w-5" />
        <span v-if="report && report.length === 0">Add Spots</span>
        <span v-else>Edit Spots</span>
      </router-link>
    </div>
    <p class="pt-0 fira-code" v-if="error">Failed to load latest wind data. Please make sure you're connected to the internet.</p>
    <p class="pt-0 fira-code" v-if="report && report.length > 0">Let me know what you think 😊 <a href="mailto:wind@jim.computer" class="underline hover:text-blue-300">wind@jim.computer</a></p>
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
