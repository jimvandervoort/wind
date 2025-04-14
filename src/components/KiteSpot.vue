<script setup>
defineProps({
  spot: Object,
  batch: Number,
});

function getKiteCountText(count) {
  const c = Math.round(count);
  if (c === 0) return "No kites on the water";
  if (c >= 1 && c < 5) return "A few kites out";
  if (c >= 5 && c < 8) return "Plenty of kites out";
  return "Looks very crowded";
}

function getWebcamUrl(slug) {
  if (slug === "khaya") return "https://wavehub.co.za/";
  if (slug === "langebaan") return "https://www.capetown-webcam.com/west-coast/sports-centre-webcam-langebaan";
  if (slug === "bigbay") return "https://www.capetown-webcam.com/west-coast/eden-on-bay-webcam";
  if (slug === "canos") return "https://www.spotfav.com/dashboard/spots/los-canos-de-meca";
  if (slug === "lances") return "https://www.spotfav.com/dashboard/spots/los-lances-norte";
}
</script>

<template>
  <div class="flex flex-row items-center justify-between sm:justify-start pl-8 pr-12">
    <a :href="spot.spot.url" rel="noreferrer">
      <h1 class="mb-1 text-lg sm:text-2xl font-semibold title" :class="`slug_${spot.spot.slug}`" v-html="spot.spot.name"></h1>
    </a>
    <div class="flex flex-col items-end sm:items-start">
      <a v-if="spot.live" :href="spot.live.url" class="hover:underline" rel="noreferrer">
        <p class="fira-code pl-3 sm:pl-6 text-xs tracking-tighter font-semibold">
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
      <a v-if="spot.kiteCount !== null" :href="getWebcamUrl(spot.spot.slug)" class="hover:underline" rel="noreferrer">
        <p class="fira-code pl-3 sm:pl-6 text-xs tracking-tighter font-semibold">
          {{ getKiteCountText(spot.kiteCount) }}
        </p>
      </a>
    </div>
  </div>
  <a class="flex flex-row flex-wrap mb-8" :href="spot.spot.url" rel="noreferrer">
    <template v-for="day in spot.days">
      <div v-if="day.batch === batch" class="flex flex-row items-end fira-code">
        <h3 class="font-semibold flex rotate-270 pt-2 pl-1.5 ml-auto" v-if="day.forecast.some(f => f.visible)">{{ day.name }}</h3>
        <template v-else>
          <h3 class="font-semibold flex rotate-270 pt-2 pl-1.5 text-gray-500">{{ day.name }}</h3>
          <div class="h-16"></div>
        </template>
        <div v-for="f in day.forecast.filter(f => f.visible)" class="mt-6">
          <div class="gust w-12 flex flex-col justify-end pl-1"
              :style="`${f.gust.style}; --wave: '${f.waveStr}'; --wp: ${f.wavePos}`">
            <div class="dir opacity-90" :style="`--deg: ${f.deg}`">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="4"
                  stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>
              </svg>
            </div>
            <span class="">{{ f.wind.value }}</span>
            <span class="font-bold">{{ f.gust.value }}</span>
            <span class="">{{ f.timeStr }}</span>
          </div>
        </div>
      </div>
    </template>
  </a>
</template>

<style>
.m {
  transition: opacity 0.1s ease;
}

.title:hover .m {
  opacity: 0;
}
</style>

<style scoped>
h3 {
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
  background-image: url('/src/assets/wave.png');
  /* background-color: tomato; */
  background-repeat: no-repeat;
  background-size: 100% auto;
  overflow: hidden;
  background-position: 0 var(--wp);
  position: absolute;
  top: -1.5rem;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
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
