<script setup>
import KiteSpots from './components/KiteSpots.vue'
import {ingest} from './data.js'

const spots = ingest();
</script>

<template>
  <KiteSpots :spots="spots"/>
</template>
