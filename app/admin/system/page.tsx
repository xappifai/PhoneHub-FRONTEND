"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: string
  responseTime: number
  lastChecked: string
}

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'degraded'
  responseTime: number
  lastChecked: string
  uptime: string
}

interface ServerMetrics {
  cpu: number
  memory: number
  disk: number
  network: {
    inbound: number
    outbound: number
  }
}

export default function SystemHealth() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSystemHealth = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API calls
      const mockSystemHealth: SystemHealth = {
        status: 'healthy',
        uptime: '99.8%',
        responseTime: 145,
        lastChecked: new Date().toISOString()
      }

      const mockServices: ServiceStatus[] = [
        {
          name: 'API Server',
          status: 'online',
          responseTime: 45,
          lastChecked: new Date().toISOString(),
          uptime: '99.9%'
        },
        {
          name: 'Database',
          status: 'online',
          responseTime: 12,
          lastChecked: new Date().toISOString(),
          uptime: '99.8%'
        },
        {
          name: 'File Storage',
          status: 'online',
          responseTime: 89,
          lastChecked: new Date().toISOString(),
          uptime: '99.7%'
        },
        {
          name: 'Email Service',
          status: 'degraded',
          responseTime: 250,
          lastChecked: new Date().toISOString(),
          uptime: '98.5%'
        },
        {
          name: 'Payment Gateway',
          status: 'online',
          responseTime: 156,
          lastChecked: new Date().toISOString(),
          uptime: '99.6%'
        }
      ]

      const mockMetrics: ServerMetrics = {
        cpu: 45,
        memory: 67,
        disk: 34,
        network: {
          inbound: 125.6,
          outbound: 89.3
        }
      }

      setSystemHealth(mockSystemHealth)
      setServices(mockServices)
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error fetching system health:', error)
      toast.error('Failed to load system health data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'offline':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
      case 'degraded':
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Degraded</span>
      case 'offline':
      case 'critical':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Offline</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  useEffect(() => {
    fetchSystemHealth()
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="admin" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  System Health
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor system performance and service status
                </p>
              </div>
              <Button onClick={fetchSystemHealth} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* System Overview */}
            {systemHealth && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Overview
                  </CardTitle>
                  <CardDescription>
                    Overall system health and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {getStatusIcon(systemHealth.status)}
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                      <p className={`text-xl font-bold ${getHealthColor(systemHealth.status)}`}>
                        {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Server className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {systemHealth.uptime}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {systemHealth.responseTime}ms
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Checked</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(systemHealth.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Server Metrics */}
            {metrics && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Server Metrics
                  </CardTitle>
                  <CardDescription>
                    Real-time server resource utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{metrics.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${metrics.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{metrics.memory}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${metrics.memory}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Disk Space</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{metrics.disk}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${metrics.disk}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Network</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {metrics.network.inbound}↓ / {metrics.network.outbound}↑ MB/s
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Service Status
                </CardTitle>
                <CardDescription>
                  Monitor individual service health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No service data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            {getStatusIcon(service.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {service.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Response: {service.responseTime}ms • Uptime: {service.uptime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div>
                            {getStatusBadge(service.status)}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
