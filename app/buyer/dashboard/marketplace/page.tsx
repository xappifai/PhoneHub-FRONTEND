"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter,
  Store,
  MapPin,
  Star,
  Users,
  Package,
  MessageCircle,
  Eye,
  Grid,
  List,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface Vendor {
  _id: string
  businessName: string
  location: string
  description: string
  categories: string[]
  rating: number
  totalProducts: number
  logo?: string
  banner?: string
  phone: string
  email: string
  address: string
  businessType?: string
  createdAt: string
  verified: boolean
}

export default function MarketplacePage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Helper function to validate image URLs
  const isValidImageUrl = (url: any): boolean => {
    if (!url) return false
    if (typeof url !== 'string') return false
    if (url.trim() === '') return false
    if (url === 'null' || url === 'undefined') return false
    return true
  }

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'Karachi', label: 'Karachi' },
    { value: 'Lahore', label: 'Lahore' },
    { value: 'Islamabad', label: 'Islamabad' },
    { value: 'Rawalpindi', label: 'Rawalpindi' },
    { value: 'Faisalabad', label: 'Faisalabad' }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Mobile Phones', label: 'Mobile Phones' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Smartwatches', label: 'Smartwatches' },
    { value: 'Audio Devices', label: 'Audio Devices' },
    { value: 'Tablets', label: 'Tablets' },
    { value: 'Laptops', label: 'Laptops' }
  ]

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: 1,
        limit: 50
      }
      
      if (searchQuery) params.search = searchQuery
      if (selectedLocation !== 'all') params.location = selectedLocation
      
      const response = await api.get('/buyer/vendors', { params })
      
      if (response.data.success) {
        // Debug: Check vendor data structure
        if (response.data.data.length > 0) {
          console.log('✅ Vendors fetched:', response.data.data.length)
          console.log('📸 First vendor logo:', response.data.data[0].logo)
          console.log('🎨 First vendor banner:', response.data.data[0].banner)
        }
        setVendors(response.data.data)
      }
    } catch (error) {
      console.error('❌ Error fetching vendors:', error)
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchQuery || 
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesLocation = selectedLocation === 'all' || vendor.location === selectedLocation
    const matchesCategory = selectedCategory === 'all' || vendor.categories.includes(selectedCategory)
    
    return matchesSearch && matchesLocation && matchesCategory
  })

  useEffect(() => {
    fetchVendors()
  }, [searchQuery, selectedLocation, selectedCategory])

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Marketplace Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover trusted vendors and their products
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search vendors, locations, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {locations.map(loc => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <Button onClick={fetchVendors} disabled={loading} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Mode and Results Count */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Vendors ({filteredVendors.length})
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse through our verified vendor network
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Vendors List */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVendors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No vendors found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or filters to find vendors.
                </p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedLocation('all')
                  setSelectedCategory('all')
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredVendors.map((vendor) => (
                <Card key={vendor._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Vendor Banner */}
                  {isValidImageUrl(vendor.banner) && (
                    <div className="h-24 w-full relative bg-gradient-to-r from-blue-500 to-purple-500">
                      <Image
                        src={vendor.banner!}
                        alt={`${vendor.businessName} banner`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLElement
                          if (target && target.parentElement) {
                            target.parentElement.style.display = 'none'
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {isValidImageUrl(vendor.logo) ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                            <Image
                              src={vendor.logo!}
                              alt={vendor.businessName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                              onError={(e) => {
                                console.log('❌ Failed to load logo:', vendor.logo)
                                const target = e.target as HTMLElement
                                if (target && target.parentElement && target.parentElement.parentElement) {
                                  target.parentElement.parentElement.innerHTML = `<div class="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border border-gray-200 dark:border-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 dark:text-blue-400"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>`
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <Store className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {vendor.businessName}
                          </h3>
                          {vendor.verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{vendor.location}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{vendor.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{vendor.totalProducts} products</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {vendor.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {vendor.categories.slice(0, 3).map((category, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {category}
                          </span>
                        ))}
                        {vendor.categories.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{vendor.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Type:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {vendor.businessType || 'Retail'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Phone:</span>
                        <span className="font-mono">{vendor.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Member since:</span>
                        <span>{new Date(vendor.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/buyer/vendors/${vendor._id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          View Store
                        </Button>
                      </Link>
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
