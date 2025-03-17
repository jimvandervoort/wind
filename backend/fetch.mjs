import fs from 'fs';
import { makeReport } from './report.js';
import { loadRegions } from './puppet.mjs';
import { fetchLiveWind } from './live.mjs';

const makeDump = process.env.WIND_MAKE_DUMP === 'true';
const useDump = process.env.WIND_USE_DUMP === 'true';
const indentLevel = process.env.NODE_ENV === 'production' ? 2 : 0;

const kiteCount = JSON.parse(fs.readFileSync('./public/kitecount.json', 'utf8'));
const liveWind = useDump ? JSON.parse(fs.readFileSync('./dump.live.json', 'utf8')) : await fetchLiveWind();
const regions = useDump ? JSON.parse(fs.readFileSync('./dump.regions.json', 'utf8')) : await loadRegions();

if (makeDump) {
  fs.writeFileSync('./dump.regions.json', JSON.stringify(regions, null, 2), 'utf8');
  fs.writeFileSync('./dump.live.json', JSON.stringify(liveWind, null, 2), 'utf8');
}

for (const region of regions) {
  const report = makeReport(region.spots, liveWind, kiteCount, 10);
  const version = process.env.VITE_WIND_VERSION || 'local';
  fs.writeFileSync(`./public/report.${region.name}.json`, JSON.stringify({
    version,
    report,
  }, null, indentLevel), 'utf8');
}
