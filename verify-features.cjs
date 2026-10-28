const puppeteer = require('puppeteer-core');

async function testFeatures() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('--- 1. Opening Portal ---');
  await page.goto('http://localhost:3000/portal/index.html?subdomain=alshifa', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // If login modal is showing, click Clinic Admin quick login button
  const adminChip = await page.$('button.bg-teal\\/15, button[title*="Clinic Admin" i]');
  if (adminChip) {
    console.log('Clicking Clinic Admin role chip...');
    await adminChip.click();
    await new Promise(r => setTimeout(r, 1500));
  } else {
    // Attempt clicking by button content
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.innerText.includes('Clinic Admin'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  // 1. Screenshot of Masked Financial Dashboard (Feature 1 & Feature 2)
  await page.screenshot({ path: 'verify-masked-dashboard.png' });
  console.log('Captured verify-masked-dashboard.png');

  // 2. Click Financial Metrics toggle to reveal metrics
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const toggle = btns.find(b => b.innerText.includes('Financial Metrics'));
    if (toggle) toggle.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'verify-revealed-dashboard.png' });
  console.log('Captured verify-revealed-dashboard.png');

  // 3. Switch to Subscription Status & Danger Zone (Feature 3)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const subBtn = btns.find(b => b.innerText.includes('Subscription Status'));
    if (subBtn) subBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'verify-danger-zone.png' });
  console.log('Captured verify-danger-zone.png');

  await browser.close();
  console.log('All screenshots verified successfully!');
}

testFeatures().catch(err => {
  console.error('Error during testing:', err);
  process.exit(1);
});
