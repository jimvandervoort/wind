<script setup>
import KiteSpots from './components/KiteSpots.vue'
import {makeReport} from './report.js'

const spots = makeReport();
</script>

<template>
  <KiteSpots :spots="spots"/>
</template>
