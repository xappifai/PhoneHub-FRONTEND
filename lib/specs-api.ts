export interface DeviceSpecResult {
  brand: string
  model: string
  screen?: string
  ram?: string
  storage?: string
  camera?: string
  battery?: string
  processor?: string
  os?: string
}

const API_PROXY_ENDPOINT = '/api/specs'

export async function fetchDeviceSpecs(brandSlug: string, deviceSlug: string): Promise<DeviceSpecResult | null> {
  try {
    if (!brandSlug || !deviceSlug) return null
    const params = new URLSearchParams({ action: 'specs', brand: brandSlug, device: deviceSlug })
    const res = await fetch(`${API_PROXY_ENDPOINT}?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch device specs')
    const payload = await res.json()
    const data = payload?.data
    if (!data) return null

    // Parse azharimm API structure
    const phoneName: string = data?.phone_name || deviceSlug
    const brandName: string = data?.brand || brandSlug
    const sections: Array<{ title: string; specs: Array<{ key: string; val: string[] }> }> = data?.specifications || []

    const findVal = (keys: string[], sectionTitles: string[]) => {
      for (const section of sections) {
        if (sectionTitles.includes(section.title)) {
          for (const spec of section.specs) {
            if (keys.includes(spec.key)) {
              return spec.val?.join(' ')
            }
          }
        }
      }
      return undefined
    }

    const screen = findVal(['Size', 'Resolution', 'Type'], ['Display'])
    const ram = findVal(['RAM'], ['Memory']) || findVal(['Internal'], ['Memory'])?.match(/\b(\d+\s?GB)\b/)?.[1]
    const storage = findVal(['Internal'], ['Memory'])
    const camera = findVal(['Single', 'Dual', 'Triple', 'Quad', 'Main Camera'], ['Main Camera'])
    const battery = findVal(['Type', 'Charging'], ['Battery'])
    const processor = findVal(['CPU'], ['Platform'])
    const os = findVal(['OS'], ['Platform'])

    const result: DeviceSpecResult = {
      brand: brandName,
      model: phoneName,
      screen,
      ram,
      storage,
      camera,
      battery,
      processor,
      os,
    }
    // Log success to browser console
    // eslint-disable-next-line no-console
    console.log('[SpecsAPI] Success', result)
    return result
  } catch (e) {
    // Fallback mock for offline development
    return {
      brand: brandSlug,
      model: deviceSlug,
      screen: '6.8" AMOLED',
      ram: '12GB',
      storage: '512GB',
      camera: '200MP + 12MP + 10MP + 10MP',
      battery: '5000mAh',
      processor: 'Octa-core',
      os: 'Android 14',
    }
  }
}

// Dynamic brands from API
export async function getBrands(): Promise<string[]> {
  try {
    const res = await fetch(`/api/specs?action=brands`, { cache: 'no-store' })
    if (!res.ok) throw new Error('brands failed')
    const payload = await res.json()
    const items: Array<{ brand_name: string; brand_slug: string }> = payload?.data?.data || []
    const list = items.map((b) => b.brand_slug)
    // eslint-disable-next-line no-console
    console.log('[SpecsAPI] Brands loaded', list.length)
    return list
  } catch {
    return ['apple', 'samsung', 'xiaomi', 'oppo', 'vivo', 'infinix', 'tecno', 'nokia', 'realme', 'oneplus']
  }
}

export async function getModels(brandSlug: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/specs?action=models&brand=${encodeURIComponent(brandSlug)}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('models failed')
    const payload = await res.json()
    const items: Array<{ phone_name: string; slug: string }> = payload?.data?.data?.phones || []
    const list = items.slice(0, 100).map((m) => m.slug)
    // eslint-disable-next-line no-console
    console.log('[SpecsAPI] Models loaded', brandSlug, list.length)
    return list
  } catch {
    return []
  }
}


