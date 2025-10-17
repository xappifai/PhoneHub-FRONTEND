"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Star, Store, Filter } from 'lucide-react'
import { MOCK_VENDORS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')

  const locations = ['all', ...Array.from(new Set(MOCK_VENDORS.map(v => v.location.split(',')[1]?.trim())))]
  
  const filteredVendors = MOCK_VENDORS.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLocation = selectedLocation === 'all' || 
                           vendor.location.toLowerCase().includes(selectedLocation.toLowerCase())
    
    return matchesSearch && matchesLocation && vendor.status === 'active'
  })

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Discover Electronics Stores
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Browse trusted Pakistani vendors for mobile phones, accessories, and electronics
              </p>
              
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-12"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
                <Button size="lg" className="h-12">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stores Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Featured Stores ({filteredVendors.length})
              </h2>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Sort by:</span>
                <select className="border border-gray-300 rounded px-3 py-1">
                  <option>Rating</option>
                  <option>Newest</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>

            {filteredVendors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/storefront/${vendor.id}`}>
                      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                        <CardHeader className="p-0">
                          <div className="relative h-48">
                            <Image
                              src={vendor.banner}
                              alt={vendor.businessName}
                              fill
                              className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                {vendor.productsCount} Products
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4 mb-4">
                            <Image
                              src={vendor.logo}
                              alt={vendor.businessName}
                              width={50}
                              height={50}
                              className="rounded-full border-2 border-white shadow-md"
                            />
                            <div className="flex-1">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {vendor.businessName}
                              </CardTitle>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{vendor.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{vendor.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                            {vendor.description}
                          </CardDescription>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Total Sales: <span className="font-medium text-secondary">
                                {formatCurrency(vendor.totalSales)}
                              </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              vendor.subscription === 'pro' 
                                ? 'bg-primary/10 text-primary'
                                : vendor.subscription === 'premium'
                                ? 'bg-purple-50 text-purple-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {vendor.subscription.toUpperCase()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No stores found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or browse all stores.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedLocation('all')
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Start Your Own Store?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join VendorHub and create your professional electronics storefront today.
              Get started with our free plan and grow your business online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Start Selling Now
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}