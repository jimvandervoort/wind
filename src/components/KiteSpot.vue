<script setup>
defineProps({
  spot: Object,
})
</script>

<template>
  <h1 class="spot_title pt-20 pl-3 mb-1 text-4xl font-semibold mb-3">{{ spot.name }}</h1>
  <div class="flex flex-row flex-wrap items-end gap-0">
    <template v-for="day in spot.days" :key="day.num">
      <div class="flex flex-row flex-wrap items-end">
        <h2 class="font-semibold rotate-270" v-if="day.hasWind">{{ day.name }}</h2>
        <h2 class="font-semibold rotate-270 text-gray-600" v-else>{{ day.name }}</h2>
        <div v-for="gust in day.gusts" class="flex flex-row items-start">
          <div class="h-16 w-11 flex flex-col justify-end pl-1" :style="gust.style">
            <span class="font-bold">{{ gust.value }}</span>
            <span class="">{{ gust.time }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
h2 {
  display: inline-block;
  box-sizing: border-box;
  width: 30px;
  min-height: 20px;
  padding-left: 10px;
}
</style>
