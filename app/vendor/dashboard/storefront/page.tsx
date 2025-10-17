"use client"

import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { useStorefrontStore } from '@/store/storefront-store'
import { useInventoryStore } from '@/store/inventory-store'
import toast from 'react-hot-toast'
import { 
  Save, 
  Upload, 
  ExternalLink, 
  TrendingUp, 
  Palette, 
  Image as ImageIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle,
  Eye,
  EyeOff,
  Star,
  Search,
  Filter,
  Calendar,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Enhanced theme system with proper color schemes
const THEMES = [
  { id: 'blue', name: 'Ocean Blue', primary: 'blue-600', secondary: 'blue-100', accent: 'blue-500' },
  { id: 'indigo', name: 'Royal Indigo', primary: 'indigo-600', secondary: 'indigo-100', accent: 'indigo-500' },
  { id: 'green', name: 'Forest Green', primary: 'green-600', secondary: 'green-100', accent: 'green-500' },
  { id: 'emerald', name: 'Emerald', primary: 'emerald-600', secondary: 'emerald-100', accent: 'emerald-500' },
  { id: 'teal', name: 'Teal', primary: 'teal-600', secondary: 'teal-100', accent: 'teal-500' },
  { id: 'cyan', name: 'Cyan', primary: 'cyan-600', secondary: 'cyan-100', accent: 'cyan-500' },
  { id: 'purple', name: 'Purple', primary: 'purple-600', secondary: 'purple-100', accent: 'purple-500' },
  { id: 'pink', name: 'Rose Pink', primary: 'pink-600', secondary: 'pink-100', accent: 'pink-500' },
  { id: 'orange', name: 'Sunset Orange', primary: 'orange-600', secondary: 'orange-100', accent: 'orange-500' },
  { id: 'slate', name: 'Modern Slate', primary: 'slate-600', secondary: 'slate-100', accent: 'slate-500' }
]

export default function StorefrontDashboard() {
  const settings = useStorefrontStore(s => s.settings)
  const analytics = useStorefrontStore(s => s.analytics)
  const loadStorefront = useStorefrontStore(s => s.loadStorefront)
  const updateStorefront = useStorefrontStore(s => s.updateStorefront)
  const uploadBanner = useStorefrontStore(s => s.uploadBanner)
  const loadAnalytics = useStorefrontStore(s => s.loadAnalytics)
  const products = useInventoryStore(s => s.products)
  const loadProducts = useInventoryStore(s => s.loadProducts)

  const [localSettings, setLocalSettings] = useState<{
    theme: string
    vendorName: string
    description: string
    about: string
    enabledCategories: string[]
    contact: { 
      phone?: string
      whatsapp?: string
      email?: string
      address?: string
    }
    mapEmbedUrl: string
    customDomain: string
    businessHours: {
      monday: { open: string; close: string; closed: boolean }
      tuesday: { open: string; close: string; closed: boolean }
      wednesday: { open: string; close: string; closed: boolean }
      thursday: { open: string; close: string; closed: boolean }
      friday: { open: string; close: string; closed: boolean }
      saturday: { open: string; close: string; closed: boolean }
      sunday: { open: string; close: string; closed: boolean }
    }
    logo?: string
    featuredProducts: string[]
    whatsappMessage: string
    sslEnabled: boolean
  }>({
    theme: 'blue',
    vendorName: 'My Store',
    description: '',
    about: '',
    enabledCategories: ['Mobile Phones','Accessories'],
    contact: {},
    mapEmbedUrl: '',
    customDomain: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    },
    logo: '',
    featuredProducts: [],
    whatsappMessage: 'Hi! I\'m interested in your product. Can you provide more details?',
    sslEnabled: false
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [price, setPrice] = useState({ min: '', max: '' })
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'branding' | 'content' | 'contact' | 'preview'>('branding')

  useEffect(() => {
    loadStorefront()
    loadProducts().catch(() => {})
    loadAnalytics()
  }, [loadStorefront, loadProducts, loadAnalytics])

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        theme: settings.theme || 'blue',
        vendorName: settings.vendorName || 'My Store',
        description: settings.description || '',
        about: settings.about || '',
        enabledCategories: settings.enabledCategories || ['Mobile Phones','Accessories'],
        contact: settings.contact || { phone: '', whatsapp: '', email: '', address: '' },
        mapEmbedUrl: settings.mapEmbedUrl || '',
        customDomain: settings.customDomain || '',
        businessHours: localSettings.businessHours,
        logo: localSettings.logo,
        featuredProducts: localSettings.featuredProducts,
        whatsappMessage: localSettings.whatsappMessage,
        sslEnabled: localSettings.sslEnabled
      })
    }
  }, [settings])

  const update = (changes: Partial<typeof localSettings>) => setLocalSettings(prev => ({ ...prev, ...changes }))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateStorefront(localSettings as any)
      toast.success('Storefront updated successfully!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update storefront')
    } finally {
      setIsSaving(false)
    }
  }

  const onBannerChange = async (file?: File) => {
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { 
      toast.error('Banner image must be less than 3MB')
      return 
    }
    try {
      await uploadBanner(file)
      toast.success('Banner uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload banner')
    }
  }

  const onLogoChange = async (file?: File) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { 
      toast.error('Logo must be less than 2MB')
      return 
    }
    try {
      // Simulate logo upload - replace with actual implementation
      const logoUrl = URL.createObjectURL(file)
      update({ logo: logoUrl })
      toast.success('Logo uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload logo')
    }
  }

  const toggleBusinessHours = (day: string) => {
    update({
      businessHours: {
        ...localSettings.businessHours,
        [day]: {
          ...localSettings.businessHours[day as keyof typeof localSettings.businessHours],
          closed: !localSettings.businessHours[day as keyof typeof localSettings.businessHours].closed
        }
      }
    })
  }

  const updateBusinessHours = (day: string, field: 'open' | 'close', value: string) => {
    update({
      businessHours: {
        ...localSettings.businessHours,
        [day]: {
          ...localSettings.businessHours[day as keyof typeof localSettings.businessHours],
          [field]: value
        }
      }
    })
  }

  const toggleFeaturedProduct = (productId: string) => {
    const featured = localSettings.featuredProducts.includes(productId)
    update({
      featuredProducts: featured 
        ? localSettings.featuredProducts.filter(id => id !== productId)
        : [...localSettings.featuredProducts, productId]
    })
  }

  const filtered = products.filter(p =>
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (category === 'all' || p.category === category) &&
    (price.min === '' || p.sellingPrice >= Number(price.min)) && 
    (price.max === '' || p.sellingPrice <= Number(price.max)) &&
    localSettings.enabledCategories.includes(p.category)
  )

  const themeSwatch: Record<string, string> = {
    blue: 'bg-blue-500', indigo: 'bg-indigo-500', green: 'bg-green-500',
    emerald: 'bg-emerald-500', teal: 'bg-teal-500', cyan: 'bg-cyan-500',
    purple: 'bg-purple-500', pink: 'bg-pink-500', orange: 'bg-orange-500',
    slate: 'bg-slate-500'
  }

  const badgeColor = themeSwatch[localSettings.theme] || 'bg-blue-500'

  const bannerUrl = typeof settings?.banner === 'string' 
    ? settings.banner 
    : settings?.banner?.url

  const currentTheme = THEMES.find(t => t.id === localSettings.theme) || THEMES[0]

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DashboardSidebar userRole="vendor" />
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Storefront Customization
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Design your professional storefront with our advanced customization tools
                  </p>
                  {settings?.subdomain && (
                    <a 
                      href={`https://${settings.subdomain}.vendorhub.pk`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-3 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {settings.subdomain}.vendorhub.pk
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Live
                      </span>
                    </a>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setPreviewMode(!previewMode)}
                    className="gap-2"
                  >
                    {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {previewMode ? 'Hide Preview' : 'Preview Mode'}
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className={`gap-2 bg-gradient-to-r ${currentTheme.primary === 'blue-600' ? 'from-blue-600 to-indigo-600' : 'from-blue-600 to-indigo-600'} hover:opacity-90`}
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {/* Analytics Summary */}
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {analytics.pageViews}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Page Views</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {analytics.inquiries}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Inquiries</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {analytics.totalSales || 0}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                          <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {analytics.productViews?.length || 0}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Products Viewed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'branding', label: 'Branding', icon: Palette },
                  { id: 'content', label: 'Content', icon: ImageIcon },
                  { id: 'contact', label: 'Contact & Hours', icon: Phone },
                  { id: 'preview', label: 'Live Preview', icon: Eye }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'branding' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
            {/* Branding */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold">Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Name
                  </label>
                  <Input
                    value={localSettings.vendorName}
                    onChange={(e) => update({ vendorName: e.target.value })}
                    placeholder="My Store"
                    className="border-2"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Business Logo
                    <span className="text-xs text-gray-500 ml-2">(max 2MB)</span>
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onLogoChange(e.target.files?.[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                    />
                    {localSettings.logo && (
                      <div className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                        <img
                          src={localSettings.logo}
                          alt="logo preview"
                          className="h-12 w-12 object-contain rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Logo preview</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => update({ theme: theme.id })}
                        className={`p-3 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                          localSettings.theme === theme.id 
                            ? 'ring-4 ring-offset-2 ring-blue-400 dark:ring-offset-gray-800 border-blue-500' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full bg-${theme.primary}`} />
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              {theme.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {theme.primary}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Banner Image
                    <span className="text-xs text-gray-500 ml-2">(1920x400, max 3MB)</span>
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onBannerChange(e.target.files?.[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                    />
                    {bannerUrl && (
                      <img
                        src={bannerUrl}
                        alt="banner"
                        className="h-24 w-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
                </div>

                {/* Preview */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Logo Preview */}
                        {localSettings.logo && (
                          <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img
                              src={localSettings.logo}
                              alt="logo"
                              className="h-16 w-auto object-contain"
                            />
                          </div>
                        )}
                        
                        {/* Theme Preview */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Colors</h4>
                          <div className="flex gap-2">
                            <div className={`w-8 h-8 rounded-full bg-${currentTheme.primary}`} title="Primary" />
                            <div className={`w-8 h-8 rounded-full bg-${currentTheme.secondary}`} title="Secondary" />
                            <div className={`w-8 h-8 rounded-full bg-${currentTheme.accent}`} title="Accent" />
                          </div>
                        </div>
                        
                        {/* Store Name Preview */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</h4>
                          <div className={`p-3 rounded-lg bg-${currentTheme.secondary} border border-${currentTheme.accent}`}>
                            <span className={`text-${currentTheme.primary} font-semibold`}>
                              {localSettings.vendorName || 'My Store'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold">Store Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Description
                  </label>
                  <textarea
                    maxLength={1000}
                    value={localSettings.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Tell customers about your store..."
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {localSettings.description.length}/1000 characters
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    About Your Business
                  </label>
                  <textarea
                    maxLength={1000}
                    value={localSettings.about}
                    onChange={(e) => update({ about: e.target.value })}
                    placeholder="Share your story and what makes you unique..."
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {localSettings.about.length}/1000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold">Product Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {['Mobile Phones','Accessories','Smartwatches','Audio Devices','Tablets','Laptops','Custom'].map(cat => (
                    <label
                      key={cat}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        localSettings.enabledCategories.includes(cat)
                          ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={localSettings.enabledCategories.includes(cat)}
                        onChange={(e) => {
                          const list = new Set(localSettings.enabledCategories)
                          e.target.checked ? list.add(cat) : list.delete(cat)
                          update({ enabledCategories: Array.from(list) })
                        }}
                        className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{cat}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Products */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select products to feature prominently on your storefront homepage
                  </p>
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {products.map(product => (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          localSettings.featuredProducts.includes(product.id)
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-400 dark:text-yellow-300'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={localSettings.featuredProducts.includes(product.id)}
                          onChange={() => toggleFeaturedProduct(product.id)}
                          className="rounded text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {product.images?.[0]?.url && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-8 w-8 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{formatCurrency(product.sellingPrice)}</div>
                          </div>
                          {localSettings.featuredProducts.includes(product.id) && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
                </div>

                {/* Preview */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Content Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Description Preview */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Description</h4>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {localSettings.description || 'Your store description will appear here...'}
                            </p>
                          </div>
                        </div>
                        
                        {/* About Preview */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">About Section</h4>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {localSettings.about || 'Your business story will appear here...'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Featured Products Count */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Products</h4>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {localSettings.featuredProducts.length} products selected
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold">Contact & Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Phone Number"
                    value={localSettings.contact.phone}
                    onChange={(e) => update({ contact: { ...localSettings.contact, phone: e.target.value }})}
                    className="border-2"
                  />
                  <Input
                    placeholder="WhatsApp"
                    value={localSettings.contact.whatsapp}
                    onChange={(e) => update({ contact: { ...localSettings.contact, whatsapp: e.target.value }})}
                    className="border-2"
                  />
                </div>
                
                <Input
                  placeholder="Email Address"
                  value={localSettings.contact.email}
                  onChange={(e) => update({ contact: { ...localSettings.contact, email: e.target.value }})}
                  className="border-2"
                />
                
                <Input
                  placeholder="Business Address"
                  value={localSettings.contact.address}
                  onChange={(e) => update({ contact: { ...localSettings.contact, address: e.target.value }})}
                  className="border-2"
                />
                
                <Input
                  placeholder="Google Maps Embed URL"
                  value={localSettings.mapEmbedUrl}
                  onChange={(e) => update({ mapEmbedUrl: e.target.value })}
                  className="border-2"
                />
                
                <div className="pt-2">
                  <Input
                    placeholder="Custom Domain (Pro/Premium)"
                    value={localSettings.customDomain}
                    onChange={(e) => update({ customDomain: e.target.value })}
                    className="border-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    SSL certificate will be automatically provisioned after DNS verification
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {Object.entries(localSettings.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {day}
                        </label>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={() => toggleBusinessHours(day)}
                          className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        {!hours.closed ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Closed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Configuration */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  WhatsApp Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default WhatsApp Message
                    </label>
                    <textarea
                      value={localSettings.whatsappMessage}
                      onChange={(e) => update({ whatsappMessage: e.target.value })}
                      placeholder="Hi! I'm interested in your product. Can you provide more details?"
                      className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This message will be pre-filled when customers click "WhatsApp" buttons
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
                </div>

                {/* Preview */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Contact Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Contact Info Preview */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Information</h4>
                          <div className="space-y-2">
                            {localSettings.contact.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">{localSettings.contact.phone}</span>
                              </div>
                            )}
                            {localSettings.contact.whatsapp && (
                              <div className="flex items-center gap-2 text-sm">
                                <MessageCircle className="h-4 w-4 text-green-600" />
                                <span className="text-gray-600 dark:text-gray-400">{localSettings.contact.whatsapp}</span>
                              </div>
                            )}
                            {localSettings.contact.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">{localSettings.contact.email}</span>
                              </div>
                            )}
                            {localSettings.contact.address && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">{localSettings.contact.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Business Hours Preview */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Hours</h4>
                          <div className="space-y-1">
                            {Object.entries(localSettings.businessHours).slice(0, 3).map(([day, hours]) => (
                              <div key={day} className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400 capitalize">{day}</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* SSL Status */}
                        {localSettings.customDomain && (
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 dark:text-green-400">SSL Enabled</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-0 shadow-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Live Storefront Preview
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium dark:bg-green-900/30 dark:text-green-300">
                          Real-time
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://${settings?.subdomain}.vendorhub.pk`, '_blank')}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Live
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
              
              <CardContent className="space-y-6 pt-6">
                {/* Hero Banner */}
                <div className="rounded-xl overflow-hidden shadow-md border-2 border-gray-200 dark:border-gray-700">
                  <div className="relative h-48">
                    {bannerUrl ? (
                      <img
                        src={bannerUrl}
                        alt="banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6 text-white">
                      <h2 className="text-2xl font-bold mb-1">
                        {localSettings.vendorName || 'My Store'}
                      </h2>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {localSettings.description || 'Your store description will appear here'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search Filters */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sm:col-span-2 border-2"
                  />
                  
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                  >
                    <option value="all">All Categories</option>
                    {localSettings.enabledCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={price.min}
                      onChange={(e) => setPrice({...price, min: e.target.value})}
                      className="border-2"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={price.max}
                      onChange={(e) => setPrice({...price, max: e.target.value})}
                      className="border-2"
                    />
                  </div>
                </div>

                {/* Featured Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Featured Products
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filtered.filter(p => p.featured).slice(0, 2).map(p => (
                      <div
                        key={p.id}
                        className="group border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          {p.images?.[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
                          )}
                          {p.onSale && (
                            <span className={`absolute top-3 left-3 text-xs font-semibold text-white px-3 py-1 rounded-full ${badgeColor}`}>
                              Sale
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(p.sellingPrice)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="default" size="sm" className="flex-1">
                              Contact
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Grid */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    All Products ({filtered.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.slice(0, 6).map(p => (
                      <div
                        key={p.id}
                        className="group border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          {p.images?.[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
                          )}
                          {p.onSale && (
                            <span className={`absolute top-2 left-2 text-xs font-semibold text-white px-2.5 py-1 rounded-full ${badgeColor}`}>
                              Sale
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(p.sellingPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Form & Map */}
                <div className="grid lg:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Get in Touch
                    </h3>
                    <Input placeholder="Your Name" className="border-2" />
                    <Input placeholder="Email Address" className="border-2" />
                    <textarea
                      placeholder="Your Message"
                      className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                      rows={3}
                    />
                    <Button className="w-full">Send Inquiry</Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Find Us
                    </h3>
                    <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 h-[200px]">
                      {localSettings.mapEmbedUrl ? (
                        <iframe
                          src={localSettings.mapEmbedUrl}
                          width="100%"
                          height="100%"
                          loading="lazy"
                          className="border-0"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Map Preview
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
