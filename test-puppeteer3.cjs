const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  let errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  console.log("Errors found:", errors.length);
  errors.forEach(e => console.log(e));
  
  await browser.close();
})();
