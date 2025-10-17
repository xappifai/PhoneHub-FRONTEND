"use client"

import React, { useState } from 'react'
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogContent } from '@/components/ui/dialog'
import { ProductItem } from '@/store/inventory-store'
import { formatCurrency } from '@/lib/utils'
import { Badge, Star, Package, AlertCircle, Calendar, Tag, Barcode } from 'lucide-react'
import Image from 'next/image'

interface ProductDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductItem | null
}

export default function ProductDetailModal({ open, onOpenChange, product }: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!product) return null

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-500' }
    if (quantity <= minStock) return { label: 'Low Stock', color: 'bg-yellow-500' }
    return { label: 'In Stock', color: 'bg-green-500' }
  }

  const stockStatus = getStockStatus(product.quantity, product.minStock)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Product Details</DialogTitle>
        <DialogClose onClick={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <>
                {/* Main Image Display */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[selectedImageIndex]?.url || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Image Counter */}
                <div className="text-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Image {selectedImageIndex + 1} of {product.images.length}
                  </span>
                </div>

                {/* Thumbnail Grid */}
                {product.images.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">All Images</p>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {product.images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                            selectedImageIndex === idx 
                              ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={img.url} 
                            alt={`${product.name} ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700">
                <Package className="h-24 w-24 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No images available</p>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg text-gray-600 dark:text-gray-400">{product.brand} • {product.model}</span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                )}
                {product.onSale && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs font-medium rounded">
                    <Tag className="h-3 w-3" /> On Sale
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Purchase Price</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(product.purchasePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.category === 'Mobile Phones' && product.individualSellingPrices && product.individualSellingPrices.length > 0 
                      ? 'Average Selling Price' 
                      : 'Selling Price'
                    }
                  </p>
                  <p className="text-xl font-semibold text-secondary">
                    {formatCurrency(product.sellingPrice)}
                  </p>
                </div>
              </div>
              
              {/* Individual Selling Prices for Mobile Phones */}
              {product.category === 'Mobile Phones' && product.individualSellingPrices && product.individualSellingPrices.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Individual Device Prices</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.individualSellingPrices.map((price, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-900 px-3 py-2 rounded-md">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Device {idx + 1}</div>
                        <div className="text-sm font-semibold text-secondary">{formatCurrency(price)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(product.sellingPrice - product.purchasePrice)} ({((product.sellingPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(1)}%)
                </p>
              </div>
            </div>

            {/* Stock Status */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${stockStatus.color}`} />
                  <span className="font-medium">{stockStatus.label}</span>
                </div>
                <span className="text-2xl font-bold">{product.quantity}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Minimum stock level: {product.minStock}
              </p>
              {product.quantity <= product.minStock && product.quantity > 0 && (
                <div className="mt-2 flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Low stock alert!</span>
                </div>
              )}
            </div>

            {/* Category and Identifiers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                <p className="font-medium text-gray-900 dark:text-white">{product.category}</p>
                {product.subcategory && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{product.subcategory}</p>
                )}
              </div>
              {product.category !== 'Mobile Phones' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SKU</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">{product.sku}</p>
                  {product.barcode && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{product.barcode}</p>
                  )}
                </div>
              )}
              {product.barcode && product.category === 'Mobile Phones' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Barcode</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">{product.barcode}</p>
                </div>
              )}
            </div>

            {/* Device Details for Mobile Phones */}
            {product.category === 'Mobile Phones' && product.imeiNumbers && product.imeiNumbers.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Device Inventory ({product.imeiNumbers.length} devices)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Individual device tracking and details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {product.imeiNumbers.map((imei, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        {/* Device Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Device {idx + 1}</span>
                          </div>
                        </div>
                        
                        {/* IMEI */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">IMEI Number</div>
                          <div className="text-sm font-mono text-gray-900 dark:text-white font-medium break-all">{imei}</div>
                        </div>
                        
                        {/* Color and Price in a row */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Color */}
                          {product.colors && product.colors[idx] && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-200 dark:border-purple-800">
                              <div className="text-xs text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Color</div>
                              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">{product.colors[idx]}</div>
                            </div>
                          )}
                          
                          {/* Individual Price */}
                          {product.individualSellingPrices && product.individualSellingPrices[idx] !== undefined && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                              <div className="text-xs text-green-600 dark:text-green-400 mb-1 uppercase tracking-wide">Price</div>
                              <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                                {formatCurrency(product.individualSellingPrices[idx])}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color Information for Same Color Variant */}
            {product.category === 'Mobile Phones' && product.colorVariant === 'same' && product.colors && product.colors[0] && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Device Color</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="text-lg font-medium text-purple-600 dark:text-purple-400">{product.colors[0]}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">All {product.quantity} devices</div>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Product Description</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{product.description}</p>
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Technical Specifications</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    value && (
                      <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize font-medium">{key}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3" />
                <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Updated: {new Date(product.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

