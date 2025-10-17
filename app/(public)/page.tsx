"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { 
  Package, 
  Calculator, 
  Store, 
  TrendingUp, 
  Shield, 
  Smartphone,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  BarChart3,
  Globe,
  Users,
  Clock,
  DollarSign,
  ShoppingBag,
  MessageCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const features = [
    {
      icon: Package,
      title: 'Smart Inventory Management',
      description: 'Track stock levels, manage variants with IMEI tracking, and get automated low-stock alerts. Perfect for mobile phone vendors managing multiple devices.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calculator,
      title: 'Financial Ledger & Accounting',
      description: 'Complete financial management with daily transaction tracking, profit/loss calculations, and automated invoice generation. Export reports to Excel and PDF.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Store,
      title: 'Professional Online Storefront',
      description: 'Beautiful, customizable storefront with custom domain support, WhatsApp integration, and mobile-optimized design. Get online in 15 minutes!',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Automated Device Specs',
      description: 'Auto-fetch mobile phone specifications from our API. No more manual data entry!'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track sales, inventory, and customer insights with comprehensive dashboards.'
    },
    {
      icon: Globe,
      title: 'Multi-language Support',
      description: 'Full Urdu and English support with RTL text rendering for Pakistani vendors.'
    },
    {
      icon: Users,
      title: 'Local Payment Gateways',
      description: 'Integrated with JazzCash and Easypaisa for seamless Pakistani payment processing.'
    }
  ]

  const stats = [
    { label: 'Active Vendors', value: '5,000+', icon: Users },
    { label: 'Products Listed', value: '250K+', icon: Package },
    { label: 'Monthly Transactions', value: '50K+', icon: DollarSign },
    { label: 'Customer Satisfaction', value: '98%', icon: Star }
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Sign Up',
      description: 'Register as a vendor in less than 2 minutes. Choose your subscription plan.',
      icon: Users
    },
    {
      step: '2',
      title: 'Add Products',
      description: 'Use our auto-fetch feature to add mobile phones with specifications instantly.',
      icon: Package
    },
    {
      step: '3',
      title: 'Manage Business',
      description: 'Track inventory, record sales, manage expenses, and generate reports.',
      icon: BarChart3
    },
    {
      step: '4',
      title: 'Get Customers',
      description: 'Your storefront goes live automatically. Customers find you online!',
      icon: ShoppingBag
    }
  ]

  const testimonials = [
    {
      name: 'Ahmed Khan',
      business: 'Tech Mobile Center, Lahore',
      rating: 5,
      text: 'VendorHub transformed my business completely. Sales increased 300% in just 6 months! The automated specs feature saves me hours every day.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      name: 'Fatima Ali',
      business: 'Audio Tech Store, Karachi',
      rating: 5,
      text: 'The inventory management is incredible. No more manual counting! Low stock alerts help me never run out of popular items.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      name: 'Hassan Sheikh',
      business: 'Digital Electronics, Islamabad',
      rating: 5,
      text: 'Professional storefront that brings customers directly to my shop. The WhatsApp integration is a game-changer for inquiries!',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: 'Rs. 0',
      period: 'Forever',
      features: [
        '50 Products',
        '100 Transactions/Month',
        'Basic Storefront',
        'Email Support',
        'Inventory Management',
        'Financial Ledger'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Basic',
      price: 'Rs. 2,500',
      period: 'per month',
      features: [
        '200 Products',
        '500 Transactions/Month',
        'Custom Themes',
        'WhatsApp Integration',
        'Priority Support',
        'Advanced Reports'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Pro',
      price: 'Rs. 5,000',
      period: 'per month',
      features: [
        '1,000 Products',
        'Unlimited Transactions',
        'Custom Domain',
        'Advanced Analytics',
        'Multi-location Support',
        'Priority Support'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Premium',
      price: 'Rs. 10,000',
      period: 'per month',
      features: [
        'Unlimited Products',
        'Unlimited Transactions',
        'API Access',
        'White-label Branding',
        'Dedicated Support',
        'Custom Integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn} className="text-center lg:text-left">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <span className="text-sm font-medium">🇵🇰 Made for Pakistani Vendors</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Digitize Your{' '}
                <span className="text-yellow-300">Electronics Business</span>
                {' '}in Pakistan
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Complete SaaS platform for Pakistani vendors managing mobile phones, 
                accessories, and electronics. Inventory management, financial ledger, 
                and professional storefront - all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/stores">
                  <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    Browse Stores
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                    <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-100">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                  alt="VendorHub Pakistan Dashboard"
                  width={800}
                  height={600}
                  className="rounded-2xl shadow-2xl border-4 border-white/20"
                />
              </div>
              <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-3xl transform rotate-6"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Three powerful modules designed specifically for Pakistani electronics vendors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Pakistani Vendors Choose Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Built specifically for the Pakistani market
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Go from signup to online store in just 15 minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                      {step.step}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start free, upgrade as you grow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative ${plan.popular ? 'lg:-mt-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <Card className={`h-full hover:shadow-xl transition-all ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      {plan.period !== 'Forever' && (
                        <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Success Stories from Pakistani Vendors
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of successful vendors already using VendorHub
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.business}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeIn} className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Electronics Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 5,000+ Pakistani vendors already using VendorHub to grow their business online
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  Login to Account
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Full support in Urdu & English</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  )
}

