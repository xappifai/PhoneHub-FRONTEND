export interface Product {
  id: string
  name: string
  brand: string
  model: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  description: string
  category: string
  subcategory: string
  sku: string
  stock: number
  specs: Record<string, string>
  features: string[]
  vendorId: string
  vendorName: string
  rating: number
  reviews: number
  isNew?: boolean
  isFeatured?: boolean
}

export interface Transaction {
  id: string
  date: string
  type: 'sale' | 'expense'
  amount: number
  category: string
  description: string
  customerName?: string
  productName?: string
  status: 'completed' | 'pending' | 'cancelled'
}

export interface Vendor {
  id: string
  name: string
  businessName: string
  email: string
  phone: string
  location: string
  logo: string
  banner: string
  description: string
  rating: number
  totalSales: number
  productsCount: number
  joinedDate: string
  status: 'active' | 'pending' | 'suspended'
  subscription: 'free' | 'basic' | 'pro' | 'premium'
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    price: 485000,
    originalPrice: 520000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800'
    ],
    description: 'Latest iPhone with Pro camera system and A17 Pro chip',
    category: 'Mobile Phones',
    subcategory: 'Smartphones',
    sku: 'IPH15PM-256-TB',
    stock: 5,
    specs: {
      'Display': '6.7" Super Retina XDR',
      'Storage': '256GB',
      'RAM': '8GB',
      'Camera': '48MP Triple Camera',
      'Battery': '4422mAh',
      'OS': 'iOS 17'
    },
    features: ['Face ID', 'Wireless Charging', '5G Ready', 'Water Resistant'],
    vendorId: '1',
    vendorName: 'Tech Mobile Center',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'
    ],
    description: 'Premium Android smartphone with S Pen and AI features',
    category: 'Mobile Phones',
    subcategory: 'Smartphones',
    sku: 'SGS24U-512-BK',
    stock: 8,
    specs: {
      'Display': '6.8" Dynamic AMOLED',
      'Storage': '512GB',
      'RAM': '12GB',
      'Camera': '200MP Quad Camera',
      'Battery': '5000mAh',
      'OS': 'Android 14'
    },
    features: ['S Pen', 'Wireless Charging', '5G Ready', 'IP68'],
    vendorId: '1',
    vendorName: 'Tech Mobile Center',
    rating: 4.7,
    reviews: 89,
    isFeatured: true
  },
  {
    id: '3',
    name: 'AirPods Pro 2nd Gen',
    brand: 'Apple',
    model: 'AirPods Pro',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    images: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800'
    ],
    description: 'Premium wireless earbuds with active noise cancellation',
    category: 'Accessories',
    subcategory: 'Audio',
    sku: 'APP2-WHT',
    stock: 12,
    specs: {
      'Driver': 'Custom',
      'Battery': '6hrs + 24hrs case',
      'Connectivity': 'Bluetooth 5.3',
      'Features': 'ANC, Transparency',
      'Charging': 'Lightning + Wireless'
    },
    features: ['Active Noise Cancellation', 'Spatial Audio', 'Wireless Charging'],
    vendorId: '2',
    vendorName: 'Audio Tech Store',
    rating: 4.9,
    reviews: 203
  }
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'sale',
    amount: 485000,
    category: 'Mobile Sales',
    description: 'iPhone 15 Pro Max - Customer Purchase',
    customerName: 'Ali Hassan',
    productName: 'iPhone 15 Pro Max',
    status: 'completed'
  },
  {
    id: '2',
    date: '2024-01-14',
    type: 'sale',
    amount: 75000,
    category: 'Accessories',
    description: 'AirPods Pro 2nd Gen',
    customerName: 'Sara Ahmed',
    productName: 'AirPods Pro 2nd Gen',
    status: 'completed'
  },
  {
    id: '3',
    date: '2024-01-13',
    type: 'expense',
    amount: 15000,
    category: 'Inventory',
    description: 'Phone cases bulk purchase',
    status: 'completed'
  }
]

export const MOCK_VENDORS: Vendor[] = [
  {
    id: '1',
    name: 'Ahmed Khan',
    businessName: 'Tech Mobile Center',
    email: 'ahmed@techcenter.pk',
    phone: '+92-300-1234567',
    location: 'Saddar, Karachi',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    description: 'Premium mobile phones and accessories with 10+ years experience',
    rating: 4.8,
    totalSales: 2500000,
    productsCount: 145,
    joinedDate: '2023-06-15',
    status: 'active',
    subscription: 'pro'
  },
  {
    id: '2',
    name: 'Fatima Ali',
    businessName: 'Audio Tech Store',
    email: 'fatima@audiotech.pk',
    phone: '+92-301-9876543',
    location: 'Gulberg, Lahore',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    description: 'Audio accessories and smart gadgets specialist',
    rating: 4.6,
    totalSales: 850000,
    productsCount: 78,
    joinedDate: '2023-08-20',
    status: 'active',
    subscription: 'basic'
  }
]

export const SUBSCRIPTION_PLANS = [
  {
    name: 'Free',
    price: 0,
    products: 50,
    transactions: 100,
    features: ['Basic storefront', 'Email support'],
    popular: false
  },
  {
    name: 'Basic',
    price: 2500,
    products: 200,
    transactions: 500,
    features: ['Custom theme', 'WhatsApp integration', 'Priority support'],
    popular: false
  },
  {
    name: 'Pro',
    price: 5000,
    products: 1000,
    transactions: 2000,
    features: ['Custom domain', 'Advanced analytics', 'Multi-location'],
    popular: true
  },
  {
    name: 'Premium',
    price: 10000,
    products: -1, // unlimited
    transactions: -1, // unlimited
    features: ['White-label', 'API access', 'Dedicated support'],
    popular: false
  }
]