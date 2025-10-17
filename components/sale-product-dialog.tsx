"use client"

import React, { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ProductItem, useInventoryStore } from '@/store/inventory-store'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'
import api from '@/lib/api-client'
import SaleReceiptModal from './sale-receipt-modal'

const schema = z.object({
  buyerName: z.string().min(2, 'Buyer name is required'),
  buyerPhone: z.string().min(10, 'Valid phone number is required'),
  buyerCnic: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be positive'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  color: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SaleProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductItem | null
}

export default function SaleProductDialog({ open, onOpenChange, product }: SaleProductDialogProps) {
  const updateProduct = useInventoryStore((s) => s.updateProduct)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      quantity: 1,
    },
  })

  const quantity = watch('quantity')
  const sellingPrice = watch('sellingPrice')
  const [selectedImeis, setSelectedImeis] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [saleData, setSaleData] = useState<any>(null)

  // Calculate profit
  const totalSaleAmount = (sellingPrice || 0) * (quantity || 0)
  const totalPurchaseCost = (product?.purchasePrice || 0) * (quantity || 0)
  const profitAmount = totalSaleAmount - totalPurchaseCost
  const profitPercentage = totalPurchaseCost > 0 ? ((profitAmount / totalPurchaseCost) * 100).toFixed(2) : '0'

  useEffect(() => {
    if (product && open) {
      reset({
        buyerName: '',
        buyerPhone: '',
        buyerCnic: '',
        sellingPrice: product.sellingPrice,
        quantity: 1,
        color: '',
      })
      setSelectedImeis([])
      setSelectedColors([])
      setShowReceipt(false)
      setSaleData(null)
    }
  }, [product, open, reset])

  // For mobile phones with IMEI tracking
  const availableImeis = product?.category === 'Mobile Phones' && product.imeiNumbers 
    ? product.imeiNumbers 
    : []

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!product) return

    try {
      // Validate quantity
      if (data.quantity > product.quantity) {
        toast.error(`Only ${product.quantity} items available in stock`)
        return
      }

      // For mobile phones, validate IMEI selection
      if (product.category === 'Mobile Phones' && availableImeis.length > 0) {
        if (selectedImeis.length !== data.quantity) {
          toast.error(`Please select ${data.quantity} IMEI number(s)`)
          return
        }
      }

      // Prepare sale data for backend
      const salePayload = {
        date: new Date().toISOString(),
        products: [{
          productId: product.id,
          quantity: data.quantity,
          unitPrice: data.sellingPrice,
          soldImeiNumbers: selectedImeis.length > 0 ? selectedImeis : undefined
        }],
        customerName: data.buyerName,
        customerPhone: data.buyerPhone,
        customerCnic: data.buyerCnic,
        soldImeiNumbers: selectedImeis,
        soldColors: product.category === 'Mobile Phones' && selectedImeis.length > 0 
          ? selectedImeis.map(imei => {
              const index = product.imeiNumbers?.indexOf(imei) || -1
              return index >= 0 && product.colors ? product.colors[index] : data.color
            }).filter(Boolean)
          : (data.color ? [data.color] : []),
        paymentMethod: 'Cash',
        notes: `Sale of ${product.name}`
      }

      // Save sale to backend
      const response = await api.post('/transactions/sale', salePayload)
      const transactionData = response.data?.data

      // Prepare receipt data
      const receiptData = {
        invoiceNumber: transactionData?.invoiceNumber,
        saleDate: new Date().toISOString(),
        product: {
          name: product.name,
          brand: product.brand,
          model: product.model
        },
        buyer: {
          name: data.buyerName,
          phone: data.buyerPhone,
          cnic: data.buyerCnic
        },
        vendor: {
          name: product.purchaseFromName,
          address: product.purchaseFromAddress,
          phone: product.purchaseFromPhone,
          cnic: product.purchaseFromCnic
        },
        sale: {
          quantity: data.quantity,
          unitPrice: data.sellingPrice,
          totalAmount: totalSaleAmount,
          purchaseCost: totalPurchaseCost,
          profit: profitAmount
        },
        imeis: selectedImeis.length > 0 ? selectedImeis : undefined,
        colors: salePayload.soldColors.length > 0 ? salePayload.soldColors : undefined
      }

      setSaleData(receiptData)
      
      // Check if product will be completely sold out
      const remainingQuantity = product.quantity - data.quantity
      
      if (remainingQuantity > 0) {
        // Update product quantity if still in stock
        await updateProduct(product.id, {
          quantity: remainingQuantity,
          imeiNumbers: product.imeiNumbers?.filter(imei => !selectedImeis.includes(imei)),
          colors: product.colors?.filter((_, idx) => {
            const imei = product.imeiNumbers?.[idx]
            return imei ? !selectedImeis.includes(imei) : true
          }),
          individualSellingPrices: product.individualSellingPrices?.filter((_, idx) => {
            const imei = product.imeiNumbers?.[idx]
            return imei ? !selectedImeis.includes(imei) : true
          })
        })
      } else {
        // Product will be completely sold out - backend will handle deletion
        // Just reload the products list to remove it from inventory
        const loadProducts = useInventoryStore.getState().loadProducts
        await loadProducts()
      }

      toast.success(`Successfully sold ${data.quantity} ${product.name}`)
      
      // Close sale dialog and show receipt
      onOpenChange(false)
      setShowReceipt(true)
    } catch (error: any) {
      console.error('Error recording sale:', error)
      toast.error(`Failed to record sale: ${error.response?.data?.message || error.message || 'Please try again.'}`)
    }
  }

  const handleImeiToggle = (imei: string) => {
    setSelectedImeis(prev => {
      if (prev.includes(imei)) {
        return prev.filter(i => i !== imei)
      } else {
        if (prev.length >= quantity) {
          toast.error(`You can only select ${quantity} IMEI number(s)`)
          return prev
        }
        return [...prev, imei]
      }
    })
  }

  if (!product) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Sale Product - {product.name}
        </DialogTitle>
        <DialogClose onClick={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Product Info Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Product:</span>
                  <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Available Stock:</span>
                  <span className="text-sm font-semibold text-gray-900">{product.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Default Price:</span>
                  <span className="text-sm font-semibold text-gray-900">${product.sellingPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buyer Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Buyer Name *</label>
                <Input {...register('buyerName')} placeholder="e.g., John Doe" />
                {errors.buyerName && <p className="text-sm text-red-500 mt-1">{errors.buyerName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number *</label>
                <Input {...register('buyerPhone')} placeholder="e.g., +92 300 1234567" />
                {errors.buyerPhone && <p className="text-sm text-red-500 mt-1">{errors.buyerPhone.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">CNIC (Optional)</label>
                <Input {...register('buyerCnic')} placeholder="e.g., 12345-1234567-1" />
                {errors.buyerCnic && <p className="text-sm text-red-500 mt-1">{errors.buyerCnic.message}</p>}
              </div>
            </div>
          </div>

          {/* Sale Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sale Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Selling Price *</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...register('sellingPrice')} 
                  placeholder="0.00" 
                />
                {errors.sellingPrice && <p className="text-sm text-red-500 mt-1">{errors.sellingPrice.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <Input 
                  type="number" 
                  {...register('quantity')} 
                  placeholder="1"
                  max={product.quantity}
                />
                {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>}
              </div>
              {product.category !== 'Mobile Phones' && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Color (Optional)</label>
                  <Input {...register('color')} placeholder="e.g., Black, Silver" />
                  {errors.color && <p className="text-sm text-red-500 mt-1">{errors.color.message}</p>}
                </div>
              )}
            </div>
          </div>

          {/* IMEI Selection for Mobile Phones */}
          {product.category === 'Mobile Phones' && availableImeis.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select IMEI Numbers ({selectedImeis.length}/{quantity})
              </h3>
              <div className="grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {availableImeis.map((imei, index) => (
                  <div
                    key={imei}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedImeis.includes(imei)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleImeiToggle(imei)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{imei}</p>
                        {product.colors && product.colors[index] && (
                          <p className="text-xs text-gray-500">Color: {product.colors[index]}</p>
                        )}
                        {product.individualSellingPrices && product.individualSellingPrices[index] && (
                          <p className="text-xs text-gray-500">Price: ${product.individualSellingPrices[index]}</p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedImeis.includes(imei)}
                        onChange={() => handleImeiToggle(imei)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profit Calculation */}
          <div className="border-t border-gray-200 pt-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 mb-3">Profit Calculation</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Purchase Cost (per unit):</span>
                <span className="text-sm font-medium text-gray-900">${product?.purchasePrice || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Selling Price (per unit):</span>
                <span className="text-sm font-medium text-gray-900">${sellingPrice || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="text-sm font-medium text-gray-900">{quantity || 0}</span>
              </div>
              <div className="border-t border-green-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Purchase Cost:</span>
                <span className="text-sm font-medium text-gray-900">${totalPurchaseCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sale Amount:</span>
                <span className="text-sm font-medium text-gray-900">${totalSaleAmount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-green-300 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Profit:</span>
                <div className="text-right">
                  <span className={`text-xl font-bold ${profitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profitAmount.toFixed(2)}
                  </span>
                  <span className="text-xs ml-2 text-gray-600">
                    ({profitPercentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${totalSaleAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </form>
      </DialogContent>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit as any)}
          disabled={isSubmitting}
          className="min-w-[120px]"
          type="button"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            'Complete Sale'
          )}
        </Button>
      </DialogFooter>
    </Dialog>
    
    {/* Receipt Modal */}
    <SaleReceiptModal 
      open={showReceipt} 
      onOpenChange={setShowReceipt} 
      receiptData={saleData} 
    />
    </>
  )
}

