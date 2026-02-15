import fs from 'fs';
import { fetchLiveWind } from './live.mjs';

const isProd = process.env.NODE_ENV === 'production';
const indentLevel = isProd ? 0 : 2;
const outputDir = process.env.WIND_OUTPUT_DIR || './public';
const logFile = process.env.WIND_LOG_FILE || '/dev/stdout';

const liveWind = await fetchLiveWind();
fs.writeFileSync(`${outputDir}/live.json`, JSON.stringify(liveWind, null, indentLevel), 'utf8');
console.log('Live wind updated');

try {
  fs.appendFileSync(logFile, JSON.stringify({ datetime: new Date().toISOString(), ...liveWind }) + '\n');
} catch (err) {
  console.error(err);
}
