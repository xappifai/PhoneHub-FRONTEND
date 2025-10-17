import { NextRequest } from 'next/server'
import { FALLBACK_BRANDS, FALLBACK_MODELS, FALLBACK_SPECS } from '@/lib/phone-data-fallback'

// Alternative free API: api-mobilespecs.azharimm.site
// Docs: https://github.com/azharimm/phone-specs-api
const BASE = 'https://api-mobilespecs.azharimm.site/v2'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'brands'

  // eslint-disable-next-line no-console
  console.log('[API /specs] action:', action, 'brand:', searchParams.get('brand'), 'device:', searchParams.get('device'))

  try {
    const headers = { 'user-agent': 'VendorHubBot/1.0 (+https://localhost)' }
    if (action === 'brands') {
      try {
        const url = `${BASE}/brands`
        // eslint-disable-next-line no-console
        console.log('[API /specs] Fetching:', url)
        const res = await fetch(url, { cache: 'no-store', headers })
        // eslint-disable-next-line no-console
        console.log('[API /specs] Response status:', res.status)
        if (!res.ok) {
          throw new Error(`Upstream returned ${res.status}`)
        }
        const data = await res.json()
        // eslint-disable-next-line no-console
        console.log('[API /specs] Brands data received:', data?.data?.length || 0, 'items')
        return json({ data })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[API /specs] Using fallback brands due to:', e)
        return json({ data: { data: FALLBACK_BRANDS } })
      }
    }

    if (action === 'models') {
      const brand = searchParams.get('brand') || ''
      if (!brand) return bad('brand is required')
      try {
        const url = `${BASE}/brands/${brand}`
        // eslint-disable-next-line no-console
        console.log('[API /specs] Fetching:', url)
        const res = await fetch(url, { cache: 'no-store', headers })
        // eslint-disable-next-line no-console
        console.log('[API /specs] Response status:', res.status)
        if (!res.ok) {
          throw new Error(`Upstream returned ${res.status}`)
        }
        const data = await res.json()
        // eslint-disable-next-line no-console
        console.log('[API /specs] Models data received:', data?.data?.phones?.length || 0, 'items')
        return json({ data })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[API /specs] Using fallback models for', brand, 'due to:', e)
        const fallbackModels = FALLBACK_MODELS[brand.toLowerCase()] || []
        return json({ data: { data: { phones: fallbackModels } } })
      }
    }

    if (action === 'specs') {
      const device = searchParams.get('device') || ''
      if (!device) return bad('device is required')
      try {
        // Specs endpoint expects device slug only
        const url = `${BASE}/${device}`
        // eslint-disable-next-line no-console
        console.log('[API /specs] Fetching:', url)
        const res = await fetch(url, { cache: 'no-store', headers })
        // eslint-disable-next-line no-console
        console.log('[API /specs] Response status:', res.status)
        if (!res.ok) {
          throw new Error(`Upstream returned ${res.status}`)
        }
        const data = await res.json()
        // eslint-disable-next-line no-console
        console.log('[API /specs] Specs data received for device:', device)
        return json({ data })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[API /specs] Using fallback specs for', device, 'due to:', e)
        const fallbackSpec = FALLBACK_SPECS[device] || null
        if (fallbackSpec) {
          return json({ data: fallbackSpec })
        }
        // Return generic specs if no specific fallback
        return json({
          data: {
            phone_name: device,
            brand: 'Unknown',
            specifications: [
              { title: 'Display', specs: [{ key: 'Size', val: ['6.5" AMOLED'] }] },
              { title: 'Platform', specs: [{ key: 'OS', val: ['Android 13'] }] },
              { title: 'Memory', specs: [{ key: 'Internal', val: ['128GB 8GB RAM'] }] },
              { title: 'Main Camera', specs: [{ key: 'Dual', val: ['50MP + 8MP'] }] },
              { title: 'Battery', specs: [{ key: 'Type', val: ['Li-Po 5000 mAh'] }] },
            ],
          },
        })
      }
    }

    return bad('unknown action')
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[API /specs] Catch error:', e?.message || e)
    return new Response(JSON.stringify({ error: 'fetch_failed', message: e?.message || 'unknown error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}

function json(obj: any) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json' } })
}
function bad(msg: string) {
  return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { 'content-type': 'application/json' } })
}


