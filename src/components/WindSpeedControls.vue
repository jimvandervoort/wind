<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
const settingsOpen = ref(false);
const input = ref(null);
const puff = ref(null);
const rangeBubbleOpen = ref(false);

const toggleGustSettings = () => {
  settingsOpen.value = !settingsOpen.value;
};

const startRangeBubble = () => {
  rangeBubbleOpen.value = true;
};

const endRangeBubble = () => {
  rangeBubbleOpen.value = false;
};

const rangeTranslateX = computed(() => {
  if (!input.value) return '0';
  const puffWidth = puff.value.getBoundingClientRect().width;
  const rangeWidth = input.value.getBoundingClientRect().width - (puffWidth / 2);
  const min = parseFloat(input.value.min);
  const max = parseFloat(input.value.max);
  const progress = (props.modelValue - 10) / 20;
  console.log(progress)
  const translateX = progress * rangeWidth;
  if (rangeBubbleOpen.value) {
    return `${translateX}px`;
  }
  return `${translateX * 2}px`;
});
</script>

<template>
  <div class="blowboy" :class="{ 'suprised': modelValue >= 30, 'side': settingsOpen }" @click="toggleGustSettings"></div>
  <div ref="puff" class="puff fira-code text-[#2d455d] pt-[.7rem] pl-[.1rem] flex flex-col items-center" :class="{ 'isopen': settingsOpen, 'israngebubble': rangeBubbleOpen }" style="letter-spacing: 0; text-align: center;">
    <span class="text-xl">{{ modelValue }}</span>
    <span class="font-bold text-xs mt-[-.4rem]">KNTS</span>
  </div>
  <div class="gustsettings bg-slate-800 pl-[8rem] pr-8 flex flex-col max-w-lg" :class="{ 'hidden': !settingsOpen }">
    <p class="mt-[.7rem]">Show me at least <span class="font-semibold fira-code">{{ modelValue }}</span> knots</p>
    <input
      @touchstart="startRangeBubble"
      @touchend="endRangeBubble"
      ref="input"
      class="mt-[.7rem]"
      type="range"
      min="10"
      max="30"
      :value="modelValue"
      @input="e => emit('update:modelValue', parseInt(e.target.value))"
    />
  </div>
</template>

<style scoped>
.blowboy {
  position: relative;
  transition: all 0.3s ease;
  background-image: url('../assets/blowboy.png');
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
  background-image: url('../assets/blowboy_suprised.png');
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
  transition: all .3s ease;
  position: fixed;
  height: 4rem;
  width: 4rem;
  background-image: url('../assets/puff3.png');
  background-size: cover;
  background-position: center;
  bottom: -.3rem;
  left: 1.3rem;
  z-index: 1;
}

.puff.isopen {
  left: 7rem;
  bottom: -.2rem;
  opacity: 1;
  transition: none;
  display: none;
  transform: scale(.5) translateX(v-bind('rangeTranslateX'));
}

.puff.israngebubble {
  display: flex;
  transition: none;
  transform: scale(1) translateY(-6rem) translateX(v-bind('rangeTranslateX'));
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
  background: url('../assets/puff3.png') no-repeat center center;
  background-size: cover;
}

input[type="range"]::-moz-range-thumb {
  appearance: none;
  border: none;
  width: 2rem;
  height: 2rem;
  background: url('../assets/puff3.png') no-repeat center center;
  background-size: cover;
}
</style>
