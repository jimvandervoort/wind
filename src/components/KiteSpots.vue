<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import KiteSpot from "./KiteSpot.vue";

defineProps({
  report: Array,
});

const touch = new URLSearchParams(window.location.search).get('touch') !== 'false';

let lastDiff = 0;
const dir = ref("prev");
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const travelAxis = ref("none");
const containerPosition = ref(0);
const translateYPrev = ref(0);
const translateYNext = ref(0);
const kiteloop = ref(false);
const animationLock = ref(false);

const translateX = computed(() => {
  return dir.value === "prev" ? 0 : -100;
});

const move = (to) => {
  kiteloop.value = Math.random() > 0.8;
  dir.value = to;
};

const next = () => move("next");
const prev = () => move("prev");

const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft') {
    prev();
  } else if (e.key === 'ArrowRight') {
    next();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const handleTouchStart = (e) => {
  if (!touch) return;
  if (animationLock.value) return;

  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;

  const newPage = document.querySelector(`.page-${dir.value === 'prev' ? 'next' : 'prev'}`);
  const oldPage = document.querySelector(`.page-${dir.value}`);
  const firstH = Array.from(oldPage.querySelectorAll('h1')).find(h => h.getBoundingClientRect().top > 0);
  const cls = Array.from(firstH.classList).find(c => c.startsWith('slug_'));
  const peer = newPage.querySelector(`.${cls}`);

  if (!peer) return;

  const peerRect = peer.getBoundingClientRect();
  const myRect = firstH.getBoundingClientRect();
  lastDiff = peerRect.top * -1 + myRect.top;
  if (dir.value === 'next') {
    translateYPrev.value = lastDiff;
  } else {
    translateYNext.value = lastDiff;
  }
};

const handleTouchMove = (e) => {
  if (!touch) return;
  if (animationLock.value) return;

  touchEndX.value = e.touches[0].clientX;
  const diff = touchEndX.value - touchStartX.value;
  const diffY = e.touches[0].clientY - touchStartY.value;
  const thresholdX = 5;
  const thresholdY = 3;

  if (travelAxis.value === "none") {
    if (Math.abs(diff) > thresholdX) {
      travelAxis.value = "x-axis"
      e.preventDefault();
      touchStartX.value = touchEndX.value;
    } else if (Math.abs(diffY) > thresholdY) {
      travelAxis.value = "y-axis"
    }

    return;
  }

  if (travelAxis.value === "x-axis") {
    e.preventDefault();
  } else if (travelAxis.value === "y-axis") {
    return;
  }

  // Limit the swipe to only move within the bounds
  if ((dir.value === "prev" && diff < 0) || (dir.value === "next" && diff > 0)) {
    const movePercent = (diff / window.innerWidth) * 100;
    containerPosition.value = dir.value === "prev" ? movePercent : -100 + movePercent;
  }
};

const handleTouchEnd = (e) => {
  if (!touch) return;
  animationLock.value = true;

  const wasY = travelAxis.value === "y-axis";
  const wasX = travelAxis.value === "x-axis";
  travelAxis.value = "none";
  if (wasY) return;

  const diff = touchEndX.value - touchStartX.value;
  const threshold = window.innerWidth * 0.2; // 20% of screen width
  const willMoveNext = (diff < -threshold && dir.value === "prev") && wasX;
  const willMovePrev = (diff > threshold && dir.value === "next") && wasX;

  if (willMoveNext || willMovePrev) {
    window.scrollTo(window.scrollX, window.scrollY + lastDiff * -1);
    setTimeout(() => {
      requestAnimationFrame(() => {
        translateYPrev.value = 0;
        translateYNext.value = 0;
        requestAnimationFrame(() => {
          animationLock.value = false;
        });
      });
    }, 300);
  } else {
    translateYPrev.value = 0;
    translateYNext.value = 0;
    animationLock.value = false;
  }

  if (willMoveNext) {
    next();
    translateYNext.value = 0;
    translateYPrev.value = lastDiff * -1;
  } else if (willMovePrev) {
    prev();
    translateYPrev.value = 0;
    translateYNext.value = lastDiff * -1;
  }

  // Reset position
  containerPosition.value = 0;
  touchStartX.value = 0;
  touchEndX.value = 0;
};
</script>

<template>
  <!-- <h1 class="sticky top-0 text-2xl p-4 z-20 bg-black">travel: {{ travelAxis }}</h1> -->
  <div class="flex flex-row justify-between pl-8 pr-8 max-w-lg">
    <button class="btn relative flex-1 mr-2 pt-1 pb-1" :class="`dir ${dir === 'prev' ? 'active' : ''}`" @click="prev">
      <div @click.stop.prevent class="select-marker" :class="{'kiteloop': kiteloop, [dir]: true}"></div>
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
      <div class="swipe-page page-prev" :style="{transform: `translateY(${translateYPrev}px)`}">
        <KiteSpot v-for="spot in report" :spot="spot" :batch="1"/>
      </div>
      <div class="swipe-page page-next" :style="{transform: `translateY(${translateYNext}px)`}">
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
  transform: translateX(0);
  width: 100%;
  height: 3rem;
  background: url('../assets/george.png') no-repeat -3px center;
  background-size: contain;
  left: 0;
  top: -9px;
}

.select-marker:not(.kiteloop).next {
  transform: translateX(calc(100% + 20px));
}

.select-marker.kiteloop.next {
  transform: translateX(calc(100% + 20px)) rotate(360deg);
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
