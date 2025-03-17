import {onMounted, onUnmounted, ref, watch} from 'vue';

const interval = 10_000;
const myVersion = import.meta.env.VITE_WIND_VERSION || 'local';

async function fetchAll(files) {
  const results = await Promise.all(files.map(f => fetch(f)));

  for (const r of results) {
    if (!r.ok) {
      throw new Error('Network response was not ok');
    }
  }

  return Promise.all(results.map(r => r.json()));
}

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
    report = report.map(spot => {
      spot.days.map(day => {
        day.forecast.forEach(f => {
          f.visible = f.gust.value >= windThreshold;
        });
        return day;
      })
      return spot;
    });

    return report;
  }

  // Add a watch on windThreshold to refilter existing data
  watch(windThreshold, (newValue) => {
    if (report.value) {
      report.value = filterDays(report.value, newValue);
    }
  });

  const fetchData = async () => {
    try {
      const [{report: fetchedReport, version: theirVersion}] = await fetchAll([`/report.${region}.json`]);

      if (myVersion !== theirVersion) {
        console.info('Server updated, reloading in 30s');
        setTimeout(() => {
          window.location.reload();
        }, 30000);
      }

      report.value = filterDays(fetchedReport, windThreshold.value);
      error.value = null;
    } catch (err) {
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
