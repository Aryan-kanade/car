// ─────────────────────────────────────────────────────────────
// Small helpers shared by the /api serverless functions.
// Handlers use the classic Vercel (req, res) signature; the dev
// middleware in vite.config.js feeds them Connect requests, so
// readJson handles both pre-parsed and streamed bodies.
// ─────────────────────────────────────────────────────────────

const MAX_BODY_BYTES = 64 * 1024

/** Send a JSON response and end the request. */
export function json(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

/** Respond with `{ error }` — every endpoint's failure shape. */
export function fail(res, status, message) {
  return json(res, status, { error: message })
}

/**
 * Read a JSON request body. Vercel pre-parses JSON into req.body;
 * in dev (Connect middleware) the body arrives as a stream.
 * Returns null when the body is missing or not valid JSON.
 */
export async function readJson(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return null
    }
  }
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') return null

  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) return null
    chunks.push(chunk)
  }
  if (chunks.length === 0) return null
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
}
