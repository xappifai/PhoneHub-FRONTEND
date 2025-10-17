"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { fetchDeviceSpecs, getBrands, getModels } from '@/lib/specs-api'
import { useInventoryStore, ProductCategory, ProductItem } from '@/store/inventory-store'
import { Upload, ImageIcon, Info, X } from 'lucide-react'
import { deleteFileFromFirebase, uploadFileToFirebase, compressImageForUpload } from '@/lib/firebase-client'
import toast from 'react-hot-toast'

const CATEGORY_LITERALS = [
  'Mobile Phones',
  'Accessories',
  'Smartwatches',
  'Audio Devices',
  'Tablets',
  'Laptops',
  'Custom',
] as const
const categories: ProductCategory[] = CATEGORY_LITERALS as unknown as ProductCategory[]

const schema = z.object({
  name: z.string().optional(),
  brand: z.string().default(''),
  model: z.string().default(''),
  category: z.enum(CATEGORY_LITERALS),
  subcategory: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0),
  featured: z.boolean().default(false),
  onSale: z.boolean().default(false),
  images: z
    .any()
    .refine((files: FileList | undefined) => !files || files.length <= 10, 'Max 10 images allowed')
    .refine(
      (files: FileList | undefined) =>
        !files || Array.from(files).every((f) => f.size <= 5 * 1024 * 1024),
      'Each image must be <= 5MB'
    )
    .refine(
      (files: FileList | undefined) =>
        !files || Array.from(files).every((f) => /(jpe?g|png|webp)$/i.test(f.name)),
      'Allowed formats: JPG, PNG, WebP'
    )
    .optional()
}).refine((data) => {
  // For mobile phones, require brand, model, and quantity
  if (data.category === 'Mobile Phones') {
    if (!data.brand || !data.model || data.quantity <= 0) {
      return false
    }
  } else {
    // For other categories, require name and sku
    if (!data.name || data.name.length < 2 || !data.sku || data.sku.length < 1) {
      return false
    }
  }
  // Validation: minStock should not be greater than quantity
  return data.minStock <= data.quantity
}, {
  message: "Please fill in all required fields",
  path: ["name"]
})

type FormValues = z.output<typeof schema>

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductItem | null
}

