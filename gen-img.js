#!/usr/bin/env node
// Generate images via OpenRouter (Flux models)
// Usage: OPENROUTER_API_KEY=sk-or-v1-... ./gen-img.js "prompt" [output.png]

const https = require('https');
const fs = require('fs');

const KEY = process.env.OPENROUTER_API_KEY || process.env.UPSTREAM_KEY;
const MODEL = process.env.MODEL || 'black-forest-labs/flux.2-klein-4b';

if (!KEY) { console.error('Need OPENROUTER_API_KEY'); process.exit(1); }

const prompt = process.argv[2];
const outPath = process.argv[3] || `img_${Date.now()}.png`;
if (!prompt) { console.error('Usage: gen-img.js "prompt" [output.png]'); process.exit(1); }

console.log(`🎨 ${MODEL}\n   "${prompt}"`);

const body = JSON.stringify({
  model: MODEL,
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 2000
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

      // Flux returns images in message.images array
      const msg = j.choices?.[0]?.message;
      const images = msg?.images || [];

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const url = images[i]?.image_url?.url || '';
          const path = images.length > 1 ? outPath.replace(/(\.\w+)$/, `_${i}$1`) : outPath;
          if (url.startsWith('data:')) saveBase64(url, path);
          else download(url, path);
        }
      } else if (msg?.content) {
        // Fallback: extract URL from text
        const urls = msg.content.match(/https?:\/\/[^\s\)\]\}]+/g);
        if (urls) urls.forEach(u => download(u, outPath));
        else console.log('Response:', msg.content.slice(0, 500));
      } else {
        console.log('No images in response. Raw:', JSON.stringify(j).slice(0, 500));
      }
    } catch (e) { console.error('Parse error:', e.message); }
  });
});
req.on('error', e => console.error('Error:', e.message));
req.write(body);
req.end();

function saveBase64(dataUrl, path) {
  const base64 = dataUrl.split(',')[1];
  fs.writeFileSync(path, Buffer.from(base64, 'base64'));
  console.log(`✅ ${path}`);
}

function download(url, path) {
  console.log(`⬇️ ${url.slice(0, 70)}`);
  https.get(url, (res) => {
    if (res.statusCode !== 200) { console.error(`DL failed: ${res.statusCode}`); return; }
    const file = fs.createWriteStream(path);
    res.pipe(file);
    file.on('finish', () => { file.close(); console.log(`✅ ${path}`); });
  }).on('error', e => console.error('DL error:', e.message));
}
