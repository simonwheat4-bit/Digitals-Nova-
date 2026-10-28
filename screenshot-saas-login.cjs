const puppeteer = require('puppeteer-core');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture Header & Hero
  await page.goto('http://localhost:3000/cloud-pos-saas', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({ path: 'preview-saas-header-hero.png', clip: { x: 0, y: 0, width: 1440, height: 650 } });
  console.log('Captured preview-saas-header-hero.png');

  // 2. Open Login Modal & capture
  await page.evaluate(() => {
    openLoginModal();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'preview-saas-login-modal.png' });
  console.log('Captured preview-saas-login-modal.png');

  // 3. Capture Portal UI
  await page.goto('http://localhost:3000/portal/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'preview-saas-portal.png' });
  console.log('Captured preview-saas-portal.png');

  await browser.close();
  console.log('Done capturing screenshots!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
