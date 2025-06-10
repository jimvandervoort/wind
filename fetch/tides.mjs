import * as cheerio from 'cheerio';
import { saveExec } from './save.js';

const earliestTide = 6;
const latestTide = 21;

const firefoxHeaders = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.5',
  // 'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Referer': 'https://www.tideschart.com/search.php?q=wallasey+beach',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

async function fetchTidesChart() {
  const response = await saveExec(
    fetch,
    'https://www.tideschart.com/United-Kingdom/England/Liverpool/New-Brighton-(Wallasey)-Beach/',
    { headers: firefoxHeaders }
  );

  const html = await response.text();
  const $ = cheerio.load(html);
  const table = $('table').first();
  const rows = table.find('tr');
  return rows
    .map((i, row) => {
      const heading = $(row).find('th').text();
      const time = $(row).find('td').first().text();
      return { heading, time };
    })
    .get()
    .filter(row => row.heading.endsWith('tide'))
    .filter(row => {
      const isAM = row.time.includes('am');
      const hour12 = parseInt(row.time.split(':')[0], 10);
      const hour24 = isAM ? hour12 : hour12 + 12;
      return hour24 >= earliestTide && hour24 <= latestTide;
    })
    .slice(0, 2)
    .map(row => ({
      time: row.time,
      text: row.heading.replace('High tide', 'high').replace('Low tide', 'low'),
    }))
}

export async function fetchTides() {
  console.log('Fetching tides');

  return {
    'wallasey': await fetchTidesChart(),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(await fetchTides());
}
