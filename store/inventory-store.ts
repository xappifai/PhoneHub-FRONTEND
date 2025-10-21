"use client"
import { create } from 'zustand'
import api from '@/lib/api-client'
import { uploadFileToFirebase, compressImageForUpload } from '@/lib/firebase-client'

export type ProductCategory =
  | 'Mobile Phones'
  | 'Accessories'
  | 'Smartwatches'
  | 'Audio Devices'
  | 'Tablets'
  | 'Laptops'
  | 'Custom'

export interface ProductVariant {
  id: string
  name: string // e.g., Color: Black, Storage: 256GB
  sku: string
  price: number
  quantity: number
}

export interface ProductImage {
  id: string
  url: string
  name?: string
  size?: number
}

export interface ProductSpecs {
  screen?: string
  ram?: string
  storage?: string
  camera?: string
  battery?: string
  processor?: string
  os?: string
  [key: string]: string | undefined
}

export interface ProductItem {
  id: string
  name: string
  brand: string
  model: string
  category: ProductCategory
  subcategory?: string
  sku: string
  imeiNumbers?: string[]
  individualSellingPrices?: number[] // For mobile phones with individual pricing
  individualPurchasePrices?: number[] // For mobile phones with individual purchase pricing
  colors?: string[] // For mobile phones with individual colors
  colorVariant?: 'same' | 'different' // Color configuration type
  priceVariant?: 'same' | 'different' // Price configuration type
  purchasePriceVariant?: 'same' | 'different' // Purchase price configuration type
  barcode?: string
  description?: string
  purchasePrice: number
  sellingPrice: number
  quantity: number
  minStock: number
  featured?: boolean
  onSale?: boolean
  // Purchase details (from whom purchasing)
  purchaseFromName?: string
  purchaseFromPhone?: string
  purchaseFromCnic?: string
  purchaseFromAddress?: string
  images: ProductImage[]
  specs?: ProductSpecs
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

type MixedImageInput = ProductImage | File | { file: File; name?: string; size?: number; url?: string }
type AddProductInput = Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'> & { images?: MixedImageInput[] }
type UpdateProductInput = Partial<ProductItem> & { images?: MixedImageInput[] }

export interface InventoryHistoryItem {
  id: string
  productId: string
  type: 'add' | 'update' | 'delete' | 'sale' | 'adjustment'
  quantityChange?: number
  note?: string
  timestamp: string
}

interface InventoryStoreState {
  products: ProductItem[]
  history: InventoryHistoryItem[]
  // Backend-backed methods
  loadProducts: () => Promise<void>
  addProduct: (product: AddProductInput) => Promise<ProductItem | null>
  updateProduct: (id: string, updates: UpdateProductInput) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  loadHistory: () => Promise<void>
  exportProductsCsv: () => Promise<string>
  // Local helpers
  getStats: () => { total: number; totalValue: number; lowStock: number; outOfStock: number }
}

// Generate IMEI-like numbers (15 digits)
function generateIMEI(): string {
  const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('')
  // Calculate Luhn check digit
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return digits + checkDigit
}

// Generate multiple unique IMEI numbers
function generateIMEIs(count: number): string[] {
  const imeis = new Set<string>()
  while (imeis.size < count) {
    imeis.add(generateIMEI())
  }
  return Array.from(imeis)
}

function toCsv(values: string[]): string {
  return values
    .map((v) => {
      const s = v ?? ''
      if (s.includes(',') || s.includes('\n') || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    })
    .join(',')
}

export const useInventoryStore = create<InventoryStoreState>()((set, get) => ({
  products: [],
  history: [],

  loadProducts: async () => {
    const { data } = await api.get('/products', { params: { limit: 100 } })
    const products = (data?.data || []).map((p: any) => ({
      id: p._id,
      name: p.name,
      brand: p.brand,
      model: p.model,
      category: p.category,
      subcategory: p.subcategory,
      sku: p.sku,
      imeiNumbers: p.imeiNumbers,
      individualSellingPrices: p.individualSellingPrices,
      colors: p.colors,
      colorVariant: p.colorVariant,
      priceVariant: p.priceVariant,
      barcode: p.barcode,
      description: p.description,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      minStock: p.minStock,
      featured: p.featured,
      onSale: p.onSale,
      purchaseFromName: p.purchaseFromName,
      purchaseFromPhone: p.purchaseFromPhone,
      purchaseFromCnic: p.purchaseFromCnic,
      purchaseFromAddress: p.purchaseFromAddress,
      images: (p.images || []).map((img: any) => ({ id: img._id, url: img.url, name: img.name, size: img.size })),
      specs: p.specs,
      variants: p.variants,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })) as ProductItem[]
    set({ products })
  },

  addProduct: async (product) => {
    // Prepare payload; upload files to Firebase client-side first
    const fields: any = { ...product }
    if (product.category === 'Mobile Phones') {
      const imeis = (product.imeiNumbers || []).filter((i) => i && i.trim() !== '')
      if (imeis.length > 0) fields.sku = imeis[0]
    }
    const images: any[] = (product.images || []) as any
    const urls: { url: string; name?: string; size?: number }[] = []
    // Upload in parallel with gentle concurrency to speed up UX
    const uploadJobs: Promise<void>[] = []
    const concurrency = 3
    let active = 0
    let index = 0
    await new Promise<void>((resolve) => {
      const runNext = () => {
        while (active < concurrency && index < images.length) {
          const img = images[index++]
          active++
          const job = (async () => {
            try {
              if (img instanceof File) {
                const compressed = await compressImageForUpload(img, { maxDimension: 1600, quality: 0.8 })
                const url = await uploadFileToFirebase(compressed, 'products')
                urls.push({ url, name: img.name, size: img.size })
              } else if (img?.file instanceof File) {
                const f: File = img.file
                const compressed = await compressImageForUpload(f, { maxDimension: 1600, quality: 0.8 })
                const url = await uploadFileToFirebase(compressed, 'products')
                urls.push({ url, name: f.name, size: f.size })
              } else if (typeof img?.url === 'string' && img.url.startsWith('http')) {
                urls.push({ url: img.url, name: img.name, size: img.size })
              }
            } finally {
              active--
              runNext()
            }
          })()
          uploadJobs.push(job)
        }
        if (active === 0 && index >= images.length) resolve()
      }
      runNext()
    })
    const payload = { ...fields, images: urls }

    const { data } = await api.post('/products', payload)
    const p = data?.data
    if (!p) return null
    const newItem: ProductItem = {
      id: p._id,
      name: p.name,
      brand: p.brand,
      model: p.model,
      category: p.category,
      subcategory: p.subcategory,
      sku: p.sku,
      imeiNumbers: p.imeiNumbers,
      individualSellingPrices: p.individualSellingPrices,
      colors: p.colors,
      colorVariant: p.colorVariant,
      priceVariant: p.priceVariant,
      barcode: p.barcode,
      description: p.description,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      minStock: p.minStock,
      featured: p.featured,
      onSale: p.onSale,
      purchaseFromName: p.purchaseFromName,
      purchaseFromPhone: p.purchaseFromPhone,
      purchaseFromCnic: p.purchaseFromCnic,
      purchaseFromAddress: p.purchaseFromAddress,
      images: (p.images || []).map((img: any) => ({ id: img._id, url: img.url, name: img.name, size: img.size })),
      specs: p.specs,
      variants: p.variants,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }
    set((state) => ({ products: [newItem, ...state.products] }))
    return newItem
  },

  updateProduct: async (id, updates) => {
    const fields: any = { ...updates }
    if (updates.imeiNumbers) {
      const imeis = updates.imeiNumbers.filter((i) => i && i.trim() !== '')
      if (imeis.length > 0) fields.sku = imeis[0]
    }
    const urls: { url: string; name?: string; size?: number }[] = []
    const images: any[] = (updates.images || []) as any
    for (const img of images) {
      if (img?.id && img.url) {
        // existing image kept
        urls.push({ url: img.url, name: img.name, size: img.size })
      } else if (img instanceof File) {
        const url = await uploadFileToFirebase(img, 'products')
        urls.push({ url, name: img.name, size: img.size })
      } else if (img?.file instanceof File) {
        const f: File = img.file
        const url = await uploadFileToFirebase(f, 'products')
        urls.push({ url, name: f.name, size: f.size })
      } else if (typeof img?.url === 'string' && img.url.startsWith('http')) {
        urls.push({ url: img.url, name: img.name, size: img.size })
      }
    }
    const payload = { ...fields, images: urls }

    const { data } = await api.put(`/products/${id}`, payload)
    const p = data?.data
    set((state) => ({
      products: state.products.map((it) => it.id === id ? {
        id: p._id,
        name: p.name,
        brand: p.brand,
        model: p.model,
        category: p.category,
        subcategory: p.subcategory,
        sku: p.sku,
        imeiNumbers: p.imeiNumbers,
        individualSellingPrices: p.individualSellingPrices,
        colors: p.colors,
        colorVariant: p.colorVariant,
        priceVariant: p.priceVariant,
        barcode: p.barcode,
        description: p.description,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        quantity: p.quantity,
        minStock: p.minStock,
        featured: p.featured,
        onSale: p.onSale,
        purchaseFromName: p.purchaseFromName,
        purchaseFromPhone: p.purchaseFromPhone,
        purchaseFromCnic: p.purchaseFromCnic,
        purchaseFromAddress: p.purchaseFromAddress,
        images: (p.images || []).map((img: any) => ({ id: img._id, url: img.url, name: img.name, size: img.size })),
        specs: p.specs,
        variants: p.variants,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      } : it)
    }))
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`)
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }))
  },

  loadHistory: async () => {
    const { data } = await api.get('/products/history', { params: { limit: 200 } })
    const history = (data?.data || []).map((h: any) => ({
      id: h._id,
      productId: h.product,
      type: h.type,
      quantityChange: h.quantityChange,
      note: h.note,
      timestamp: h.createdAt,
    })) as InventoryHistoryItem[]
    set({ history })
  },

  exportProductsCsv: async () => {
    const res = await api.get('/products/export/csv', { responseType: 'text' })
    return res.data as string
  },

  getStats: () => {
    const products = get().products
    const total = products.length
    const totalValue = products.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0)
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length
    const outOfStock = products.filter((p) => p.quantity === 0).length
    return { total, totalValue, lowStock, outOfStock }
  },
}))


