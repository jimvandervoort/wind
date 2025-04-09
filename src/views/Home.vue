<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import KiteSpots from '../components/KiteSpots.vue';
import RegionSelect from '../components/RegionSelect.vue';
import { useFetchInterval } from "../useFetchInterval.js";
import { mapRangeClamp } from '../range';

const router = useRouter();
const props = defineProps({
  region: {
    type: String,
    default: null
  }
});

watch(() => props.region, (newRegion) => {
  if (newRegion) {
    localStorage.setItem('lastRegion', newRegion);
  }
}, { immediate: true });

const availableRegions = [
  { id: 'capetown', name: 'Cape Town', emoji: '🇿🇦' },
  { id: 'tarifa', name: 'Tarifa', emoji: '🇪🇸' },
  { id: 'holland', name: 'Holland', emoji: '🇳🇱' }
];

const windThreshold = ref(Number(localStorage.getItem('windThreshold')) || 20);
const roundedWindThreshold = ref(Math.round(windThreshold.value));
const showSettings = ref(false);

watch(windThreshold, (newValue) => {
  localStorage.setItem('windThreshold', Math.round(newValue));
  roundedWindThreshold.value = Math.round(newValue);
});

onMounted(() => {
  console.log(props.region);
  if (props.region) {
    console.log('setting last region', props.region);
    localStorage.setItem('lastRegion', props.region);
    return;
  }

  const lastRegion = localStorage.getItem('lastRegion');
  if (lastRegion && availableRegions.some(r => r.id === lastRegion)) {
    router.push(`/${lastRegion}`);
  }
});

const { report, error } = useFetchInterval(roundedWindThreshold);

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
}
</script>

<template>
  <div class="p-8">
    <router-link to="/login" class="hover:underline">Login</router-link>
  </div>

  <template v-if="region">
    <div class="pt-8 pb-5 pl-8 pr-8 roboto-medium max-w-2xl">
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
    <p class="p-8 pt-0 fira-code" v-if="error">Failed to load latest wind data. Please make sure you're connected to the internet.</p>
    <p class="p-8 pt-0 fira-code" v-if="report">Let me know what you think 😊 <a href="mailto:wind@jim.computer" class="underline hover:text-blue-300">wind@jim.computer</a></p>
  </template>

  <RegionSelect v-else />
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
  width: var(--scale);
  height: var(--scale);
  background: url('../assets/george.png') no-repeat center center;
  background-size: cover;
}
</style>
