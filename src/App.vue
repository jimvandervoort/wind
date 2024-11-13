<script setup>
import KiteSpots from './components/KiteSpots.vue';
import {makeReport} from './report.js';
import data from '../data.json';
import macWind from '../wind.json';

const spots = makeReport(data, macWind);
</script>

<template>
  <KiteSpots :spots="spots"/>
</template>
