const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = __dirname;
const server = http.createServer((req,res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if(error) {res.writeHead(404).end(); return;}
    res.setHeader('Content-Type', ({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpeg':'image/jpeg'})[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH} : {channel:'msedge'})});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('.story-card').first().waitFor();
    assert.equal(await page.locator('.story-card').count(),3);
    for (const tab of await page.locator('.menu-tab').all()) {
      await tab.click();
      assert.equal(await page.locator('.menu-panel:visible').count(),1);
      assert.equal(await tab.getAttribute('aria-selected'),'true');
    }
    await page.locator('.menu-tab').last().press('ArrowRight');
    assert.equal(await page.locator('.menu-tab').first().getAttribute('aria-selected'),'true');
    await page.evaluate(() => {window.open=(url)=>{window.lastWhatsApp=url;return null;};});
    await page.locator('#story-text').fill('pendek');
    await page.locator('#story-form button').click();
    assert.equal(await page.locator('#story-text').getAttribute('aria-invalid'),'true');
    const story='Kopinya enak, saya mau mampir lagi bersama teman.';
    await page.locator('#story-name').fill('Nama pribadi');
    await page.locator('#story-anonim').check();
    assert.equal(await page.locator('#story-name').isDisabled(),true);
    await page.locator('#story-text').fill(story);
    await page.locator('#story-form button').click();
    assert.equal(await page.locator('#story-text').inputValue(),story);
    const message=await page.evaluate(()=>new URL(window.lastWhatsApp).searchParams.get('text'));
    assert(message.includes('Anonim') && !message.includes('Nama pribadi'));
    assert.equal(await page.locator('#story-form-note a').count(),1);
    for (const width of [320,390,768,1020,1440]) {
      await page.setViewportSize({width,height:850});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`overflow ${width}`);
    }
    await page.setViewportSize({width:390,height:850});
    await page.locator('#nav-toggle').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'false');
    await page.locator('#nav-toggle').click();
    await page.setViewportSize({width:1440,height:900});
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('nav-open')),false);
    await page.route('**/data/stories.json',route=>route.fulfill({status:500,body:''}));
    await page.reload();
    await page.locator('.retry-link').waitFor();
    await page.unroute('**/data/stories.json');
    await page.locator('.retry-link').click();
    await page.locator('.story-card').first().waitFor();
    await page.route('**/data/stories.json',route=>route.fulfill({contentType:'application/json',body:'[]'}));
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('#stories-wall').textContent.includes('Belum ada cerita'));
    await page.unroute('**/data/stories.json');
    await page.reload();
    await page.locator('.story-card').first().waitFor();
    await page.evaluate(async () => { document.querySelectorAll('img').forEach(img=>img.loading='eager'); await Promise.all(Array.from(document.images, img=>img.decode())); await document.fonts.ready; window.scrollTo({top:0,behavior:'instant'}); });
    await page.screenshot({path:'preview-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:850});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:'preview-mobile.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: tabs, keyboard, form validation, anonymous message, popup fallback, draft preservation, responsive widths, navigation, story failure/retry/empty state; no JS errors.');
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
