"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  Calendar,
  Mail,
  Phone,
  Send,
  User
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
    model?: string
    images: any[]
  }
  buyer?: {
    _id: string
    name: string
    email: string
    phone: string
  }
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  message: string
  subject: string
  inquiryType: string
  status: 'pending' | 'responded' | 'closed'
  response?: {
    message: string
    respondedAt: string
  }
  createdAt: string
  isReadByVendor: boolean
}

export default function VendorInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [responding, setResponding] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'closed'>('all')

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      
      const params: any = { page: 1, limit: 50 }
      if (filter !== 'all') params.status = filter
      
      const response = await api.get('/inquiries/vendor', { params })
      
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
    setResponseMessage('')
    
    // Mark as read
    try {
      await api.get(`/inquiries/${inquiry._id}`)
      
      // Update local state
      setInquiries(prev => prev.map(inq => 
        inq._id === inquiry._id ? { ...inq, isReadByVendor: true } : inq
      ))
      
      if (!inquiry.isReadByVendor) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking inquiry as read:', error)
    }
  }

  const handleRespondToInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedInquiry || !responseMessage.trim()) {
      toast.error('Please enter a response message')
      return
    }

    try {
      setResponding(true)
      
      const response = await api.put(`/inquiries/${selectedInquiry._id}/respond`, {
        message: responseMessage
      })
      
      if (response.data.success) {
        toast.success('Response sent successfully!')
        fetchInquiries()
        setShowModal(false)
        setResponseMessage('')
      }
    } catch (error: any) {
      console.error('Error responding to inquiry:', error)
      toast.error(error.response?.data?.message || 'Failed to send response')
    } finally {
      setResponding(false)
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

  const getInquiryTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      price: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      availability: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      specifications: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || colors.general}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
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
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Customer Inquiries
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and respond to product inquiries from buyers
                </p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2 rounded-lg">
                  <span className="font-semibold">{unreadCount}</span> unread inquir{unreadCount !== 1 ? 'ies' : 'y'}
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
                  <p className="text-gray-600 dark:text-gray-400">
                    When buyers contact you about products, inquiries will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => (
                  <Card 
                    key={inquiry._id} 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      !inquiry.isReadByVendor 
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
                              {getInquiryTypeBadge(inquiry.inquiryType)}
                              {!inquiry.isReadByVendor && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                                  Unread
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {inquiry.buyerName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {inquiry.buyerEmail}
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
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                              <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
                                Your Response:
                              </p>
                              <p className="text-sm text-green-800 dark:text-green-300 line-clamp-2">
                                {inquiry.response.message}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View & Respond
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

      {/* Inquiry Detail & Response Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              {/* Status & Type Badges */}
              <div className="flex gap-2 mb-6">
                {getStatusBadge(selectedInquiry.status)}
                {getInquiryTypeBadge(selectedInquiry.inquiryType)}
              </div>

              {/* Buyer Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Buyer Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span><strong>Name:</strong> {selectedInquiry.buyerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span><strong>Email:</strong> {selectedInquiry.buyerEmail}</span>
                  </div>
                  {selectedInquiry.buyerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span><strong>Phone:</strong> {selectedInquiry.buyerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span><strong>Received:</strong> {formatDate(selectedInquiry.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Buyer's Message */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Buyer's Message</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Previous Response (if exists) */}
              {selectedInquiry.response && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Previous Response</h3>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedInquiry.response.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Sent on {formatDate(selectedInquiry.response.respondedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Response Form */}
              {selectedInquiry.status !== 'closed' && (
                <form onSubmit={handleRespondToInquiry} className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedInquiry.response ? 'Send Another Response' : 'Send Response'}
                  </h3>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response here..."
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex gap-3 mt-3">
                    <Button type="submit" disabled={responding || !responseMessage.trim()}>
                      {responding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Response
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedInquiry.status !== 'closed' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCloseInquiry(selectedInquiry._id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Inquiry
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Close Window
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}

