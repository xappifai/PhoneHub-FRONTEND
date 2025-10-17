"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Store,
  Package,
  Heart,
  TrendingUp,
  Eye,
  MapPin,
  Star,
  ArrowRight,
  ShoppingCart,
  Clock,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useBuyerStore } from '@/store/buyer-store'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface ProductImage {
  id?: string
  url: string
  name?: string
  size?: number
  public_id?: string
}

interface Product {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  description?: string
  images: ProductImage[]
  vendor: {
    _id: string
    businessName: string
    location: string
    phone: string
  }
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock'
  specs?: any
}

interface Vendor {
  _id: string
  businessName: string
  location: string
  description?: string
  logo?: string
  rating?: number
  totalProducts?: number
}

interface DashboardStats {
  totalVendors: number
  totalProducts: number
  totalCategories: number
}

export default function BuyerDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [topVendors, setTopVendors] = useState<Vendor[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productLoading, setProductLoading] = useState(false)
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: ''
  })
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name' | 'newest'>('newest')
  const [brands, setBrands] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  
  const { wishlist, compare, recentSearches, addRecentSearch, toggleWishlist, addToCompare } = useBuyerStore()

  // Helper function to validate image URL (supports Firebase storage URLs)
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    return !!(
      url && 
      typeof url === 'string' && 
      url.trim() !== '' && 
      (url.startsWith('http') || url.startsWith('https') || url.includes('firebase'))
    )
  }

  // Helper function to get the first valid image URL from product images
  const getProductImageUrl = (images: ProductImage[] | undefined): string | null => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null
    }
    
    const firstImage = images[0]
    if (firstImage && firstImage.url) {
      return isValidImageUrl(firstImage.url) ? firstImage.url : null
    }
    
    return null
  }

  // Handle view product - fetch full details and show modal
  const handleViewProduct = async (product: Product) => {
    try {
      setProductLoading(true)
      setSelectedProduct(product)
      setIsProductModalOpen(true)
      
      // Fetch full product details from backend
      const response = await api.get(`/buyer/products/${product._id}`)
      
      if (response.data.success) {
        const fullProduct = response.data.data
        setSelectedProduct(fullProduct)
        
        // Track product view for recently viewed
        addRecentSearch(fullProduct)
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
      toast.error('Failed to load product details')
    } finally {
      setProductLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/buyer/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/buyer/categories')
      if (response.data.success) {
        setCategories(['all', ...response.data.data.map((cat: any) => cat._id)])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/buyer/products', {
        params: {
          page: 1,
          limit: 6,
          sort: '-createdAt' // Get newest products
        }
      })
      
      if (response.data.success) {
        setFeaturedProducts(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    }
  }

  const fetchTopVendors = async () => {
    try {
      const response = await api.get('/buyer/vendors', {
        params: {
          page: 1,
          limit: 4
        }
      })
      
      if (response.data.success) {
        setTopVendors(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching top vendors:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchFeaturedProducts(),
        fetchTopVendors(),
        fetchCategories(),
        fetchStats(),
        fetchBrands()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await api.get('/buyer/brands')
      if (response.data.success) {
        setBrands(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    try {
      setIsSearching(true)
      setHasSearched(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('search', searchQuery)
      
      if (filters.category) params.append('category', filters.category)
      if (filters.brand) params.append('brand', filters.brand)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      
      // Add sorting
      if (sortBy === 'price-asc') params.append('sort', 'price:asc')
      else if (sortBy === 'price-desc') params.append('sort', 'price:desc')
      else if (sortBy === 'name') params.append('sort', 'name:asc')
      else params.append('sort', 'createdAt:desc')

      const response = await api.get(`/buyer/products?${params.toString()}`)
      
      if (response.data.success) {
        setSearchResults(response.data.data || [])
      }
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Failed to search products')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: ''
    })
    setSortBy('newest')
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  useEffect(() => {
    fetchData()
    // Fetch all products by default
    fetchAllProducts()
  }, [])

  // Debug: Log search results when they change
  useEffect(() => {
    console.log('Search results updated:', searchResults.length, searchResults)
  }, [searchResults])

  const fetchAllProducts = async () => {
    try {
      setIsSearching(true)
      setHasSearched(true)
      
      console.log('Fetching all products...')
      const response = await api.get('/buyer/products')
      console.log('Products response:', response.data)
      
      if (response.data.success) {
        // Backend returns products directly in data array
        const products = response.data.data || []
        console.log('Products found:', products.length, products)
        setSearchResults(products)
      } else {
        console.error('API returned success: false', response.data)
        setSearchResults([])
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Failed to load products')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">In Stock</span>
      case 'Low Stock':
        return <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">Low Stock</span>
      case 'Out of Stock':
        return <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">Out of Stock</span>
      default:
        return null
    }
  }

  const dashboardStats = [
    {
      title: 'Total Vendors',
      value: stats?.totalVendors.toString() || '0',
      icon: Store,
      color: 'from-blue-500 to-blue-600',
      link: '/buyer/dashboard/marketplace'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts.toString() || '0',
      icon: Package,
      color: 'from-green-500 to-green-600',
      link: '/buyer/dashboard/marketplace'
    },
    {
      title: 'Wishlist Items',
      value: wishlist.length.toString(),
      icon: Heart,
      color: 'from-red-500 to-red-600',
      link: '/buyer/dashboard/wishlist'
    },
    {
      title: 'Compare List',
      value: compare.length.toString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      link: '/buyer/dashboard/compare'
    }
  ]

  // Get recently viewed products
  const recentlyViewedProducts = recentSearches.slice(0, 4)

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to VendorHub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your marketplace for mobile phones and accessories
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => (
                <Link key={index} href={stat.link}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <stat.icon className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link href="/buyer/dashboard/marketplace">
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Browse Marketplace</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Explore all products & vendors</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/buyer/dashboard/wishlist">
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-red-500">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">My Wishlist</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{wishlist.length} items saved</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/buyer/dashboard/compare">
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-500">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Compare Products</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{compare.length} products to compare</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Search Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search Mobile Phones
                </CardTitle>
                <CardDescription>
                  Find the best mobile phones across all vendor storefronts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search for mobile phones, brands, models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                        className="pl-10 pr-4 py-3 text-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={performSearch} 
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-8"
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    {hasSearched && (
                      <Button variant="outline" onClick={clearSearch}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Brand
                      </label>
                      <select
                        value={filters.brand}
                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">All Brands</option>
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Price
                      </label>
                      <Input
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Price
                      </label>
                      <Input
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sort by:
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="newest">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name">Name A-Z</option>
                      </select>
                    </div>
                    
                    <Button 
                      onClick={performSearch}
                      disabled={isSearching}
                      size="sm"
                    >
                      Apply Filters
                    </Button>
                  </div>
                    </div>
                )}

                {/* Search Results */}
                {(hasSearched || searchResults.length > 0) && (
                  <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {searchQuery.trim() ? 'Search Results' : 'All Products'}
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} {searchQuery.trim() ? 'found' : 'available'}
                  </span>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.map((product) => (
                      <Card key={product._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-square mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {getProductImageUrl(product.images) ? (
                              <Image
                                src={getProductImageUrl(product.images)!}
                                alt={product.name}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-16 w-16 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {product.brand}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(product.price)}
                              </span>
                              {getStockBadge(product.stockStatus)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Store className="h-4 w-4 mr-1" />
                              {product.vendor.businessName}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-1" />
                              {product.vendor.location}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Product
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleWishlist(product._id)}
                              className={wishlist.includes(product._id) ? 'text-red-600 border-red-600' : ''}
                            >
                              <Heart className={`h-4 w-4 ${wishlist.includes(product._id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToCompare(product._id)}
                              disabled={compare.length >= 4 && !compare.includes(product._id)}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {searchQuery.trim() ? 'No products found' : 'No products available'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchQuery.trim() 
                          ? 'Try adjusting your search terms or filters'
                          : 'No products have been added by vendors yet'
                        }
                      </p>
                      {searchQuery.trim() && (
                        <Button onClick={clearSearch} variant="outline">
                          Clear Search
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
