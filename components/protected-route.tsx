"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/contexts/auth-context'
import { motion } from 'framer-motion'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'vendor':
            router.push('/vendor/dashboard')
            break
          case 'buyer':
            router.push('/buyer/dashboard')
            break
          default:
            router.push('/')
        }
        return
      }
    }
  }, [user, isLoading, router, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}