import Color from 'color';
import { mapRangeClamp } from '../src/range.js';

const minHour = 8;
const maxHour = 20;

const dayNameMap = {
  'Mo': 'MON',
  'Tu': 'TUE',
  'We': 'WED',
  'Th': 'THU',
  'Fr': 'FRI',
  'Sa': 'SAT',
  'Su': 'SUN',
};

function worthyDays(day, windThreshold) {
  day.forecast = day.forecast.filter(forecast => forecast.gust.value >= windThreshold && forecast.time >= minHour && forecast.time <= maxHour);
  return day;
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

function styleWave(w) {
  return {
    wave: w > 0 ? w : '',
    waveStr: w > 0 ? w.toFixed(1) : '',
    wavePos: `${mapRangeClamp(w, 0, 4, 1, .4)}rem`,
  }
}

function styleDir(dirStr) {
  const dir = parseInt(dirStr.deg.match(/\((\d+)°\)/)[1], 10)

  return {
    dir,
    dirStr,
    deg: `${dir - 180}deg`,
  }
}

function mapToDay(combined) {
  const result = [];

  for (let i = 0; i < combined.length; i++) {
    const pointer = combined[i];
    const prev = result[result.length - 1] || {};

    if (dayNameMap[pointer.dayName] !== prev.name) {
      result.push({
        name: dayNameMap[pointer.dayName],
        unixTime: pointer.unixTime,
        forecast: [],
      });
    }

    const curr = result[result.length - 1];

    curr.forecast.push({
      ...pointer,
      time: parseInt(pointer.time, 10),
      timeStr: pointer.time,
      unixTime: pointer.unixTime,
    })
  }

  return result;
}

function recolorGust(gust) {
  const factor = mapRangeClamp(gust.value, 10, 30, .4, 0)
  const rgba = gust.style.match(/rgba\(.*\)/)[0];
  const clr = new Color(rgba)
    .fade(factor / 1.5)
    .darken(factor / 4)
    .rgb()
    .string();


  return {
    ...gust,
    style: `background-color: ${clr};`,
  };
}

function processSpot(spot, maxDays) {
  const combined = spot.data.dates.map((day, i) => {
    return {
      ...day,
      ...styleWave(spot.data.waves[i]),
      ...styleDir(spot.data.dir[i]),
      gust: recolorGust(spot.data.gusts[i]),
      wind: spot.data.wind[i],
    }
  });

  const days = mapToDay(combined).filter(day => {
    const maxUnixTime = new Date().getTime() / 1000 + maxDays * 24 * 60 * 60;
    return day.unixTime < maxUnixTime;
  });

  delete spot.data;
  return {
    spot,
    days,
  };
}

function addWind(spot, macWind, langeWind) {
  const macLast = macWind[0];
  const deg = mapWindDirection(macLast.dir);

  if (spot.spot.slug === "khaya") {
    return {
      ...spot,
      live: {
        ...macLast,
        deg,
        url: 'https://mac-wind.appspot.com/?show=15min',
      }
    }
  }

  if (spot.spot.slug === "langebaan") {
    const langeLive = {
      low: langeWind.windMin,
      high: langeWind.windMax,
      dir: langeWind.compassDir,
      deg: mapWindDirection(langeWind.compassDir),
      url: 'https://capekiting.co.za/langebaan/',
    }
    return {
      ...spot,
      live: langeLive,
    }
  }

  return spot;
}

export function makeReport(data, macWind, langeWind, kiteCount, windThreshold, maxDays = 6) {
  const spots = data.map(spot => processSpot(spot, maxDays));
  const spotsWithWind = spots
    .map(spot => ({
      ...spot,
      kiteCount: kiteCount[spot.spot.slug] ?? null,
      days: spot.days.map(day => worthyDays(day, windThreshold))
    }))
    .filter(spot => spot.days.length > 0); // TODO does this filter do anything?

  return spotsWithWind.map(spot => addWind(spot, macWind, langeWind));
}
