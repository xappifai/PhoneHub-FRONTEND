"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Edit,
  X,
  Heart,
  Eye,
  TrendingUp,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { useBuyerStore } from '@/store/buyer-store'
import { useAuth } from '@/contexts/auth-context'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const { user } = useAuth()
  const { profile, updateProfile, wishlist, compare, recentSearches } = useBuyerStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'whatsapp' as 'whatsapp' | 'email',
    address: '',
    city: '',
    interests: [] as string[]
  })

  const availableInterests = [
    'Mobile Phones',
    'Accessories',
    'Smartwatches',
    'Audio Devices',
    'Tablets',
    'Laptops',
    'Gaming',
    'Photography'
  ]

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/auth/me')
      
      if (response.data.success) {
        const userData = response.data.data
        setUserData(userData)
        
        // Initialize form data from fetched user data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          preferredContact: userData.preferredContact || profile.preferredContact || 'whatsapp',
          address: userData.address || '',
          city: userData.city || '',
          interests: userData.interests || profile.interests || []
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Update user details on backend
      const response = await api.put('/auth/updatedetails', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      })
      
      if (response.data.success) {
        // Also update local store
        updateProfile(formData)
        setUserData(response.data.data)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: userData?.name || profile.name || '',
      email: userData?.email || profile.email || '',
      phone: userData?.phone || profile.phone || '',
      preferredContact: profile.preferredContact || 'whatsapp',
      address: profile.address || '',
      city: profile.city || '',
      interests: profile.interests || []
    })
    setIsEditing(false)
  }

  const stats = [
    {
      title: 'Wishlist Items',
      value: wishlist.length,
      icon: Heart,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Compare List',
      value: compare.length,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Recent Searches',
      value: recentSearches.length,
      icon: Eye,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Messages Sent',
      value: 12, // Mock data
      icon: MessageCircle,
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account information and preferences
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
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
              ))}
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Basic Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                      {!isEditing && (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preferred Contact
                        </label>
                        <select
                          value={formData.preferredContact}
                          onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address
                        </label>
                        <Input
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your city"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} disabled={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Interests */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interests</CardTitle>
                    <CardDescription>
                      Select categories you're interested in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {availableInterests.map((interest) => (
                        <label key={interest} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {interest}
                          </span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Settings */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full">
                      Notification Settings
                    </Button>
                    <Button variant="outline" className="w-full">
                      Privacy Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
