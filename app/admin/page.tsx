"use client"

import React from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { MOCK_VENDORS, SUBSCRIPTION_PLANS } from '@/lib/mock-data'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const mockRevenueData = [
  { month: 'Jan', revenue: 125000 },
  { month: 'Feb', revenue: 145000 },
  { month: 'Mar', revenue: 135000 },
  { month: 'Apr', revenue: 180000 },
  { month: 'May', revenue: 195000 },
  { month: 'Jun', revenue: 210000 },
]

const subscriptionData = SUBSCRIPTION_PLANS.map(plan => ({
  name: plan.name,
  value: plan.name === 'Basic' ? 45 : plan.name === 'Pro' ? 30 : plan.name === 'Premium' ? 15 : 10,
  color: plan.name === 'Basic' ? '#3B82F6' : plan.name === 'Pro' ? '#10B981' : plan.name === 'Premium' ? '#8B5CF6' : '#6B7280'
}))

export default function AdminDashboard() {
  const totalVendors = MOCK_VENDORS.length
  const activeVendors = MOCK_VENDORS.filter(v => v.status === 'active').length
  const pendingVendors = MOCK_VENDORS.filter(v => v.status === 'pending').length
  const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  const monthlyGrowth = 12.5 // Mock growth percentage

  const stats = [
    {
      title: 'Total Vendors',
      value: totalVendors.toString(),
      change: `${activeVendors} active`,
      icon: Users,
      positive: true
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(mockRevenueData[mockRevenueData.length - 1]?.revenue || 0),
      change: `+${monthlyGrowth}%`,
      icon: DollarSign,
      positive: true
    },
    {
      title: 'Growth Rate',
      value: `${monthlyGrowth}%`,
      change: '+2.1% vs last month',
      icon: TrendingUp,
      positive: true
    },
    {
      title: 'System Uptime',
      value: '99.5%',
      change: 'Last 30 days',
      icon: Activity,
      positive: true
    }
  ]

  const recentVendors = MOCK_VENDORS.slice(0, 5)

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="admin" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Platform overview and management tools
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
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
                        <p className="text-sm text-secondary">
                          {stat.change}
                        </p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-full">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>
                    Monthly recurring revenue from subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), 'Revenue']}
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
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                  <CardDescription>
                    Current subscription plans usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {subscriptionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Usage']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {subscriptionData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.name}: {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Vendors */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Vendors</CardTitle>
                      <CardDescription>
                        Latest vendor registrations
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentVendors.map((vendor) => (
                      <div key={vendor.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {vendor.businessName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {vendor.businessName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {vendor.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              vendor.status === 'active'
                                ? 'bg-green-50 text-green-600'
                                : vendor.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-red-50 text-red-600'
                            }`}>
                              {vendor.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {vendor.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {vendor.status === 'suspended' && <AlertCircle className="w-3 h-3 mr-1" />}
                              {vendor.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex flex-col space-y-2">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Approve Vendors</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <DollarSign className="h-6 w-6" />
                      <span className="text-sm">View Revenue</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-sm">Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <Activity className="h-6 w-6" />
                      <span className="text-sm">System Status</span>
                    </Button>
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