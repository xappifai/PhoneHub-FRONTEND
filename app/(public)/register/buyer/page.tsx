"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'
import { ArrowRight, ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, ShoppingBag, Sparkles, Heart, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function BuyerRegistrationPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)

    try {
      const success = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'buyer'
      })

      if (success) {
        toast.success('Registration successful! Please verify your email.')
        router.push('/login')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
            <motion.div 
              className="text-center lg:text-left"
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={fadeIn.transition}
            >
              <Link href="/register" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Registration
              </Link>
              
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-200 dark:border-gray-700">
                <ShoppingBag className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Buyer Registration</span>
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 dark:from-white dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent mb-6">
                Join as a Buyer
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Discover and compare the best electronics deals from verified vendors across Pakistan. Start your shopping journey today!
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Advanced Search</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find exactly what you're looking for</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Wishlist & Compare</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Save and compare your favorites</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Price Alerts</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of price drops</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Registration Form */}
            <motion.div
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={{ ...fadeIn.transition, delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create Your Account
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Join thousands of satisfied customers
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
                              errors.firstName ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'
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
                              errors.lastName ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'
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
                            errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'
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
                            errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'
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
                              errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'
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
                              errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'
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

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Buyer Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Sign In Link */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <Link href="/login" className="text-green-600 hover:text-green-500 dark:text-green-400 font-medium">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}