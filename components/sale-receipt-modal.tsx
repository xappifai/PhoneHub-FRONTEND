"use client"

import React, { useRef } from 'react'
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Printer, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SaleReceiptData {
  invoiceNumber?: string
  saleDate: string
  product: {
    name: string
    brand: string
    model: string
  }
  buyer: {
    name: string
    phone: string
    cnic?: string
  }
  vendor: {
    name?: string
    address?: string
    phone?: string
    cnic?: string
  }
  sale: {
    quantity: number
    unitPrice: number
    totalAmount: number
    purchaseCost: number
    profit: number
  }
  imeis?: string[]
  colors?: string[]
}

interface SaleReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: SaleReceiptData | null
}

export default function SaleReceiptModal({ open, onOpenChange, receiptData }: SaleReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!receiptData) return null

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Sale Receipt - ${receiptData.invoiceNumber || 'INVOICE'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; }
            .label { font-weight: 500; color: #666; }
            .value { font-weight: bold; color: #000; }
            .profit { color: #059669; font-size: 18px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = () => {
    const content = printRef.current
    if (!content) return

    const dataStr = `data:text/html;charset=utf-8,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sale Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `)}`
    
    const downloadLink = document.createElement('a')
    downloadLink.href = dataStr
    downloadLink.download = `receipt-${receiptData.invoiceNumber || Date.now()}.html`
    downloadLink.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-6 w-6" />
          Sale Completed Successfully
        </DialogTitle>
        <DialogClose onClick={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <div ref={printRef} className="bg-white p-6 rounded-lg">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">SALE RECEIPT</h1>
            {receiptData.invoiceNumber && (
              <p className="text-lg text-gray-600 mt-2">Invoice: {receiptData.invoiceNumber}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Date: {new Date(receiptData.saleDate).toLocaleDateString()} {new Date(receiptData.saleDate).toLocaleTimeString()}
            </p>
          </div>

          {/* Buyer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-2">Buyer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-900">{receiptData.buyer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold text-gray-900">{receiptData.buyer.phone}</span>
              </div>
              {receiptData.buyer.cnic && (
                <div className="flex justify-between">
                  <span className="text-gray-600">CNIC:</span>
                  <span className="font-semibold text-gray-900">{receiptData.buyer.cnic}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-2">Product Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-semibold text-gray-900">{receiptData.product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brand:</span>
                <span className="font-semibold text-gray-900">{receiptData.product.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-semibold text-gray-900">{receiptData.product.model}</span>
              </div>
            </div>
          </div>

          {/* IMEI Numbers (if applicable) */}
          {receiptData.imeis && receiptData.imeis.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-2">IMEI Numbers</h3>
              <div className="bg-gray-50 p-3 rounded">
                {receiptData.imeis.map((imei, idx) => (
                  <div key={idx} className="font-mono text-sm text-gray-800">
                    {idx + 1}. {imei}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Colors (if applicable) */}
          {receiptData.colors && receiptData.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-2">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {receiptData.colors.map((color, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vendor Information */}
          {(receiptData.vendor.name || receiptData.vendor.address || receiptData.vendor.phone || receiptData.vendor.cnic) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-2">Vendor Information (Purchased From)</h3>
              <div className="space-y-2">
                {receiptData.vendor.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor Name:</span>
                    <span className="font-semibold text-gray-900">{receiptData.vendor.name}</span>
                  </div>
                )}
                {receiptData.vendor.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">{receiptData.vendor.phone}</span>
                  </div>
                )}
                {receiptData.vendor.cnic && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">CNIC:</span>
                    <span className="font-semibold text-gray-900">{receiptData.vendor.cnic}</span>
                  </div>
                )}
                {receiptData.vendor.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-semibold text-gray-900">{receiptData.vendor.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sale Summary */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-2">Sale Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold text-gray-900">{receiptData.sale.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(receiptData.sale.unitPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Cost:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(receiptData.sale.purchaseCost)}</span>
              </div>
              <div className="border-t-2 border-gray-300 my-2"></div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total Amount:</span>
                <span className="font-bold text-blue-600">{formatCurrency(receiptData.sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Profit:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(receiptData.sale.profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t border-gray-300">
            <p className="text-sm text-gray-600">Thank you for your business!</p>
            <p className="text-xs text-gray-500 mt-2">This is a computer-generated receipt</p>
          </div>
        </div>
      </DialogContent>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