export default function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const updateProduct = useInventoryStore((s) => s.updateProduct)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  })

  const selectedCategory = watch('category')
  const brand = watch('brand')
  const model = watch('model')
  const quantity = watch('quantity')
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [existingImages, setExistingImages] = useState<Array<{ id: string; url: string }>>([])
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([])
  const [uploadPreview, setUploadPreview] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imeiNumbers, setImeiNumbers] = useState<string[]>([])
  const [sellingPrices, setSellingPrices] = useState<number[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [colorVariant, setColorVariant] = useState<'same' | 'different'>('same')
  const [priceVariant, setPriceVariant] = useState<'same' | 'different'>('same')
  const [singleColor, setSingleColor] = useState('')

  const [brandOptions, setBrandOptions] = useState<string[]>([])
  const [modelOptions, setModelOptions] = useState<string[]>([])
  
  React.useEffect(() => { getBrands().then(setBrandOptions) }, [])
  React.useEffect(() => { if (brand) getModels(brand).then(setModelOptions) }, [brand])

  // Update IMEI, selling price, and color arrays when quantity changes
  React.useEffect(() => {
    if (selectedCategory === 'Mobile Phones' && quantity > 0) {
      // Use functional updates to avoid circular dependency
      setImeiNumbers(prevImeiNumbers => {
        const newImeiNumbers = Array(quantity).fill('').map((_, i) => prevImeiNumbers[i] || '')
        return newImeiNumbers
      })
      
      if (priceVariant === 'different') {
        setSellingPrices(prevSellingPrices => {
          const newSellingPrices = Array(quantity).fill(0).map((_, i) => prevSellingPrices[i] || 0)
          return newSellingPrices
        })
      }
      
      if (colorVariant === 'different') {
        setColors(prevColors => {
          const newColors = Array(quantity).fill('').map((_, i) => prevColors[i] || '')
          return newColors
        })
      }
    }
  }, [quantity, selectedCategory, colorVariant, priceVariant])

  // Load product data when dialog opens
  useEffect(() => {
    if (product && open) {
      reset({
        name: product.name,
        brand: product.brand,
        model: product.model,
        category: product.category,
        subcategory: product.subcategory || '',
        sku: product.sku,
        barcode: product.barcode || '',
        description: product.description || '',
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        minStock: product.minStock,
        featured: product.featured || false,
        onSale: product.onSale || false,
      })
      // Normalize specs keys coming from store to UI labels
      const specsRecord: Record<string, string> = {}
      if (product.specs) {
        Object.entries(product.specs).forEach(([key, value]) => {
          if (!value) return
          const lower = key.toLowerCase()
          let uiKey = key
          if (lower === 'screen') uiKey = 'Screen'
          else if (lower === 'ram') uiKey = 'RAM'
          else if (lower === 'storage') uiKey = 'Storage'
          else if (lower === 'camera') uiKey = 'Camera'
          else if (lower === 'battery') uiKey = 'Battery'
          else if (lower === 'processor') uiKey = 'Processor'
          else if (lower === 'os') uiKey = 'OS'
          else uiKey = key.charAt(0).toUpperCase() + key.slice(1)
          specsRecord[uiKey] = value
        })
      }
      setSpecs(specsRecord)
      setExistingImages(product.images || [])
      setUploadPreview([])
      
      // Load IMEI numbers and individual selling prices for mobile phones
      if (product.category === 'Mobile Phones') {
        setImeiNumbers(product.imeiNumbers || [])
        setSellingPrices(product.individualSellingPrices || [])
        setColors(product.colors || [])
        setColorVariant(product.colorVariant || 'same')
        setPriceVariant(product.priceVariant || 'same')
        // Set single color if using same color variant
        if (product.colorVariant === 'same' && product.colors && product.colors.length > 0) {
          setSingleColor(product.colors[0])
        } else {
          setSingleColor('')
        }
      } else {
        setImeiNumbers([])
        setSellingPrices([])
        setColors([])
        setColorVariant('same')
        setPriceVariant('same')
        setSingleColor('')
      }
    }
  }, [product, open, reset])

  async function onFetchSpecs() {
    try {
      const result = await fetchDeviceSpecs(brand || '', model || '')
      if (result) {
        const mapped: Record<string, string> = {
          Screen: result.screen || '',
          RAM: result.ram || '',
          Storage: result.storage || '',
          Camera: result.camera || '',
          Battery: result.battery || '',
          Processor: result.processor || '',
          OS: result.os || '',
        }
        setSpecs(mapped)
        toast.success('Specifications loaded')
      } else {
        toast.error('No specs found for selected brand/model')
      }
    } catch (e) {
      toast.error('Failed to fetch specifications')
    }
  }

  function handleImagesChange(files?: FileList) {
    if (!files || files.length === 0) {
      setUploadPreview([])
      setSelectedFiles([])
      return
    }
    
    const previews: string[] = new Array(files.length)
    let loadedCount = 0
    
    const arr = Array.from(files)
    setSelectedFiles(arr)
    arr.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = () => {
        previews[index] = String(reader.result)
        loadedCount++
        if (loadedCount === files.length) {
          setUploadPreview(previews)
        }
      }
      reader.onerror = () => {
        console.error('Error reading file:', file.name)
        loadedCount++
        if (loadedCount === files.length) {
          setUploadPreview(previews.filter(preview => preview)) // Remove undefined entries
        }
      }
      reader.readAsDataURL(file)
    })
  }

  function removeExistingImage(id: string) {
    setExistingImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.url) setRemovedImageUrls((r) => Array.from(new Set([...r, img.url])))
      return prev.filter(img => img.id !== id)
    })
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!product) return

    try {
      // Additional validation for mobile phones
      if (selectedCategory === 'Mobile Phones') {
        if (!data.brand || !data.model) {
          toast.error('Please select both brand and model for mobile phones')
          return
        }
        if (data.quantity <= 0) {
          toast.error('Please enter a valid quantity')
          return
        }
      } else {
        if (!data.name || data.name.length < 2) {
          toast.error('Please enter a valid product name')
          return
        }
        if (!data.sku || data.sku.length < 1) {
          toast.error('Please enter a valid SKU')
          return
        }
      }

      // Process uploaded images
      const filesToUpload = selectedFiles.length > 0
        ? selectedFiles
        : Array.from((data.images as FileList) || [])
      const uploadedUrls: { url: string; name?: string; size?: number }[] = []
      for (const f of filesToUpload) {
        const compressed = await compressImageForUpload(f, { maxDimension: 1600, quality: 0.8 })
        const url = await uploadFileToFirebase(compressed, 'products')
        uploadedUrls.push({ url, name: f.name, size: f.size })
      }
      const productPayload: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt' | 'images'> = {
        name: selectedCategory === 'Mobile Phones' ? (data.model || '') : (data.name || ''),
        brand: data.brand || '',
        model: data.model || '',
        category: data.category,
        subcategory: data.subcategory,
        sku: selectedCategory === 'Mobile Phones' 
          ? '' // Will be set automatically in the store from IMEI numbers
          : data.sku || '',
        barcode: data.barcode,
        description: data.description,
        purchasePrice: data.purchasePrice,
        sellingPrice: (selectedCategory === 'Mobile Phones' && priceVariant === 'different')
          ? (sellingPrices.filter(price => price > 0).length > 0
              ? (sellingPrices.filter(price => price > 0).reduce((sum, price) => sum + price, 0) / sellingPrices.filter(price => price > 0).length)
              : data.sellingPrice)
          : data.sellingPrice,
        quantity: data.quantity,
        minStock: data.minStock,
        featured: !!data.featured,
        onSale: !!data.onSale,
        imeiNumbers: selectedCategory === 'Mobile Phones' ? imeiNumbers.filter(imei => imei.trim() !== '') : undefined,
        individualSellingPrices: (selectedCategory === 'Mobile Phones' && priceVariant === 'different')
          ? ((sellingPrices.filter(price => price > 0).length > 0) ? sellingPrices.filter(price => price > 0) : undefined)
          : undefined,
        colors: selectedCategory === 'Mobile Phones' 
          ? (colorVariant === 'same' 
              ? (singleColor.trim() !== '' ? Array(data.quantity).fill(singleColor.trim()) : undefined)
              : colors.filter(color => color.trim() !== '').length > 0 ? colors.filter(color => color.trim() !== '') : undefined)
          : undefined,
        colorVariant: selectedCategory === 'Mobile Phones' ? colorVariant : undefined,
        priceVariant: selectedCategory === 'Mobile Phones' ? priceVariant : undefined,
        specs: Object.fromEntries(Object.entries(specs).map(([k, v]) => [k.toLowerCase(), v])),
      }
      await updateProduct(product.id, { ...productPayload, images: [...existingImages, ...uploadedUrls] as any })
      if (removedImageUrls.length) {
        for (const url of removedImageUrls) {
          await deleteFileFromFirebase(url)
        }
        setRemovedImageUrls([])
      }
      toast.success('Product updated successfully!')
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product. Please try again.')
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogClose onClick={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        {/* Category */}
        <div className="mb-6">
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Auto-fetch specs */}
        {selectedCategory === 'Mobile Phones' && (
          <Card className="mb-6 border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Device Configuration</h3>
                  <p className="text-sm text-gray-600">Configure your mobile phone inventory details</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <select
                      {...register('brand')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    >
                      <option value="">Select brand</option>
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                    <select
                      {...register('model')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    >
                      <option value="">Select model</option>
                      {modelOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <Input 
                      type="number" 
                      {...register('quantity')} 
                      className="px-4 py-3 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                    {errors.quantity && <p className="text-sm text-red-500 mt-1">{String(errors.quantity.message)}</p>}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Button 
                    type="button" 
                    onClick={onFetchSpecs}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200"
                  >
                    🔄 Fetch Specifications
                  </Button>
                </div>

                {/* Color and Price Variant Configuration */}
                {quantity > 0 && (
                  <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Configuration</label>
                        <select
                          value={colorVariant}
                          onChange={(e) => setColorVariant(e.target.value as 'same' | 'different')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        >
                          <option value="same">Same color for all devices</option>
                          <option value="different">Different colors per device</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Configuration</label>
                        <select
                          value={priceVariant}
                          onChange={(e) => setPriceVariant(e.target.value as 'same' | 'different')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        >
                          <option value="same">Same price for all devices</option>
                          <option value="different">Different prices per device</option>
                        </select>
                      </div>
                    </div>

                    {/* Single Color Input */}
                    {colorVariant === 'same' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Device Color</label>
                        <Input
                          value={singleColor}
                          onChange={(e) => setSingleColor(e.target.value)}
                          placeholder="e.g., Space Black, Silver, Blue"
                          className="px-4 py-3 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic IMEI, Color, and Selling Price fields */}
              {quantity > 0 && (
                <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="font-medium text-gray-900">IMEI Numbers</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Editable</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: quantity }, (_, i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Device {i + 1}</label>
                          <Input
                            value={imeiNumbers[i] || ''}
                            onChange={(e) => {
                              const newImeiNumbers = [...imeiNumbers]
                              newImeiNumbers[i] = e.target.value
                              setImeiNumbers(newImeiNumbers)
                            }}
                            placeholder={`IMEI ${i + 1}`}
                            className="font-mono text-sm border-gray-200 focus:border-green-400 focus:ring-green-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Color Fields */}
                  {colorVariant === 'different' && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <h4 className="font-medium text-gray-900">Device Colors</h4>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Individual Colors</span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: quantity }, (_, i) => (
                          <div key={i} className="space-y-1">
                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Device {i + 1} Color</label>
                            <Input
                              value={colors[i] || ''}
                              onChange={(e) => {
                                const newColors = [...colors]
                                newColors[i] = e.target.value
                                setColors(newColors)
                              }}
                              placeholder="e.g., Space Black"
                              className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Selling Price Fields */}
                  {priceVariant === 'different' && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h4 className="font-medium text-gray-900">Individual Selling Prices</h4>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Per Device</span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: quantity }, (_, i) => (
                          <div key={i} className="space-y-1">
                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Device {i + 1} Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={sellingPrices[i] || ''}
                                onChange={(e) => {
                                  const newSellingPrices = [...sellingPrices]
                                  newSellingPrices[i] = parseFloat(e.target.value) || 0
                                  setSellingPrices(newSellingPrices)
                                }}
                                placeholder="0.00"
                                className="pl-8 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product core fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {selectedCategory !== 'Mobile Phones' && (
            <div>
              <label className="text-sm font-medium">Product Name *</label>
              <Input {...register('name')} placeholder="e.g., Galaxy S24 Ultra" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{String(errors.name.message)}</p>}
            </div>
          )}
          {selectedCategory !== 'Mobile Phones' && (
            <div>
              <label className="text-sm font-medium">SKU *</label>
              <Input {...register('sku')} placeholder="SAM-S24U-512-BLK" />
              {errors.sku && <p className="text-sm text-red-500 mt-1">{String(errors.sku.message)}</p>}
            </div>
          )}
          {selectedCategory === 'Mobile Phones' && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 italic">
                Product name is automatically set to the selected model. Individual IMEI numbers and prices are managed above.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register('description')}
            placeholder="Product description..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Pricing and stock */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium">Purchase Price</label>
            <Input type="number" step="0.01" {...register('purchasePrice')} />
          </div>
          {selectedCategory !== 'Mobile Phones' && (
            <div>
              <label className="text-sm font-medium">Selling Price</label>
              <Input type="number" step="0.01" {...register('sellingPrice')} />
            </div>
          )}
          {selectedCategory !== 'Mobile Phones' && (
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" {...register('quantity')} />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium">Minimum Stock Level</label>
            <Input type="number" {...register('minStock')} />
          </div>
          <div>
            <label className="text-sm font-medium">Barcode</label>
            <Input {...register('barcode')} placeholder="EAN/UPC" />
          </div>
          <div>
            <label className="text-sm font-medium">Subcategory</label>
            <Input {...register('subcategory')} placeholder="e.g., Smartphones" />
          </div>
        </div>

        {/* Specifications grid */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Specifications</p>
          <div className="grid md:grid-cols-3 gap-4">
            {['Screen', 'RAM', 'Storage', 'Camera', 'Battery', 'Processor', 'OS'].map((k) => (
              <div key={k}>
                <label className="text-xs text-gray-600 dark:text-gray-400">{k}</label>
                <Input value={specs[k] || ''} onChange={(e) => setSpecs({ ...specs, [k]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Current Images</p>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images upload */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Add More Images (up to 10 total, max 5MB each, JPG/PNG/WebP)</p>
          <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <Upload className="h-5 w-5" />
            <span>Upload Images</span>
            <Controller
              name="images"
              control={control}
              render={({ field: { onChange, name, ref } }) => (
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  name={name}
                  ref={ref}
                  onChange={(e) => {
                    const files = e.target.files
                    onChange(files || undefined)
                    handleImagesChange(files || undefined)
                  }}
                />
              )}
            />
          </label>
          {errors.images && <p className="text-sm text-red-500 mt-1">{String(errors.images.message)}</p>}
          {uploadPreview.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-3">
              {uploadPreview.map((src, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured and On Sale */}
        <div className="mt-6 flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('featured')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
            <span className="text-sm font-medium">Featured Product</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('onSale')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
            <span className="text-sm font-medium">On Sale</span>
          </label>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit as any)} disabled={isSubmitting}>Update Product</Button>
      </DialogFooter>
    </Dialog>
  )
}

