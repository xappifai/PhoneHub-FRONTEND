"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegistrationStore } from '@/store/registration-store'
import toast from 'react-hot-toast'
import { ArrowRight, ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, Store, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VendorRegistrationStep1() {
  const router = useRouter()
  const { sellerFormData, updateSellerFormData } = useRegistrationStore()
  const [formData, setFormData] = useState({
    firstName: sellerFormData.firstName || '',
    lastName: sellerFormData.lastName || '',
    email: sellerFormData.email || '',
    phone: sellerFormData.phone || '',
    password: sellerFormData.password || '',
    confirmPassword: sellerFormData.confirmPassword || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      updateSellerFormData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      router.push('/register/vendor/step2')
    } else {
      toast.error('Please fix the errors in the form')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <Link href="/register" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Registration
            </Link>
            
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-200 dark:border-gray-700">
              <Store className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendor Registration</span>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              Step 1: Personal Information
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Let's start with your basic information to create your vendor account
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Personal Info</span>
              </div>
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Info</span>
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
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Tell us about yourself to get started
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                            errors.firstName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                          }`}
                          required
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                            errors.lastName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                          }`}
                          required
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                          errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                        }`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className={`pl-10 h-12 rounded-xl border-2 transition-colors ${
                          errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                        }`}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          className={`pl-10 pr-10 h-12 rounded-xl border-2 transition-colors ${
                            errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                          }`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className={`pl-10 pr-10 h-12 rounded-xl border-2 transition-colors ${
                            errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                          }`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center">!</span>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Password Requirements:</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={formData.password.length >= 8 ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={/[A-Z]/.test(formData.password) ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={/[a-z]/.test(formData.password) ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 ${/\d/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={/\d/.test(formData.password) ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 ${/[^A-Za-z\d]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={/[^A-Za-z\d]/.test(formData.password) ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>
                          One special character
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                    size="lg"
                  >
                    Continue to Business Information
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