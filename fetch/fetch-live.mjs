import fs from 'fs';
import { fetchLiveWind } from './live.mjs';

const isProd = process.env.NODE_ENV === 'production';
const indentLevel = isProd ? 0 : 2;
const outputDir = process.env.WIND_OUTPUT_DIR || './public';

const liveWind = await fetchLiveWind();
fs.writeFileSync(`${outputDir}/live.json`, JSON.stringify(liveWind, null, indentLevel), 'utf8');
console.log('Live wind updated');
