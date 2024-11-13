<script setup>
import KiteSpots from './components/KiteSpots.vue'
import {makeReport} from './report.js'
import data from '../data.json'

const spots = makeReport(data);
</script>

<template>
  <KiteSpots :spots="spots"/>
</template>
