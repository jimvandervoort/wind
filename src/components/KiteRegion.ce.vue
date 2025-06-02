<script setup>
import { ref } from 'vue';
import KiteSpots from './KiteSpots.vue';
import { useFetchInterval } from '../useFetchInterval';

const props = defineProps({
  region: {
    type: String,
    required: true
  },
});

const windThreshold = ref(10);
const { report, error } = useFetchInterval(windThreshold, props.region, true);
</script>

<template>
  <h2 class="text-lg">Wind forecast <span class="fira-code font-bold">10</span> knots and up</h2>

  <KiteSpots v-if="report && report.length > 0" :report="report" />

  <div class="flex flex-col p-8 pl-[6.66rem] pr-2 gap-4">
    <p class="pt-0 fira-code" v-if="error">Failed to load latest wind data. Please make sure you're connected to the internet.</p>
  </div>
</template>

<style>
@import '../style.css';

:host {
  display: block;
  font-family: 'Roboto', sans-serif;
  background-color: #0c1215;
  color: #e2e8f0;
  cursor: url('/src/assets/fish.png') 0 0, auto;
}
</style>
