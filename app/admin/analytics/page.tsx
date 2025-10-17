"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  DollarSign,
  Users,
  Package,
  RefreshCw,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface RevenueData {
  month: string
  revenue: number
  transactions: number
}

interface SubscriptionData {
  plan: string
  count: number
  revenue: number
}

export default function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6months')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [revenueResponse, subscriptionResponse, statsResponse] = await Promise.all([
        api.get(`/admin/analytics/revenue?period=${period}`),
        api.get('/admin/analytics/subscriptions'),
        api.get('/admin/stats')
      ])

      if (revenueResponse.data.success) {
        setRevenueData(revenueResponse.data.data)
      }

      if (subscriptionResponse.data.success) {
        setSubscriptionData(subscriptionResponse.data.data)
      }

      if (statsResponse.data.success) {
        const data = statsResponse.data.data
        const monthlyRevenue = revenueResponse.data.data.reduce((sum: number, item: RevenueData) => sum + item.revenue, 0)
        const totalTransactions = revenueResponse.data.data.reduce((sum: number, item: RevenueData) => sum + item.transactions, 0)
        
        setStats({
          totalRevenue: data.revenue,
          monthlyRevenue: monthlyRevenue,
          totalTransactions: totalTransactions,
          averageOrderValue: totalTransactions > 0 ? monthlyRevenue / totalTransactions : 0
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B']

  useEffect(() => {
    fetchAnalytics()
  }, [period])

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
                  Revenue Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track revenue trends and subscription analytics
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchAnalytics} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Period Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.monthlyRevenue)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalTransactions.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.averageOrderValue)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>
                    Monthly revenue over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : revenueData.length > 0 ? (
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

              {/* Transaction Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Volume</CardTitle>
                  <CardDescription>
                    Number of transactions per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : revenueData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [value, 'Transactions']}
                          />
                          <Bar dataKey="transactions" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No transaction data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>
                  Revenue and user distribution by subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="h-80">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : subscriptionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subscriptionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ plan, count }) => `${plan}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {subscriptionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No subscription data available
                      </div>
                    )}
                  </div>

                  {/* Revenue by Plan */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue by Plan</h3>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : subscriptionData.length > 0 ? (
                      <div className="space-y-3">
                        {subscriptionData.map((plan, index) => (
                          <div key={plan.plan} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="font-medium text-gray-900 dark:text-white">{plan.plan}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(plan.revenue)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {plan.count} subscribers
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No subscription data available
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
