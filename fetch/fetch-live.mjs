import fs from 'fs';
import { fetchLiveWind } from './live.mjs';

const isProd = process.env.NODE_ENV === 'production';
const indentLevel = isProd ? 0 : 2;
const outputDir = process.env.WIND_OUTPUT_DIR || './public';
const logFile = process.env.WIND_LOG_FILE || '/dev/stdout';

const outputFile = `${outputDir}/live.json`;

let previous = {};
try {
  previous = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
} catch {}

const liveWind = await fetchLiveWind();
for (const [spot, data] of Object.entries(liveWind)) {
  if (data == null && previous[spot] != null) {
    console.log(`No data for ${spot}, keeping previous value`);
    liveWind[spot] = previous[spot];
  }
}

fs.writeFileSync(outputFile, JSON.stringify(liveWind, null, indentLevel), 'utf8');
console.log('Live wind updated');

try {
  fs.appendFileSync(logFile, JSON.stringify({ datetime: new Date().toISOString(), ...liveWind }) + '\n');
} catch (err) {
  console.error(err);
}
