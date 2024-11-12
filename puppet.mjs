import puppeteer from 'puppeteer';
import fs from 'fs';

function getRandomSurferEmoji() {
  const baseSurfer = '\u{1F3C4}'; // Base surfer emoji
  const genders = ['\u{200D}\u{2640}\u{FE0F}', '\u{200D}\u{2642}\u{FE0F}']; // Female and Male modifiers
  const skinTones = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']; // Skin tone modifiers

  const randomGender = genders[Math.floor(Math.random() * genders.length)];
  const randomSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];

  return baseSurfer + randomSkinTone + randomGender;
}

const spots = [
  {
    name: 'Khaya Beach 🐕',
    slug: 'khaya',
    url: 'https://www.windguru.cz/137630',
  },
  {
    name: 'Dolphin 🐬️',
    slug: 'dolphin',
    url: 'https://www.windguru.cz/206959',
  },
  {
    name: `Big Bay ${getRandomSurferEmoji()}`,
    slug: 'bigbay',
    url: 'https://www.windguru.cz/131599',
  },
  {
    name:'Langebaan 🦭',
    slug: 'langebaan',
    url: 'https://www.windguru.cz/21691',
  },
  {
    name: 'Misty Cliffs 👻',
    slug: 'misty',
    url: 'https://www.windguru.cz/208280',
  },
  {
    name: 'Witsands 🏖️',
    slug: 'witsands',
    url: 'https://www.windguru.cz/131693',
  },
]

async function getSpotData(browser, spotUrl) {
  const page = await browser.newPage();
  await page.goto(spotUrl);
  await Promise.all([
    page.waitForSelector('#tabid_0_0_dates'),
    page.waitForSelector('#tabid_0_0_GUST'),
    page.waitForSelector('#tabid_0_0_WINDSPD'),
  ]);

  const dates = await page.$eval('#tabid_0_0_dates',
    el => Array.from(el.querySelectorAll('td')).map(td => {
      const data = td.innerHTML.split('<br>');
      return {
        dayName: data[0],
        dayNum: data[1].replace('.', ''),
        unixTime: JSON.parse(td.getAttribute('data-x')).unixtime,
        time: data[2],
      }
    })
  );

  const wind = await page.$eval('#tabid_0_0_WINDSPD',
    el => Array.from(el.querySelectorAll('td')).map(td => ({
      value: parseInt(td.textContent, 10),
      style: td.getAttribute('style'),
    }))
  );

  const gusts = await page.$eval('#tabid_0_0_GUST',
    el => Array.from(el.querySelectorAll('td')).map(td => ({
      value: parseInt(td.textContent, 10),
      style: td.getAttribute('style'),
    }))
  );

  await page.close();

  return {
    wind,
    dates,
    gusts,
  }
}

async function loadSpots(browser) {
  const datas = spots.map(async spot => {
    return {
      ...spot,
      data: await getSpotData(browser, spot.url)
    }
  });
  return await Promise.all(datas);
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  try {
    const data = await loadSpots(browser);
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}


await run();
