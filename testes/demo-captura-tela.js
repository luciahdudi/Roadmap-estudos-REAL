const { chromium } = require("playwright");
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage();
  await p.route(/open-meteo|googleapis|accounts\.google/, r => r.abort()); await p.goto("file://" + require("path").resolve(__dirname, "../index.html") + ""); await p.waitForTimeout(4300);
  await p.screenshot({ path: "capturas/demo-login.png" });
  await p.click('[data-act="demo"]'); await p.waitForTimeout(800); await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: "capturas/demo-app.png", clip: { x: 0, y: 0, width: 390, height: 420 } });
  console.log("overflow:", await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1));
  await b.close(); })();
