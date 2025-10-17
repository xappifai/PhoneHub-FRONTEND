"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp,
  Eye,
  Store,
  MapPin,
  X,
  Heart,
  Plus,
  Package,
  Check,
  Minus,
  ShoppingCart
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
  specs?: Record<string, any>
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { compare, removeFromCompare, clearCompare, wishlist, toggleWishlist } = useBuyerStore()

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

  const fetchCompareProducts = async () => {
    try {
      setLoading(true)
      
      if (compare.length === 0) {
        setProducts([])
        return
      }
      
      // Fetch all products and filter by compare list
      const response = await api.get('/buyer/products', {
        params: {
          page: 1,
          limit: 100 // Get more products to filter from
        }
      })
      
      if (response.data.success) {
        // Filter products that are in compare list
        const compareProducts = response.data.data.filter((product: Product) => 
          compare.includes(product._id)
        )
        setProducts(compareProducts)
      }
    } catch (error) {
      console.error('Error fetching compare products:', error)
      toast.error('Failed to load compare products')
    } finally {
      setLoading(false)
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
        return <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">In Stock</span>
      case 'Low Stock':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">Low Stock</span>
      case 'Out of Stock':
        return <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">Out of Stock</span>
      default:
        return null
    }
  }

  // Get all unique spec keys from all products
  const getAllSpecKeys = () => {
    const allKeys = new Set<string>()
    products.forEach(product => {
      if (product.specs) {
        Object.keys(product.specs).forEach(key => allKeys.add(key))
      }
    })
    return Array.from(allKeys)
  }

  const specKeys = getAllSpecKeys()

  useEffect(() => {
    fetchCompareProducts()
  }, [compare])

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Compare Products
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {products.length} product{products.length !== 1 ? 's' : ''} selected for comparison
                </p>
              </div>
              {products.length > 0 && (
                <Button 
                  onClick={clearCompare} 
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading comparison...</span>
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No products to compare
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                    Start adding products to your comparison list to see them here. You can compare up to 4 products at once.
                  </p>
                  <Link href="/buyer/dashboard/marketplace">
                    <Button>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Product Cards Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card key={product._id} className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                        onClick={() => removeFromCompare(product._id)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          {getProductImageUrl(product.images) ? (
                            <Image
                              src={getProductImageUrl(product.images)!}
                              alt={product.name}
                              width={200}
                              height={200}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.brand}</p>
                        <p className="text-xl font-bold text-green-600 mb-3">
                          {formatCurrency(product.price)}
                        </p>
                        <div className="mb-3">
                          {getStockBadge(product.stockStatus)}
                        </div>
                        <Button
                          size="sm"
                          variant={wishlist.includes(product._id) ? "default" : "outline"}
                          className="w-full"
                          onClick={() => toggleWishlist(product._id)}
                        >
                          <Heart className={`h-4 w-4 mr-2 ${wishlist.includes(product._id) ? 'fill-current' : ''}`} />
                          {wishlist.includes(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add More Card */}
                  {products.length < 4 && (
                    <Link href="/buyer/dashboard/marketplace">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer h-full">
                        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                            <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Add Product
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Compare up to 4 products
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>

                {/* Detailed Comparison Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Detailed Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                              Feature
                            </th>
                            {products.map((product) => (
                              <th key={product._id} className="text-center p-4 min-w-[200px]">
                                <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                  {product.name}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Price Row */}
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              Price
                            </td>
                            {products.map((product) => (
                              <td key={product._id} className="text-center p-4">
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(product.price)}
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Brand Row */}
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              Brand
                            </td>
                            {products.map((product) => (
                              <td key={product._id} className="text-center p-4 text-gray-700 dark:text-gray-300">
                                {product.brand}
                              </td>
                            ))}
                          </tr>

                          {/* Category Row */}
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              Category
                            </td>
                            {products.map((product) => (
                              <td key={product._id} className="text-center p-4 text-gray-700 dark:text-gray-300">
                                {product.category}
                              </td>
                            ))}
                          </tr>

                          {/* Stock Status Row */}
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              Availability
                            </td>
                            {products.map((product) => (
                              <td key={product._id} className="text-center p-4">
                                {getStockBadge(product.stockStatus)}
                              </td>
                            ))}
                          </tr>

                          {/* Vendor Row */}
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              Vendor
                            </td>
                            {products.map((product) => (
                              <td key={product._id} className="text-center p-4">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                    <Store className="h-4 w-4" />
                                    <span className="font-medium">{product.vendor.businessName}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="h-3 w-3" />
                                    <span>{product.vendor.location}</span>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>

                          {/* Specifications Rows */}
                          {specKeys.length > 0 && (
                            <>
                              <tr className="bg-gray-100 dark:bg-gray-800">
                                <td colSpan={products.length + 1} className="p-4 font-bold text-gray-900 dark:text-white">
                                  Specifications
                                </td>
                              </tr>
                              {specKeys.map((key) => (
                                <tr key={key} className="border-b border-gray-200 dark:border-gray-700">
                                  <td className="p-4 font-medium text-gray-900 dark:text-white capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </td>
                                  {products.map((product) => (
                                    <td key={product._id} className="text-center p-4 text-gray-700 dark:text-gray-300">
                                      {product.specs?.[key] ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <Check className="h-4 w-4 text-green-600" />
                                          <span>{String(product.specs[key])}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center gap-1 text-gray-400">
                                          <Minus className="h-4 w-4" />
                                          <span>N/A</span>
                                        </div>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <Link href="/buyer/dashboard/marketplace">
                        <Button variant="outline">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Browse More Products
                        </Button>
                      </Link>
                      <Link href="/buyer/dashboard/wishlist">
                        <Button variant="outline">
                          <Heart className="h-4 w-4 mr-2" />
                          View Wishlist
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

