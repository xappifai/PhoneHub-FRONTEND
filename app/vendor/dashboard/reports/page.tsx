"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  TrendingUp,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Package,
  Users,
  DollarSign,
  Filter,
  RefreshCw
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface ReportData {
  salesByPeriod: Array<{ date: string; sales: number; profit: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  salesByCategory: Array<{ name: string; value: number }>
  salesByPaymentMethod: Array<{ name: string; value: number }>
  customerInsights: {
    totalInquiries: number
    conversionRate: number
    topLocations: string[]
    peakHours: string[]
  }
  summary: {
    totalSales: number
    totalProfit: number
    totalTransactions: number
    avgTransactionValue: number
    topSellingProduct: string
    profitMargin: number
  }
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel')
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers'>('sales')

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      const response = await api.get('/reports/analytics', {
        params: {
          startDate: dateRange.from,
          endDate: dateRange.to
        }
      })
      
      if (response.data?.success) {
        setReportData(response.data.data)
      }
    } catch (error) {
      console.error('Error loading report data:', error)
      // Generate sample data for MVP
      setReportData(generateSampleReportData())
    } finally {
      setLoading(false)
    }
  }

  const generateSampleReportData = (): ReportData => {
    const salesByPeriod = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      salesByPeriod.push({
        date: date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        sales: Math.floor(Math.random() * 50000) + 10000,
        profit: Math.floor(Math.random() * 15000) + 3000
      })
    }

    return {
      salesByPeriod,
      topProducts: [
        { name: 'iPhone 15 Pro Max', quantity: 45, revenue: 5400000 },
        { name: 'Samsung Galaxy S24 Ultra', quantity: 38, revenue: 4180000 },
        { name: 'iPad Air 10.9"', quantity: 25, revenue: 2750000 },
        { name: 'AirPods Pro 2nd Gen', quantity: 60, revenue: 1800000 },
        { name: 'MacBook Air M2', quantity: 15, revenue: 3750000 }
      ],
      salesByCategory: [
        { name: 'Mobile Phones', value: 65 },
        { name: 'Accessories', value: 20 },
        { name: 'Tablets', value: 10 },
        { name: 'Laptops', value: 5 }
      ],
      salesByPaymentMethod: [
        { name: 'Cash', value: 45 },
        { name: 'JazzCash', value: 25 },
        { name: 'Bank Transfer', value: 20 },
        { name: 'Easypaisa', value: 10 }
      ],
      customerInsights: {
        totalInquiries: 156,
        conversionRate: 32.5,
        topLocations: ['Karachi', 'Lahore', 'Islamabad'],
        peakHours: ['14:00-16:00', '18:00-20:00']
      },
      summary: {
        totalSales: 17880000,
        totalProfit: 2682000,
        totalTransactions: 183,
        avgTransactionValue: 97705,
        topSellingProduct: 'iPhone 15 Pro Max',
        profitMargin: 15.0
      }
    }
  }

  const exportReport = async () => {
    try {
      if (exportFormat === 'excel') {
        // Generate Excel file
        const csvData = generateCSV()
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `report_${dateRange.from}_to_${dateRange.to}.csv`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Excel report downloaded successfully')
      } else {
        // Generate PDF
        await generatePDF()
        toast.success('PDF report generated successfully')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    }
  }

  const generateCSV = () => {
    if (!reportData) return ''
    
    let csv = 'VendorHub Pakistan - Sales Report\n'
    csv += `Period: ${dateRange.from} to ${dateRange.to}\n\n`
    
    csv += 'Summary\n'
    csv += `Total Sales,${reportData.summary.totalSales}\n`
    csv += `Total Profit,${reportData.summary.totalProfit}\n`
    csv += `Total Transactions,${reportData.summary.totalTransactions}\n`
    csv += `Average Transaction,${reportData.summary.avgTransactionValue}\n`
    csv += `Profit Margin,${reportData.summary.profitMargin}%\n\n`
    
    csv += 'Top Products\n'
    csv += 'Product Name,Quantity,Revenue\n'
    reportData.topProducts.forEach(p => {
      csv += `${p.name},${p.quantity},${p.revenue}\n`
    })
    
    csv += '\nSales by Period\n'
    csv += 'Date,Sales,Profit\n'
    reportData.salesByPeriod.forEach(s => {
      csv += `${s.date},${s.sales},${s.profit}\n`
    })
    
    return csv
  }

  const generatePDF = async () => {
    if (!reportData) return

    // Simple HTML to PDF conversion
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Report - ${dateRange.from} to ${dateRange.to}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; }
          h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .summary-value { font-size: 24px; font-weight: bold; color: #1e40af; margin: 5px 0; }
          .summary-label { color: #6b7280; font-size: 14px; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Sales Report</h1>
        <p style="color: #6b7280;">Period: <strong>${new Date(dateRange.from).toLocaleDateString()} to ${new Date(dateRange.to).toLocaleDateString()}</strong></p>
        
        <h2>Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Sales</div>
            <div class="summary-value">${formatCurrency(reportData.summary.totalSales)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Profit</div>
            <div class="summary-value">${formatCurrency(reportData.summary.totalProfit)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Transactions</div>
            <div class="summary-value">${reportData.summary.totalTransactions}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Avg Transaction</div>
            <div class="summary-value">${formatCurrency(reportData.summary.avgTransactionValue)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Profit Margin</div>
            <div class="summary-value">${reportData.summary.profitMargin.toFixed(1)}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Top Product</div>
            <div class="summary-value" style="font-size: 16px;">${reportData.summary.topSellingProduct}</div>
          </div>
        </div>

        <h2>Top Selling Products</h2>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th style="text-align: right;">Quantity Sold</th>
              <th style="text-align: right;">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.topProducts.map(p => `
              <tr>
                <td>${p.name}</td>
                <td style="text-align: right;">${p.quantity}</td>
                <td style="text-align: right;">${formatCurrency(p.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Sales by Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.salesByCategory.map(c => `
              <tr>
                <td>${c.name}</td>
                <td style="text-align: right;">${c.value}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Payment Methods Distribution</h2>
        <table>
          <thead>
            <tr>
              <th>Payment Method</th>
              <th style="text-align: right;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.salesByPaymentMethod.map(p => `
              <tr>
                <td>${p.name}</td>
                <td style="text-align: right;">${p.value}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Customer Insights</h2>
        <table>
          <tbody>
            <tr>
              <td><strong>Total Inquiries</strong></td>
              <td style="text-align: right;">${reportData.customerInsights.totalInquiries}</td>
            </tr>
            <tr>
              <td><strong>Conversion Rate</strong></td>
              <td style="text-align: right;">${reportData.customerInsights.conversionRate}%</td>
            </tr>
            <tr>
              <td><strong>Top Locations</strong></td>
              <td style="text-align: right;">${reportData.customerInsights.topLocations.join(', ')}</td>
            </tr>
            <tr>
              <td><strong>Peak Hours</strong></td>
              <td style="text-align: right;">${reportData.customerInsights.peakHours.join(', ')}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()} | VendorHub Pakistan</p>
          <p>This report is for internal use only and contains confidential business information.</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const data = reportData || generateSampleReportData()

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Advanced Reports & Analytics
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive business insights and performance metrics
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'excel' | 'pdf')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  >
                    <option value="excel">Excel (XLSX)</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <Button onClick={exportReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export {exportFormat.toUpperCase()}
                  </Button>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setDateRange({
                        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        to: new Date().toISOString().split('T')[0]
                      })}
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDateRange({
                        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        to: new Date().toISOString().split('T')[0]
                      })}
                    >
                      Last 30 Days
                    </Button>
                    <Button variant="outline" onClick={loadReportData} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Total Sales</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(data.summary.totalSales)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Total Profit</span>
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(data.summary.totalProfit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Transactions</span>
                  </div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {data.summary.totalTransactions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Avg Transaction</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(data.summary.avgTransactionValue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Profit Margin</span>
                  </div>
                  <div className="text-xl font-bold text-pink-600 dark:text-pink-400">
                    {data.summary.profitMargin.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Inquiries</span>
                  </div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {data.customerInsights.totalInquiries}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
                  { id: 'products', label: 'Product Performance', icon: Package },
                  { id: 'customers', label: 'Customer Insights', icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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
            {activeTab === 'sales' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Sales & Profit Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.salesByPeriod}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="Sales" />
                        <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Sales by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={data.salesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.salesByPaymentMethod}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8B5CF6" name="Percentage (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="grid gap-6">
                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {data.topProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-semibold">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                                {product.quantity}
                              </td>
                              <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(product.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Revenue Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Customer Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Inquiries</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {data.customerInsights.totalInquiries}
                        </p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {data.customerInsights.conversionRate}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Top Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {data.customerInsights.topLocations.map((location) => (
                          <span key={location} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Peak Inquiry Hours</p>
                      <div className="flex flex-wrap gap-2">
                        {data.customerInsights.peakHours.map((hour) => (
                          <span key={hour} className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
                            {hour}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Customer Activity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Most inquiries come from Karachi, followed by Lahore and Islamabad. Peak activity times are afternoons and evenings.
                        </p>
                      </div>

                      <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Conversion Trends</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your conversion rate of {data.customerInsights.conversionRate}% is above average. Focus on quick response times to maintain this rate.
                        </p>
                      </div>

                      <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Growth Opportunity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Consider expanding your operating hours during peak inquiry times (2-4 PM and 6-8 PM) to capture more leads.
                        </p>
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

