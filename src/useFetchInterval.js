import {onMounted, onUnmounted, ref} from 'vue';
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

export function useFetchInterval() {
  const report = ref(null);
  const error = ref(null);

  const fetchData = async () => {
    try {
      const [data, macWind, langeWind] = await fetchAll([
        '/data.json',
        '/wind.json',
        '/langewind.json',
      ])

      const theirVersion = data[0].version;
      console.log({theirVersion, myVersion});
      if (myVersion !== theirVersion) {
        console.info('Server updated, reloading in 30s');
        setTimeout(() => {
          window.location.reload();
        }, 30000);
      }

      report.value = makeReport(data, macWind, langeWind);
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
