<script setup>
import { ref, computed, inject, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import spots from 'virtual:spotlist';
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import Sortable from 'sortablejs';
import { RequestQueue } from '../requestqueue';

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
const userSpots = ref(null);
const router = useRouter();
const isLoading = ref(true);

const requestQueue = new RequestQueue();

const userSpotsContainer = ref(null);
const availableSpotsContainer = ref(null);

const filteredSpots = computed(() => {
  if (!searchQuery.value) {
    return spotList.value.filter(spot =>
      !userSpots.value.some(userSpot => userSpot.slug === spot.slug)
    );
  }

  const query = searchQuery.value.toLowerCase();
  return spotList.value.filter(spot =>
    !userSpots.value.some(userSpot => userSpot.slug === spot.slug) &&
    (spot.name.toLowerCase().includes(query) ||
    spot.slug.toLowerCase().includes(query) ||
    spot.region.toLowerCase().includes(query))
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
  userSpots.value = [...userSpots.value, spot];
};

const removeSpot = async (spot) => {
  userSpots.value = userSpots.value.filter(s => s.slug !== spot.slug);
};

const loadUserSpots = async () => {
  try {
    const response = await api.get('/myspots');
    if (response.ok) {
      const data = await response.json();
      userSpots.value = data.report.map(spot => ({
        ...spot.spot,
        region: spot.spot.region
      }));
      isLoading.value = false;
    }
  } catch (error) {
    console.error('Failed to load user spots:', error);
  }
};

watch(userSpots, () => {
  requestQueue.add(() => api.put('/myspots', {
    slugs: userSpots.value.map(s => s.slug),
  }));
});

onMounted(async () => {
  await loadUserSpots();
  await nextTick();

  if (userSpotsContainer.value) {
    new Sortable(userSpotsContainer.value, {
      animation: 150,
      ghostClass: 'opacity-50',
      group: 'spots',
      onEnd: (evt) => {
        const spots = [...userSpots.value];
        const [movedSpot] = spots.splice(evt.oldIndex, 1);
        spots.splice(evt.newIndex, 0, movedSpot);
        userSpots.value = spots;
      }
    });
  }

  if (availableSpotsContainer.value) {
    new Sortable(availableSpotsContainer.value, {
      animation: 150,
      ghostClass: 'opacity-50',
      group: 'spots',
      onEnd: (evt) => {
        if (evt.to === userSpotsContainer.value) {
          const spot = filteredSpots.value[evt.oldIndex];
          const newSpots = [...userSpots.value];
          newSpots.splice(evt.newIndex, 0, spot);
          userSpots.value = newSpots;
        }
      }
    });
  }
});
</script>

<template>
  <div class="p-8 pt-4 max-w-xl mx-auto">
    <div class="flex justify-end mb-4">
      <router-link
        to="/myspots"
        class="px-6 py-4 mb-1 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 hover:opacity-90 text-white font-bold transition-all"
      >
        Done
      </router-link>
    </div>
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

    <!-- User's Spots Section -->
    <div class="mb-8">
      <h2 class="text-lg font-bold text-white mb-4">Your Spots<span class="text-white/50 font-normal pl-2">&mdash; Drag to change order</span></h2>
      <div ref="userSpotsContainer" class="grid gap-4">
        <div
          v-for="spot in userSpots"
          :key="spot.slug"
          class="p-4 rounded-lg text-left shadow-sm transition-transform hover:scale-[1.02] cursor-move"
          :class="getRegionColor(spot.region)"
        >
          <h3 class="flex flex-row justify-between items-center text-lg font-mono text-white font-bold py-1">
            <span v-html="spot.name"></span>
            <div class="flex items-center gap-2">
              <div class="h-6 w-px bg-white/50"></div>
              <button
                @click="removeSpot(spot)"
                class="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <TrashIcon class="h-6 w-6 text-white" />
              </button>
            </div>
          </h3>
        </div>
      </div>
    </div>

    <!-- Available Spots Section -->
    <div v-if="userSpots">
      <h2 class="text-lg font-bold text-white mb-4">Available Spots</h2>
      <div ref="availableSpotsContainer" class="grid gap-4">
        <button
          v-for="spot in filteredSpots"
          :key="spot.slug"
          @click="addSpot(spot)"
          class="p-4 rounded-lg text-left shadow-sm transition-transform hover:scale-[1.02] cursor-move"
          :class="getRegionColor(spot.region)"
        >
          <h3 class="flex flex-row justify-between items-center text-lg font-mono text-white font-bold py-1">
            <span v-html="spot.name"></span>
            <div class="flex items-center gap-2">
              <div class="h-6 w-px bg-white/50"></div>
              <div class="p-1 rounded-full hover:bg-white/10 transition-colors">
                <PlusIcon class="h-6 w-6 text-white" />
              </div>
            </div>
          </h3>
        </button>
      </div>
    </div>
  </div>
</template>
