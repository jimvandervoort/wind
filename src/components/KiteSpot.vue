<script setup>
defineProps({
  spot: Object,
})
</script>

<template>
  <div class="flex flex-row items-center pl-8 pr-12 mt-8">
    <a :href="spot.spot.url" rel="noreferrer">
      <h1 :id="spot.spot.slug" class="mb-1 text-2xl font-semibold">{{ spot.spot.name }}</h1>
    </a>
    <a v-if="spot.live" :href="spot.live.url" rel="noreferrer">
      <p class="fira-code pl-3 sm:pl-6 text-xs tracking-tighter text-lg font-semibold mr-6">
        Live: {{ Math.round(spot.live.low) }} - {{ Math.round(spot.live.high) }} knts
        <span class="whitespace-nowrap">
          {{ spot.live.dir }}
          <svg class="-ml-1 -mt-1 size-3 inline" :style="`transform: rotate(${spot.live.deg}deg)`"
               xmlns="http://www.w3.org/2000/svg"
               fill="none" viewBox="0 0 24 24" stroke-width="4" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>
          </svg>
        </span>
      </p>
    </a>
  </div>
  <a class="flex flex-row flex-wrap mb-12" :href="spot.spot.url" rel="noreferrer">
    <template v-for="day in spot.days">
      <div class="flex flex-row items-end fira-code">
        <h2 class="font-semibold flex rotate-270 pt-2 pl-1.5 ml-auto" v-if="day.hasWind">{{ day.name }}</h2>
        <template v-else>
          <h2 class="font-semibold flex rotate-270 pt-2 pl-1.5 text-gray-500">{{ day.name }}</h2>
          <div class="h-16"></div>
        </template>
        <div v-for="fc in day.forecast" class="mt-6">
          <div class="gust w-12 flex flex-col justify-end pl-1"
               :style="`${fc.gust.style}; --wo: ${fc.waveOpacity}; --wave: '${fc.waveStr}'; --wp: ${fc.wavePos}`">
            <div class="dir opacity-90" :style="`--deg: ${fc.deg}`">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="4"
                   stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>
              </svg>
            </div>
            <span class="">{{ fc.wind.value }}</span>
            <span class="font-bold">{{ fc.gust.value }}</span>
            <span class="">{{ fc.timeStr }}</span>
          </div>
        </div>
      </div>
    </template>
  </a>
</template>

<style scoped>
h2 {
  transform: translateX(3px) translateY(1px) rotate(270deg);
}

.dir {
  position: absolute;
  top: .03rem;
  right: .2rem;
  width: 1rem;
  transform: rotate(var(--deg));
}

.gust {
  position: relative;
}

.gust::before {
  content: '';
  background-image: urL("/assets/wave.png");
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
}

.gust::after {
  content: var(--wave);
  position: absolute;
  right: .1rem;
  font-size: .8rem;
  opacity: 1;
  top: -1.0rem;
}
</style>
