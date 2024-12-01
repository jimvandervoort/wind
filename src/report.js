import Color from 'color';

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

  const days = mapToDay(combined).filter(day => {
    const maxUnixTime = new Date().getTime() / 1000 + maxDays * 24 * 60 * 60;
    return day.unixTime < maxUnixTime;
  });

  return {
    spot,
    days: days,
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

export function makeReport(data, macWind, langeWind, windThreshold) {
  const spots = data.map(spot => processSpot(spot));
  const spotsWithWind = spots
    .map(spot => ({
      ...spot,
      days: spot.days.map(day => worthyDays(day, windThreshold)).map(day => {
        return {
          ...day,
          hasWind: day.forecast.length > 0
        }
      })
    }))
    .filter(spot => spot.days.length > 0);

  return spotsWithWind.map(spot => addWind(spot, macWind, langeWind));
}
