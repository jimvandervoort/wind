<script setup>
import { watch } from 'vue';
import KiteRegion from '../components/KiteRegion.vue';
import RegionSelectMenu from '../components/RegionSelectMenu.vue';

const props = defineProps({
  region: {
    type: String,
    required: true
  }
});

watch(() => props.region, (newRegion) => {
  ['capetown', 'tarifa', 'holland'].includes(newRegion) && localStorage.setItem('lastRegion', newRegion);
});
</script>

<template>
  <RegionSelectMenu :region="region" />
  <KiteRegion :region="region" />
</template>
