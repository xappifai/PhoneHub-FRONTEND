"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Save,
  Bell,
  Search,
  Trash2,
  Play,
  Clock,
  Check,
  X
} from 'lucide-react'
import { useBuyerStore } from '@/store/buyer-store'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const { profile, updateProfile, savedSearches, removeSavedSearch, updateSavedSearchLastRun } = useBuyerStore()
  
  const [notifications, setNotifications] = useState({
    email: profile.notifications?.email ?? true,
    wishlistSale: profile.notifications?.wishlistSale ?? true,
    inquiryResponses: profile.notifications?.inquiryResponses ?? true,
    newProducts: profile.notifications?.newProducts ?? false
  })

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      
      // Update profile with notification preferences
      updateProfile({ notifications })
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleRunSavedSearch = (search: any) => {
    updateSavedSearchLastRun(search.id)
    
    // Build query string
    const params = new URLSearchParams()
    if (search.query) params.append('search', search.query)
    if (search.filters.category) params.append('category', search.filters.category)
    if (search.filters.brand) params.append('brand', search.filters.brand)
    if (search.filters.minPrice) params.append('minPrice', search.filters.minPrice)
    if (search.filters.maxPrice) params.append('maxPrice', search.filters.maxPrice)
    if (search.filters.location) params.append('location', search.filters.location)
    
    // Navigate to marketplace with query
    window.location.href = `/buyer/dashboard?${params.toString()}`
    toast.success(`Running saved search: ${search.name}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastRun = (dateString?: string) => {
    if (!dateString) return 'Never run'
    
    const now = new Date()
    const lastRun = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your preferences and saved searches
              </p>
            </div>

            {/* Notification Preferences */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive general email notifications
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Wishlist Sale Alerts
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified when wishlist items go on sale
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('wishlistSale')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.wishlistSale ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.wishlistSale ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Inquiry Responses
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified when vendors respond to your inquiries
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('inquiryResponses')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.inquiryResponses ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.inquiryResponses ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      New Product Alerts
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified when new products match your interests
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('newProducts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.newProducts ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.newProducts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Saved Searches
                </CardTitle>
                <CardDescription>
                  Quickly access your frequently used searches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedSearches.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No saved searches yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Save your searches from the marketplace to quickly access them here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedSearches.map((search) => (
                      <div 
                        key={search.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {search.name}
                            </h3>
                            {search.query && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
                                "{search.query}"
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                            {search.filters.category && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                Category: {search.filters.category}
                              </span>
                            )}
                            {search.filters.brand && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                Brand: {search.filters.brand}
                              </span>
                            )}
                            {(search.filters.minPrice || search.filters.maxPrice) && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                Price: {search.filters.minPrice || '0'} - {search.filters.maxPrice || '∞'}
                              </span>
                            )}
                            {search.filters.location && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                Location: {search.filters.location}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Created: {formatDate(search.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last run: {formatLastRun(search.lastRun)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRunSavedSearch(search)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeSavedSearch(search.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                </Button>
                        </div>
                      </div>
              ))}
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
