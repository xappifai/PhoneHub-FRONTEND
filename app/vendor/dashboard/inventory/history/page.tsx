"use client"

import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  History, 
  Search, 
  Calendar,
  Package,
  Edit,
  Trash2,
  ShoppingCart,
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useInventoryStore } from '@/store/inventory-store'
import Link from 'next/link'

export default function InventoryHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'add' | 'update' | 'delete' | 'sale' | 'adjustment'>('all')

  const history = useInventoryStore(s => s.history)
  const products = useInventoryStore(s => s.products)
  const loadHistory = useInventoryStore(s => s.loadHistory)
  const loadProducts = useInventoryStore(s => s.loadProducts)

  useEffect(() => {
    Promise.all([loadProducts(), loadHistory()]).catch(() => {})
  }, [loadProducts, loadHistory])

  // Filter history based on search and type
  const filteredHistory = history.filter(item => {
    const product = products.find(p => p.id === item.productId)
    const matchesSearch = !searchQuery || 
      product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'add': return <Package className="h-4 w-4" />
      case 'update': return <Edit className="h-4 w-4" />
      case 'delete': return <Trash2 className="h-4 w-4" />
      case 'sale': return <ShoppingCart className="h-4 w-4" />
      case 'adjustment': return <Settings className="h-4 w-4" />
      default: return <History className="h-4 w-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'add': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
      case 'update': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
      case 'delete': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
      case 'sale': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
      case 'adjustment': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  const getDescription = (item: typeof history[0]) => {
    const product = products.find(p => p.id === item.productId)
    const productName = product?.name || 'Unknown Product'
    
    switch (item.type) {
      case 'add':
        return `Added ${productName} (${item.quantityChange || 0} units)`
      case 'update':
        return `Updated ${productName}`
      case 'delete':
        return `Deleted ${productName} (${item.quantityChange || 0} units)`
      case 'sale':
        return `Sold ${Math.abs(item.quantityChange || 0)} units of ${productName}`
      case 'adjustment':
        return `Adjusted inventory for ${productName} (${item.quantityChange || 0})`
      default:
        return productName
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link href="/vendor/dashboard/inventory">
                    <Button variant="ghost" size="sm">← Back to Inventory</Button>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Inventory History
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track all changes and movements in your inventory
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {history.length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {history.filter(h => h.type === 'add').length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Additions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {history.filter(h => h.type === 'sale').length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sales</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {history.filter(h => h.type === 'update').length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Updates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-500">
                    {history.filter(h => h.type === 'delete').length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deletions</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by product name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="add">Additions</option>
                    <option value="update">Updates</option>
                    <option value="sale">Sales</option>
                    <option value="adjustment">Adjustments</option>
                    <option value="delete">Deletions</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* History Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline ({filteredHistory.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredHistory.length > 0 ? (
                  <div className="space-y-4">
                    {filteredHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <div className={`p-2 rounded-full ${getColor(item.type)}`}>
                          {getIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getDescription(item)}
                          </p>
                          {item.note && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Note: {item.note}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                            {item.quantityChange !== undefined && item.quantityChange !== 0 && (
                              <span className={`text-xs flex items-center gap-1 ${
                                item.quantityChange > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.quantityChange > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {Math.abs(item.quantityChange)} units
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getColor(item.type)}`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No history records found. Try adjusting your filters.
                    </p>
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

