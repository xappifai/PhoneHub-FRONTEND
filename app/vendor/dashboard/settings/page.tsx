"use client"

import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings as SettingsIcon,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Shield,
  Key,
  Globe,
  Palette,
  Zap,
  Download,
  CheckCircle
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface VendorSettings {
  notifications: {
    email: {
      lowStockAlerts: boolean
      newInquiries: boolean
      subscriptionReminders: boolean
      salesReports: boolean
      systemAnnouncements: boolean
    }
    sms: {
      lowStockAlerts: boolean
      subscriptionReminders: boolean
      paymentConfirmations: boolean
    }
    inApp: {
      all: boolean
    }
    dailySummary: {
      enabled: boolean
      time: string
    }
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    loginAlerts: boolean
  }
  preferences: {
    language: 'en' | 'ur'
    timezone: string
    currency: string
    dateFormat: string
    theme: 'light' | 'dark' | 'system'
  }
  reports: {
    autoExport: boolean
    exportFormat: 'excel' | 'pdf' | 'both'
    scheduleWeekly: boolean
    scheduleMonthly: boolean
  }
}

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<VendorSettings>({
    notifications: {
      email: {
        lowStockAlerts: true,
        newInquiries: true,
        subscriptionReminders: true,
        salesReports: false,
        systemAnnouncements: true
      },
      sms: {
        lowStockAlerts: true,
        subscriptionReminders: true,
        paymentConfirmations: true
      },
      inApp: {
        all: true
      },
      dailySummary: {
        enabled: false,
        time: '18:00'
      }
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Karachi',
      currency: 'PKR',
      dateFormat: 'DD/MM/YYYY',
      theme: 'system'
    },
    reports: {
      autoExport: false,
      exportFormat: 'excel',
      scheduleWeekly: false,
      scheduleMonthly: false
    }
  })
  
  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'preferences' | 'reports'>('notifications')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/settings')
      
      if (response.data?.success) {
        const data = response.data.data
        // Merge with default settings to ensure all properties exist
        setSettings(prev => ({
          ...prev,
          ...data,
          notifications: {
            ...prev.notifications,
            ...data?.notifications,
            email: {
              ...prev.notifications.email,
              ...data?.notifications?.email
            },
            sms: {
              ...prev.notifications.sms,
              ...data?.notifications?.sms
            },
            inApp: {
              ...prev.notifications.inApp,
              ...data?.notifications?.inApp
            },
            dailySummary: {
              ...prev.notifications.dailySummary,
              ...data?.notifications?.dailySummary
            }
          },
          security: {
            ...prev.security,
            ...data?.security
          },
          preferences: {
            ...prev.preferences,
            ...data?.preferences
          },
          reports: {
            ...prev.reports,
            ...data?.reports
          }
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await api.put('/users/settings', settings)
      
      if (response.data?.success) {
        toast.success('Settings updated successfully!')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.response?.data?.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      const response = await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      if (response.data?.success) {
        toast.success('Password changed successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  }

  const updateNotificationSetting = (category: 'email' | 'sms' | 'inApp' | 'dailySummary', key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [category]: {
          ...prev.notifications[category],
          [key]: value
        }
      }
    }))
  }

  const tabs = [
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'preferences' as const, label: 'Preferences', icon: SettingsIcon },
    { id: 'reports' as const, label: 'Reports', icon: Download }
  ]

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
                    Settings
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your account preferences and notifications
                  </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
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
            {activeTab === 'notifications' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Email Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {settings.notifications?.email && Object.entries(settings.notifications.email).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNotificationSetting('email', key, e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>
                    ))}
                  </CardContent>
                </Card>

                {/* SMS Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      SMS Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {settings.notifications?.sms && Object.entries(settings.notifications.sms).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNotificationSetting('sms', key, e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>
                    ))}
                    <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                      SMS charges may apply based on your mobile carrier
                    </div>
                  </CardContent>
                </Card>

                {/* In-App Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      In-App Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable All In-App Notifications
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.inApp.all}
                        onChange={(e) => updateNotificationSetting('inApp', 'all', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notifications will appear in your dashboard
                    </p>
                  </CardContent>
                </Card>

                {/* Daily Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Daily Summary Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Send Daily Summary
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.notifications.dailySummary.enabled}
                        onChange={(e) => updateNotificationSetting('dailySummary', 'enabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    
                    {settings.notifications.dailySummary.enabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Send At
                        </label>
                        <input
                          type="time"
                          value={settings.notifications.dailySummary.time}
                          onChange={(e) => updateNotificationSetting('dailySummary', 'time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Change Password */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPasswords ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            placeholder="Enter current password"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <Input
                          type={showPasswords ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          placeholder="Enter new password"
                          required
                          minLength={8}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <Input
                          type={showPasswords ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={showPasswords}
                          onChange={(e) => setShowPasswords(e.target.checked)}
                          className="rounded text-blue-500"
                        />
                        Show passwords
                      </label>
                      
                      <Button type="submit">
                        Change Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                          Two-Factor Authentication
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Add an extra layer of security
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {...settings.security, twoFactorAuth: e.target.checked}
                        })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                          Login Alerts
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Get notified of new login attempts
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.loginAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {...settings.security, loginAlerts: e.target.checked}
                        })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {...settings.security, sessionTimeout: Number(e.target.value)}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="240">4 hours</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Language & Region */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Language & Region
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: {...settings.preferences, language: e.target.value as 'en' | 'ur'}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="ur">اردو (Urdu)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: {...settings.preferences, timezone: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      >
                        <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: {...settings.preferences, currency: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      >
                        <option value="PKR">PKR - Pakistani Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: {...settings.preferences, dateFormat: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'system'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setSettings({
                              ...settings,
                              preferences: {...settings.preferences, theme: theme as any}
                            })}
                            className={`p-3 border-2 rounded-lg transition-all ${
                              settings.preferences.theme === theme
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="text-sm font-medium capitalize">{theme}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Report Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                          Auto-Export Reports
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Automatically export reports
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.reports.autoExport}
                        onChange={(e) => setSettings({
                          ...settings,
                          reports: {...settings.reports, autoExport: e.target.checked}
                        })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Export Format
                      </label>
                      <select
                        value={settings.reports.exportFormat}
                        onChange={(e) => setSettings({
                          ...settings,
                          reports: {...settings.reports, exportFormat: e.target.value as any}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      >
                        <option value="excel">Excel (XLSX)</option>
                        <option value="pdf">PDF</option>
                        <option value="both">Both Excel & PDF</option>
                      </select>
                    </div>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Weekly Reports
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.reports.scheduleWeekly}
                        onChange={(e) => setSettings({
                          ...settings,
                          reports: {...settings.reports, scheduleWeekly: e.target.checked}
                        })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Monthly Reports
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.reports.scheduleMonthly}
                        onChange={(e) => setSettings({
                          ...settings,
                          reports: {...settings.reports, scheduleMonthly: e.target.checked}
                        })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                      Reports will be sent to your email automatically
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

