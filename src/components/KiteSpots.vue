<script setup>
import { ref } from "vue";
import KiteSpot from "./KiteSpot.vue";

defineProps({
  report: Array,
});

const dir = ref("prev");

const next = () => {
  dir.value = "next";
};

const prev = () => {
  dir.value = "prev";
};
</script>

<template>
  <div class="flex flex-row justify-between pl-8 pr-8 max-w-lg">
    <button class="btn relative flex-1 mr-2 pt-1 pb-1" :class="`dir ${dir === 'prev' ? 'active' : ''}`" @click="prev">
      <div class="select-marker" :class="dir"></div>
      This week
    </button>
    <button class="btn relative flex-1 ml-2" :class="`dir ${dir === 'next' ? 'active' : ''}`" @click="next">
      Next week
    </button>
  </div>
  <div class="relative">
    <transition name="slide">
      <div class="pt-8" v-if="dir === 'prev'">
        <KiteSpot v-for="spot in report" :spot="spot" :batch="1"/>
      </div>
    </transition>
    <transition name="slide-reverse">
      <div class="pt-8" v-if="dir === 'next'">
        <KiteSpot v-for="spot in report" :spot="spot" :batch="2"/>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.btn {
  border: 2px solid #ccc;
  border-radius: .3rem;
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

  /* border: 2px solid #cccccc5b; */
  background: #cccccc5b;
  border-radius: 50%;
}

.select-marker {
  display: block;
  position: absolute;
  z-index: 1;
  transition: all .3s ease;
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

.slide-reverse-enter-active,
.slide-enter-active {
  position: absolute;
  top: 0;
}

.slide-enter-active,
.slide-leave-active,
.slide-reverse-enter-active,
.slide-reverse-leave-active {
  transition: all .3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100vw);
}

.slide-reverse-enter-from,
.slide-reverse-leave-to {
  transform: translateX(100vw);
}
</style>
