"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegistrationStore } from '@/store/registration-store'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, Loader2, Store, Sparkles, User, Mail, Phone, MapPin, Building2, Shield } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VendorRegistrationStep3() {
  const router = useRouter()
  const { sellerFormData, resetSellerForm } = useRegistrationStore()
  const { register } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const success = await register({
        firstName: sellerFormData.firstName,
        lastName: sellerFormData.lastName,
        email: sellerFormData.email,
        phone: sellerFormData.phone,
        password: sellerFormData.password,
        businessName: sellerFormData.businessName,
        addressLine1: sellerFormData.addressLine1,
        addressLine2: sellerFormData.addressLine2,
        city: sellerFormData.city,
        state: sellerFormData.state,
        postalCode: sellerFormData.postalCode,
        country: sellerFormData.country,
        role: 'vendor'
      })

      if (success) {
        toast.success('Registration successful! Please verify your email.')
        resetSellerForm()
        router.push('/login')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
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
            <Link href="/register/vendor/step2" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Step 2
            </Link>
            
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-200 dark:border-gray-700">
              <Store className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendor Registration</span>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              Step 3: Review & Submit
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Review your information and complete your vendor registration
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
              <div className="w-16 h-1 bg-green-500 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Business Info</span>
              </div>
              <div className="w-16 h-1 bg-blue-500 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Review</span>
              </div>
            </div>
          </div>

          {/* Review Cards */}
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ ...fadeIn.transition, delay: 0.2 }}
            className="space-y-6 mb-8"
          >
            {/* Personal Information */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Your personal details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sellerFormData.firstName} {sellerFormData.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sellerFormData.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sellerFormData.phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Business Information
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Your business details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Store className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sellerFormData.businessName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Business Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sellerFormData.addressLine1}
                      {sellerFormData.addressLine2 && `, ${sellerFormData.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {sellerFormData.city}, {sellerFormData.state} {sellerFormData.postalCode}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {sellerFormData.country}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Business Address</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Terms and Submit */}
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ ...fadeIn.transition, delay: 0.4 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm">
                      By creating your account, you agree to our Terms of Service and Privacy Policy
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Complete Registration
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    You'll receive a verification email after registration
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}