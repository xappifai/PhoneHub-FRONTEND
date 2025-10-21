"use client"

import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  Download,
  AlertCircle,
  History,
  TrendingUp,
  Package,
  ShoppingCart
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useInventoryStore, ProductItem } from '@/store/inventory-store'
import AddProductDialog from '@/components/add-product-dialog'
import EditProductDialog from '@/components/edit-product-dialog'
import ProductDetailModal from '@/components/product-detail-modal'
import SaleProductDialog from '@/components/sale-product-dialog'
import Image from 'next/image'
import Link from 'next/link'

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSaleOpen, setIsSaleOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)

  const products = useInventoryStore(s => s.products)
  const loadProducts = useInventoryStore(s => s.loadProducts)
  const deleteProduct = useInventoryStore(s => s.deleteProduct)
  const exportProductsCsv = useInventoryStore(s => s.exportProductsCsv)
  const addProduct = useInventoryStore(s => s.addProduct)
  const getStats = useInventoryStore(s => s.getStats)

  useEffect(() => {
    loadProducts().catch(() => {})
  }, [loadProducts])

  // Filter products based on search, category, stock status, and price range
  const filteredProducts = products.filter(product => {
    const q = (searchQuery || '').toLowerCase()
    const matchesSearch = product.name.toLowerCase().includes(q) ||
                         product.brand.toLowerCase().includes(q) ||
                         (product.sku || '').toLowerCase().includes(q) ||
                         (Array.isArray(product.imeiNumbers) && product.imeiNumbers.some(imei => (imei || '').toString().includes(searchQuery)))
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && product.quantity > product.minStock) ||
      (stockFilter === 'low-stock' && product.quantity > 0 && product.quantity <= product.minStock) ||
      (stockFilter === 'out-of-stock' && product.quantity === 0)
    
    const matchesPrice = 
      (!priceRange.min || product.sellingPrice >= parseFloat(priceRange.min)) &&
      (!priceRange.max || product.sellingPrice <= parseFloat(priceRange.max))
    
    return matchesSearch && matchesCategory && matchesStock && matchesPrice
  })

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const stats = getStats()

  const onExport = async () => {
    const csv = await exportProductsCsv()
    const blob = new Blob([csv as unknown as string], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importInputRef = React.useRef<HTMLInputElement | null>(null)
  const onImportClick = () => importInputRef.current?.click()
  const onImportFile = async (file?: File) => {
    if (!file) return
    const text = await file.text()
    // Basic CSV parsing
    const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean)
    const headers = headerLine.split(',')
    const objects = rows.map((line) => {
      const cols = line.match(/(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|[^,]+)/g) || []
      const values = cols.map((c) => c.replace(/^\"|\"$/g, '').replace(/\"\"/g, '"'))
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => (obj[h] = values[i] || ''))
      return obj
    })
    // Import each row via backend
    for (const row of objects) {
      const category = (row.category as any) || 'Custom'
      const imeiNumbers = row.imeiNumbers ? row.imeiNumbers.split(';').map(s => s.trim()).filter(Boolean) : []
      const payload: any = {
        name: row.name || 'Unnamed',
        brand: row.brand || '',
        model: row.model || '',
        category,
        subcategory: row.subcategory || undefined,
        sku: row.sku || '',
        barcode: row.barcode || undefined,
        description: row.description || undefined,
        purchasePrice: Number(row.purchasePrice || 0),
        sellingPrice: Number(row.sellingPrice || 0),
        quantity: Number(row.quantity || 0),
        minStock: Number(row.minStock || 0),
        featured: String(row.featured).toLowerCase() === 'true',
        onSale: String(row.onSale).toLowerCase() === 'true',
        images: [],
        specs: undefined,
        variants: [],
        imeiNumbers: imeiNumbers.length ? imeiNumbers : undefined,
      }
      try { await addProduct(payload as any) } catch {}
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' }
    if (stock <= minStock) return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' }
    return { label: 'In Stock', color: 'text-secondary bg-green-50 dark:bg-green-900/20' }
  }

  const handleEditProduct = (product: ProductItem) => {
    setSelectedProduct(product)
    setIsEditOpen(true)
  }

  const handleViewProduct = (product: ProductItem) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  const handleSaleProduct = (product: ProductItem) => {
    setSelectedProduct(product)
    setIsSaleOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(productId)
    }
  }

  // Low stock products
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock)

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Inventory Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your products, track stock levels, and organize your inventory
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={(e)=> onImportFile(e.target.files?.[0])} />
                <Link href="/vendor/dashboard/inventory/history">
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={onImportClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-secondary">
                    {products.filter(p => p.quantity > 5).length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Stock</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-500">
                    {products.filter(p => p.quantity === 0).length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alert Banner */}
            {lowStockProducts.length > 0 && (
              <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-200">
                        Low Stock Alert: {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                        {lowStockProducts.length > 3 && ` and ${lowStockProducts.length - 3} more`}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setStockFilter('low-stock')}>
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products, brands, or SKU/IMEI..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>

                    {/* Stock Status Filter */}
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Stock Status</option>
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                    
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                      <Filter className="h-4 w-4 mr-2" />
                      {showFilters ? 'Hide' : 'More'} Filters
                    </Button>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium mb-3">Price Range</p>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          className="w-32"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPriceRange({ min: '', max: '' })}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products ({filteredProducts.length})</CardTitle>
                  <div className="flex items-center space-x-2">
                    {selectedProducts.length > 0 && (
                      <Button variant="outline" size="sm">
                        Bulk Actions ({selectedProducts.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          SKU/IMEI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product.quantity, product.minStock)
                        return (
                          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleSelectProduct(product.id)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-14 w-14 flex-shrink-0 relative">
                                  {product.images?.[0]?.url ? (
                                    <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                      <Image
                                        src={product.images[0].url}
                                        alt={product.name}
                                        width={56}
                                        height={56}
                                        className="h-full w-full object-cover hover:scale-110 transition-transform duration-200"
                                      />
                                      {product.images.length > 1 && (
                                        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                          {product.images.length}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {product.brand} • {product.model}
                                  </div>
                                  {product.images && product.images.length > 1 && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      {product.images.length} images
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.category === 'Mobile Phones' && product.imeiNumbers && product.imeiNumbers.length > 0 ? (
                                <div className="max-w-xs">
                                  <div className="text-sm font-mono text-gray-900 dark:text-white truncate">
                                    {product.imeiNumbers.slice(0, 3).join(', ')}
                                  </div>
                                  {product.imeiNumbers.length > 3 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400" title={product.imeiNumbers.join(', ')}>
                                      +{product.imeiNumbers.length - 3} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs" title={product.sku}>
                                  {product.sku || '-'}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                  {stockStatus.label}
                                </span>
                                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                  ({product.quantity})
                                </span>
                                {product.quantity <= product.minStock && product.quantity > 0 && (
                                  <AlertCircle className="ml-1 h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              <div>
                                <span className="font-semibold">{formatCurrency(product.sellingPrice)}</span>
                                {product.category === 'Mobile Phones' && product.individualSellingPrices && product.individualSellingPrices.length > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={product.individualSellingPrices.map(price => formatCurrency(price)).join(', ')}>
                                    Per-device: {product.individualSellingPrices.slice(0,3).map(price => formatCurrency(price)).join(', ')}
                                    {product.individualSellingPrices.length > 3 && ` +${product.individualSellingPrices.length - 3} more`}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-green-600 hover:text-green-700" 
                                  onClick={() => handleSaleProduct(product)}
                                  disabled={product.quantity === 0}
                                  title="Sale Product"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewProduct(product)} title="View Details">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditProduct(product)} title="Edit Product">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteProduct(product.id)} title="Delete Product">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      No products found. Try adjusting your search or filters.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AddProductDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <EditProductDialog open={isEditOpen} onOpenChange={setIsEditOpen} product={selectedProduct} />
      <ProductDetailModal open={isDetailOpen} onOpenChange={setIsDetailOpen} product={selectedProduct as any} viewerRole="vendor" />
      <SaleProductDialog open={isSaleOpen} onOpenChange={setIsSaleOpen} product={selectedProduct} />
    </ProtectedRoute>
  )
}