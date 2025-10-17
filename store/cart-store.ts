import { create } from 'zustand'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  vendorId: string
}

export interface WishlistItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  vendorId: string
}

interface CartStore {
  items: CartItem[]
  wishlist: WishlistItem[]
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  wishlist: [],
  
  addToCart: (item) => {
    const existingItem = get().items.find(i => i.productId === item.productId)
    
    if (existingItem) {
      get().updateQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      set((state) => ({
        items: [...state.items, { ...item, id: Date.now().toString(), quantity: 1 }]
      }))
    }
  },
  
  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== id)
    }))
  },
  
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id)
      return
    }
    
    set((state) => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    }))
  },
  
  clearCart: () => {
    set({ items: [] })
  },
  
  addToWishlist: (item) => {
    const exists = get().wishlist.find(w => w.productId === item.productId)
    if (!exists) {
      set((state) => ({
        wishlist: [...state.wishlist, { ...item, id: Date.now().toString() }]
      }))
    }
  },
  
  removeFromWishlist: (productId) => {
    set((state) => ({
      wishlist: state.wishlist.filter(item => item.productId !== productId)
    }))
  },
  
  isInWishlist: (productId) => {
    return get().wishlist.some(item => item.productId === productId)
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0)
  }
}))