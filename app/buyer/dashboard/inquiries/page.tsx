"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  Store,
  Calendar
} from 'lucide-react'
import Image from 'next/image'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface Inquiry {
  _id: string
  product: {
    _id: string
    name: string
    brand: string
    images: any[]
  }
  vendor: {
    _id: string
    businessName: string
    email: string
    phone: string
  }
  message: string
  subject: string
  status: 'pending' | 'responded' | 'closed'
  response?: {
    message: string
    respondedAt: string
  }
  createdAt: string
  isReadByBuyer: boolean
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'closed'>('all')

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      
      const params: any = { page: 1, limit: 50 }
      if (filter !== 'all') params.status = filter
      
      const response = await api.get('/inquiries/buyer', { params })
      
      if (response.data.success) {
        setInquiries(response.data.data)
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleViewInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setShowModal(true)
    
    // Mark as read
    try {
      await api.get(`/inquiries/${inquiry._id}`)
      
      // Update local state
      setInquiries(prev => prev.map(inq => 
        inq._id === inquiry._id ? { ...inq, isReadByBuyer: true } : inq
      ))
      
      if (!inquiry.isReadByBuyer && inquiry.status === 'responded') {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking inquiry as read:', error)
    }
  }

  const handleCloseInquiry = async (inquiryId: string) => {
    try {
      const response = await api.put(`/inquiries/${inquiryId}/close`)
      
      if (response.data.success) {
        toast.success('Inquiry closed successfully')
        fetchInquiries()
        setShowModal(false)
      }
    } catch (error: any) {
      console.error('Error closing inquiry:', error)
      toast.error(error.response?.data?.message || 'Failed to close inquiry')
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [filter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        )
      case 'responded':
        return (
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Responded
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3 mr-1" />
            Closed
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(inq => inq.status === filter)

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="buyer" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  My Inquiries
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your product inquiries and vendor responses
                </p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2 rounded-lg">
                  <span className="font-semibold">{unreadCount}</span> new response{unreadCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({inquiries.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pending ({inquiries.filter(i => i.status === 'pending').length})
              </Button>
              <Button
                variant={filter === 'responded' ? 'default' : 'outline'}
                onClick={() => setFilter('responded')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Responded ({inquiries.filter(i => i.status === 'responded').length})
              </Button>
              <Button
                variant={filter === 'closed' ? 'default' : 'outline'}
                onClick={() => setFilter('closed')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Closed ({inquiries.filter(i => i.status === 'closed').length})
              </Button>
            </div>

            {/* Inquiries List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredInquiries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No inquiries yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    When you contact vendors about products, your inquiries will appear here.
                  </p>
                  <Button onClick={() => window.location.href = '/buyer/dashboard'}>
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => (
                  <Card 
                    key={inquiry._id} 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      !inquiry.isReadByBuyer && inquiry.status === 'responded' 
                        ? 'border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleViewInquiry(inquiry)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {inquiry.product.images && inquiry.product.images[0]?.url ? (
                            <Image
                              src={inquiry.product.images[0].url}
                              alt={inquiry.product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400 m-auto mt-6" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {inquiry.subject || `Inquiry about ${inquiry.product.name}`}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {inquiry.product.brand} - {inquiry.product.name}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(inquiry.status)}
                              {!inquiry.isReadByBuyer && inquiry.status === 'responded' && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                                  New Response
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Store className="h-4 w-4" />
                              {inquiry.vendor.businessName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(inquiry.createdAt)}
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                            {inquiry.message}
                          </p>

                          {inquiry.response && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                                Vendor Response:
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-300 line-clamp-2">
                                {inquiry.response.message}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedInquiry.subject}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedInquiry.product.brand} - {selectedInquiry.product.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </Button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                {getStatusBadge(selectedInquiry.status)}
              </div>

              {/* Your Message */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Message</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{selectedInquiry.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Sent on {formatDate(selectedInquiry.createdAt)}
                  </p>
                </div>
              </div>

              {/* Vendor Response */}
              {selectedInquiry.response && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Vendor Response</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{selectedInquiry.response.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Responded on {formatDate(selectedInquiry.response.respondedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Vendor Contact Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Vendor Contact</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                  <p><strong>Business:</strong> {selectedInquiry.vendor.businessName}</p>
                  <p><strong>Email:</strong> {selectedInquiry.vendor.email}</p>
                  <p><strong>Phone:</strong> {selectedInquiry.vendor.phone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedInquiry.status !== 'closed' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCloseInquiry(selectedInquiry._id)}
                  >
                    Close Inquiry
                  </Button>
                )}
                <Button onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}

