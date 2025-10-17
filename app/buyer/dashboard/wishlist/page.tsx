"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart,
  MessageCircle,
  Eye,
  Store,
  MapPin,
  Star,
  Trash2,
  Package
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

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productLoading, setProductLoading] = useState(false)
  const { wishlist, toggleWishlist, addRecentSearch } = useBuyerStore()

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

  const fetchWishlistProducts = async () => {
    try {
      setLoading(true)
      
      if (wishlist.length === 0) {
        setProducts([])
        return
      }
      
      // Fetch all products and filter by wishlist
      const response = await api.get('/buyer/products', {
        params: {
          page: 1,
          limit: 100 // Get more products to filter from
        }
      })
      
      if (response.data.success) {
        // Filter products that are in wishlist
        const wishlistProducts = response.data.data.filter((product: Product) => 
          wishlist.includes(product._id)
        )
        setProducts(wishlistProducts)
      }
    } catch (error) {
      console.error('Error fetching wishlist products:', error)
      toast.error('Failed to load wishlist products')
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

  useEffect(() => {
    fetchWishlistProducts()
  }, [wishlist])

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Products you've saved for later
            </p>
          </div>

          {/* Wishlist Content */}
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
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start exploring products and add them to your wishlist to keep track of items you're interested in.
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
              {/* Wishlist Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {products.length} items in your wishlist
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total estimated value: {formatCurrency(products.reduce((sum, product) => sum + product.price, 0))}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        products.forEach(product => toggleWishlist(product._id))
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
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
                          <Heart className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => toggleWishlist(product._id)}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                      <div className="absolute bottom-2 left-2">
                        {getStockBadge(product.stockStatus)}
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
                        <Store className="h-4 w-4" />
                        <span className="truncate">{product.vendor.businessName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{product.vendor.location}</span>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/buyer/products/${product._id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewProduct(product)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Product
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

        {/* Product Detail Modal */}
        {isProductModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Product Details
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProductModalOpen(false)}
                  >
                    ×
                  </Button>
                </div>

                {productLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading product details...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div>
                      <div className="relative">
                        {getProductImageUrl(selectedProduct.images) ? (
                          <Image
                            src={getProductImageUrl(selectedProduct.images)!}
                            alt={selectedProduct.name}
                            width={500}
                            height={400}
                            className="w-full h-96 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Additional Images */}
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {selectedProduct.images.slice(1, 5).map((image, index) => (
                            getProductImageUrl([image]) ? (
                              <Image
                                key={index}
                                src={getProductImageUrl([image])!}
                                alt={`${selectedProduct.name} ${index + 2}`}
                                width={100}
                                height={100}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div key={index} className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedProduct.name}
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                        {selectedProduct.brand}
                      </p>
                      
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-green-600">
                          {formatCurrency(selectedProduct.price)}
                        </span>
                        {getStockBadge(selectedProduct.stockStatus)}
                      </div>

                      {/* Vendor Information */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Vendor Information</h3>
                        <div className="space-y-1">
                          <p><strong>Business:</strong> {selectedProduct.vendor.businessName}</p>
                          <p><strong>Location:</strong> {selectedProduct.vendor.location}</p>
                          <p><strong>Phone:</strong> {selectedProduct.vendor.phone}</p>
                        </div>
                      </div>

                      {/* Product Specifications */}
                      {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Specifications</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selectedProduct.specs).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {selectedProduct.description && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedProduct.description}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => toggleWishlist(selectedProduct._id)}
                          variant={wishlist.includes(selectedProduct._id) ? "default" : "outline"}
                          className="flex-1"
                        >
                          <Heart className={`h-4 w-4 mr-2 ${wishlist.includes(selectedProduct._id) ? 'fill-current' : ''}`} />
                          {wishlist.includes(selectedProduct._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}