"use client"

import React, { useEffect, useMemo, useState } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api-client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Analytics = { pageViews: number; inquiries: number; totalSales: number; productViews: { productId: string; productName: string; views: number }[] }
type ProductLite = { id?: string; _id?: string; name: string; sellingPrice: number; quantity: number; minStock: number }

export default function VendorDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [products, setProducts] = useState<ProductLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: a }, { data: p }] = await Promise.all([
          api.get('/storefront/analytics'),
          api.get('/products', { params: { limit: 10, sort: '-createdAt' } })
        ])
        setAnalytics(a?.data)
        setProducts((p?.data?.data || p?.data || []).map((x: any) => ({
          id: x.id || x._id,
          name: x.name,
          sellingPrice: x.sellingPrice || x.price || 0,
          quantity: x.quantity || 0,
          minStock: x.minStock || 0
        })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const lowStockCount = useMemo(() => products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length, [products])
  const stats = useMemo(() => ([
    { title: 'Total Sales', value: formatCurrency(analytics?.totalSales || 0), change: '', icon: DollarSign, positive: true },
    { title: 'Products', value: String(products.length), change: '', icon: Package, positive: true },
    { title: 'Low Stock Alerts', value: String(lowStockCount), change: '', icon: AlertTriangle, positive: lowStockCount === 0 },
    { title: 'Page Views', value: String(analytics?.pageViews || 0), change: '', icon: Eye, positive: true }
  ]), [analytics, products, lowStockCount])

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back! Here's what's happening with your store today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className={`text-sm ${
                          stat.positive ? 'text-secondary' : 'text-red-500'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${
                        stat.positive ? 'bg-secondary/10' : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <stat.icon className={`h-6 w-6 ${
                          stat.positive ? 'text-secondary' : 'text-red-500'
                        }`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>
                    Monthly sales performance for the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(analytics?.productViews || []).slice(0, 6).map(v => ({ month: v.productName, sales: v.views }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), 'Sales']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>
                        Latest sales and expenses from your store
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(products || []).slice(0,5).map((transaction: any, idx: number) => (
                      <div key={transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{transaction.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Product #{idx + 1}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              (transaction.quantity || 0) > 0
                                ? 'bg-secondary/10 text-secondary'
                                : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20'
                            }`}>
                              {transaction.quantity > 0 ? 'In stock' : 'Out of stock'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              'text-secondary'
                            }`}>
                              {formatCurrency(transaction.sellingPrice || transaction.price || 0)}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions removed as requested */}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

