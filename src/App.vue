<script setup>
import KiteSpots from './components/KiteSpots.vue';
import {useFetchInterval} from "./useFetchInterval.js";

const { report, error } = useFetchInterval();
if (error) {
  console.error(error);
}
</script>

<template>
  <KiteSpots :spots="report"/>
</template>
