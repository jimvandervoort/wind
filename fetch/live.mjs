import { WebSocket } from 'ws';

/**
 * This module fetches live wind data from several sources.
 * Returned format should be an object with keys:
 * - high: the highest wind speed in knts
 * - low: the lowest wind speed in knts
 * - dir: the compass direction string
 * - url: the URL of the source website for the user
 */

const dirs = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

// Convert direction string to degrees
function dirToDeg(str) {
  return dirs[str];
}

// Convert degrees to direction string
function degToDir(deg) {
  // Normalize the degree to 0-360 range
  deg = ((deg % 360) + 360) % 360;

  // Find the closest direction
  let closest = null;
  let minDiff = Infinity;

  for (const [dir, dirDeg] of Object.entries(dirs)) {
    const diff = Math.abs(dirDeg - deg);
    if (diff < minDiff) {
      minDiff = diff;
      closest = dir;
    }
  }

  return closest;
}

function mapWindDirection(str) {
  return dirToDeg(str) - 180;
}

function metersToKnots(meters) {
  return meters * 1.94384;
}

function translateWindDirection(str) {
  // from dutch to english
  return str.replaceAll('O', 'E').replaceAll('Z', 'S');
}

async function runWithTimeout(func, timeout) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout of ${timeout}ms reached`)), timeout);
  });

  try {
    return await Promise.race([
      func(),
      timeoutPromise
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function saveExec(func, ...args) {
  try {
    return await runWithTimeout(() => func(...args), 30000);
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchMacWind() {
  const response = await fetch('https://mac-wind.appspot.com/data/15min.json?offset=');
  const data = await response.json();
  const windData = data[0];
  return {
    high: windData.high,
    low: windData.low,
    dir: windData.dir,
    deg: mapWindDirection(windData.dir),
    url: 'https://mac-wind.appspot.com/data/15min.json?offset=',
  }
}

async function fetchLangeWind() {
  const response = await fetch('https://capekiting.co.za/wp-json/api/v1/get-wind-data/?page_id=9001&timespanhours=6');
  const data = await response.json();
  const windData = data.wind_data.kiteometer[0];
  return {
    high: windData.windMax,
    low: windData.windMin,
    dir: windData.compassDir,
    deg: windData.windDir,
    url: 'https://capekiting.co.za/langebaan/',
  }
}

async function fetchActueleWind() {
  const response = await fetch('https://actuelewind.nl/getActualSpotData6.php?t=web&p=null');
  return response.json();
}

function actueleWindStation(actueleWind, sid) {
  const windData = actueleWind.wind[sid].winddata[0];
  return {
    low: metersToKnots(windData.windsnelheidMS),
    high: metersToKnots(windData.windstotenMS),
    dir: translateWindDirection(windData.windrichting),
    deg: windData.windrichtingGR,
    url: `https://actuelewind.nl/?stationcode=${sid}#SpotPage`,
  }
}

async function fetchKwind() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://api.kwind.app');

    ws.on('open', () => {
      ws.send(JSON.stringify({ action: 'subscribe', channel: { name: 'station', params: { where: { _id: '64177a9fdb592ea709c59792' }, interval: 3600000 } } }));
    });

    ws.on('message', (data) => {
      const json = JSON.parse(data.toString());
      if (json.data?.lastWindData) {
        resolve({
          low: json.data.lastWindData.windspeedAdjusted,
          high: json.data.lastWindData.windspeedHighAdjusted,
          dir: degToDir(json.data.lastWindData.direction),
          deg: json.data.lastWindData.direction,
          url: 'https://kwind.app/station/64177a9fdb592ea709c59792',
        });
        ws.close();
      };
    });

    ws.on('error', (error) => {
      reject(error);
    });
  });
}

export async function fetchLiveWind() {
  console.log('Feching live wind data');

  const actueleWind = await saveExec(fetchActueleWind);
  return {
    khaya: await saveExec(fetchMacWind),
    langebaan: await saveExec(fetchLangeWind),
    kijkduin: await saveExec(actueleWindStation, actueleWind, '9984'),
    wijkaanzee: await saveExec(actueleWindStation, actueleWind, '6225'),
    cadzandbad: await saveExec(actueleWindStation, actueleWind, '6308'),
    terschelling: await saveExec(actueleWindStation, actueleWind, '6251'),
    vlieland: await saveExec(actueleWindStation, actueleWind, '6242'),
    mirns: await saveExec(actueleWindStation, actueleWind, '9985'),
    schiermonnikoog: await saveExec(actueleWindStation, actueleWind, '6285'),
    lances: await saveExec(fetchKwind),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const liveWind = await fetchLiveWind();
  console.log(JSON.stringify(liveWind, null, 2));
}
