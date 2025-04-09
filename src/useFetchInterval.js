import {onMounted, onUnmounted, ref, watch} from 'vue';
import { useRoute } from 'vue-router';

const interval = 10_000;
const myVersion = import.meta.env.VITE_WIND_VERSION ?? 'local';
const maxDays = new URL(window.location.href).searchParams.get('days') ?? 7;

export function useFetchInterval(windThreshold) {
  const report = ref(null);
  const error = ref(null);
  const route = useRoute();
  const region = ref(route.params.region);
  let intervalId;

  const filterDays = (report, windThreshold) => {
    report.forEach(spot => {
      spot.days.forEach((day, i) => {
        day.batch = Math.floor(i / maxDays) + 1;
        day.forecast.forEach(f => {
          f.visible = f.gust.value >= windThreshold;
        });
      })
    });

    return report;
  }

  // Add a watch on windThreshold to refilter existing data
  watch(windThreshold, (newValue) => {
    if (report.value) {
      filterDays(report.value, newValue);
    }
  });

  watch(() => route.params.region, (newValue) => {
    region.value = newValue;

    if (intervalId) {
      clearInterval(intervalId);
    }

    fetchData();
    intervalId = setInterval(fetchData, interval);
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`/report.${region.value}.json`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const {report: fetchedReport, version: theirVersion} = await res.json();

      if (myVersion !== theirVersion) {
        console.info('Server updated, reloading in 30s');
        setTimeout(() => {
          window.location.reload();
        }, 30_000);
      }


      report.value = filterDays(fetchedReport, windThreshold.value);
      error.value = null;
    } catch (err) {
      console.error(err);
      error.value = err;
    }
  };

  onMounted(() => {
    fetchData(); // Initial fetch
    intervalId = setInterval(fetchData, interval);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {report, error};
}
