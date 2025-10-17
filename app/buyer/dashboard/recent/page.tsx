"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Eye,
  MessageCircle,
  Store,
  MapPin,
  Star,
  Clock,
  Trash2,
  Heart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useBuyerStore } from '@/store/buyer-store'

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
  images: ProductImage[]
  vendor: {
    _id: string
    businessName: string
    location: string
    phone: string
  }
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock'
  viewedAt: string
}

export default function RecentPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { wishlist, toggleWishlist, recentSearches, clearRecentSearches } = useBuyerStore()

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

  const fetchRecentProducts = async () => {
    try {
      setLoading(true)
      
      // Get recent searches from store and convert to product format
      const recentProducts = recentSearches.map((search: any) => ({
        _id: search.productId || search._id,
        name: search.name || search.productName,
        brand: search.brand,
        price: search.price,
        category: search.category,
        images: search.images || [],
        vendor: {
          _id: search.vendorId || search.vendor?._id,
          businessName: search.vendorName || search.vendor?.businessName,
          location: search.vendorLocation || search.vendor?.location,
          phone: search.vendorPhone || search.vendor?.phone
        },
        stockStatus: search.stockStatus || 'In Stock',
        viewedAt: search.timestamp || search.viewedAt || new Date().toISOString()
      }))
      
      setProducts(recentProducts)
    } catch (error) {
      console.error('Error fetching recent products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">In Stock</span>
      case 'Low Stock':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Low Stock</span>
      case 'Out of Stock':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Out of Stock</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  const clearRecentHistory = () => {
    clearRecentSearches()
    setProducts([])
  }

  useEffect(() => {
    fetchRecentProducts()
  }, [recentSearches])

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Recently Viewed
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Products you've recently browsed
              </p>
            </div>

            {/* Recent Products Content */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No recently viewed products
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start browsing products to see them here. Your recently viewed items will appear in this section.
                  </p>
                  <Link href="/buyer/dashboard">
                    <Button>
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Recent Stats */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {products.length} recently viewed products
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Keep track of products you're interested in
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={clearRecentHistory}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear History
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product._id} className="hover:shadow-lg transition-shadow">
                      <div className="relative">
                        {getProductImageUrl(product.images) ? (
                          <Image
                            src={getProductImageUrl(product.images)!}
                            alt={product.name}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                            <Eye className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => toggleWishlist(product._id)}
                        >
                          <Heart className={`h-4 w-4 ${wishlist.includes(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                        </Button>
                        <div className="absolute bottom-2 left-2">
                          {getStockBadge(product.stockStatus)}
                        </div>
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(product.viewedAt)}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <Store className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{product.vendor.businessName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{product.vendor.location}</span>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/buyer/products/${product._id}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">
                              <Eye className="h-4 w-4 mr-1" />
                              View Again
                            </Button>
                          </Link>
                          <Button size="sm" className="flex-1">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contact Vendor
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
