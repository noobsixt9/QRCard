/**
 * Unified session cache for QRCard frontend.
 *
 * All GET responses are stored in sessionStorage with a TTL.
 * Mutations (POST/PUT/PATCH/DELETE) call invalidate() for the
 * affected key so the next GET fetches fresh data.
 *
 * Storage: sessionStorage — clears when the tab closes, never
 * persists across browser sessions, not accessible cross-origin.
 */

// ── Cache keys ────────────────────────────────────────────────
export const CACHE = {
  ME:           'qrc_me',
  QR:           'qrc_qr',
  ORDERS:       'qrc_orders',
  COMPLETENESS: 'qrc_completeness',
  PROFILE:      'qrc_profile',
}

// ── TTLs (ms) ─────────────────────────────────────────────────
const TTL = {
  [CACHE.ME]:           10 * 60 * 1000,   // 10 min
  [CACHE.QR]:            5 * 60 * 1000,   //  5 min
  [CACHE.ORDERS]:           30 * 1000,    // 30 sec
  [CACHE.COMPLETENESS]:  5 * 60 * 1000,   //  5 min
  [CACHE.PROFILE]:       5 * 60 * 1000,   //  5 min
}

// ── Low-level helpers ─────────────────────────────────────────

/**
 * Read cached data for key. Returns null if missing or expired.
 */
export function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, expiresAt } = JSON.parse(raw)
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

/**
 * Store data for key with the configured TTL.
 */
export function setCached(key, data) {
  try {
    const ttl = TTL[key] ?? 5 * 60 * 1000
    sessionStorage.setItem(key, JSON.stringify({
      data,
      expiresAt: Date.now() + ttl,
    }))
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

/**
 * Remove a cache entry so the next cachedFetch hits the network.
 */
export function invalidate(key) {
  try {
    sessionStorage.removeItem(key)
  } catch { /* ignore */ }
}

// ── High-level fetch wrapper ──────────────────────────────────

/**
 * Drop-in replacement for fetch on GET routes.
 *
 * Returns cached data immediately if fresh, fetches from the
 * network on a cache miss, stores the result, and returns
 * result.data directly — so callers don't need res.json().
 *
 * @param {string} key   - One of the CACHE.* constants
 * @param {string} url   - Full URL to fetch
 * @param {object} opts  - fetch options (e.g. { headers })
 * @returns {Promise<any>} The response data (result.data field), or null on error
 */
export async function cachedFetch(key, url, opts = {}) {
  // Return cached data if still fresh
  const cached = getCached(key)
  if (cached !== null) return cached

  try {
    const res = await fetch(url, { method: 'GET', ...opts })
    if (!res.ok) return null

    const result = await res.json()
    const data = result?.data !== undefined ? result.data : result

    if (data !== undefined && data !== null) {
      setCached(key, data)
    }
    return data
  } catch {
    return null
  }
}
