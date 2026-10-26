import {onMounted, onUnmounted, ref, watch, inject, computed} from 'vue';
import { useRoute, useRouter } from 'vue-router';

const interval = 10_000;
const myVersion = import.meta.env.VITE_WIND_VERSION ?? 'local';
const maxDays = new URL(window.location.href).searchParams.get('days') ?? 7;

export function useFetchInterval(windThreshold, regionProp, isCE = false, windMode = ref('base')) {
  const baseReport = ref(null);
  const liveWind = ref({});
  const kiteCount = ref({});
  const error = ref(null);
  const route = useRoute();
  const router = useRouter();
  const region = isCE ? ref(regionProp) : ref(route.params.region);
  const api = isCE ? null : inject('api');
  let intervalId;

  const report = computed(() => {
    if (!baseReport.value) return null;

    return baseReport.value.map(spot => ({
      ...spot,
      live: liveWind.value[spot.spot.slug] ?? null,
      kiteCount: kiteCount.value[spot.spot.slug] ?? null,
    }));
  });

  const filterDays = (reportData, threshold, mode) => {
    reportData.forEach(spot => {
      spot.days.forEach((day, i) => {
        day.batch = Math.floor(i / maxDays) + 1;
        day.forecast.forEach(f => {
          const value = mode === 'gust' ? f.gust.value : f.wind.value;
          f.visible = value >= threshold;
        });
      })
    });

    return reportData;
  }

  watch([windThreshold, windMode], ([threshold, mode]) => {
    if (baseReport.value) {
      filterDays(baseReport.value, threshold, mode);
    }
  });

  if (route?.params?.region) {
    watch(() => route.params.region, (newValue) => {
      region.value = newValue;

      if (intervalId) {
        clearInterval(intervalId);
      }

      fetchAll();
      intervalId = setInterval(fetchAll, interval);
    });
  }

  const fetchReport = async () => {
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

      baseReport.value = filterDays(fetchedReport, windThreshold.value, windMode.value);
      error.value = null;
    } catch (err) {
      console.error('Report fetch error:', err);
      error.value = err;
    }
  };

  const fetchLiveData = async () => {
    const endpoint = import.meta.env.VITE_WIND_ENDPOINT || '';

    try {
      const res = await fetch(`${endpoint}/live.json`);
      if (res.ok) {
        liveWind.value = await res.json();
      }
    } catch (err) {
      console.warn('Live wind fetch failed:', err);
    }

    try {
      const res = await fetch(`${endpoint}/kitecount.json`);
      if (res.ok) {
        kiteCount.value = await res.json();
      }
    } catch (err) {
      console.warn('Kitecount fetch failed:', err);
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchReport(), fetchLiveData()]);
  };

  onMounted(() => {
    fetchAll();
    intervalId = setInterval(fetchAll, interval);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {report, error};
}
