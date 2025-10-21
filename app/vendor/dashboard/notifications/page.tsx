"use client"

import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Package,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Calendar,
  Trash2,
  Filter,
  CheckCheck
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'inventory' | 'subscription' | 'inquiry' | 'sales' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'inventory' | 'subscription' | 'inquiry' | 'sales'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      const params: any = { page: 1, limit: 100 }
      if (filter === 'unread') params.isRead = false
      if (filter !== 'all' && filter !== 'unread') params.category = filter
      
      const response = await api.get('/notifications', { params })
      
      if (response.data?.success) {
        setNotifications(response.data.data)
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error)
      // If error is 404 or no data, show empty state
      if (error.response?.status === 404 || error.response?.status === 401) {
        setNotifications([])
      } else {
        // For other errors, generate sample data as fallback
        setNotifications(generateSampleNotifications())
      }
    } finally {
      setLoading(false)
    }
  }

  const generateSampleNotifications = (): Notification[] => {
    return [
      {
        _id: '1',
        type: 'warning',
        category: 'inventory',
        title: 'Low Stock Alert',
        message: 'iPhone 15 Pro Max has reached minimum stock level. Current quantity: 2',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/vendor/dashboard/inventory'
      },
      {
        _id: '2',
        type: 'info',
        category: 'inquiry',
        title: 'New Customer Inquiry',
        message: 'You have a new inquiry about Samsung Galaxy S24 Ultra',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/vendor/dashboard/inquiries'
      },
      {
        _id: '3',
        type: 'success',
        category: 'sales',
        title: 'Daily Sales Summary',
        message: 'You made Rs. 125,000 in sales today with 8 transactions',
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '4',
        type: 'warning',
        category: 'subscription',
        title: 'Subscription Renewal Reminder',
        message: 'Your Pro subscription will expire in 3 days. Renew now to continue accessing premium features.',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/vendor/dashboard/subscriptions'
      },
      {
        _id: '5',
        type: 'info',
        category: 'system',
        title: 'New Feature Available',
        message: 'Check out our new Advanced Reports feature with PDF export capability!',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '6',
        type: 'warning',
        category: 'inventory',
        title: 'Out of Stock',
        message: 'AirPods Pro 2nd Gen is now out of stock. Restock soon to avoid losing sales.',
        isRead: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  const markAsRead = async (ids: string[]) => {
    try {
      await api.put('/notifications/mark-read', { ids })
      
      setNotifications(prev => prev.map(n => 
        ids.includes(n._id) ? { ...n, isRead: true } : n
      ))
      
      toast.success('Marked as read')
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const deleteNotifications = async (ids: string[]) => {
    try {
      await api.delete('/notifications', { data: { ids } })
      
      setNotifications(prev => prev.filter(n => !ids.includes(n._id)))
      setSelectedIds([])
      
      toast.success('Notifications deleted')
    } catch (error) {
      console.error('Error deleting notifications:', error)
      toast.error('Failed to delete notifications')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotifications.map(n => n._id))
    }
  }

  const getIcon = (category: string) => {
    switch (category) {
      case 'inventory': return Package
      case 'subscription': return CreditCard
      case 'inquiry': return MessageSquare
      case 'sales': return TrendingUp
      case 'system': return Info
      default: return Bell
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.category === filter
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

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
                    Notifications
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Stay updated with your business activities
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark All Read ({unreadCount})
                    </Button>
                  )}
                  {selectedIds.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteNotifications(selectedIds)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedIds.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {notifications.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('unread')}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {unreadCount}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('inventory')}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {notifications.filter(n => n.category === 'inventory').length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inventory</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('inquiry')}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {notifications.filter(n => n.category === 'inquiry').length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inquiries</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('sales')}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {notifications.filter(n => n.category === 'sales').length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sales</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('subscription')}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {notifications.filter(n => n.category === 'subscription').length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Billing</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'inventory', label: 'Inventory' },
                { id: 'inquiry', label: 'Inquiries' },
                { id: 'sales', label: 'Sales' },
                { id: 'subscription', label: 'Billing' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Bulk Actions */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredNotifications.length}
                    onChange={selectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Select All
                  </span>
                </label>
                {selectedIds.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedIds.length} selected
                  </span>
                )}
              </div>
            )}

            {/* Notifications List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You're all caught up! New notifications will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = getIcon(notification.category)
                  
                  return (
                    <Card
                      key={notification._id}
                      className={`transition-all hover:shadow-md ${
                        !notification.isRead
                          ? 'border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                          : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(notification._id)}
                            onChange={() => toggleSelect(notification._id)}
                            className="h-4 w-4 text-blue-600 rounded mt-1"
                          />

                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium whitespace-nowrap">
                                  Unread
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {formatDate(notification.createdAt)}
                              </div>

                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsRead([notification._id])}
                                    className="h-7 text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Mark Read
                                  </Button>
                                )}
                                {notification.actionUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => window.location.href = notification.actionUrl!}
                                  >
                                    View
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteNotifications([notification._id])}
                                  className="h-7 text-xs text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

