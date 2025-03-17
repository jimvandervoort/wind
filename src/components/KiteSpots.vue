<script setup>
import { ref, computed } from "vue";
import KiteSpot from "./KiteSpot.vue";

defineProps({
  report: Array,
});

const dir = ref("prev");
const touchStartX = ref(0);
const touchEndX = ref(0);
const containerPosition = ref(0);

const translateX = computed(() => {
  return dir.value === "prev" ? 0 : -100;
});

const next = () => {
  dir.value = "next";
};

const prev = () => {
  dir.value = "prev";
};

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX;
  const diff = touchEndX.value - touchStartX.value;

  // Limit the swipe to only move within the bounds
  if ((dir.value === "prev" && diff < 0) || (dir.value === "next" && diff > 0)) {
    const movePercent = (diff / window.innerWidth) * 100;
    containerPosition.value = dir.value === "prev" ? movePercent : -100 + movePercent;
  }
};

const handleTouchEnd = () => {
  const diff = touchEndX.value - touchStartX.value;
  const threshold = window.innerWidth * 0.2; // 20% of screen width

  if (diff < -threshold && dir.value === "prev") {
    dir.value = "next";
  } else if (diff > threshold && dir.value === "next") {
    dir.value = "prev";
  }

  // Reset position
  containerPosition.value = 0;
  touchStartX.value = 0;
  touchEndX.value = 0;
};
</script>

<template>
  <div class="flex flex-row justify-between pl-8 pr-8 max-w-lg">
    <button class="btn relative flex-1 mr-2 pt-1 pb-1" :class="`dir ${dir === 'prev' ? 'active' : ''}`" @click="prev">
      <div @click.stop.prevent class="select-marker" :class="dir"></div>
      This week
    </button>
    <button class="btn relative flex-1 ml-2" :class="`dir ${dir === 'next' ? 'active' : ''}`" @click="next">
      Next week
    </button>
  </div>
  <div class="swipe-container"
       @touchstart="handleTouchStart"
       @touchmove="handleTouchMove"
       @touchend="handleTouchEnd">
    <div class="swipe-wrapper"
         :style="{transform: `translateX(${(containerPosition || translateX) / 2}%)`, transition: containerPosition ? 'none' : 'transform 0.3s ease'}">
      <div class="swipe-page">
        <KiteSpot v-for="spot in report" :spot="spot" :batch="1"/>
      </div>
      <div class="swipe-page">
        <KiteSpot v-for="spot in report" :spot="spot" :batch="2"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  border: 2px solid #ccc;
  border-radius: .3rem;
  transition: transform .3s ease;
}

.btn::before {
  content: '';
  display: block;
  position: absolute;
  z-index: -1;

  top: 50%;
  left: .7rem;
  transform: translateY(-50%);
  width: .9rem;
  height: .9rem;

  background: #cccccc5b;
  border-radius: 50%;
}

.select-marker {
  display: block;
  position: absolute;
  z-index: 1;
  transition: transform .3s ease;
  width: 100%;
  height: 3rem;
  background: url('../assets/george.png') no-repeat -3px center;
  background-size: contain;
  left: 0;
  top: -9px;
}

.select-marker.prev {
  transform: translateX(0);
}

.select-marker.next {
  transform: translateX(calc(100% + 20px));
}

.swipe-container {
  overflow: hidden;
  width: 100vw;
  position: relative;
}

.swipe-wrapper {
  display: flex;
  width: 200vw;
  position: relative;
}

.swipe-page {
  width: 100vw;
  flex-shrink: 0;
  padding-top: 2rem;
}
</style>
