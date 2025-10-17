"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Shield, Store, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)
      
      if (success) {
        toast.success('Login successful!')
        
        // Get user data from localStorage to determine role
        const userData = localStorage.getItem('user_data')
        if (userData) {
          const user = JSON.parse(userData)
          // Redirect based on user role
          switch (user.role) {
            case 'vendor':
              router.push('/vendor/dashboard')
              break
            case 'buyer':
              router.push('/buyer/dashboard')
              break
            case 'admin':
              router.push('/admin/dashboard')
              break
            default:
              router.push('/')
          }
        } else {
          router.push('/')
        }
      } else {
        toast.error('Invalid email or password')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const slideIn = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, delay: 0.2 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
            <motion.div 
              className="text-center lg:text-left"
              initial={slideIn.initial}
              animate={slideIn.animate}
              transition={slideIn.transition}
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-200 dark:border-gray-700">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Welcome Back</span>
                </div>
                
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
                  Sign In to VendorHub
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Access your dashboard and continue managing your electronics business with Pakistan's leading marketplace platform.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <Store className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendors</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage inventory</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <ShoppingBag className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Buyers</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Browse products</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admins</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Platform control</p>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={fadeIn.transition}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className="pl-10 h-12 rounded-xl border-2 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-12 rounded-xl border-2 focus:border-blue-500 transition-colors"
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
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In to Your Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Don't have an account?
                      </span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <Link href="/register">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-2 rounded-xl py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                      >
                        Create New Account
                      </Button>
                    </Link>
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