// OpenRouter API client — zero npm deps
import https from 'node:https'

const BASE = 'openrouter.ai'
const PATH = '/api/v1/chat/completions'

export function callApi({ model, messages, apiKey, modalities, maxTokens }) {
  return new Promise((resolve, reject) => {
    const payload = { model, messages, max_tokens: maxTokens || 45000 }
    if (modalities) payload.modalities = modalities

    const body = JSON.stringify(payload)

    const opts = {
      hostname: BASE,
      path: PATH,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        try {
          const j = JSON.parse(data)
          if (j.error) {
            const errMsg = typeof j.error === 'string' ? j.error : JSON.stringify(j.error, null, 2)
            console.error('🤖 OpenRouter error:', errMsg)
            console.error('  raw:', data.slice(0, 1000))
            return reject(errMsg)
          }

          const msg = j.choices?.[0]?.message
          const usage = j.usage || {}

          // Extract images — two formats:
          // 1. msg.images[] (old Flux/SD style)
          // 2. msg.content[] with type: "image_url" (GPT-5 Image, Gemini Image)
          let images = msg?.images?.map((i) => i.image_url?.url).filter(Boolean) || []
          if (!images.length && Array.isArray(msg?.content)) {
            for (const part of msg.content) {
              if (part.type === 'image_url' && part.image_url?.url) {
                images.push(part.image_url.url)
              }
            }
            // Extract text from content blocks too
            const textParts = msg.content.filter((p) => p.type === 'text').map((p) => p.text)
            msg._text = textParts.join('\n')
          }

          resolve({
            images,
            text: msg?._text || (typeof msg?.content === 'string' ? msg.content : ''),
            usage: {
              prompt: usage.prompt_tokens || 0,
              output: usage.completion_tokens || 0
            },
            raw: j
          })
        } catch (e) {
          reject(`Parse error: ${e.message}\n${data.slice(0, 500)}`)
        }
      })
    })

    req.on('error', (e) => reject(`Request error: ${e.message}`))
    req.write(body)
    req.end()
  })
}
