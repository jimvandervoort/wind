<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { mapRangeClamp } from '../range.js';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  windMode: {
    type: String,
    default: 'base',
    validator: (v) => ['gust', 'base'].includes(v)
  }
});

const windModes = [
  { value: 'gust', label: 'Gust' },
  { value: 'base', label: 'Base' },
];

// p: current position, o: original position, k: stiffness
function rubberBand(p, o, k = 120) {
  const d = p - o;
  const s = Math.sign(d);
  const a = Math.abs(d);
  return o + s * (k * Math.log1p(a / k)); // log1p(x) = log(1+x)
}

const emit = defineEmits(['update:modelValue', 'update:windMode']);

const enableRangeDrag = window.location.hash === '#drag';
let didInteract = localStorage.getItem('didInteractWithWindControls') === 'true';
const closeTimer = ref(null);
let puffDragStartX = 0;
let puffDragTranslateX = ref(0);
let isPuffDragging = ref(false);
const isSettingsOpen = ref(!didInteract);
const input = ref(null);
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

const setWindMode = (mode) => {
  // Treat a toggle tap like a slider release: restart the dismiss timer so the
  // panel stays open briefly to show the change, then closes on its own.
  unsetCloseTimer();
  setCloseTimer();
  if (mode === props.windMode) return;
  emit('update:windMode', mode);
};

const handleScroll = () => {
  if (!didInteract) return;
  if (isRangePuffOpen.value) return;
  if (!isSettingsOpen.value) return;
  isSettingsOpen.value = false;
};

const startPuffDrag = (e) => {
  if (!enableRangeDrag) return;

  puffDragStartX = e.touches[0].clientX;
  isPuffDragging.value = true;
};

const handlePuffDrag = (e) => {
  if (!enableRangeDrag) return;

  e.preventDefault();
  const dragX = e.touches[0].clientX;
  const dragDiff = dragX - puffDragStartX;

  const nextValue = Math.round(mapRangeClamp(dragDiff, puffDragStartX, window.innerWidth - 100, 10, 30));
  emit('update:modelValue', nextValue);

  puffDragTranslateX.value = `${rubberBand(dragDiff, puffDragStartX, 120) * .5}px`;
}

const endPuffDrag = () => {
  if (!enableRangeDrag) return;

  isPuffDragging.value = false;
  puffDragTranslateX.value = '0';
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
  <div
  ref="puff"
  @click="toggleGustSettings"
  @touchstart="startPuffDrag"
  @touchmove="handlePuffDrag"
  @touchend="endPuffDrag"
  class="puff btnpuff fira-code text-[#2d455d] pt-[.6rem] pl-[.1rem] flex flex-col items-center"
  :class="{ 'isopen': isSettingsOpen, 'puffdragging': isPuffDragging }">
    <span class="text-xl">{{ modelValue }}+</span>
    <span class="font-bold text-xs mt-[-.4rem]">KNOTS</span>
  </div>
  <div
    ref="rangePuff"
    class="puff rangepuff fira-code text-[#2d455d] pt-[.6rem] pl-[.1rem] flex flex-col items-center"
    :class="{ 'isopen': isSettingsOpen, 'israngepuffopen': isSettingsOpen && isRangePuffOpen }">
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
    <div v-if="isSettingsOpen" class="gustsettings bg-slate-900 border-t-[#2d455d] border-t-2 pl-[8rem] pr-5 flex flex-col max-w-lg">
      <p class="mt-[.4rem]">Show me at least <span class="font-semibold fira-code">{{ modelValue }}</span> knots</p>
      <div class="mt-[.1rem] flex flex-row items-center gap-3">
        <input
          @touchstart="startRangPuff"
          @mousedown="startRangPuff"
          @touchend="endRangePuff"
          @mouseup="endRangePuff"
          ref="input"
          class="flex-1 min-w-0"
          type="range"
          min="10"
          max="30"
          :value="modelValue"
          @input="handleRangeInput"
        />
        <div class="windmode fira-code flex flex-row shrink-0" role="radiogroup" aria-label="Wind value">
          <button
            v-for="mode in windModes"
            :key="mode.value"
            type="button"
            role="radio"
            :aria-checked="windMode === mode.value"
            class="windmode-option"
            :class="{ 'isactive': windMode === mode.value }"
            @click="setWindMode(mode.value)"
          >{{ mode.label }}</button>
        </div>
      </div>
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
  bottom: calc(-2rem + env(safe-area-inset-bottom));
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
  height: calc(5rem + env(safe-area-inset-bottom));
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
  transform: translateX(v-bind('puffDragTranslateX'));
  bottom: env(safe-area-inset-bottom);
  left: 1.6rem;
}

.puff.btnpuff.puffdragging {
  transition: none;
}

.puff.btnpuff.isopen {
  opacity: 0;
  transform: translateX(-1rem);
}

.puff.rangepuff {
  display: none;
  bottom: calc(4.5rem + env(safe-area-inset-bottom));
  left: 0;
  z-index: 3;
}

.puff.israngepuffopen {
  display: flex;
  transition: none;
  transform: translateX(v-bind('rangeTranslateX'));
}

.windmode {
  border: 2px solid #2d455d;
  border-radius: .4rem;
  overflow: hidden;
  position: relative;
  z-index: 10;
}

.windmode-option {
  padding: .15rem .55rem;
  font-size: .75rem;
  font-weight: 600;
  line-height: 1.2rem;
  color: rgba(255, 255, 255, .7);
  transition: background-color .15s ease, color .15s ease;
}

.windmode-option + .windmode-option {
  border-left: 2px solid #2d455d;
}

.windmode-option.isactive {
  background: #2d455d;
  color: #fff;
}

input[type="range"] {
  appearance: none;
  background: hsl(214, 29%, 40%);
  border: none;
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
