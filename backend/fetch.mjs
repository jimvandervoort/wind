import fs from 'fs';
import { makeReport } from './report.js';
import { loadRegions } from './puppet.mjs';
import { fetchLiveWind } from './live.mjs';

const kiteCount = JSON.parse(fs.readFileSync('./public/kitecount.json', 'utf8'));
const live = await fetchLiveWind();
const regions = await loadRegions();

fs.writeFileSync('./regions.json', JSON.stringify(regions, null, 2), 'utf8');

for (const region of regions) {
  const report = makeReport(region.spots, live.khaya, live.langebaan, kiteCount, 10);
  const version = process.env.VITE_WIND_VERSION || 'local';
  fs.writeFileSync(`./public/report.${region.name}.json`, JSON.stringify({
    version,
    report,
  }, null, 2), 'utf8');
}
