<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  kickers: Array,
  days: Array,
  batch: Number,
  slug: String,
});

const expanded = ref(false);

const noKickerPhrases = [
  'Can\'t see any lekker kickers coming up 🥺',
  'No epic kickers on the horizon... yet 🤷',
  'Kicker gods are taking a break 😴',
  'No kickers found, time to practice your yoga 🧘',
  '404 - kickers not found 🕵️‍♂️',
  'Kickers shall commence when the elements align 🌌',
];

function fmtTime(time) {
  const date = new Date(time);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 10) * 10;

  const adjustedDate = new Date(date);
  adjustedDate.setMinutes(roundedMinutes);

  return adjustedDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Johannesburg",
  });
}

function getIntensityColor(startTime) {
  const hour = 60 * 60 * 1000;
  const now = new Date();
  const start = new Date(startTime);
  const timeDiff = start - now;

  if (timeDiff <= 0) return "text-rose-500";
  if (timeDiff <= hour) return "text-rose-400";
  if (timeDiff <= 2 * hour) return "text-rose-300";
  if (timeDiff <= 3 * hour) return "text-rose-200";
  if (timeDiff <= 4 * hour) return "text-rose-100";
  return "text-rose-50";
}

// Get visible forecast timestamps (in ms) for the current batch
function getVisibleForecastTimes() {
  if (!props.days) return [];

  const times = [];
  for (const day of props.days) {
    if (day.batch !== props.batch) continue;
    for (const f of day.forecast) {
      if (!f.visible) continue;
      // forecast unixTime is in seconds, kickers use milliseconds
      times.push(f.unixTime * 1000);
    }
  }
  return times;
}

function mapKicker(k, now, tomorrow) {
  const dateStart = new Date(k.start);
  const dateEnd = new Date(k.end);
  const dayName = dateStart.toLocaleDateString(undefined, {
    weekday: "long",
    timeZone: "Africa/Johannesburg",
  });
  return {
    clrClass: getIntensityColor(k.start),
    start: fmtTime(k.start),
    end: fmtTime(k.end),
    isToday: dateStart.toDateString() === now.toDateString(),
    isTomorrow: dateStart.toDateString() === tomorrow.toDateString(),
    isNow: dateStart <= now && dateEnd >= now,
    dayName,
  };
}

function sameDay(tsA, tsB) {
  const a = new Date(tsA).toLocaleDateString(undefined, { timeZone: 'Africa/Johannesburg' });
  const b = new Date(tsB).toLocaleDateString(undefined, { timeZone: 'Africa/Johannesburg' });
  return a === b;
}

const batchKickers = computed(() => {
  if (!props.kickers) return [];

  const visibleTimes = getVisibleForecastTimes();
  if (!visibleTimes.length) return [];

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return props.kickers
    .filter((k) => {
      if (new Date(k.end) <= now) return false;
      // Show kicker if any visible forecast block is on the same day as the kicker
      return visibleTimes.some((t) => sameDay(t, k.start) || sameDay(t, k.end));
    })
    .map((k) => mapKicker(k, now, tomorrow));
});

const noKickerPhrase = noKickerPhrases[Math.floor(Math.random() * noKickerPhrases.length)];
</script>

<template>
  <div
    v-if="batchKickers.length"
    class="pl-8 pr-12 pb-6 cursor-pointer select-none"
    @click="expanded = !expanded"
  >
    <p
      v-for="(kicker, i) in expanded ? batchKickers : [batchKickers[0]]"
      :key="i"
      class="roboto roboto-medium text-sm"
    >
      <template v-if="kicker.isNow">
        Lekker kickers
        <span class="fira-code font-bold text-rose-500">NOW!</span> until
        <span class="fira-code font-bold text-rose-500">{{ kicker.end }}</span>
      </template>
      <template v-else>
        Lekker kickers
        <span class="fira-code font-bold text-rose-300">{{
          kicker.isTomorrow
            ? "tomorrow"
            : kicker.isToday
              ? "today"
              : kicker.dayName
        }}</span>
        between
        <span class="fira-code font-bold" :class="kicker.clrClass">{{
          kicker.start
        }}</span>
        and
        <span class="fira-code font-bold" :class="kicker.clrClass">{{
          kicker.end
        }}</span>
      </template>
    </p>
    <p v-if="!expanded && batchKickers.length > 1" class="text-xs text-gray-500 mt-0.5">
      + {{ batchKickers.length - 1 }} more
    </p>
  </div>
  <p
    v-else-if="slug === 'khaya'"
    class="roboto roboto-medium text-sm block pl-8 pr-12 pb-6"
  >
    {{ noKickerPhrase }}
  </p>
</template>
