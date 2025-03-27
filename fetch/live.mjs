/**
 * This module fetches live wind data from several sources.
 * Returned format should be an object with keys:
 * - high: the highest wind speed in knts
 * - low: the lowest wind speed in knts
 * - dir: the compass direction string
 * - url: the URL of the source website for the user
 */

function metersToKnots(meters) {
  return meters * 1.94384;
}

function translateWindDirection(str) {
  // from dutch to english
  return str.replaceAll('O', 'E').replaceAll('Z', 'S');
}

function mapWindDirection(str) {
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

  return dirs[str] - 180;
}

async function saveExec(func, ...args) {
  try {
    return await func(...args);
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
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const liveWind = await fetchLiveWind();
  console.log(JSON.stringify(liveWind, null, 2));
}
