#!/usr/bin/env node
// Image generation dashboard — Flux via OpenRouter
// Usage: OPENROUTER_API_KEY=sk-or-v1-... node img-dash.js

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY = process.env.OPENROUTER_API_KEY || process.env.UPSTREAM_KEY;
const PORT = process.env.PORT || 3030;
const IMG_DIR = path.join(__dirname, 'img_output');

if (!KEY) { console.error('Need OPENROUTER_API_KEY'); process.exit(1); }
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// ── Models ──
const MODELS = {
  'flux-2-klein': { id: 'black-forest-labs/flux.2-klein-4b', cost: 0.002, label: 'Flux.2 Klein 4B' },
  'flux-dev':      { id: 'black-forest-labs/flux-dev', cost: 0.003, label: 'Flux Dev' },
  'flux-pro':      { id: 'black-forest-labs/flux-1.1-pro', cost: 0.005, label: 'Flux 1.1 Pro' },
  'sd-3.5':        { id: 'stabilityai/stable-diffusion-3.5-large', cost: 0.004, label: 'SD 3.5 Large' },
};

// ── API call to OpenRouter ──
function generateImage(modelId, messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: modelId, messages, max_tokens: 2000
    });
    const opts = {
      hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const msg = j.choices?.[0]?.message;
          const usage = j.usage || {};
          const images = msg?.images?.map(i => i.image_url?.url) || [];
          const text = msg?.content || '';
          resolve({ images, text, usage: { prompt: usage.prompt_tokens || 0, output: usage.completion_tokens || 0 } });
        } catch(e) { reject(e.message); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Save base64 image to file ──
function saveImage(dataUrl) {
  const name = `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.png`;
  const p = path.join(IMG_DIR, name);
  fs.writeFileSync(p, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return name;
}

// ── HTTP server ──
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Serve saved images
  if (req.method === 'GET' && req.url.startsWith('/img/')) {
    const file = path.join(IMG_DIR, path.basename(req.url));
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      fs.createReadStream(file).pipe(res);
    } else { res.writeHead(404); res.end(); }
    return;
  }

  // API: generate image
  if (req.method === 'POST' && req.url === '/api/generate') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { messages, modelKey } = JSON.parse(body);
        const model = MODELS[modelKey] || MODELS['flux-2-klein'];
        const result = await generateImage(model.id, messages);

        // Save images, return file paths
        const saved = result.images.map(url => {
          if (url.startsWith('data:')) return { file: saveImage(url), dataUrl: url };
          return { url };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          images: saved, text: result.text,
          usage: result.usage, model: model.label,
          cost: (model.cost * Math.max(1, result.images.length)).toFixed(4)
        }));
      } catch(e) { res.writeHead(500); res.end(JSON.stringify({ error: e })); }
    });
    return;
  }

  // Serve frontend
  if (req.method === 'GET' || req.method === 'POST' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`🎨 Image Dashboard: http://localhost:${PORT}`);
  console.log(`   Key: ${KEY.slice(0, 15)}...`);
  console.log(`   Images: ${IMG_DIR}`);
});

