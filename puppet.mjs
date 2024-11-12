import puppeteer from 'puppeteer';
import fs from 'fs';

const spots = [
  {
    name: 'Khaya Beach',
    slug: 'khaya',
    url: 'https://www.windguru.cz/137630',
  },
  {
    name: 'Misty Cliffs',
    slug: 'misty',
    url: 'https://www.windguru.cz/208280',
  },
  {
    name: 'Langebaan',
    slug: 'langebaan',
    url: 'https://www.windguru.cz/21691',
  }
]

async function getSpotData(browser, spotUrl) {
  const page = await browser.newPage();
  await page.goto(spotUrl);
  await Promise.all([
    page.waitForSelector('#tabid_0_0_dates'),
    page.waitForSelector('#tabid_0_0_GUST'),
  ]);

  const dates = await page.$eval('#tabid_0_0_dates',
    el => Array.from(el.querySelectorAll('td')).map(td => {
      const data = td.innerHTML.split('<br>');
      return {
        dayName: data[0],
        dayNum: data[1].replace('.', ''),
        time: data[2],
      }
    })
  );

  const gusts = await page.$eval('#tabid_0_0_GUST',
    el => Array.from(el.querySelectorAll('td')).map(td => parseInt(td.textContent, 10))
  );

  await page.close();

  return {
    dates,
    gusts
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

  const data = await loadSpots(browser);
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  await browser.close();
}


await run();
