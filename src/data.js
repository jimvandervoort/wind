import data from '../data.json'

const dayNameMap = {
  'Mo': 'MON',
  'Tu': 'TUE',
  'We': 'WED',
  'Th': 'THU',
  'Fr': 'FRI',
  'Sa': 'SAT',
  'Su': 'SUN',
};

function makeDays({dates, gusts}) {
  let result = [];

  for (let i = 0; i < dates.length; i++) {
    let curr = result[result.length - 1] || {};
    if (curr.name !== dates[i].dayName) {
      result.push({
        name: dates[i].dayName,
        gusts: []
      });
    }

    curr = result[result.length - 1] || {};

    curr.gusts.push(gusts[i]);
  }

  result = result.map((day) => {
    day.name = dayNameMap[day.name];
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
