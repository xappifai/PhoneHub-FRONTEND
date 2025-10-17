"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegistrationStore } from '@/store/registration-store'
import toast from 'react-hot-toast'
import { ArrowRight, ArrowLeft, Building2, MapPin, Store, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VendorRegistrationStep2() {
  const router = useRouter()
  const { sellerFormData, updateSellerFormData } = useRegistrationStore()
  const [formData, setFormData] = useState({
    businessName: sellerFormData.businessName || '',
    addressLine1: sellerFormData.addressLine1 || '',
    addressLine2: sellerFormData.addressLine2 || '',
    city: sellerFormData.city || '',
    state: sellerFormData.state || '',
    postalCode: sellerFormData.postalCode || '',
    country: sellerFormData.country || 'Pakistan'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      updateSellerFormData({
        businessName: formData.businessName,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      })
      router.push('/register/vendor/step3')
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <Link href="/register/vendor/step1" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Step 1
            </Link>
            
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-200 dark:border-gray-700">
              <Store className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendor Registration</span>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              Step 2: Business Information
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tell us about your business and location details
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Personal Info</span>
              </div>
              <div className="w-16 h-1 bg-blue-500 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Business Info</span>
              </div>
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Review</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ ...fadeIn.transition, delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center pb-8 pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Business Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Provide your business details and address
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Enter your business name"
                        className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                          errors.businessName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                        }`}
                        required
                      />
                    </div>
                    {errors.businessName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address Line 1 *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        placeholder="Street address, building number"
                        className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                          errors.addressLine1 ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                        }`}
                        required
                      />
                    </div>
                    {errors.addressLine1 && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address Line 2
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Apartment, suite, unit, building (optional)"
                        className="pl-10 h-12 rounded-xl border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        City *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Enter your city"
                          className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                            errors.city ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                          }`}
                          required
                        />
                      </div>
                      {errors.city && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        State/Province *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="Enter your state/province"
                          className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                            errors.state ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                          }`}
                          required
                        />
                      </div>
                      {errors.state && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Postal Code */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Postal Code
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          placeholder="Enter postal code"
                          className="pl-10 h-12 rounded-xl border-2 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full h-12 px-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="India">India</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Sri Lanka">Sri Lanka</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                    size="lg"
                  >
                    Continue to Review
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}