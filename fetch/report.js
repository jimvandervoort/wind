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

function worthyDays(day, windThreshold, from, to) {
  day.forecast = day.forecast.filter(forecast => forecast.gust.value >= windThreshold && forecast.time >= from && forecast.time <= to);
  return day;
}

function styleWave(w) {
  return {
    wave: w > 0 ? w : '',
    waveStr: w > 0 ? w.toFixed(1) : '',
    wavePos: w > 0 ? `${mapRangeClamp(w, 0, 4, 1, .4)}rem` : `4rem`,
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

function processSpot(spot) {
  const combined = spot.data.dates.map((day, i) => {
    return {
      ...day,
      ...styleWave(spot.data.waves[i]),
      ...styleDir(spot.data.dir[i]),
      gust: recolorGust(spot.data.gusts[i]),
      wind: spot.data.wind[i],
    }
  });

  const days = mapToDay(combined);

  delete spot.data;
  return {
    spot,
    days,
  };
}

function addLiveWind(spot, liveWind) {
  const wind = liveWind[spot.spot.slug];
  if (!wind) return spot;

  return {
    ...spot,
    live: wind,
  }
}

function addTides(spot, tides) {
  const tide = tides[spot.spot.slug];
  if (!tide) return spot;

  return {
    ...spot,
    tide,
  }
}

export function makeReport(region, liveWind, kiteCount, tides, windThreshold) {
  const spots = region.spots.map(spot => processSpot(spot));
  const spotsWithWind = spots
    .map(spot => ({
      ...spot,
      kiteCount: kiteCount[spot.spot.slug] ?? null,
      days: spot.days.map(day => worthyDays(day, windThreshold, region.from, region.to))
    }))

  return spotsWithWind.map(spot => addLiveWind(addTides(spot, tides), liveWind));
}
