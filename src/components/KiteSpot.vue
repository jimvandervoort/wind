<script setup>
import { ref } from 'vue';

const props = defineProps({
  spot: Object,
  batch: Number,
});

const showPopup = ref(false);

function getKiteCountText(count) {
  const c = Math.round(count);
  if (c === 0) return "No kites on the water";
  if (c < 5) return "A few kites out";
  if (c < 8) return "Plenty of room for you";
  if (c < 10) return "Crowded out there";
  return "Just saw your mum's out";
}

function getWebcamUrl(slug) {
  if (slug === "khaya") return "https://wavehub.co.za/";
  if (slug === "langebaan") return "https://www.capetown-webcam.com/west-coast/sports-centre-webcam-langebaan";
  if (slug === "bigbay") return "https://www.capetown-webcam.com/west-coast/eden-on-bay-webcam";
  if (slug === "canos") return "https://www.spotfav.com/dashboard/spots/los-canos-de-meca";
  if (slug === "lances") return "https://www.spotfav.com/dashboard/spots/los-lances-norte";
}

function getFrameUrl(slug) {
  return `/frames/${slug}.jpg?t=${Date.now()}`;
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
      <a v-if="spot.tide && spot.tide.length" href="https://www.tideschart.com/United-Kingdom/England/Liverpool/New-Brighton-(Wallasey)-Beach/" class="hover:underline" rel="noreferrer">
        <p class="fira-code pl-3 sm:pl-6 text-xs tracking-tighter font-semibold">
          Tide {{ spot.tide.map(t => `${t.text}: ${t.time}`).join(', ') }}
        </p>
      </a>
      <div v-else-if="spot.kiteCount !== null">
        <p class="fira-code pl-3 sm:pl-6 text-xs tracking-tighter font-semibold cursor-pointer hover:underline"
           @click="showPopup = !showPopup">
          {{ getKiteCountText(spot.kiteCount) }}
        </p>
        <Teleport to="body">
          <div v-if="showPopup" class="popup-overlay" @click="showPopup = false">
            <div class="webcam-popup" @click.stop>
              <button class="popup-dismiss fira-code" @click="showPopup = false" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
                DISMISS
              </button>
              <img :src="getFrameUrl(spot.spot.slug)" alt="Latest webcam frame" class="popup-img" />
              <a :href="getWebcamUrl(spot.spot.slug)" class="webcam-link fira-code" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
                  <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                </svg>
                View live webcam
              </a>
            </div>
          </div>
        </Teleport>
      </div>
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

.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.webcam-popup {
  position: relative;
  background: #1a1a1a;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  width: 100%;
}

@media (min-width: 640px) {
  .webcam-popup {
    width: 600px;
  }
}

.popup-dismiss {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  font-size: 0.75rem;
}

.popup-dismiss:hover {
  background: rgba(0, 0, 0, 0.8);
}

.popup-dismiss svg {
  width: 16px;
  height: 16px;
}

.popup-img {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 16 / 9;
  background: #000;
}

.webcam-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  background: #4c3a5c;
}

.webcam-link:hover {
  background: #5d4a6e;
}

.play-icon {
  width: 18px;
  height: 18px;
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
