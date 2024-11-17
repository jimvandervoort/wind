import {onMounted, onUnmounted, ref} from 'vue';
import {makeReport} from "./report.js";

const interval = 10000;
const myVersion = import.meta.env.VITE_WIND_VERSION || 'local';

export function useFetchInterval() {
  const report = ref(null);
  const error = ref(null);

  const fetchData = async () => {
    try {
      // Fetch both files
      const [dataResponse, windResponse, langeWindResponse] = await Promise.all([
        fetch('/data.json'),
        fetch('/wind.json'),
        fetch('/langewind.json'),
      ]);

      // Check for errors in the response
      if (!dataResponse.ok || !windResponse.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON data
      const data = await dataResponse.json();
      const macWind = await windResponse.json();
      const langeWind = await langeWindResponse.json();

      const theirVersion = data[0].version;
      console.log({theirVersion, myVersion});
      if (myVersion !== theirVersion) {
        console.info('Server updated, reloading in 30s');
        setTimeout(() => {
          window.location.reload();
        }, 30000);
      }

      // Process the data with makeReport
      report.value = makeReport(data, macWind, langeWind);
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
