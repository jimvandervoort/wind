import {onMounted, onUnmounted, ref, watch} from 'vue';
import {makeReport} from "./report.js";

const interval = 10000;
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
  const rawData = ref(null);
  const rawMacWind = ref(null);
  const rawLangeWind = ref(null);
  const rawKiteCount = ref(null);

  const updateReport = () => {
    if (rawData.value && rawMacWind.value && rawLangeWind.value && rawKiteCount.value) {
      report.value = makeReport(rawData.value, rawMacWind.value, rawLangeWind.value, rawKiteCount.value, windThreshold.value);
    }
  };

  const region = getRegion();

  const fetchData = async () => {
    try {
      const [data, macWind, langeWind, kiteCount] = await fetchAll([
        `/${region}.json`,
        '/macwind.json',
        '/langewind.json',
        '/kitecount.json',
      ])

      const theirVersion = data[0].version;
      console.log({theirVersion, myVersion});
      if (myVersion !== theirVersion) {
        console.info('Server updated, reloading in 30s');
        setTimeout(() => {
          window.location.reload();
        }, 30000);
      }

      rawData.value = data;
      rawMacWind.value = macWind;
      rawLangeWind.value = langeWind;
      rawKiteCount.value = kiteCount;
      updateReport();
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

  // Watch for changes in windThreshold and only update the report
  watch(windThreshold, () => {
    updateReport();
  });

  return {report, error};
}
