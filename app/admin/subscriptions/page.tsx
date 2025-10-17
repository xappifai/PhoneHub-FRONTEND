"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface Subscription {
  _id: string
  user?: {
    _id: string
    name: string
    email: string
    businessName?: string
  }
  planName: string
  status: string
  monthlyPrice: number
  startDate: string
  expiresAt: string
  autoRenew: boolean
  usage: {
    productsUsed: number
    transactionsUsed: number
    maxProducts: number
    maxTransactionsPerMonth: number
  }
}

export default function SubscriptionMonitoring() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    revenue: 0
  })

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      
      // For now, use mock data since the backend might not have subscriptions yet
      const mockSubscriptions: Subscription[] = [
        {
          _id: '1',
          user: {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            businessName: 'Tech Mobile Center'
          },
          planName: 'PRO',
          status: 'active',
          monthlyPrice: 5000,
          startDate: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: true,
          usage: {
            productsUsed: 45,
            transactionsUsed: 120,
            maxProducts: 500,
            maxTransactionsPerMonth: 1000
          }
        },
        {
          _id: '2',
          user: {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            businessName: 'Mobile World'
          },
          planName: 'BASIC',
          status: 'active',
          monthlyPrice: 2500,
          startDate: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: true,
          usage: {
            productsUsed: 12,
            transactionsUsed: 45,
            maxProducts: 100,
            maxTransactionsPerMonth: 200
          }
        }
      ]
      
      setSubscriptions(mockSubscriptions)
      
      // Calculate stats
      const total = mockSubscriptions.length
      const active = mockSubscriptions.filter((sub: Subscription) => sub.status === 'active').length
      const expired = mockSubscriptions.filter((sub: Subscription) => sub.status === 'expired').length
      const revenue = mockSubscriptions
        .filter((sub: Subscription) => sub.status === 'active')
        .reduce((sum: number, sub: Subscription) => sum + sub.monthlyPrice, 0)
      
      setStats({ total, active, expired, revenue })
      
      // Uncomment this when backend is ready:
      // const response = await api.get('/admin/subscriptions')
      // if (response.data.success) {
      //   setSubscriptions(response.data.data)
      //   // ... rest of the logic
      // }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
      case 'expired':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Expired</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Cancelled</span>
      case 'trial':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Trial</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>
    }
  }

  const getPlanBadge = (planName: string) => {
    const colors = {
      'FREE': 'bg-gray-100 text-gray-800',
      'BASIC': 'bg-blue-100 text-blue-800',
      'PRO': 'bg-purple-100 text-purple-800',
      'PREMIUM': 'bg-gold-100 text-gold-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[planName as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {planName}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = !searchTerm || 
      sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesPlan = planFilter === 'all' || sub.planName === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  useEffect(() => {
    fetchSubscriptions()
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
                  Subscription Monitoring
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor and manage vendor subscriptions
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchSubscriptions} disabled={loading} variant="outline" size="sm">
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subscriptions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expired}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.revenue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search subscriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="trial">Trial</option>
                    </select>
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Plans</option>
                      <option value="FREE">Free</option>
                      <option value="BASIC">Basic</option>
                      <option value="PRO">Pro</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscriptions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscriptions ({filteredSubscriptions.length})
                </CardTitle>
                <CardDescription>
                  Monitor subscription status and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No subscriptions found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubscriptions.map((subscription) => (
                      <div key={subscription._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {subscription.user?.businessName || subscription.user?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{subscription.user?.email || 'No email'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {getPlanBadge(subscription.planName)}
                                {getStatusBadge(subscription.status)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(subscription.monthlyPrice)}/month
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Usage: {subscription.usage.productsUsed}/{subscription.usage.maxProducts} products
                            </p>
                          </div>
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
