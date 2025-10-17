"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Package, 
  Calculator, 
  Store, 
  CreditCard, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Home,
  Users,
  HelpCircle,
  TrendingUp,
  Activity,
  Heart,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface DashboardSidebarProps {
  userRole: 'vendor' | 'admin' | 'buyer'
}

const vendorNavItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/vendor/dashboard', icon: BarChart3 },
  { label: 'Inventory', href: '/vendor/dashboard/inventory', icon: Package },
  { label: 'Ledger', href: '/vendor/dashboard/ledger', icon: Calculator },
  { label: 'Storefront', href: '/vendor/dashboard/storefront', icon: Store },
  { label: 'Subscriptions', href: '/vendor/dashboard/subscriptions', icon: CreditCard },
  { label: 'Reports', href: '/vendor/dashboard/reports', icon: FileText },
  { label: 'Settings', href: '/vendor/dashboard/settings', icon: Settings },
]

const buyerNavItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/buyer/dashboard', icon: BarChart3 },
  { label: 'Marketplace', href: '/buyer/dashboard/marketplace', icon: Store },
  { label: 'Wishlist', href: '/buyer/dashboard/wishlist', icon: Heart },
  { label: 'Compare', href: '/buyer/dashboard/compare', icon: TrendingUp },
  { label: 'Recently Viewed', href: '/buyer/dashboard/recent', icon: Eye },
  { label: 'Profile', href: '/buyer/dashboard/profile', icon: Users },
  { label: 'Settings', href: '/buyer/dashboard/settings', icon: Settings },
]

const adminNavItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Vendor Management', href: '/admin/vendors', icon: Users },
  { label: 'Subscription Monitoring', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Revenue Analytics', href: '/admin/analytics', icon: TrendingUp },
  { label: 'Support Tickets', href: '/admin/support', icon: HelpCircle },
  { label: 'System Health', href: '/admin/system', icon: Activity },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  const navItems = userRole === 'admin' ? adminNavItems : userRole === 'buyer' ? buyerNavItems : vendorNavItems

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VH</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            VendorHub
          </span>
        </Link>
        
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">Back to Site</span>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 fixed left-0 top-0 h-full z-30">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}