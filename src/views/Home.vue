<script setup>
import {  watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RegionSelect from '../components/RegionSelect.vue';
import KiteRegion from '../components/KiteRegion.vue';
import { useFetchInterval } from "../useFetchInterval.js";

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
</script>

<template>
  <!-- <div class="p-8">
    <router-link to="/login" class="hover:underline">Login</router-link>
  </div> -->
  <KiteRegion v-if="region" :region="region" />
  <RegionSelect v-else />
</template>
