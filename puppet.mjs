import puppeteer from 'puppeteer';
import fs from 'fs';

import regions from './region.mjs';

const isProd = process.env.NODE_ENV === "production";
const version = process.env.VITE_WIND_VERSION || 'local';

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

async function loadSpots(browser, spots) {
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

async function loadRegion(spots, name) {
  console.log(`Launching browser for ${name}`);
  const browser = await puppeteer.launch({
    headless: true,
    args: isProd ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
  });

  try {
    const data = await loadSpots(browser, spots);
    const output = isProd ? `dist/${name}.json` : `public/${name}.json`;
    console.log(`Saving result to ${output}`);
    fs.writeFileSync(output, JSON.stringify(data));
  } catch (e) {
    console.error('Error loading spots', e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

async function run() {
  for (const region of regions) {
    await loadRegion(region.spots, region.name);
  }

  console.log('Have a nice day!')
}

await run();
