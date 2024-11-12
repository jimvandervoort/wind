<script setup>
defineProps({
  spot: Object,
})
</script>

<template>
  <h1 class="spot_title pt-10 pl-3 mb-1 text-4xl font-semibold mb-8">{{ spot.name }}</h1>
  <div v-for="day in spot.days" class="flex flex-row items-end">
    <h2 class="font-semibold rotate-270 ps-2.5 h-10 w-10 m-0">{{ day.name }}</h2>
    <div v-for="gust in day.gusts" class="flex flex-row items-start">
      <div class="h-12 w-6 bg-purple-950">{{ gust }}</div>
    </div>
  </div>
</template>
