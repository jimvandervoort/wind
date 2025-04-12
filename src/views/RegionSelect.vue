<script setup>
const availableRegions = [
  { id: 'capetown', name: 'Cape Town', emoji: '🇿🇦' },
  { id: 'tarifa', name: 'Tarifa', emoji: '🇪🇸' },
  { id: 'holland', name: 'Holland', emoji: '🇳🇱' }
];
</script>

<template>
  <div class="p-8 flex flex-col items-center justify-center max-w-lg mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Where do you shred? 🤙</h1>
    <div class="flex flex-col gap-5 w-full">
      <router-link
        v-for="region in availableRegions"
        :key="region.id"
        :to="`/${region.id}`"
        class="p-8 flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-transform hover:scale-105"
        :class="{
          'bg-gradient-to-br from-rose-500 to-orange-500': region.id === 'tarifa',
          'bg-gradient-to-br from-emerald-500 to-teal-500': region.id === 'capetown',
          'bg-gradient-to-br from-blue-400 to-indigo-400': region.id === 'holland',
        }"
      >
        <span class="text-6xl">{{ region.emoji }}</span>
        <span class="text-2xl font-mono text-white font-bold fira-code">{{ region.name }}</span>
      </router-link>
    </div>
  </div>
</template>
