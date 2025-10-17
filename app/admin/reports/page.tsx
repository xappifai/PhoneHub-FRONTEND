"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download,
  Calendar,
  RefreshCw,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Filter,
  Eye
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface ReportType {
  id: string
  name: string
  description: string
  icon: any
  color: string
  lastGenerated?: string
  recordCount?: number
}

export default function Reports() {
  const [reports, setReports] = useState<ReportType[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API calls
      const mockReports: ReportType[] = [
        {
          id: 'vendors',
          name: 'Vendor Report',
          description: 'Complete list of all vendors with subscription status and activity',
          icon: Users,
          color: 'bg-blue-100 text-blue-600',
          lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          recordCount: 1247
        },
        {
          id: 'revenue',
          name: 'Revenue Report',
          description: 'Financial summary including subscription revenue and transaction data',
          icon: DollarSign,
          color: 'bg-green-100 text-green-600',
          lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          recordCount: 8934
        },
        {
          id: 'products',
          name: 'Product Report',
          description: 'Inventory report with product details, stock levels, and sales data',
          icon: Package,
          color: 'bg-purple-100 text-purple-600',
          lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          recordCount: 15672
        },
        {
          id: 'analytics',
          name: 'Analytics Report',
          description: 'Platform usage statistics and performance metrics',
          icon: TrendingUp,
          color: 'bg-orange-100 text-orange-600',
          lastGenerated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          recordCount: 245
        },
        {
          id: 'transactions',
          name: 'Transaction Report',
          description: 'All transactions with payment details and vendor information',
          icon: FileText,
          color: 'bg-red-100 text-red-600',
          lastGenerated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          recordCount: 34521
        },
        {
          id: 'subscriptions',
          name: 'Subscription Report',
          description: 'Subscription status, renewals, and payment history',
          icon: Calendar,
          color: 'bg-indigo-100 text-indigo-600',
          lastGenerated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          recordCount: 1247
        }
      ]
      
      setReports(mockReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (reportId: string) => {
    try {
      setGenerating(reportId)
      
      // Mock report generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Report generated successfully')
      
      // Update the report with new generation time
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, lastGenerated: new Date().toISOString() }
          : report
      ))
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setGenerating(null)
    }
  }

  const downloadReport = async (reportId: string, format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Mock download - replace with actual API call
      toast.success(`Downloading ${format.toUpperCase()} report...`)
      
      // Simulate download
      const link = document.createElement('a')
      link.href = '#' // Replace with actual download URL
      link.download = `${reportId}_report.${format}`
      link.click()
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchReports()
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
                  Reports & Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate and download comprehensive platform reports
                </p>
              </div>
              <Button onClick={fetchReports} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Date Range Filter */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Report Filters
                </CardTitle>
                <CardDescription>
                  Set date range for report generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button size="sm">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${report.color}`}>
                          <report.icon className="h-5 w-5" />
                        </div>
                        {report.name}
                      </CardTitle>
                      <CardDescription>
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {report.lastGenerated && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>Last Generated:</strong> {formatDate(report.lastGenerated)}</p>
                            <p><strong>Records:</strong> {report.recordCount?.toLocaleString()}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => generateReport(report.id)}
                            disabled={generating === report.id}
                            className="flex-1"
                            size="sm"
                          >
                            {generating === report.id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4 mr-2" />
                            )}
                            {generating === report.id ? 'Generating...' : 'Generate'}
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'csv')}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'excel')}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Excel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'pdf')}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Generate all reports or perform bulk operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate All Reports
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Bulk Download
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Reports
                  </Button>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Custom Analytics
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
