"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api-client'

export type UserRole = 'vendor' | 'buyer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  businessName?: string
  phone?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    if (token && userData) setUser(JSON.parse(userData))
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res?.data?.success) {
        const { token, user } = res.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(user))
        setUser(user)
        return true
      }
    } catch (e) {}
    return false
  }

  const register = async (form: any): Promise<boolean> => {
    try {
      // Base payload for all roles
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role || 'vendor',
      }

      // Role-specific fields
      if (form.role === 'vendor') {
        payload.businessName = form.businessName
        payload.businessAddress = {
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || '',
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country || 'Pakistan',
        }
        payload.location = form.location
      }

      // Admin-specific fields
      if (form.role === 'admin') {
        payload.adminCode = form.adminCode
      }

      const res = await api.post('/auth/register', payload)
      return !!res?.data?.success
    } catch (e) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}