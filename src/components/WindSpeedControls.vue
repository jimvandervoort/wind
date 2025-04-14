<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

let didInteract = localStorage.getItem('didInteractWithWindControls') === 'true';
const closeTimer = ref(null);

const isSettingsOpen = ref(!didInteract);
const input = ref(null);
const puff = ref(null);
const rangePuff = ref(null);
const isRangePuffOpen = ref(false);

const toggleGustSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value;
  unsetCloseTimer();
};

const startRangPuff = () => {
  isSettingsOpen.value = true;
  isRangePuffOpen.value = true;
  unsetCloseTimer();
};

const endRangePuff = () => {
  isRangePuffOpen.value = false;
  setCloseTimer();
};

const unsetCloseTimer = () => {
  if (closeTimer.value) {
    clearTimeout(closeTimer.value);
  }
};

const setCloseTimer = () => {
  closeTimer.value = setTimeout(() => {
    didInteract = true;
    localStorage.setItem('didInteractWithWindControls', 'true');
    isSettingsOpen.value = false;
  }, 600);
};

const handleRangeInput = (e) => {
  emit('update:modelValue', parseInt(e.target.value));
};

const handleScroll = () => {
  if (!didInteract) return;
  if (isRangePuffOpen.value) return;
  if (!isSettingsOpen.value) return;
  isSettingsOpen.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});


const rangeTranslateX = computed(() => {
  if (!input.value) return '0';
  const puffWidth = rangePuff.value.getBoundingClientRect().width;
  const inputRect = input.value.getBoundingClientRect();
  const rangeWidth = inputRect.width - puffWidth / 2;
  const min = parseFloat(input.value.min);
  const max = parseFloat(input.value.max);
  const progress = (props.modelValue - min) / (max - min);
  const translateX = progress * rangeWidth + inputRect.left - puffWidth / 4;
  if (isRangePuffOpen.value) {
    return `${translateX}px`;
  }
  return `${translateX * 2}px`;
});
</script>

<template>
  <div class="blowboy" :class="{ 'suprised': modelValue >= 30, 'side': isSettingsOpen }" @click="toggleGustSettings"></div>
  <div ref="puff" @click="toggleGustSettings" class="puff btnpuff fira-code text-[#2d455d] pt-[.6rem] pl-[.1rem] flex flex-col items-center" :class="{ 'isopen': isSettingsOpen}">
    <span class="text-xl">{{ modelValue }}+</span>
    <span class="font-bold text-xs mt-[-.4rem]">KNOTS</span>
  </div>
  <div ref="rangePuff" class="puff rangepuff fira-code text-[#2d455d] pt-[.6rem] pl-[.1rem] flex flex-col items-center" :class="{ 'isopen': isSettingsOpen, 'israngepuffopen': isSettingsOpen && isRangePuffOpen }">
    <span class="text-xl">{{ modelValue }}+</span>
    <span class="font-bold text-xs mt-[-.4rem]">KNOTS</span>
  </div>
  <transition
    enter-active-class="transition duration-[0.3s] ease-in"
    enter-from-class="transform opacity-0"
    enter-to-class="transform opacity-100"
    leave-active-class="transition duration-[0.3s] ease-in"
    leave-from-class="transform opacity-100"
    leave-to-class="transform opacity-0"
  >
    <div v-if="isSettingsOpen" class="gustsettings bg-slate-900 border-t-[#2d455d] border-t-2 pl-[8rem] pr-8 flex flex-col max-w-lg">
      <p class="mt-[.7rem]">Show me at least <span class="font-semibold fira-code">{{ modelValue }}</span> knots</p>
      <input
        @touchstart="startRangPuff"
        @mousedown="startRangPuff"
        @touchend="endRangePuff"
        @mouseup="endRangePuff"
        ref="input"
        class="mt-[.7rem]"
        type="range"
        min="10"
        max="30"
        :value="modelValue"
        @input="handleRangeInput"
      />
    </div>
  </transition>
</template>

<style scoped>
.blowboy {
  position: relative;
  transition: all 0.4s ease;
  background-image: url('../assets/blowboy.webp');
  background-size: cover;
  background-position: center;
  position: fixed;
  bottom: -2.3rem;
  left: -5rem;
  height: 11rem;
  width: 8rem;
  z-index: 2;
}

.blowboy::after {
  content: '';
  position: absolute;
  transition: opacity 0.2s ease;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../assets/blowboy_suprised.webp');
  background-size: cover;
  background-position: center;
  z-index: 1;
  opacity: 0;
}

.blowboy.suprised::after {
  opacity: 1;
}

.blowboy.side {
  left: -0rem;
}

.gustsettings {
  position: fixed;
  height: 5rem;
  width: 100vw;
  bottom: 0;
}

.puff {
  letter-spacing: 0;
  position: fixed;
  height: 4rem;
  width: 4rem;
  background-image: url('../assets/puff.webp');
  background-size: cover;
  background-position: center;
}

.puff.btnpuff {
  transition: all .5s ease;
  bottom: -0.3rem;
  left: 1.6rem;
}

.puff.btnpuff.isopen {
  opacity: 0;
  transform: translateX(-1rem);
}

.puff.rangepuff {
  display: none;
  bottom: 4.5rem;
  left: 0;
  z-index: 3;
}

.puff.israngepuffopen {
  display: flex;
  transition: none;
  transform: translateX(v-bind('rangeTranslateX'));
}

input[type="range"] {
  appearance: none;
  background: none;
  border: 2px solid #ccc;
  outline: none;
  border-radius: .2rem;
  height: .4rem;
  position: relative;
  z-index: 10;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  width: 2rem;
  height: 2rem;
  background: url('../assets/puff.webp') no-repeat center center;
  background-size: cover;
}

input[type="range"]::-moz-range-thumb {
  appearance: none;
  border: none;
  width: 2rem;
  height: 2rem;
  background: url('../assets/puff.webp') no-repeat center center;
  background-size: cover;
}
</style>
