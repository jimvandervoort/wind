import {onMounted, onUnmounted, ref, watch, inject} from 'vue';
import { useRoute, useRouter } from 'vue-router';

const interval = 10_000;
const myVersion = import.meta.env.VITE_WIND_VERSION ?? 'local';
const maxDays = new URL(window.location.href).searchParams.get('days') ?? 7;

export function useFetchInterval(windThreshold, regionProp, isCE = false) {
  const report = ref(null);
  const error = ref(null);
  const route = useRoute();
  const router = useRouter();
  const region = isCE ? ref(regionProp) : ref(route.params.region);
  const api = isCE ? null : inject('api');
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

  if (route?.params?.region) {
    watch(() => route.params.region, (newValue) => {
      region.value = newValue;

      if (intervalId) {
        clearInterval(intervalId);
      }

      fetchData();
      intervalId = setInterval(fetchData, interval);
    });
  }

  const fetchData = async () => {
    try {
      const endpoint = import.meta.env.VITE_WIND_ENDPOINT || '';
      const res = route?.params?.region === 'myspots' ? await api.get(`${endpoint}/myspots`) : await fetch(`${endpoint}/report.${region.value}.json`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        } else if (res.status === 404) {
          router.push('/myspots/edit');
          return;
        } else {
          throw new Error('Network response was not ok');
        }
      }

      const {report: fetchedReport, version: theirVersion} = await res.json();

      if (!isCE && myVersion !== theirVersion) {
        console.info('Server updated, reloading soon');
        setTimeout(() => {
          window.location.reload();
        }, 120_000);
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
