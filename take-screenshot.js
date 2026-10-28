import puppeteer from 'puppeteer-core';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'localhost-preview.png', fullPage: true });
  await browser.close();
  console.log('Screenshot captured successfully to localhost-preview.png');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
