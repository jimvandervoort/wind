import fs from 'fs';
import { makeReport } from './report.js';
import { loadRegions } from './puppet.mjs';
import { fetchLiveWind } from './live.mjs';

const isProd = process.env.NODE_ENV === 'production';
const makeDump = !isProd;
const indentLevel = isProd ? 0 : 2;
const useDump = process.env.WIND_USE_DUMP === 'true';
const outputDir = process.env.WIND_OUTPUT_DIR || './public';

const kiteCount = JSON.parse(fs.readFileSync(`${outputDir}/kitecount.json`, 'utf8'));
const liveWind = useDump ? JSON.parse(fs.readFileSync(`${outputDir}/dump.live.json`, 'utf8')) : await fetchLiveWind();
const regions = useDump ? JSON.parse(fs.readFileSync(`${outputDir}/dump.regions.json`, 'utf8')) : await loadRegions();

if (makeDump) {
  fs.writeFileSync(`${outputDir}/dump.regions.json`, JSON.stringify(regions, null, 2), 'utf8');
  fs.writeFileSync(`${outputDir}/dump.live.json`, JSON.stringify(liveWind, null, 2), 'utf8');
}

for (const region of regions) {
  const report = makeReport(region, liveWind, kiteCount, 10);
  const version = process.env.VITE_WIND_VERSION || 'local';
  fs.writeFileSync(`${outputDir}/report.${region.name}.json`, JSON.stringify({
    version,
    report,
  }, null, indentLevel), 'utf8');
}
