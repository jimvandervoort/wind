const minKnots = 23;
const minHour = 8;
const maxHour = 20;
const maxDays = 7;

const dayNameMap = {
  'Mo': 'MON',
  'Tu': 'TUE',
  'We': 'WED',
  'Th': 'THU',
  'Fr': 'FRI',
  'Sa': 'SAT',
  'Su': 'SUN',
};

// Takes a number "n" and maps it from the range [a, b] to the range [c, d]
function mapRange(n, a, b, c, d) {
  return (n - a) * (d - c) / (b - a) + c;
}

function mapRangeClamp(n, a, b, c, d) {
  const m = mapRange(n, a, b, c, d);

  if (c < d) {
    return Math.min(Math.max(m, c), d);
  }

  return Math.max(Math.min(m, c), d);
}

function worthyDays(day) {
  day.forecast = day.forecast.filter(forecast => forecast.gust.value >= minKnots && forecast.time >= minHour && forecast.time <= maxHour);
  return day;
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

function processSpot(spot) {
  const combined = spot.data.dates.map((day, i) => {
    return {
      ...day,
      gust: spot.data.gusts[i],
      wind: spot.data.wind[i],
      wave: spot.data.waves[i],
      waveOpacity: mapRangeClamp(spot.data.waves[i], 1, 4, 0.4, 1),
      wavePos:  `${mapRangeClamp(spot.data.waves[i], 1, 4, 150, 120)}%`,
    }
  });

  const days = mapToDay(combined).map(worthyDays).map(day => ({
    ...day,
    hasWind: day.forecast.length > 0,
  })).filter(day => {
    const maxUnixTime = new Date().getTime() / 1000 + maxDays * 24 * 60 * 60;
    return  day.unixTime < maxUnixTime;
  });

  delete spot.data;

  return {
    spot,
    days: days,
  };
}

export function makeReport(data) {
  const spots = data.map(spot => processSpot(spot));
  console.log(spots);

  return spots;
}
