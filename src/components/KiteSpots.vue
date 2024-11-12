<script setup>
import KiteSpot from "./KiteSpot.vue";

defineProps({
  spots: Array,
})
</script>

<template>
  <KiteSpot v-for="spot in spots" :spot="spot"/>
</template>
