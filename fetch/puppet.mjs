import puppeteer from 'puppeteer';

import regions from './region.mjs';

const isProd = process.env.NODE_ENV === "production";
const headless = (process.env.WIND_HEADLESS || 'true') === 'true';
const optimizeLoad = (process.env.WIND_OPTIMIZE_LOAD || 'true') === 'true';

async function getWaves(page, len) {
  const hasWaves = !!await page.$('#tabid_0_0_HTSGW');
  if (!hasWaves) {
    return Array(len).fill(0);
  }

  return page.$eval('#tabid_0_0_HTSGW',
    el => Array.from(el.querySelectorAll('td')).map(td => parseFloat(td.textContent))
  );
}

function shouldLoad(request) {
  if (!optimizeLoad) {
    return true;
  }

  const resourceType = request.resourceType();
  if (resourceType === 'stylesheet' || resourceType === 'image') {
    return false;
  }

  const { hostname } = new URL(request.url());
  return hostname === 'www.windguru.cz' || hostname === 'www.windguru.net' || hostname === 'unpkg.com';
}

async function getSpotData(page, spotUrl) {
  console.log('Loading url:', spotUrl);

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

  console.log('Processing spot complete');

  return {
    wind,
    dates,
    gusts,
    waves,
    dir,
  }
}

async function loadSpots(browser, spots) {
  console.log('Loading spots');
  const page = await browser.newPage();
  page.on('request', (request) => shouldLoad(request) ? request.continue() : request.abort());
  await page.setRequestInterception(true);

  const datas = [];
  for (const spot of spots) {
    console.log('Processing:', spot.slug);
    const data = await getSpotData(page, spot.url);
    datas.push({
      ...spot,
      data
    });
  }

  await page.close();

  return datas;
}

async function loadRegion(spots, name) {
  console.log(`Launching browser for ${name}`);
  const browser = await puppeteer.launch({
    headless,
    args: isProd ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=ServiceWorker'] : ['--disable-features=ServiceWorker'],
  });

  let result;
  try {
    result = await loadSpots(browser, spots);
  } catch (e) {
    console.error('Error loading spots', e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }

  return result;
}

export async function loadRegions() {
  const results = [];
  for (const region of regions) {
    results.push({
      ...region,
      spots: await loadRegion(region.spots, region.name),
    });
  }

  return results;
}
