import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

export interface BuyerProfile {
  name?: string
  email?: string
  phone?: string
  preferredContact?: 'whatsapp' | 'email'
  address?: string
  city?: string
  interests?: string[]
  notifications?: {
    email?: boolean
    wishlistSale?: boolean
    inquiryResponses?: boolean
    newProducts?: boolean
  }
}

interface RecentSearch {
  productId: string
  name: string
  brand: string
  price: number
  category: string
  images: any[]
  vendorId: string
  vendorName: string
  vendorLocation: string
  vendorPhone: string
  stockStatus: string
  timestamp: string
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: {
    category?: string
    brand?: string
    minPrice?: string
    maxPrice?: string
    location?: string
  }
  createdAt: string
  lastRun?: string
}

interface BuyerState {
  wishlist: string[]
  compare: string[]
  recentSearches: RecentSearch[]
  savedSearches: SavedSearch[]
  profile: BuyerProfile
  toggleWishlist: (productId: string) => void
  addToCompare: (productId: string) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  addRecentSearch: (product: any) => void
  clearRecentSearches: () => void
  addSavedSearch: (name: string, query: string, filters: any) => void
  removeSavedSearch: (id: string) => void
  updateSavedSearchLastRun: (id: string) => void
  updateProfile: (p: Partial<BuyerProfile>) => void
}

export const useBuyerStore = create<BuyerState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      compare: [],
      recentSearches: [],
      savedSearches: [],
      profile: { 
        preferredContact: 'whatsapp',
        notifications: {
          email: true,
          wishlistSale: true,
          inquiryResponses: true,
          newProducts: false
        }
      },

      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      addToCompare: (productId) =>
        set((state) => {
          if (state.compare.includes(productId)) return state
          const next = [...state.compare, productId].slice(-4) // keep last 4
          return { compare: next }
        }),

      removeFromCompare: (productId) =>
        set((state) => ({ compare: state.compare.filter((id) => id !== productId) })),

      clearCompare: () => set({ compare: [] }),

      addRecentSearch: (product) =>
        set((state) => {
          const recentSearch: RecentSearch = {
            productId: product._id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            category: product.category,
            images: product.images || [],
            vendorId: product.vendor._id,
            vendorName: product.vendor.businessName,
            vendorLocation: product.vendor.location,
            vendorPhone: product.vendor.phone,
            stockStatus: product.stockStatus || 'In Stock',
            timestamp: new Date().toISOString()
          }
          
          // Remove existing entry if it exists and add to front
          const filtered = state.recentSearches.filter((s) => s.productId !== product._id)
          const next = [recentSearch, ...filtered].slice(0, 20) // keep last 20
          return { recentSearches: next }
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      addSavedSearch: (name, query, filters) =>
        set((state) => {
          const savedSearch: SavedSearch = {
            id: `search_${Date.now()}`,
            name,
            query,
            filters,
            createdAt: new Date().toISOString()
          }
          return { savedSearches: [savedSearch, ...state.savedSearches].slice(0, 10) } // keep last 10
        }),

      removeSavedSearch: (id) =>
        set((state) => ({ savedSearches: state.savedSearches.filter((s) => s.id !== id) })),

      updateSavedSearchLastRun: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.map((s) =>
            s.id === id ? { ...s, lastRun: new Date().toISOString() } : s
          )
        })),

      updateProfile: (p) => set((state) => ({ profile: { ...state.profile, ...p } })),
    }),
    { name: 'buyer-store' }
  )
)
