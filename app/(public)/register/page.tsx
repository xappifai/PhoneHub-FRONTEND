"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  ShoppingBag, 
  Shield,
  ArrowRight,
  CheckCircle,
  Users,
  BarChart3,
  Package,
  Sparkles,
  TrendingUp,
  Globe,
  Zap,
  Star,
  Heart
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const signupOptions = [
    {
      title: 'Vendor',
      subtitle: 'For Electronics Sellers',
      description: 'Launch and scale your electronics business with our comprehensive platform',
      icon: Store,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      accentColor: 'blue',
      features: [
        { name: 'Smart Inventory Management', icon: Package },
        { name: 'Financial Ledger & Analytics', icon: BarChart3 },
        { name: 'Professional Storefront', icon: Globe },
        { name: 'Multi-location Support', icon: TrendingUp }
      ],
      link: '/register/vendor/step1',
      popular: true,
      stats: 'Join 500+ vendors',
      gradient: 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
    },
    {
      title: 'Buyer',
      subtitle: 'For Electronics Shoppers',
      description: 'Discover and compare the best electronics deals from verified vendors',
      icon: ShoppingBag,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      accentColor: 'green',
      features: [
        { name: 'Browse Verified Vendors', icon: Store },
        { name: 'Advanced Product Search', icon: Zap },
        { name: 'Wishlist & Compare Tools', icon: Heart },
        { name: 'Price Drop Alerts', icon: TrendingUp }
      ],
      link: '/register/buyer',
      popular: false,
      stats: '10,000+ products',
      gradient: 'bg-gradient-to-br from-green-50 via-white to-green-50'
    },
    {
      title: 'Admin',
      subtitle: 'For Platform Managers',
      description: 'Oversee platform operations with powerful management tools',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      accentColor: 'purple',
      features: [
        { name: 'Vendor & User Management', icon: Users },
        { name: 'Revenue Analytics Dashboard', icon: BarChart3 },
        { name: 'Support Ticket System', icon: Zap },
        { name: 'System Health Monitoring', icon: Shield }
      ],
      link: '/register/admin',
      popular: false,
      stats: 'Authorized Access',
      gradient: 'bg-gradient-to-br from-purple-50 via-white to-purple-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div 
            className="text-center mb-20"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-200 dark:border-gray-700">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Join the Future of Electronics Commerce</span>
            </div>
            
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
              Choose Your Path
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Become part of Pakistan's most trusted electronics marketplace. Whether you're selling, buying, or managing, we have the perfect solution for you.
            </p>
          </motion.div>

          {/* Signup Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {signupOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Link href={option.link}>
                  <Card className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 cursor-pointer group border-0 ${option.popular ? 'ring-2 ring-blue-500/50 shadow-xl' : 'shadow-lg hover:shadow-2xl'}`}>
                    {/* Popular Badge */}
                    {option.popular && (
                      <div className="absolute top-6 right-6 z-10">
                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${option.bgColor} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <CardHeader className="text-center pb-6 pt-8">
                        {/* Icon */}
                        <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}>
                          <option.icon className="h-12 w-12 text-white" />
                        </div>

                        {/* Title & Subtitle */}
                        <div className="mb-4">
                          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {option.title}
                          </CardTitle>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {option.subtitle}
                          </p>
                        </div>

                        {/* Description */}
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-4">
                          {option.description}
                        </CardDescription>

                        {/* Stats */}
                        <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1">
                          <div className={`w-2 h-2 rounded-full bg-${option.accentColor}-500`}></div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{option.stats}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 pb-8">
                        {/* Features */}
                        <div className="space-y-4 mb-8">
                          {option.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-3 group/feature">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0 group-hover/feature:scale-110 transition-transform duration-200`}>
                                <feature.icon className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                {feature.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* CTA Button */}
                        <Button 
                          className={`w-full bg-gradient-to-r ${option.color} hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-0 text-white font-semibold py-6 rounded-2xl`}
                          size="lg"
                        >
                          <span className="flex items-center justify-center gap-2">
                            Get Started as {option.title}
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </span>
                        </Button>
                      </CardContent>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div 
            className="text-center"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ ...fadeIn.transition, delay: 0.8 }}
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Already part of our community?
              </p>
              <Link href="/login">
                <Button variant="outline" size="lg" className="hover:bg-gray-50 dark:hover:bg-gray-800 border-2 rounded-xl px-8 py-3 font-semibold">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}



