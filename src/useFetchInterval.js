import {onMounted, onUnmounted, ref, watch} from 'vue';

const interval = 10_000;
const myVersion = import.meta.env.VITE_WIND_VERSION ?? 'local';
const maxDays = new URL(window.location.href).searchParams.get('days') ?? 7;

function getRegion() {
  const sp = new URL(window.location.href).searchParams.get('region')
  if (sp) {
    return sp;
  }

  const hostParts = window.location.host.split('.');
  if (hostParts.length >= 3) {
    return hostParts[0];
  }

  return 'wind';
}

export function useFetchInterval(windThreshold) {
  const report = ref(null);
  const error = ref(null);
  const region = getRegion();

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

  const fetchData = async () => {
    try {
      const res = await fetch(`/report.${region}.json`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const {report: fetchedReport, version: theirVersion} = await res.json();

      if (myVersion !== theirVersion) {
        console.info('Server updated, reloading in 30s');
        setTimeout(() => {
          window.location.reload();
        }, 30000);
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
    const intervalId = setInterval(fetchData, interval); // Set up interval
    onUnmounted(() => clearInterval(intervalId)); // Clear interval on unmount
  });

  return {report, error};
}
