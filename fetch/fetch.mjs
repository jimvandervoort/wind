import fs from 'fs';
import { makeReport } from './report.js';
import { loadRegions } from './puppet.mjs';
import { fetchTides } from './tides.mjs';

const isProd = process.env.NODE_ENV === 'production';
const makeDump = !isProd;
const indentLevel = isProd ? 0 : 2;
const useDump = process.env.WIND_USE_DUMP === 'true';
const outputDir = process.env.WIND_OUTPUT_DIR || './public';

const tides = useDump ? JSON.parse(fs.readFileSync(`./dump.tides.json`, 'utf8')) : await fetchTides();
const regions = useDump ? JSON.parse(fs.readFileSync(`./dump.regions.json`, 'utf8')) : await loadRegions();

if (makeDump) {
  console.log('Dumping before processing (debug mode)');
  fs.writeFileSync(`./dump.tides.json`, JSON.stringify(tides, null, 2), 'utf8');
  fs.writeFileSync(`./dump.regions.json`, JSON.stringify(regions, null, 2), 'utf8');
}

for (const region of regions) {
  const report = makeReport(region, tides, 10);
  const version = process.env.VITE_WIND_VERSION || 'local';
  fs.writeFileSync(`${outputDir}/report.${region.name}.json`, JSON.stringify({
    version,
    report,
  }, null, indentLevel), 'utf8');
}

console.log('Done');
