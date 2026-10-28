const puppeteer = require('puppeteer-core');

async function testTabs() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Screenshot Hero section
  const heroEl = await page.$('#hero');
  if (heroEl) {
    await heroEl.screenshot({ path: 'preview-hero-fixed.png' });
    console.log('Saved preview-hero-fixed.png');
  }

  // 2. Click Tab 5: "05 Content Creation"
  const tabs = await page.$$('.services-nav-pill');
  if (tabs.length >= 6) {
    await tabs[5].click(); // Tab 5 is "05 Content Creation" (index 0 is "All Services")
    await new Promise(r => setTimeout(r, 700));
    const servicesEl = await page.$('#services');
    if (servicesEl) {
      await servicesEl.screenshot({ path: 'preview-click-tab5.png' });
      console.log('Saved preview-click-tab5.png (Clicked 05 Content Creation)');
    }

    // 3. Click Tab 6: "06 E-Commerce"
    await tabs[6].click(); // Tab 6 is "06 E-Commerce"
    await new Promise(r => setTimeout(r, 700));
    if (servicesEl) {
      await servicesEl.screenshot({ path: 'preview-click-tab6.png' });
      console.log('Saved preview-click-tab6.png (Clicked 06 E-Commerce)');
    }
  }

  await browser.close();
  console.log('Test completed successfully!');
}

testTabs().catch(err => {
  console.error(err);
  process.exit(1);
});
