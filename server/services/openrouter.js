// OpenRouter API client — zero npm deps
import https from 'node:https'

const BASE = 'openrouter.ai'
const PATH = '/api/v1/chat/completions'

export function callApi({ model, messages, apiKey }) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      messages,
      max_tokens: 2000
    })

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
          if (j.error) return reject(j.error.message || JSON.stringify(j.error))

          const msg = j.choices?.[0]?.message
          const usage = j.usage || {}
          const images = msg?.images?.map((i) => i.image_url?.url).filter(Boolean) || []

          resolve({
            images,
            text: msg?.content || '',
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
