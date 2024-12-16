import puppeteer from 'puppeteer';
import fs from 'fs';

const spots = [
  {
    name: 'Khaya Beach 🐕',
    slug: 'khaya',
    url: 'https://www.windguru.cz/208276',
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
    name: 'Langebaan 🦭',
    slug: 'langebaan',
    url: 'https://www.windguru.cz/21691',
  },
  {
    name: 'Shark Bay 🦈',
    slug: 'sharkbay',
    url: 'https://www.windguru.cz/67005',
  },
  {
    name: 'Misty Cliffs 👻',
    slug: 'misty',
    url: 'https://www.windguru.cz/208280',
  },
  {
    name: 'Her<span class="m">m</span>anus 🐋',
    slug: 'hermanus',
    url: 'https://www.windguru.cz/80216',
  },
  {
    name: 'Witsand 🏖️',
    slug: 'witsand',
    url: 'https://www.windguru.cz/131707',
  },
  {
    name: 'Brandvlei 🔥️',
    slug: 'braindvlei',
    url: 'https://www.windguru.cz/131692',
  },
];

const isProd = process.env.NODE_ENV === "production";
const version = process.env.VITE_WIND_VERSION || 'local';

function getRandomSurferEmoji() {
  const baseSurfer = '\u{1F3C4}'; // Base surfer emoji
  const genders = ['\u{200D}\u{2640}\u{FE0F}', '\u{200D}\u{2642}\u{FE0F}']; // Female and Male modifiers
  const skinTones = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']; // Skin tone modifiers

  const randomGender = genders[Math.floor(Math.random() * genders.length)];
  const randomSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];

  return baseSurfer + randomSkinTone + randomGender;
}

async function getWaves(page, len) {
  const hasWaves = !!await page.$('#tabid_0_0_HTSGW');
  if (!hasWaves) {
    return Array(len).fill(0);
  }

  return page.$eval('#tabid_0_0_HTSGW',
    el => Array.from(el.querySelectorAll('td')).map(td => parseFloat(td.textContent))
  );
}

async function getSpotData(browser, spotUrl) {
  console.log('Loading url:', spotUrl);

  const page = await browser.newPage();
  await page.goto(spotUrl);
  await Promise.all([
    page.waitForSelector('#tabid_0_0_dates'),
    page.waitForSelector('#tabid_0_0_GUST'),
    page.waitForSelector('#tabid_0_0_WINDSPD'),
    page.waitForSelector('#tabid_0_0_SMER'),
  ]);

  console.log('Page load complete');

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

  const dir = await page.$eval('#tabid_0_0_SMER', el => Array.from(el.querySelectorAll('td')).map(td => ({
    transform: td.querySelector('g').getAttribute('transform').replace(/ translate(.*)/, ''),
    deg: td.querySelector('span').title,
  })));

  const waves = await getWaves(page, gusts.length);

  await page.close();

  console.log('Processed spot complete');

  return {
    wind,
    dates,
    gusts,
    waves,
    dir,
  }
}

async function loadSpots(browser) {
  const datas = [];
  for (const spot of spots) {
    console.log('Processing:', spot.slug);
    const data = await getSpotData(browser, spot.url);
    datas.push({
      version,
      ...spot,
      data
    });
  }
  return datas;
}

async function run() {
  console.log('Launching browser');
  const browser = await puppeteer.launch({
    headless: true,
    args: isProd ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
  });

  try {
    const data = await loadSpots(browser);
    const output = isProd ? `dist/data.json` : `public/data.json`;
    console.log(`Saving result to ${output}`);
    fs.writeFileSync(output, JSON.stringify(data));
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }

  console.log('Have a nice day!')
}

await run();
