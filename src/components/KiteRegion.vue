<script setup>
import { ref, computed, watch } from 'vue';
import KiteSpots from './KiteSpots.vue';
import { mapRangeClamp } from '../range';
import { useFetchInterval } from '../useFetchInterval';
import { PlusIcon, PencilIcon } from '@heroicons/vue/24/outline';
import WindSpeedControls from './WindSpeedControls.vue';
const props = defineProps({
  region: {
    type: String,
    required: true
  },
});

const isCustomisable = computed(() => props.region === 'myspots');
const windThreshold = ref(Number(localStorage.getItem('windThreshold')) || 10);
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
      <router-link v-if="report && report.length === 0" to="/myspots/edit" class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg fira-code bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
        <span class="font-semibold text-2xl">+</span>
        <span>Add Spots</span>
      </router-link>
      <router-link v-else-if="report && report.length > 0" to="/myspots/edit" class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg fira-code border-2 border-white">
        <PencilIcon class="h-5 w-5" />
        <span>Edit Spots</span>
      </router-link>
    </div>
  </div>

  <div class="flex flex-col p-8 pl-[6.66rem] pr-2 gap-4">
    <p class="pt-0 fira-code" v-if="error">Failed to load latest wind data. Please make sure you're connected to the internet.</p>
    <p class="pt-0 fira-code" v-if="report && report.length > 0">For feedback, compliments and suggestions, email: <a href="mailto:wind@jim.computer" class="underline hover:text-blue-300">wind@jim.computer</a></p>
  </div>
  <WindSpeedControls v-if="report && report.length > 0" v-model="windThreshold" />
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
