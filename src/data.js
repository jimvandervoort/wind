import data from '../data.json'

const minKnots = 23;
const minHour = 8;
const maxHour = 20;
const maxDays = 8;

const dayNameMap = {
  'Mo': 'MON',
  'Tu': 'TUE',
  'We': 'WED',
  'Th': 'THU',
  'Fr': 'FRI',
  'Sa': 'SAT',
  'Su': 'SUN',
};

function isGusty(gust) {
  if (gust.value < minKnots) {
    return false;
  }

  const time = parseInt(gust.time, 10);
  return !(time < minHour || time > maxHour);
}

function isInTime(unixTime) {
  const now = new Date();
  const nowUnix = now.getTime() / 1000;
  return unixTime > nowUnix && unixTime < nowUnix + (maxDays - 1) * 24 * 60 * 60;
}

function makeDays({dates, gusts}) {
  let result = [];

  for (let i = 0; i < dates.length; i++) {
    let curr = result[result.length - 1] || {};
    if (!isInTime(dates[i].unixTime)) {
      continue;
    }

    if (curr.name !== dates[i].dayName) {
      result.push({
        name: dates[i].dayName,
        num: dates[i].dayNum,
        gusts: []
      });
    }

    gusts[i].time = dates[i].time;
    curr = result[result.length - 1] || {};

    if (isGusty(gusts[i])) {
      curr.gusts.push(gusts[i]);
    }
  }

  result = result.map((day) => {
    day.name = dayNameMap[day.name];
    day.hasWind = day.gusts.length > 0;
    return day;
  });

  return result;
}

export function ingest() {
  data.map((spot) => {
    spot.days = makeDays(spot.data);
  });

  return data;
}
