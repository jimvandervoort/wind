<script setup>
import {  watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RegionSelect from '../components/RegionSelect.vue';
import KiteRegion from '../components/KiteRegion.vue';
import RegionSelectMenu from '../components/RegionSelectMenu.vue';

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

const existingRegions = ['capetown', 'tarifa', 'holland', 'myspots'];
const availableRegions = [
  { id: 'capetown', name: 'Cape Town', emoji: '🇿🇦' },
  { id: 'tarifa', name: 'Tarifa', emoji: '🇪🇸' },
  { id: 'holland', name: 'Holland', emoji: '🇳🇱' }
];

onMounted(() => {
  if (props.region) {
    localStorage.setItem('lastRegion', props.region);
    return;
  }

  const lastRegion = localStorage.getItem('lastRegion');
  if (lastRegion && existingRegions.includes(lastRegion)) {
    router.push(`/${lastRegion}`);
  }
});
</script>

<template>
  <RegionSelectMenu v-if="region" :region="region" />
  <KiteRegion v-if="region" :region="region" />
  <RegionSelect v-else />
</template>
