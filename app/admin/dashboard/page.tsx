"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Package,
  Store,
  Activity,
  Shield,
  RefreshCw
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface AdminStats {
  users: {
    total: number
    vendors: number
    buyers: number
  }
  products: number
  transactions: number
  subscriptions: number
  revenue: number
}

interface RecentActivity {
  type: string
  message: string
  timestamp: string
  user?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState([])
  const [subscriptionData, setSubscriptionData] = useState([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, revenueResponse, subscriptionResponse, activitiesResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/analytics/revenue'),
        api.get('/admin/analytics/subscriptions'),
        api.get('/admin/activities')
      ])

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data)
      }

      if (revenueResponse.data.success) {
        setRevenueData(revenueResponse.data.data)
      }

      if (subscriptionResponse.data.success) {
        setSubscriptionData(subscriptionResponse.data.data)
      }

      if (activitiesResponse.data.success) {
        setRecentActivities(activitiesResponse.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statsCards = stats ? [
    {
      title: 'Total Vendors',
      value: stats.users.vendors.toLocaleString(),
      change: '+12.5%', // This would come from analytics API
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue),
      change: '+18.2%', // This would come from analytics API
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Active Subscriptions',
      value: stats.subscriptions.toLocaleString(),
      change: '+8.1%', // This would come from analytics API
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: 'Stable',
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600'
    }
  ] : []

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'transaction':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'subscription_upgrade':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

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
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Platform overview and system management
                </p>
              </div>
              <Button 
                onClick={fetchDashboardData} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {loading ? (
              /* Loading Stats Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Stats Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {stat.change}
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
            )}

            {!loading && (
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                      Monthly revenue for the last 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                              labelFormatter={(label) => `Month: ${label}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="#3B82F6" 
                              strokeWidth={3}
                              dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No revenue data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Distribution</CardTitle>
                    <CardDescription>
                      Active subscriptions by plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {subscriptionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={subscriptionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="plan" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any) => [value, 'Subscriptions']}
                            />
                            <Bar dataKey="count" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No subscription data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest platform activities and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent activities
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity: RecentActivity, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
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

