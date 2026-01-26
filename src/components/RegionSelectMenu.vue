<script setup>
import { computed } from 'vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { getRegionGradient } from '../regionGradients';

const props = defineProps({
  region: {
    type: String,
    required: true
  }
});

const availableRegions = [
  { id: 'capetown', name: 'Cape Town', emoji: '🇿🇦' },
  { id: 'holland', name: 'Holland', emoji: '🇳🇱' },
  { id: 'tarifa', name: 'Tarifa', emoji: '🇪🇸' },
  { id: 'sweden', name: 'Sweden', emoji: '🇸🇪' },
  { id: 'myspots', name: 'My Spots', emoji: '🤩' },
  // { id: 'account', name: 'Manage Account', emoji: '💅' },
];

const listedRegions = availableRegions;

const selectedRegion = computed(() => {
  const region = availableRegions.find(r => r.id === props.region)
  if (region) return region;
  return { id: 'menu', name: 'Go to', emoji: '👉' }
});
</script>

<template>
  <div class="flex-col items-end justify-center w-full region-select-container">
    <Menu as="div" class="relative">
      <div class="flex justify-end">
        <MenuButton class="px-4 py-2 text-left rounded-b-lg border-2 border-t-0 border-gray-300 shadow-sm hover:bg-teal-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          <span class="flex items-center gap-2">
            <span class="text-sm">{{ selectedRegion.emoji }}</span>
            <span class="text sm fira-code font-mono font-bold">{{ selectedRegion.name }}</span>
          </span>
        </MenuButton>
      </div>

      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems class="absolute z-10 mt-2 w-full origin-top-right rounded-lg shadow-lg overflow-hidden flex justify-end">
          <div class="flex flex-col w-full max-w-md">
            <MenuItem v-for="region in listedRegions" :key="region.id" v-slot="{ active, close }">
              <a
                :href="`/${region.id}`"
                :class="[
                  active ? 'scale-[1.02]' : '',
                  'p-4 flex items-center gap-3 w-full transition-transform',
                  getRegionGradient(region.id)
                ]"
                @click.prevent="() => { close(); $router.push(`/${region.id}`); }"
              >
                <span class="text-3xl">{{ region.emoji }}</span>
                <span class="text-lg font-mono text-white font-bold">{{ region.name }}</span>
            </a>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>

<style scoped>
.region-select-container {
  padding-top: env(safe-area-inset-top);
}
</style>
