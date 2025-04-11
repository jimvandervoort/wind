<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import spots from 'virtual:spotlist';

const emailTemplate = encodeURIComponent(`Hey Jim

I'm trying to add a new spot to the site, but I can't find it.
Here is some info about the spot:

Name:
Country:
This is the Emoji I think would be best for the spot:

Any other feedback and suggestions 😊:

Thanks!`);

const emailSubject = encodeURIComponent('Add this spot');

const api = inject('api');
const searchQuery = ref('');
const spotList = ref(spots);
const router = useRouter();

const filteredSpots = computed(() => {
  if (!searchQuery.value) return spotList.value;

  const query = searchQuery.value.toLowerCase();
  return spotList.value.filter(spot =>
    spot.name.toLowerCase().includes(query) ||
    spot.slug.toLowerCase().includes(query) ||
    spot.region.toLowerCase().includes(query)
  );
});

const getRegionColor = (region) => {
  switch (region) {
    case 'tarifa':
      return 'bg-gradient-to-br from-rose-500 to-orange-500';
    case 'capetown':
      return 'bg-gradient-to-br from-emerald-500 to-teal-500';
    case 'holland':
      return 'bg-gradient-to-br from-blue-400 to-indigo-400';
    default:
      return 'bg-gradient-to-br from-amber-500 to-yellow-500';
  }
};

const addSpot = async (spot) => {
  await api.put('/myspots', {
    slugs: [spot.slug],
  });
  router.push('/myspots');
};
</script>

<template>
  <div class="p-8 max-w-xl mx-auto">
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search spots..."
        class="w-full p-4 rounded-lg border-2 bg-slate-100 text-[#0c1215] font-bold border-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <h1 v-if="!searchQuery" class="text-xl pt-4 font-bold text-center text-white">Hey there handsome! 👋</h1>
    <p v-if="!searchQuery" class="text-lg text-white pb-8">
      Stoked to have you here! We're just starting so if you can't find your spot, please
      <a :href="`mailto:wind@jim.computer?subject=${emailSubject}&body=${emailTemplate}`" class="underline hover:text-blue-300">get in touch</a>
      and we'll do our best!
    </p>

    <div class="grid gap-4 pb-8">
      <button
        v-for="spot in filteredSpots"
        @click="addSpot(spot)"
        :key="spot.slug"
        class="p-4 rounded-lg text-left shadow-sm transition-transform hover:scale-[1.02]"
        :class="getRegionColor(spot.region)"
      >
        <h3 class="flex flex-row justify-between text-lg font-mono text-white font-bold py-1">
          <span v-html="spot.name"></span>
          <span v-html="spot.emoji"></span>
        </h3>
      </button>
    </div>
  </div>
</template>
