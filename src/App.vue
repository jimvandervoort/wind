<script setup>
import KiteSpots from './components/KiteSpots.vue';
import {useFetchInterval} from "./useFetchInterval.js";

const { report, error } = useFetchInterval();
</script>

<template>
  <KiteSpots :spots="report"/>
  <pre class="m-3" v-if="error">Failed to load latest wind data: {{error}}</pre>
</template>
