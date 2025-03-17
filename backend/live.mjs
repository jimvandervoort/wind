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
  return [data[0]];
}

async function fetchLangeWind() {
  const response = await fetch('https://capekiting.co.za/wp-json/api/v1/get-wind-data/?page_id=9001&timespanhours=6');
  const data = await response.json();
  return data.wind_data.kiteometer[0];
}

async function fetchActueleWind() {
  const response = await fetch('https://actuelewind.nl/getActualSpotData6.php?t=web&p=null');
  return response.json();
}

function actueleWindStation(actueleWind, sid) {
  return actueleWind.wind[sid].winddata[0];
}

export async function fetchLiveWind() {
  const actueleWind = await saveExec(fetchActueleWind);

  return {
    khaya: await saveExec(fetchMacWind),
    langebaan: await saveExec(fetchLangeWind),
    kijkduin: await saveExec(actueleWindStation, actueleWind, '9984'),
  }
}
