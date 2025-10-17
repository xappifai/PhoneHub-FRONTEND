"use client"

import React from 'react'
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
import { MOCK_TRANSACTIONS } from '@/lib/mock-data'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockSalesData = [
  { month: 'Jan', sales: 45000 },
  { month: 'Feb', sales: 52000 },
  { month: 'Mar', sales: 48000 },
  { month: 'Apr', sales: 65000 },
  { month: 'May', sales: 72000 },
  { month: 'Jun', sales: 68000 },
]

export default function VendorDashboard() {
  const stats = [
    {
      title: 'Total Sales',
      value: formatCurrency(245000),
      change: '+12.5%',
      icon: DollarSign,
      positive: true
    },
    {
      title: 'Products',
      value: '145',
      change: '+3 this week',
      icon: Package,
      positive: true
    },
    {
      title: 'Low Stock Alerts',
      value: '8',
      change: '3 critical',
      icon: AlertTriangle,
      positive: false
    },
    {
      title: 'Monthly Growth',
      value: '18.2%',
      change: '+2.1% vs last month',
      icon: TrendingUp,
      positive: true
    }
  ]

  const recentTransactions = MOCK_TRANSACTIONS.slice(0, 5)

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
                      <LineChart data={mockSalesData}>
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
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {transaction.customerName} • {formatDate(transaction.date)}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              transaction.status === 'completed'
                                ? 'bg-secondary/10 text-secondary'
                                : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.type === 'sale' 
                                ? 'text-secondary' 
                                : 'text-red-500'
                            }`}>
                              {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(transaction.amount)}
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

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your store efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-16 flex flex-col space-y-1">
                    <Package className="h-5 w-5" />
                    <span className="text-xs">Add Product</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col space-y-1">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-xs">Record Sale</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col space-y-1">
                    <Eye className="h-5 w-5" />
                    <span className="text-xs">View Storefront</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col space-y-1">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

