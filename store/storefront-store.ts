import { create } from 'zustand'
import api from '@/lib/api-client'
import { uploadFileToFirebase } from '@/lib/firebase-client'

export type ThemeName =
  | 'blue' | 'indigo' | 'green' | 'emerald' | 'teal' | 'cyan' | 'purple' | 'pink' | 'orange' | 'slate'

export interface BusinessHours {
  [day: string]: { open: string; close: string; closed?: boolean }
}

export interface StorefrontSettings {
  id?: string
  vendorId: string
  vendorName: string
  subdomain: string // vendorname.vendorhub.pk
  theme: ThemeName
  banner?: { url: string; public_id?: string } | string
  logo?: { url: string; public_id?: string }
  description?: string
  about?: string
  enabledCategories: string[]
  contact: { phone?: string; whatsapp?: string; email?: string; address?: string }
  hours?: BusinessHours
  mapEmbedUrl?: string
  customDomain?: string // Pro/Premium
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; youtube?: string; linkedin?: string }
  features?: {
    showPrices?: boolean
    showStock?: boolean
    enableWhatsAppInquiry?: boolean
    enableContactForm?: boolean
  }
  isPublished?: boolean
  analytics: { pageViews: number; productViews: Record<string, number>; inquiries: number; totalSales?: number }
}

export interface StorefrontAnalytics {
  pageViews: number
  inquiries: number
  totalSales: number
  productViews: Array<{ productId: string; productName: string; views: number }>
}

interface StorefrontState {
  settings: StorefrontSettings | null
  analytics: StorefrontAnalytics | null
  loadStorefront: () => Promise<void>
  updateStorefront: (updates: Partial<StorefrontSettings>) => Promise<void>
  loadAnalytics: () => Promise<void>
  uploadBanner: (file: File) => Promise<void>
  uploadLogo: (file: File) => Promise<void>
}

const defaultHours: BusinessHours = {
  mon: { open: '09:00', close: '18:00' },
  tue: { open: '09:00', close: '18:00' },
  wed: { open: '09:00', close: '18:00' },
  thu: { open: '09:00', close: '18:00' },
  fri: { open: '09:00', close: '18:00' },
  sat: { open: '10:00', close: '16:00' },
  sun: { open: '00:00', close: '00:00', closed: true },
}

export const useStorefrontStore = create<StorefrontState>()((set, get) => ({
  settings: null,
  analytics: null,

  loadStorefront: async () => {
    try {
      const { data } = await api.get('/storefront')
      const sf = data?.data
      if (sf) {
        const hours: BusinessHours = {}
        if (sf.hours && Array.isArray(sf.hours)) {
          sf.hours.forEach((h: any) => {
            hours[h.day] = { open: h.open, close: h.close, closed: h.closed }
          })
        }
        const productViews: Record<string, number> = {}
        if (sf.analytics?.productViews) {
          Object.entries(sf.analytics.productViews).forEach(([k, v]) => {
            productViews[k] = v as number
          })
        }
        set({
          settings: {
            id: sf._id,
            vendorId: sf.user,
            vendorName: sf.vendorName,
            subdomain: sf.subdomain,
            theme: sf.theme || 'blue',
            banner: sf.banner,
            logo: sf.logo,
            description: sf.description,
            about: sf.about,
            enabledCategories: sf.enabledCategories || [],
            contact: sf.contact || {},
            hours: Object.keys(hours).length ? hours : defaultHours,
            mapEmbedUrl: sf.mapEmbedUrl,
            customDomain: sf.customDomain,
            socialLinks: sf.socialLinks,
            features: sf.features,
            isPublished: sf.isPublished,
            analytics: {
              pageViews: sf.analytics?.pageViews || 0,
              productViews,
              inquiries: sf.analytics?.inquiries || 0,
              totalSales: sf.analytics?.totalSales || 0,
            },
          }
        })
      }
    } catch (error) {
      console.error('Failed to load storefront:', error)
    }
  },

  updateStorefront: async (updates) => {
    try {
      const { data } = await api.put('/storefront', updates)
      if (data?.data) {
        await get().loadStorefront()
      }
    } catch (error) {
      console.error('Failed to update storefront:', error)
      throw error
    }
  },

  loadAnalytics: async () => {
    try {
      const { data } = await api.get('/storefront/analytics')
      if (data?.data) {
        set({ analytics: data.data })
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  },

  uploadBanner: async (file: File) => {
    try {
      const url = await uploadFileToFirebase(file, 'storefront/banners')
      const { data } = await api.put('/storefront/banner', { url })
      if (data?.data) {
        await get().loadStorefront()
      }
    } catch (error) {
      console.error('Failed to upload banner:', error)
      throw error
    }
  },

  uploadLogo: async (file: File) => {
    try {
      const url = await uploadFileToFirebase(file, 'storefront/logos')
      const { data } = await api.put('/storefront/logo', { url })
      if (data?.data) {
        await get().loadStorefront()
      }
    } catch (error) {
      console.error('Failed to upload logo:', error)
      throw error
    }
  },
}))


