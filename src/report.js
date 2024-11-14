const minKnots = 20;
const minHour = 8;
const maxHour = 20;
const maxDays = 6;

const macWindSpots = ['khaya']

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
    waveOpacity: w > 0 ? mapRangeClamp(w, 1, 3, 1, 1) : 0,
    wavePos: `${mapRangeClamp(w, 0, 4, 160, 110)}%`,
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

function processSpot(spot) {
  const combined = spot.data.dates.map((day, i) => {
    return {
      ...day,
      ...styleWave(spot.data.waves[i]),
      ...styleDir(spot.data.dir[i]),
      gust: spot.data.gusts[i],
      wind: spot.data.wind[i],
    }
  });

  const days = mapToDay(combined).map(worthyDays).map(day => ({
    ...day,
    hasWind: day.forecast.length > 0,
  })).filter(day => {
    const maxUnixTime = new Date().getTime() / 1000 + maxDays * 24 * 60 * 60;
    return day.unixTime < maxUnixTime;
  });

  return {
    spot,
    days: days,
  };
}

function addWind(spot, macWind) {
  const last = macWind[macWind.length - 1];
  const deg = mapWindDirection(last.dir);

  if (macWindSpots.includes(spot.spot.slug)) {
    return {
      ...spot,
      live: {
        ...last,
        deg,
      }
    }
  }

  return spot;
}

export function makeReport(data, macWind) {
  const spots = data
    .map(spot => processSpot(spot))
    .map(spot => addWind(spot, macWind))

  console.log(spots);

  return spots;
}
