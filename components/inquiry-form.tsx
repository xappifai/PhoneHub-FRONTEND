"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X } from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/auth-context'

interface InquiryFormProps {
  productId: string
  productName: string
  vendorName: string
  onClose?: () => void
  onSuccess?: () => void
}

export default function InquiryForm({ 
  productId, 
  productName, 
  vendorName,
  onClose, 
  onSuccess 
}: InquiryFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    buyerName: user?.name || '',
    buyerEmail: user?.email || '',
    buyerPhone: user?.phone || '',
    subject: `Inquiry about ${productName}`,
    message: '',
    inquiryType: 'general'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.message.trim()) {
      toast.error('Please enter your message')
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/inquiries', {
        productId,
        ...formData,
        source: 'marketplace'
      })

      if (response.data.success) {
        toast.success('Inquiry submitted successfully! The vendor will contact you soon.')
        if (onSuccess) onSuccess()
        if (onClose) onClose()
      }
    } catch (error: any) {
      console.error('Error submitting inquiry:', error)
      toast.error(error.response?.data?.message || 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Vendor
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send an inquiry to {vendorName}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Name *
            </label>
            <Input
              value={formData.buyerName}
              onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.buyerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, buyerEmail: e.target.value }))}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.buyerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, buyerPhone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Inquiry Type
            </label>
            <select
              value={formData.inquiryType}
              onChange={(e) => setFormData(prev => ({ ...prev, inquiryType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="general">General Inquiry</option>
              <option value="price">Price Inquiry</option>
              <option value="availability">Availability</option>
              <option value="specifications">Specifications</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Subject"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Enter your message here..."
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Inquiry
              </>
            )}
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

