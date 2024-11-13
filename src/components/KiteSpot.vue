<script setup>
defineProps({
  spot: Object,
})
</script>

<template>
  <h1 class="pt-20 pl-3 mb-1 text-4xl mb-2 font-semibold i">{{ spot.spot.name }}</h1>
  <div class="flex flex-row flex-wrap items-end gap-0">
    <template v-for="day in spot.days">
      <div class="flex flex-row items-end fira-code">
        <h2 class="font-semibold flex rotate-270 pt-2 pl-1.5" v-if="day.hasWind">{{ day.name }}</h2>
        <template v-else>
          <h2 class="font-semibold flex rotate-270 pt-2 pl-1.5 text-gray-600">{{ day.name }}</h2>
          <div class="h-16"></div>
        </template>
        <div v-for="fc in day.forecast" class="mt-6">
          <div class="gust h-16 w-12 flex flex-col justify-end pl-1" :style="`${fc.gust.style}; --wo: ${fc.waveOpacity}; --wave: '${fc.wave}'; --wp: ${fc.wavePos}`">
            <span class="font-bold">{{ fc.gust.value }}</span>
            <span class="">{{ fc.timeStr }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
h2 {
  transform: translateX(3px) translateY(1px) rotate(270deg);
}

.gust {
  position: relative;
  z-index: 10;
}

.gust::before {
  content: '';
  background-image: urL("https://em-content.zobj.net/source/apple/391/water-wave_1f30a.png");
  background-repeat: no-repeat;
  background-size: 130% auto;
  overflow: hidden;
  background-position: 0 var(--wp);
  opacity: var(--wo);
  position: absolute;
  top: -100%;
  left: 0;
  width: 43%;
  height: 100%;
  z-index: 0;
}

.gust::after {
  content: var(--wave);
  position: absolute;
  right: .1rem;
  font-size: .8rem;
  opacity: 1;
  top: -1.0rem;
}

.gust span {
  z-index: 10;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.9);
}
</style>
