import { WebSocket } from 'ws';
import { saveExec } from './save.js';

/**
 * This module fetches live wind data from several sources.
 * Returned format should be an object with keys:
 * - high: the highest wind speed in knts
 * - low: the lowest wind speed in knts
 * - dir: the compass direction string
 * - deg: the wind direction in degrees
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

async function fetchMacWind() {
  const response = await fetch('https://mac-wind.appspot.com/data/15min.json?offset=');
  const data = await response.json();
  const windData = data[0];
  return {
    high: windData.high,
    low: windData.low,
    dir: windData.dir,
    deg: mapWindDirection(windData.dir),
    url: 'https://mac-wind.appspot.com/?show=15min',
  }
}

// Not used anymore, no more free version
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

async function fetchKwind(stationId) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://api.kwind.app');

    ws.on('open', () => {
      ws.send(JSON.stringify({ action: 'subscribe', channel: { name: 'station', params: { where: { _id: stationId }, interval: 3600000 } } }));
    });

    ws.on('message', (data) => {
      const json = JSON.parse(data.toString());
      if (json.data?.lastWindData) {
        resolve({
          low: json.data.lastWindData.windspeedAdjusted || json.data.lastWindData.windspeed,
          high: json.data.lastWindData.windspeedHighAdjusted || json.data.lastWindData.windspeedHigh,
          dir: degToDir(json.data.lastWindData.direction),
          deg: json.data.lastWindData.direction - 180,
          url: `https://kwind.app/station/${stationId}`,
        });
        ws.close();
      };
    });

    ws.on('error', (error) => {
      reject(error);
    });
  });
}

async function fetchWallasey() {
  const adjustment = 4;
  const response = await fetch('https://peelports.port-log.net/latest/getlatest.php?item=c2l0ZT0yMTcwJmRhdGFzZXQ9NSZQSU49JTI0OEIyQw==&SID=plg_peelports_liverpool&format=JSON');
  const json = await response.json();

  return {
    low: Math.max(parseFloat(json['2170']['5']['50002']['Text']) - adjustment, 0),
    high: Math.max(parseFloat(json['2170']['5']['50006']['Text']) - adjustment, 0),
    dir: json['2170']['5']['50003']['Text'],
    deg: dirToDeg(json['2170']['5']['50003']['Text']) - 180,
    url: 'https://peelports.port-log.net/liverpool/Weather?site=2170&theme=Day&page=weather',
  }
}

function htmlExtractText(line) {
  const match = line.match(/>(.*)</);
  if (!match) return null;
  return match[1];
}

function htlmExtractNumber(line) {
  const str = htmlExtractText(line);
  if (!str) return null;
  return parseInt(str, 10);
}

async function fetchWestKirby() {
  const response = await fetch('https://skylink-pro.com/remote-index.php?domainname=wirralsailingcentre&keyword=sailing&units=kt');
  const text = await response.text();
  const lines = text.split('\n');
  const result = {
    url: 'https://skylink-pro.com/remote-index.php?domainname=wirralsailingcentre&keyword=sailing&units=kt',
  };

  for (let i = 0; i < lines.length; i++) {
    const cl = lines[i];
    if (cl.includes('Gust knots')) {
      result.high = htlmExtractNumber(lines[i+2]);
    } else if (cl.includes('Avg knots')) {
      result.low = htlmExtractNumber(lines[i+2]);
    } else if (cl.includes('Direction')) {
      result.dir = htmlExtractText(lines[i+2]);
      result.deg = dirToDeg(result.dir) - 180;
    }
  }

  return result;
}

async function fetchAinsdale() {
  const response = await fetch('https://mmweather.net/data/current-data?paramnames=s1pwcode,s1heading1,s1winddir2,s1windspeed2,s1windbacked2,s1windveered2,s1winddir2,s1windspeed2,s1windgust2,s1winddir10,s1windspeed10,s1windgust10,s1qnh10,s1qfe10,s1tempdry10,s1dewpoint10,s1humidity10,s1windchill10,s1cloudbase1,s1cloudbase2,s1visibility10,s1winddir10,s1windspeed10,s1windgust10,s1qnh10,s1tempdry10,s1humidity10,s1windchill10,s1cloudbase1,s1visibility10,s1tshs,s1sptp&siteids=1054&metar=1');
  const json = await response.json();
  const deg = parseInt(json.data["1054"]["13"].v, 10);
  return {
    high: json.data["1054"]["15"].v,
    low: json.data["1054"]["14"].v,
    dir: degToDir(deg),
    deg: deg - 180,
    url: 'https://mmweather.net/perl/current-site.pl?siteid=1054',
  }
}

export async function fetchLiveWind() {
  console.log('Feching live wind');

  const actueleWind = await saveExec(fetchActueleWind);
  return {
    khaya: await saveExec(fetchMacWind),
    kijkduin: await saveExec(actueleWindStation, actueleWind, '9984'),
    wijkaanzee: await saveExec(actueleWindStation, actueleWind, '6225'),
    cadzandbad: await saveExec(actueleWindStation, actueleWind, '6308'),
    terschelling: await saveExec(actueleWindStation, actueleWind, '6251'),
    vlieland: await saveExec(actueleWindStation, actueleWind, '6242'),
    mirns: await saveExec(actueleWindStation, actueleWind, '9985'),
    schiermonnikoog: await saveExec(actueleWindStation, actueleWind, '6285'),
    lances: await saveExec(fetchKwind, '64177a9fdb592ea709c59792'),
    valdevaqueros: await saveExec(fetchKwind, '647de689181cad75ef6778b1'),
    wallasey: await saveExec(fetchWallasey),
    westkirby: await saveExec(fetchWestKirby),
    ainsdale: await saveExec(fetchAinsdale),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const liveWind = await fetchLiveWind();
  console.log(JSON.stringify(liveWind, null, 2));
}
