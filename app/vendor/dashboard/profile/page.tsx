"use client"

import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Save,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Globe,
  Calendar,
  Shield,
  Briefcase
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { uploadFileToFirebase, compressImageForUpload } from '@/lib/firebase-client'

interface VendorProfile {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  businessType: string
  taxRegistrationNumber: string
  logo: string
  locations: {
    id: string
    name: string
    address: string
    city: string
    country: string
    isMain: boolean
  }[]
  bankDetails: {
    bankName: string
    accountTitle: string
    accountNumber: string
    iban: string
    branchCode: string
  }
  verificationStatus: 'pending' | 'verified' | 'rejected'
  subscriptionTier: string
  memberSince: string
}

export default function VendorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [profile, setProfile] = useState<VendorProfile>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'Retail',
    taxRegistrationNumber: '',
    logo: '',
    locations: [],
    bankDetails: {
      bankName: '',
      accountTitle: '',
      accountNumber: '',
      iban: '',
      branchCode: ''
    },
    verificationStatus: 'pending',
    subscriptionTier: 'Free',
    memberSince: new Date().toISOString()
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/profile')
      
      if (response.data?.success) {
        const userData = response.data.data
        setProfile({
          businessName: userData.businessName || '',
          ownerName: userData.name || userData.ownerName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.businessAddress || userData.address || '',
          businessType: userData.businessType || 'Retail',
          taxRegistrationNumber: userData.taxRegistrationNumber || '',
          logo: userData.avatar?.url || userData.logo || '',
          locations: userData.locations || [],
          bankDetails: userData.bankDetails || {
            bankName: '',
            accountTitle: '',
            accountNumber: '',
            iban: '',
            branchCode: ''
          },
          verificationStatus: userData.verificationStatus || 'pending',
          subscriptionTier: userData.subscription?.tier || 'Free',
          memberSince: userData.createdAt || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await api.put('/users/profile', {
        name: profile.ownerName,
        phone: profile.phone,
        businessName: profile.businessName,
        businessAddress: profile.address,
        businessType: profile.businessType,
        taxRegistrationNumber: profile.taxRegistrationNumber,
        locations: profile.locations,
        bankDetails: profile.bankDetails
      })
      
      if (response.data?.success) {
        toast.success('Profile updated successfully!')
      }
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    // Validation
    if (!file) {
      toast.error('Please select a file')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, etc.)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB`)
      return
    }

    setUploadingLogo(true)
    let loadingToast: string | undefined
    
    try {
      // Step 1: Compressing
      setUploadProgress('Compressing image...')
      loadingToast = toast.loading('📦 Compressing image...')
      
      const compressedFile = await compressImageForUpload(file, { 
        maxDimension: 512, 
        quality: 0.85 
      })
      
      const originalSize = (file.size / 1024).toFixed(0)
      const compressedSize = (compressedFile.size / 1024).toFixed(0)
      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB`)
      
      // Step 2: Uploading to Firebase
      setUploadProgress('Uploading to Firebase...')
      toast.loading('☁️ Uploading to Firebase...', { id: loadingToast })
      
      const firebaseUrl = await uploadFileToFirebase(compressedFile, 'avatars')
      console.log('Firebase URL:', firebaseUrl)
      
      // Step 3: Saving to database
      setUploadProgress('Saving to your profile...')
      toast.loading('💾 Saving to your profile...', { id: loadingToast })
      
      const response = await api.put('/users/avatar', {
        url: firebaseUrl
      })
      
      if (response.data?.success) {
        setProfile(prev => ({ ...prev, logo: firebaseUrl }))
        setUploadProgress('')
        toast.success(`✅ Logo uploaded successfully! (Compressed from ${originalSize}KB to ${compressedSize}KB)`, { 
          id: loadingToast,
          duration: 4000
        })
      } else {
        throw new Error('Failed to save logo to profile')
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      setUploadProgress('')
      
      let errorMsg = 'Failed to upload logo'
      
      // Provide specific error messages
      if (error.message?.includes('timeout')) {
        errorMsg = '⏱️ Upload timed out. Please check your internet connection and try again.'
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMsg = '🌐 Network error. Please check your internet connection.'
      } else if (error.message?.includes('Firebase')) {
        errorMsg = '☁️ Firebase error. Please try again or contact support.'
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.message) {
        errorMsg = error.message
      }
      
      toast.error(errorMsg, { id: loadingToast, duration: 5000 })
    } finally {
      setUploadingLogo(false)
      setUploadProgress('')
      
      // Reset file input so user can upload the same file again if needed
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
  }

  const addLocation = () => {
    setProfile(prev => ({
      ...prev,
      locations: [
        ...prev.locations,
        {
          id: `loc_${Date.now()}`,
          name: '',
          address: '',
          city: '',
          country: 'Pakistan',
          isMain: prev.locations.length === 0
        }
      ]
    }))
  }

  const removeLocation = (id: string) => {
    setProfile(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id)
    }))
  }

  const updateLocation = (id: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      locations: prev.locations.map(loc =>
        loc.id === id ? { ...loc, [field]: value } : loc
      )
    }))
  }

  const getVerificationBadge = () => {
    switch (profile.verificationStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-1" />
            Verified
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-sm font-medium">
            <AlertCircle className="h-4 w-4 mr-1" />
            Pending Verification
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-sm font-medium">
            <AlertCircle className="h-4 w-4 mr-1" />
            Verification Rejected
          </span>
        )
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardSidebar userRole="vendor" />
          <div className="flex-1 lg:ml-64 p-6 lg:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Business Profile
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your business information and settings
                  </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              {/* Verification Status */}
              <div className="flex items-center gap-4">
                {getVerificationBadge()}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Member since {new Date(profile.memberSince).toLocaleDateString()}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {profile.subscriptionTier} Plan
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Business Name *
                        </label>
                        <Input
                          value={profile.businessName}
                          onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                          placeholder="Your Business Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Owner Name *
                        </label>
                        <Input
                          value={profile.ownerName}
                          onChange={(e) => setProfile({...profile, ownerName: e.target.value})}
                          placeholder="Owner Full Name"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={profile.email}
                            disabled
                            className="pl-10 bg-gray-100 dark:bg-gray-800"
                            placeholder="email@example.com"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="pl-10"
                            placeholder="+92 xxx xxxxxxx"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          value={profile.address}
                          onChange={(e) => setProfile({...profile, address: e.target.value})}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          rows={3}
                          placeholder="Complete business address"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Business Type
                        </label>
                        <select
                          value={profile.businessType}
                          onChange={(e) => setProfile({...profile, businessType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="Retail">Retail Shop</option>
                          <option value="Wholesale">Wholesale</option>
                          <option value="Online">Online Only</option>
                          <option value="Hybrid">Retail + Online</option>
                          <option value="Distributor">Distributor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tax Registration Number
                        </label>
                        <Input
                          value={profile.taxRegistrationNumber}
                          onChange={(e) => setProfile({...profile, taxRegistrationNumber: e.target.value})}
                          placeholder="NTN/STRN"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Locations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Business Locations
                      </CardTitle>
                      <Button size="sm" variant="outline" onClick={addLocation}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Location
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {profile.locations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No additional locations added yet</p>
                        <p className="text-sm">Add locations if you have multiple branches</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profile.locations.map((location) => (
                          <div key={location.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                Location {profile.locations.indexOf(location) + 1}
                              </h4>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={location.isMain}
                                    onChange={(e) => updateLocation(location.id, 'isMain', e.target.checked)}
                                    className="rounded text-blue-500"
                                  />
                                  Main Location
                                </label>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeLocation(location.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <Input
                                placeholder="Location Name"
                                value={location.name}
                                onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                              />
                              <Input
                                placeholder="City"
                                value={location.city}
                                onChange={(e) => updateLocation(location.id, 'city', e.target.value)}
                              />
                            </div>
                            <div className="mt-3">
                              <Input
                                placeholder="Complete Address"
                                value={location.address}
                                onChange={(e) => updateLocation(location.id, 'address', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bank Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Bank Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For payment settlements and subscriptions
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bank Name
                        </label>
                        <Input
                          value={profile.bankDetails.bankName}
                          onChange={(e) => setProfile({
                            ...profile,
                            bankDetails: {...profile.bankDetails, bankName: e.target.value}
                          })}
                          placeholder="e.g., HBL, UBL, MCB"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Title
                        </label>
                        <Input
                          value={profile.bankDetails.accountTitle}
                          onChange={(e) => setProfile({
                            ...profile,
                            bankDetails: {...profile.bankDetails, accountTitle: e.target.value}
                          })}
                          placeholder="Account holder name"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Number
                        </label>
                        <Input
                          value={profile.bankDetails.accountNumber}
                          onChange={(e) => setProfile({
                            ...profile,
                            bankDetails: {...profile.bankDetails, accountNumber: e.target.value}
                          })}
                          placeholder="xxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Branch Code
                        </label>
                        <Input
                          value={profile.bankDetails.branchCode}
                          onChange={(e) => setProfile({
                            ...profile,
                            bankDetails: {...profile.bankDetails, branchCode: e.target.value}
                          })}
                          placeholder="Branch code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        IBAN (Optional)
                      </label>
                      <Input
                        value={profile.bankDetails.iban}
                        onChange={(e) => setProfile({
                          ...profile,
                          bankDetails: {...profile.bankDetails, iban: e.target.value}
                        })}
                        placeholder="PKxxxx..."
                      />
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-900 dark:text-blue-200">
                        <p className="font-medium mb-1">Secure Information</p>
                        <p className="text-xs">Your bank details are encrypted and stored securely. They're used only for payment settlements.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Logo & Quick Stats */}
              <div className="space-y-6">
                {/* Business Logo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Business Logo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      {profile.logo ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-green-500 dark:border-green-600 shadow-md">
                          <Image
                            src={profile.logo}
                            alt="Business Logo"
                            fill
                            className="object-cover"
                          />
                          {/* Success indicator */}
                          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <Building2 className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Progress */}
                    {uploadingLogo && uploadProgress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">{uploadProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      id="logo-upload"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      disabled={uploadingLogo}
                    />
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      type="button"
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {profile.logo ? 'Change Logo' : 'Upload Logo'}
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Max 5MB • JPG, PNG, WebP • Stored on Firebase
                    </p>
                    
                    {/* Success message after upload */}
                    {profile.logo && !uploadingLogo && (
                      <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>Logo uploaded successfully</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Member Since</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(profile.memberSince).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Subscription Plan</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          {profile.subscriptionTier}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Verification Status</p>
                        <p className="font-medium">
                          {profile.verificationStatus === 'verified' && (
                            <span className="text-green-600 dark:text-green-400">Verified ✓</span>
                          )}
                          {profile.verificationStatus === 'pending' && (
                            <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                          )}
                          {profile.verificationStatus === 'rejected' && (
                            <span className="text-red-600 dark:text-red-400">Rejected</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Locations</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {profile.locations.length || 'No'} additional location{profile.locations.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="border-red-200 dark:border-red-900/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 dark:text-red-400">
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.')) {
                          toast.error('Account deletion is not available in demo mode')
                        }
                      }}
                    >
                      Delete Account
                    </Button>
                    <p className="text-xs text-gray-500">
                      Data will be retained for 30 days for recovery
                    </p>
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