// ── Embedded HTML frontend ──
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🎨 Flux Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#0f0f13;color:#e0e0e0;height:100vh;display:flex}
.sidebar{width:280px;background:#1a1a24;border-right:1px solid #2a2a3a;padding:20px;display:flex;flex-direction:column;gap:16px;flex-shrink:0}
.sidebar h1{font-size:18px;color:#8b7aff;font-weight:700}
.sidebar label{font-size:12px;color:#888;display:flex;flex-direction:column;gap:4px}
.sidebar select,.sidebar input[type=number]{background:#2a2a3a;border:1px solid #3a3a4a;color:#e0e0e0;padding:8px 12px;border-radius:6px;font-size:13px}
.sidebar .stats{font-size:12px;color:#666;line-height:1.6;margin-top:auto;padding-top:16px;border-top:1px solid #2a2a3a}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.chat{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px}
.msg{display:flex;flex-direction:column;gap:8px;max-width:800px}
.msg.user{align-self:flex-end}
.msg.user .bubble{background:#2a1f6e;border:1px solid #4a3f9e;border-radius:12px 12px 4px 12px;padding:10px 14px;font-size:14px;align-self:flex-end}
.msg.assistant .bubble{background:#1e1e2e;border:1px solid #2a2a3a;border-radius:12px 12px 12px 4px;padding:10px 14px;font-size:14px}
.msg .imgs{display:flex;flex-wrap:wrap;gap:8px}
.msg .imgs img{max-width:300px;max-height:300px;border-radius:8px;border:1px solid #2a2a3a;cursor:pointer;transition:transform .2s}
.msg .imgs img:hover{transform:scale(1.05)}
.msg .info{font-size:11px;color:#555;display:flex;gap:12px}
.inputbar{display:flex;gap:8px;padding:16px 20px;border-top:1px solid #2a2a3a;background:#1a1a24}
.inputbar textarea{flex:1;background:#2a2a3a;border:1px solid #3a3a4a;color:#e0e0e0;padding:12px;border-radius:8px;resize:none;font-size:14px;font-family:inherit;min-height:44px;max-height:120px}
.inputbar textarea:focus{outline:none;border-color:#6b5fff}
.inputbar button{background:#6b5fff;color:#fff;border:none;border-radius:8px;padding:0 20px;font-size:14px;cursor:pointer;font-weight:600;transition:background .2s}
.inputbar button:hover{background:#5a4ee6}
.inputbar button:disabled{opacity:.4;cursor:default}
.spinner{display:inline-block;width:16px;height:16px;border:2px solid #6b5fff33;border-top-color:#6b5fff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.clear-btn{background:transparent;border:1px solid #3a3a4a;color:#888;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;transition:all .2s}
.clear-btn:hover{background:#2a2a3a;color:#e0e0e0}
.cost{color:#4caf50!important}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:100;align-items:center;justify-content:center;cursor:pointer}
.modal img{max-width:90vw;max-height:90vh;border-radius:8px}
.modal.show{display:flex}
.settings-row{display:flex;gap:12px;align-items:center}
.settings-row label{flex-direction:row!important;align-items:center!important;gap:8px!important;font-size:12px;color:#888;cursor:pointer}
</style>
</head>
<body>
<div class="sidebar">
  <h1>🎨 Flux Dash</h1>
  <label>Model
    <select id="model">
      <option value="flux-2-klein">Flux.2 Klein 4B — $0.002/img</option>
      <option value="flux-dev">Flux Dev — $0.003/img</option>
      <option value="flux-pro">Flux 1.1 Pro — $0.005/img</option>
      <option value="sd-3.5">SD 3.5 Large — $0.004/img</option>
    </select>
  </label>
  <div class="settings-row">
    <label><input type="checkbox" id="contextToggle" checked> Context</label>
    <label><input type="number" id="maxContext" value="6" min="1" max="20" style="width:50px"> msgs</label>
  </div>
  <button class="clear-btn" onclick="clearChat()">🗑️ Clear chat</button>
  <div class="stats" id="stats">
    <div>Images: <span id="imgCount">0</span></div>
    <div>Spent: $<span id="totalCost" class="cost">0.000</span></div>
    <div>Tokens: <span id="totalTokens">0</span></div>
  </div>
</div>
<div class="main">
  <div class="chat" id="chat"></div>
  <div class="inputbar">
    <textarea id="input" rows="1" placeholder="Describe image..." onkeydown="if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}"></textarea>
    <button id="sendBtn" onclick="send()">Send</button>
  </div>
</div>
<div class="modal" id="modal" onclick="this.classList.remove('show')">
  <img id="modalImg" src="" alt="full">
</div>
<script>
let msgs = [{role:'user',content:'You are an image generator. Generate ONLY the image based on the prompt, no extra text.'}];
let totalCost = 0, totalTokens = 0, imgCount = 0;
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const btn = document.getElementById('sendBtn');

async function send() {
  const text = input.value.trim();
  if (!text) return;
  input.value = ''; btn.disabled = true;

  addMsg('user', text, []);
  const modelKey = document.getElementById('model').value;
  const maxCtx = parseInt(document.getElementById('maxContext').value);
  const useCtx = document.getElementById('contextToggle').checked;

  let ctx = [];
  if (useCtx) {
    ctx = msgs.slice(-maxCtx * 2);
    ctx.push({role:'user', content: text});
  } else {
    ctx = [{role:'system',content:'Generate image only, no extra text.'}, {role:'user',content:text}];
  }

  try {
    const res = await fetch('/api/generate', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({messages: ctx, modelKey})
    });
    const data = await res.json();
    const urls = data.images || [];

    addMsg('assistant', data.text || '', urls, data);
    if (useCtx) msgs.push({role:'assistant', content: text});
    if (data.cost) { totalCost += parseFloat(data.cost); document.getElementById('totalCost').textContent = totalCost.toFixed(4); }
    if (data.usage) { totalTokens += data.usage.prompt + data.usage.output; document.getElementById('totalTokens').textContent = totalTokens; }
    imgCount += urls.length; document.getElementById('imgCount').textContent = imgCount;
  } catch(e) { addMsg('assistant', 'Error: '+e.message, []); }
  btn.disabled = false; input.focus();
  chat.scrollTop = chat.scrollHeight;
}

function addMsg(role, text, images, data) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  let html = '<div class="bubble">'+esc(text||'(image generated)')+'</div>';
  if (images.length) {
    html += '<div class="imgs">';
    for (const img of images) {
      if (img.file) html += '<img src="/img/'+img.file+'" onclick="showModal(this.src)">';
      else if (img.dataUrl) html += '<img src="'+img.dataUrl+'" onclick="showModal(this.src)">';
      else if (img.url) html += '<img src="'+img.url+'" onclick="showModal(this.src)">';
    }
    html += '</div>';
  }
  if (data) html += '<div class="info">'+(data.model||'')+' · $'+data.cost+' · '+((data.usage?.prompt||0)+(data.usage?.output||0))+' tokens</div>';
  div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function clearChat() {
  chat.innerHTML = '';
  msgs = [{role:'user',content:'Generate image only, no extra text.'}];
  totalCost = 0; totalTokens = 0; imgCount = 0;
  document.getElementById('totalCost').textContent = '0.000';
  document.getElementById('totalTokens').textContent = '0';
  document.getElementById('imgCount').textContent = '0';
}

function showModal(src) { document.getElementById('modalImg').src = src; document.getElementById('modal').classList.add('show'); }
function esc(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
input.focus();
</script>
</body>
</html>`;
