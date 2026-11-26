const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const OUT = path.resolve(__dirname, '..', 'docs', '参赛截图');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const BASE = 'http://127.0.0.1:4173/index.html';

fs.mkdirSync(OUT, { recursive: true });

const userDataDir = path.join(os.tmpdir(), 'redpen-shot-profile-' + Date.now());
const chrome = spawn(CHROME, [
  '--headless=new',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + userDataDir,
  '--window-size=1440,960',
  '--force-device-scale-factor=2',
  '--hide-scrollbars',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch {}
    await sleep(300);
  }
  throw new Error('Chrome CDP not ready');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.sessions = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('timeout: ' + method));
        }
      }, 30000);
    });
  }
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  return new CDP(ws);
}

async function main() {
  const wsUrl = await getWsUrl();
  const cdp = await connect(wsUrl);

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = sessionId;

  await cdp.send('Page.enable', {}, S);
  await cdp.send('Runtime.enable', {}, S);
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 960, deviceScaleFactor: 2, mobile: false,
  }, S);

  const evalJs = async (expr, awaitPromise = true) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr, awaitPromise, returnByValue: true,
    }, S);
    if (r.exceptionDetails) {
      throw new Error('JS error: ' + JSON.stringify(r.exceptionDetails.exception || r.exceptionDetails));
    }
    return r.result && r.result.value;
  };

  const shot = async (name) => {
    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: false,
    }, S);
    const file = path.join(OUT, name);
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    console.log('saved', name, fs.statSync(file).size);
  };

  const navigate = async (url) => {
    const loaded = new Promise((resolve) => {
      const handler = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.method === 'Page.loadEventFired') {
          cdp.ws.removeEventListener('message', handler);
          resolve();
        }
      };
      cdp.ws.addEventListener('message', handler);
    });
    await cdp.send('Page.navigate', { url }, S);
    await loaded;
    await sleep(1200);
  };

  const setViewport = async (w, h) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: w, height: h, deviceScaleFactor: 2, mobile: false,
    }, S);
    await sleep(400);
  };

  await navigate(BASE);
  await evalJs(`document.fonts && document.fonts.ready ? document.fonts.ready.then(()=>true) : true`);
  await sleep(600);
  await shot('01-home.png');

  console.log('samples:', await evalJs(`JSON.stringify(window.RedPenEngine.SAMPLES.map(s=>({id:s.id,type:s.type,name:s.name})))`));

  const fillText = (sampleMatch) => `(() => {
    const S = window.RedPenEngine.SAMPLES;
    const s = S.find(x => ${sampleMatch}) || S[0];
    const ta = document.getElementById('contractInput');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, s.text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.scrollTop = 0;
    return s.type + ' / ' + s.name;
  })()`;

  console.log('filled:', await evalJs(fillText(`/三方/.test(x.type)`)));
  await sleep(800);
  await shot('02-input.png');

  await evalJs(`document.getElementById('analyzeBtn').click()`);
  await sleep(2800);
  await shot('03-report.png');

  const info = await evalJs(`(() => {
    const items = document.querySelectorAll('#itemsList > *');
    return {
      items: items.length,
      verdict: (document.getElementById('verdictTag') || {}).textContent,
      docType: (document.getElementById('reportDocType') || {}).textContent,
      pageH: document.documentElement.scrollHeight,
    };
  })()`);
  console.log('report info:', JSON.stringify(info));

  const scrollReport = async (y) => {
    await evalJs(`(() => {
      const el = document.getElementById('reportScroll') || document.scrollingElement;
      el.scrollTop = ${y};
      return el.scrollTop;
    })()`);
    await sleep(600);
  };

  await scrollReport(620);
  await shot('04-report-cards.png');

  await scrollReport(0);
  await evalJs(`document.getElementById('tabContract').click()`);
  await sleep(900);
  await shot('05-contract-marked.png');

  await evalJs(`document.getElementById('rulesBtn').click()`);
  await sleep(1000);
  await shot('06-rules.png');
  await evalJs(`document.getElementById('drawerClose').click()`);
  await sleep(500);

  await evalJs(`document.getElementById('brandHome').click()`);
  await sleep(700);
  console.log('labor filled:', await evalJs(fillText(`/劳动合同/.test(x.type) && /2 年/.test(x.name)`)));
  await evalJs(`document.getElementById('analyzeBtn').click()`);
  await sleep(2800);
  await shot('07-labor-report.png');

  await setViewport(414, 896);
  await evalJs(`(() => {
    const t = document.getElementById('tabReport');
    if (t) t.click();
    return true;
  })()`);
  await sleep(900);
  await shot('08-mobile-report.png');

  await evalJs(`document.getElementById('brandHome').click()`);
  await sleep(800);
  await shot('09-mobile-home.png');

  await setViewport(1440, 960);
  await evalJs(`(() => {
    const S = window.RedPenEngine.SAMPLES;
    const s = S.find(x => /三方/.test(x.type)) || S[0];
    const ta = document.getElementById('contractInput');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, s.text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('analyzeBtn').click();
    return true;
  })()`);
  await sleep(2800);
  await evalJs(`(() => {
    const el = document.getElementById('reportScroll');
    if (el) { el.style.height = 'auto'; el.style.maxHeight = 'none'; el.style.overflow = 'visible'; }
    return true;
  })()`);
  await sleep(700);
  {
    const metrics = await cdp.send('Page.getLayoutMetrics', {}, S);
    const h = Math.ceil(metrics.cssContentSize.height);
    console.log('full page height', h);
    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: 1440, height: Math.min(h, 4000), scale: 2 },
    }, S);
    fs.writeFileSync(path.join(OUT, '10-full-report.png'), Buffer.from(data, 'base64'));
    console.log('saved 10-full-report.png');
  }

  console.log('DONE');
  await cdp.send('Target.closeTarget', { targetId });
  chrome.kill();
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED', e.message);
  try { chrome.kill(); } catch {}
  process.exit(1);
});
