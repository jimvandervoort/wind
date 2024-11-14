import { ref, onMounted, onUnmounted } from 'vue';
import { makeReport } from "./report.js";

const interval = 60000;

export function useFetchInterval() {
  const report = ref(null);
  const error = ref(null);

  const fetchData = async () => {
    try {
      // Fetch both files
      const [dataResponse, windResponse] = await Promise.all([
        fetch('/data.json'),
        fetch('/wind.json')
      ]);

      // Check for errors in the response
      if (!dataResponse.ok || !windResponse.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON data
      const data = await dataResponse.json();
      const windData = await windResponse.json();

      // Process the data with makeReport
      report.value = makeReport(data, windData);
    } catch (err) {
      error.value = err;
    }
  };

  onMounted(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, interval); // Set up interval
    onUnmounted(() => clearInterval(intervalId)); // Clear interval on unmount
  });

  return { report, error };
}
