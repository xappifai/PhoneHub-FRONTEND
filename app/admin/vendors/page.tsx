"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  UserCheck,
  RefreshCw,
  Download
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface Vendor {
  _id: string
  name: string
  email: string
  phone: string
  businessName?: string
  businessAddress?: any
  location?: string
  accountStatus: string
  createdAt: string
  subscription?: any
  storefront?: any
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        role: 'vendor',
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await api.get(`/admin/users?${params}`)
      
      if (response.data.success) {
        setVendors(response.data.data)
        setTotalPages(response.data.pages)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const updateVendorStatus = async (vendorId: string, newStatus: string) => {
    try {
      const response = await api.put(`/admin/users/${vendorId}/status`, {
        accountStatus: newStatus
      })
      
      if (response.data.success) {
        toast.success(`Vendor ${newStatus === 'active' ? 'approved' : 'suspended'}`)
        fetchVendors()
      }
    } catch (error) {
      console.error('Error updating vendor status:', error)
      toast.error('Failed to update vendor status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
      case 'suspended':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Suspended</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>
    }
  }

  const getStatusActions = (vendor: Vendor) => {
    if (vendor.accountStatus === 'pending') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => updateVendorStatus(vendor._id, 'active')}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => updateVendorStatus(vendor._id, 'suspended')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )
    }
    
    if (vendor.accountStatus === 'active') {
      return (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => updateVendorStatus(vendor._id, 'suspended')}
        >
          <Ban className="h-4 w-4 mr-1" />
          Suspend
        </Button>
      )
    }
    
    if (vendor.accountStatus === 'suspended') {
      return (
        <Button
          size="sm"
          onClick={() => updateVendorStatus(vendor._id, 'active')}
          className="bg-green-600 hover:bg-green-700"
        >
          <UserCheck className="h-4 w-4 mr-1" />
          Reactivate
        </Button>
      )
    }
    
    return null
  }

  useEffect(() => {
    fetchVendors()
  }, [currentPage, searchTerm, statusFilter])

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
                  Vendor Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage vendor accounts, approvals, and status
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchVendors} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search vendors..."
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
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendors Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Vendors ({vendors.length})
                </CardTitle>
                <CardDescription>
                  Manage vendor accounts and their status
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
                ) : vendors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No vendors found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vendors.map((vendor) => (
                      <div key={vendor._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {vendor.businessName || vendor.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">{vendor.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div>
                            {getStatusBadge(vendor.accountStatus)}
                          </div>
                          <div>
                            {getStatusActions(vendor)}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
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
