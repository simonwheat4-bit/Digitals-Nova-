const puppeteer = require('puppeteer-core');

async function captureSections() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const sections = ['hero', 'services', 'process', 'cta', 'faq'];
  for (const s of sections) {
    const el = await page.$('#' + s);
    if (el) {
      await el.screenshot({ path: `preview-${s}.png` });
      console.log(`Captured preview-${s}.png`);
    }
  }

  await browser.close();
  console.log('All sections captured!');
}

captureSections().catch(err => {
  console.error(err);
  process.exit(1);
});
