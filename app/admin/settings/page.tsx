"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Save,
  RefreshCw,
  Shield,
  Globe,
  Mail,
  Bell,
  Database,
  Key,
  Users,
  DollarSign
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface AdminSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportEmail: string
    timezone: string
    currency: string
  }
  security: {
    maxLoginAttempts: number
    sessionTimeout: number
    requireMFA: boolean
    passwordMinLength: number
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    adminAlerts: boolean
    vendorAlerts: boolean
  }
  subscription: {
    defaultPlan: string
    trialDays: number
    gracePeriod: number
    autoRenewal: boolean
  }
  system: {
    maintenanceMode: boolean
    apiRateLimit: number
    maxFileSize: number
    allowedFileTypes: string[]
  }
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    general: {
      siteName: 'VendorHub Pakistan',
      siteDescription: 'Leading mobile phone marketplace in Pakistan',
      contactEmail: 'contact@vendorhub.pk',
      supportEmail: 'support@vendorhub.pk',
      timezone: 'Asia/Karachi',
      currency: 'PKR'
    },
    security: {
      maxLoginAttempts: 5,
      sessionTimeout: 24,
      requireMFA: false,
      passwordMinLength: 8
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      adminAlerts: true,
      vendorAlerts: true
    },
    subscription: {
      defaultPlan: 'FREE',
      trialDays: 14,
      gracePeriod: 3,
      autoRenewal: true
    },
    system: {
      maintenanceMode: false,
      apiRateLimit: 1000,
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf']
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      // const response = await api.get('/admin/settings')
      // setSettings(response.data.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // Mock save - replace with actual API call
      // await api.put('/admin/settings', settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (section: keyof AdminSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="admin" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Admin Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Configure platform settings and preferences
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchSettings} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={saveSettings} disabled={saving} size="sm">
                  <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Basic platform information and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Site Name
                      </label>
                      <Input
                        value={settings.general.siteName}
                        onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                        placeholder="Enter site name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Email
                      </label>
                      <Input
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateSettings('general', 'contactEmail', e.target.value)}
                        placeholder="contact@vendorhub.pk"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Support Email
                      </label>
                      <Input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => updateSettings('general', 'supportEmail', e.target.value)}
                        placeholder="support@vendorhub.pk"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Currency
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) => updateSettings('general', 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="PKR">Pakistani Rupee (PKR)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site Description
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      placeholder="Enter site description"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure security policies and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Login Attempts
                      </label>
                      <Input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Session Timeout (hours)
                      </label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                        min="1"
                        max="168"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password Min Length
                      </label>
                      <Input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                        min="6"
                        max="32"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireMFA"
                        checked={settings.security.requireMFA}
                        onChange={(e) => updateSettings('security', 'requireMFA', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="requireMFA" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Require MFA for Admin
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => updateSettings('notifications', 'emailNotifications', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => updateSettings('notifications', 'smsNotifications', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        SMS Notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="adminAlerts"
                        checked={settings.notifications.adminAlerts}
                        onChange={(e) => updateSettings('notifications', 'adminAlerts', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="adminAlerts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Admin Alerts
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="vendorAlerts"
                        checked={settings.notifications.vendorAlerts}
                        onChange={(e) => updateSettings('notifications', 'vendorAlerts', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="vendorAlerts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vendor Alerts
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Subscription Settings
                  </CardTitle>
                  <CardDescription>
                    Configure subscription plans and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Plan
                      </label>
                      <select
                        value={settings.subscription.defaultPlan}
                        onChange={(e) => updateSettings('subscription', 'defaultPlan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="FREE">Free</option>
                        <option value="BASIC">Basic</option>
                        <option value="PRO">Pro</option>
                        <option value="PREMIUM">Premium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Trial Days
                      </label>
                      <Input
                        type="number"
                        value={settings.subscription.trialDays}
                        onChange={(e) => updateSettings('subscription', 'trialDays', parseInt(e.target.value))}
                        min="0"
                        max="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Grace Period (days)
                      </label>
                      <Input
                        type="number"
                        value={settings.subscription.gracePeriod}
                        onChange={(e) => updateSettings('subscription', 'gracePeriod', parseInt(e.target.value))}
                        min="0"
                        max="30"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoRenewal"
                        checked={settings.subscription.autoRenewal}
                        onChange={(e) => updateSettings('subscription', 'autoRenewal', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="autoRenewal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto Renewal
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Configure system limits and maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Rate Limit (requests/hour)
                      </label>
                      <Input
                        type="number"
                        value={settings.system.apiRateLimit}
                        onChange={(e) => updateSettings('system', 'apiRateLimit', parseInt(e.target.value))}
                        min="100"
                        max="10000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max File Size (MB)
                      </label>
                      <Input
                        type="number"
                        value={settings.system.maxFileSize}
                        onChange={(e) => updateSettings('system', 'maxFileSize', parseInt(e.target.value))}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={settings.system.maintenanceMode}
                        onChange={(e) => updateSettings('system', 'maintenanceMode', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Maintenance Mode
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
