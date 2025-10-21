"use client"

import React, { useMemo, useState } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { fetchDeviceSpecs, getBrands, getModels } from '@/lib/specs-api'
import { useInventoryStore, ProductCategory, ProductItem } from '@/store/inventory-store'
import { Upload, ImageIcon, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadFileToFirebase, compressImageForUpload } from '@/lib/firebase-client'
import api from '@/lib/api-client'

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
  // Purchase details (from whom purchasing)
  purchaseFromName: z.string().optional(),
  purchaseFromPhone: z.string().optional(),
  purchaseFromCnic: z.string().optional(),
  purchaseFromAddress: z.string().optional(),
  images: z
    .any()
    .refine((files: FileList | undefined) => !files || files.length <= 3, 'Max 3 images allowed')
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
}).superRefine((data, ctx) => {
  // For mobile phones, require brand, model, and quantity
  if (data.category === 'Mobile Phones') {
    if (!data.brand) {
      ctx.addIssue({
        code: "custom",
        message: "Please select a brand",
        path: ["brand"]
      })
    }
    if (!data.model) {
      ctx.addIssue({
        code: "custom",
        message: "Please select a model",
        path: ["model"]
      })
    }
    if (data.quantity <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid quantity",
        path: ["quantity"]
      })
    }
  } else {
    // For other categories, require name and sku
    if (!data.name || data.name.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid product name (min 2 characters)",
        path: ["name"]
      })
    }
    if (!data.sku || data.sku.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid SKU",
        path: ["sku"]
      })
    }
  }
  
  // Validation: minStock should not be greater than quantity
  if (data.minStock > data.quantity) {
    ctx.addIssue({
      code: "custom",
      message: "Minimum stock level should not be greater than quantity",
      path: ["minStock"]
    })
  }
})

type FormValues = z.output<typeof schema>

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const addProduct = useInventoryStore((s) => s.addProduct)
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
    defaultValues: {
      category: 'Mobile Phones',
      quantity: 0,
      minStock: 0,
      purchasePrice: 0,
      sellingPrice: 0,
    },
  })

  const selectedCategory = watch('category')
  const brand = watch('brand')
  const model = watch('model')
  const quantity = watch('quantity')
  const numericQuantity = useMemo(() => Number(quantity) || 0, [quantity])
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [uploadPreview, setUploadPreview] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imeiNumbers, setImeiNumbers] = useState<string[]>([])
  const [sellingPrices, setSellingPrices] = useState<number[]>([])
  const [purchasePrices, setPurchasePrices] = useState<number[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [colorVariant, setColorVariant] = useState<'same' | 'different'>('same')
  const [priceVariant, setPriceVariant] = useState<'same' | 'different'>('same')
  const [purchasePriceVariant, setPurchasePriceVariant] = useState<'same' | 'different'>('same')
  const [singleColor, setSingleColor] = useState('')
  const [isProcessingImages, setIsProcessingImages] = useState(false)

  const [brandOptions, setBrandOptions] = useState<string[]>([])
  const [modelOptions, setModelOptions] = useState<string[]>([])
  React.useEffect(() => { getBrands().then(setBrandOptions) }, [])
  React.useEffect(() => { if (brand) getModels(brand).then(setModelOptions) }, [brand])

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        category: 'Mobile Phones',
        quantity: 0,
        minStock: 0,
        purchasePrice: 0,
        sellingPrice: 0,
      })
      setSpecs({})
      setImeiNumbers([])
      setSellingPrices([])
      setPurchasePrices([])
      setColors([])
      setColorVariant('same')
      setPriceVariant('same')
      setPurchasePriceVariant('same')
      setSingleColor('')
      setUploadPreview([])
      setSelectedFiles([])
    }
  }, [open, reset])

  // Update IMEI, selling price, purchase price, and color arrays when quantity changes
  React.useEffect(() => {
    if (selectedCategory === 'Mobile Phones' && numericQuantity > 0) {
      // Create empty IMEI fields based on quantity (no auto-generation)
      setImeiNumbers(prevImeiNumbers => {
        const newImeiNumbers = Array(numericQuantity).fill('').map((_, i) => {
          // Keep existing IMEI if available, otherwise empty string
          return prevImeiNumbers[i] || ''
        })
        return newImeiNumbers
      })
      
      if (priceVariant === 'different') {
        setSellingPrices(prevSellingPrices => {
          const newSellingPrices = Array(numericQuantity).fill(0).map((_, i) => prevSellingPrices[i] || 0)
          return newSellingPrices
        })
      }
      
      if (purchasePriceVariant === 'different') {
        setPurchasePrices(prevPurchasePrices => {
          const newPurchasePrices = Array(numericQuantity).fill(0).map((_, i) => prevPurchasePrices[i] || 0)
          return newPurchasePrices
        })
      }
      
      if (colorVariant === 'different') {
        setColors(prevColors => {
          const newColors = Array(numericQuantity).fill('').map((_, i) => prevColors[i] || '')
          return newColors
        })
      }
    }
  }, [numericQuantity, selectedCategory, colorVariant, priceVariant, purchasePriceVariant])

  // Generate IMEI-like numbers (15 digits)
  function generateIMEI(): string {
    const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('')
    // Calculate Luhn check digit
    let sum = 0
    let double = false
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i])
      if (double) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      double = !double
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return digits + checkDigit
  }

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
        toast.success('Specifications loaded successfully')
      } else {
        toast.error('No specs found for selected brand/model')
      }
    } catch (e) {
      toast.error('Failed to fetch specifications')
    }
  }

  // Function to compress image for preview
  function compressImage(file: File, maxWidth: number = 400, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  function handleImagesChange(files?: FileList) {
    if (!files || files.length === 0) {
      setUploadPreview([])
      setSelectedFiles([])
      setIsProcessingImages(false)
      return
    }
    
    // Limit to 3 images to prevent storage issues
    const limitedFiles = Array.from(files).slice(0, 3)
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed to prevent storage issues')
    }
    
    setIsProcessingImages(true)
    setSelectedFiles(limitedFiles)
    const previews: string[] = new Array(limitedFiles.length)
    let loadedCount = 0
    
    limitedFiles.forEach(async (file, index) => {
      try {
        const compressedImage = await compressImage(file, 300, 0.6) // Smaller size, lower quality
        previews[index] = compressedImage
        loadedCount++
        console.log(`Compressed image ${loadedCount}/${limitedFiles.length}:`, compressedImage.length, 'bytes')
        
        if (loadedCount === limitedFiles.length) {
          const validPreviews = previews.filter(preview => preview)
          console.log('All images processed. Valid previews:', validPreviews.length)
          setUploadPreview(validPreviews)
          setIsProcessingImages(false)
        }
      } catch (error) {
        console.error('Error processing image:', file.name, error)
        loadedCount++
        if (loadedCount === limitedFiles.length) {
          const validPreviews = previews.filter(preview => preview)
          setUploadPreview(validPreviews)
          setIsProcessingImages(false)
        }
      }
    })
  }

  // Validate IMEI format: only ensure exactly 15 digits (no Luhn check)
  const validateIMEI = (imei: string): boolean => {
    return /^\d{15}$/.test(imei);
  };

  // Check for duplicate IMEI numbers in the current form
  const checkDuplicateIMEIs = (imeis: string[]): string[] => {
    const duplicates: string[] = [];
    const seen = new Set<string>();
    
    imeis.forEach((imei, index) => {
      if (imei.trim() !== '') {
        if (seen.has(imei)) {
          duplicates.push(`Device ${index + 1}`);
        } else {
          seen.add(imei);
        }
      }
    });
    
    return duplicates;
  };

  // Check IMEI uniqueness against database
  const checkIMEIUniqueness = async (imeis: string[]): Promise<{unique: boolean, duplicates: any[], existing: any[]}> => {
    try {
      const { data } = await api.post('/products/check-imei', { imeiNumbers: imeis })
      return data?.data ?? { unique: true, duplicates: [], existing: [] }
    } catch (error) {
      console.warn('IMEI uniqueness check failed (allowing submit):', error)
      return { unique: true, duplicates: [], existing: [] }
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log('onSubmit called with data:', data)
    try {
      console.log('Form data:', data)
      console.log('Selected category:', selectedCategory)
      console.log('IMEI numbers:', imeiNumbers)
      console.log('Selling prices:', sellingPrices)
      console.log('Colors:', colors)
      console.log('Color variant:', colorVariant)
      console.log('Price variant:', priceVariant)
      console.log('Single color:', singleColor)
      console.log('Upload preview:', uploadPreview)
      console.log('Files from form:', data.images)

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
        
        // Validate IMEI numbers
        const validImeis = imeiNumbers.filter(imei => imei.trim() !== '');
        if (validImeis.length !== data.quantity) {
          toast.error(`Please enter IMEI numbers for all ${data.quantity} devices`)
          return
        }
        
        // Check IMEI format (15 digits only)
        const invalidImeis: string[] = [];
        validImeis.forEach((imei, index) => {
          if (!validateIMEI(imei)) {
            invalidImeis.push(`Device ${index + 1}`);
          }
        });
        
        if (invalidImeis.length > 0) {
          toast.error(`Invalid IMEI format for: ${invalidImeis.join(', ')}. IMEI must be exactly 15 digits.`)
          return
        }
        
        // Check for duplicate IMEIs in form
        const duplicateImeis = checkDuplicateIMEIs(validImeis);
        if (duplicateImeis.length > 0) {
          toast.error(`Duplicate IMEI numbers found for: ${duplicateImeis.join(', ')}`)
          return
        }
        
        // Check IMEI uniqueness against database
        const uniquenessCheck = await checkIMEIUniqueness(validImeis);
        if (!uniquenessCheck.unique) {
          let errorMessage = 'IMEI validation failed:\n';
          
          if (uniquenessCheck.duplicates.length > 0) {
            errorMessage += `Duplicate IMEIs in form: ${uniquenessCheck.duplicates.map(d => `Device ${d.deviceNumber}`).join(', ')}\n`;
          }
          
          if (uniquenessCheck.existing.length > 0) {
            errorMessage += `IMEIs already exist: ${uniquenessCheck.existing.map(e => `${e.imei} (${e.brand} ${e.model})`).join(', ')}`;
          }
          
          toast.error(errorMessage);
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

      // For mobile phones, use model as name, otherwise use provided name
      const productName = selectedCategory === 'Mobile Phones' ? (data.model || '') : (data.name || '')

      // For mobile phones, SKU is derived from IMEI numbers, for others use provided SKU
      const productSku = selectedCategory === 'Mobile Phones' 
        ? '' // Will be set automatically in the store from IMEI numbers
        : data.sku || ''

      // Prepare color data
      const finalColors = selectedCategory === 'Mobile Phones' 
        ? (colorVariant === 'same' 
            ? (singleColor.trim() !== '' ? Array(data.quantity).fill(singleColor.trim()) : undefined)
            : colors.filter(color => color.trim() !== '').length > 0 ? colors.filter(color => color.trim() !== '') : undefined)
        : undefined

      // Prepare selling prices
      const finalSellingPrices = selectedCategory === 'Mobile Phones' && priceVariant === 'different'
        ? sellingPrices.filter(price => price > 0).length > 0 ? sellingPrices.filter(price => price > 0) : undefined
        : undefined

      // Prepare purchase prices
      const finalPurchasePrices = selectedCategory === 'Mobile Phones' && purchasePriceVariant === 'different'
        ? purchasePrices.filter(price => price > 0).length > 0 ? purchasePrices.filter(price => price > 0) : undefined
        : undefined

      // Calculate average selling price
      const averageSellingPrice = selectedCategory === 'Mobile Phones' && finalSellingPrices && finalSellingPrices.length > 0
        ? finalSellingPrices.reduce((sum, price) => sum + price, 0) / finalSellingPrices.length
        : data.sellingPrice

      // Calculate average purchase price
      const averagePurchasePrice = selectedCategory === 'Mobile Phones' && finalPurchasePrices && finalPurchasePrices.length > 0
        ? finalPurchasePrices.reduce((sum, price) => sum + price, 0) / finalPurchasePrices.length
        : data.purchasePrice

      console.log('Final colors:', finalColors)
      console.log('Final selling prices:', finalSellingPrices)
      console.log('Average selling price:', averageSellingPrice)

      // Process uploaded images
      const filesFromState = selectedFiles
      const fileList = (data.images as any as FileList) || undefined
      const filesToUpload: File[] = filesFromState.length > 0
        ? filesFromState
        : (fileList ? Array.from(fileList).slice(0, 10) : [])
      
      console.log('Processed images (files to upload):', filesToUpload)

      // Upload images to Firebase and collect URLs
      const imageUrls: string[] = []
      if (filesToUpload.length > 0) {
        for (const file of filesToUpload) {
          try {
            // Compress to reduce size (use your firebase-client function)
            const compressedFile = await compressImageForUpload(file, { maxDimension: 1600, quality: 0.8 })
            // Upload to Firebase
            const url = await uploadFileToFirebase(compressedFile, 'products')  // Prefix: adjust if needed (e.g., 'products/mobile-phones')
            imageUrls.push(url)
            console.log(`Successfully uploaded: ${file.name} -> ${url}`)
          } catch (uploadError: any) {
            console.error(`Failed to upload ${file.name}:`, uploadError)
            toast.error(`Failed to upload ${file.name}: ${uploadError.message || 'Unknown error'}`)
            // Continue with other images; don't block the whole submit
          }
        }
        if (imageUrls.length === 0 && filesToUpload.length > 0) {
          toast('No images uploaded successfully. Product will save without images.')
        } else if (imageUrls.length > 0) {
          toast.success(`${imageUrls.length}/${filesToUpload.length} image(s) uploaded!`)
        }
      }

      // Prepare payload (now with specs and image URLs)
      const productPayload: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'> = {
        name: productName,
        brand: data.brand || '',
        model: data.model || '',
        category: data.category,
        subcategory: data.subcategory,
        sku: productSku,
        barcode: data.barcode,
        description: data.description,
        purchasePrice: averagePurchasePrice,
        sellingPrice: averageSellingPrice,
        quantity: data.quantity,
        minStock: data.minStock,
        featured: !!data.featured,
        onSale: !!data.onSale,
        images: imageUrls.map((url, idx) => ({ id: String(idx + 1), url })),
        specs: Object.fromEntries(Object.entries(specs).map(([k, v]) => [k.toLowerCase(), v])),  // Fixed: Include specs
        variants: [],
        imeiNumbers: selectedCategory === 'Mobile Phones' ? imeiNumbers.filter(imei => imei.trim() !== '') : undefined,
        individualSellingPrices: finalSellingPrices,
        individualPurchasePrices: finalPurchasePrices,
        colors: finalColors,
        colorVariant: selectedCategory === 'Mobile Phones' ? colorVariant : undefined,
        priceVariant: selectedCategory === 'Mobile Phones' ? priceVariant : undefined,
        purchasePriceVariant: selectedCategory === 'Mobile Phones' ? purchasePriceVariant : undefined,
      }

      console.log('Product payload (with URLs):', productPayload)
      
      // Save to store (no upload needed here anymore)
      const addedProduct = await addProduct(productPayload)
      console.log('Product added successfully:', addedProduct)
      toast.success('Product added successfully!')
      onOpenChange(false)

      // Reset states after success
      setSelectedFiles([])
      setUploadPreview([])
      reset()  // Reset form

    } catch (error: any) {
      console.error('Error adding product:', error)
      // Handle non-upload errors (e.g., store save failure)
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded:', error)
        toast.error('Storage limit reached. Please try with fewer/smaller images or clear some old products.')
        
        const shouldClear = window.confirm(
          'Storage is full. Would you like to clear old product data to make space? This will remove all existing products.'
        )
        
        if (shouldClear) {
          localStorage.removeItem('inventory-store')
          toast.success('Storage cleared. Please try adding the product again.')
          window.location.reload()
        }
      } else {
        toast.error(`Failed to add product: ${error.message || 'Please try again.'}`)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogClose onClick={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        {/* Category */}
        <div className="mb-6">
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                      placeholder="0" 
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
                    disabled={!brand || !model}
                  >
                    🔄 Fetch Specifications
                  </Button>
                </div>

                {/* Specifications grid (moved here under Fetch Specifications) */}
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Specifications</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {['Screen', 'RAM', 'Storage', 'Camera', 'Battery', 'Processor', 'OS'].map((k) => (
                      <div key={k}>
                        <label className="text-xs text-gray-600">{k}</label>
                        <Input value={specs[k] || ''} onChange={(e) => setSpecs({ ...specs, [k]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* IMEI Numbers (moved under Fetch Specifications) */}
                {numericQuantity > 0 && (
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="font-medium text-gray-900">IMEI Numbers</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Manual entry required</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: numericQuantity }, (_, i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Device {i + 1} IMEI</label>
                          <Input
                            inputMode="numeric"
                            pattern="\\d*"
                            maxLength={15}
                            value={imeiNumbers[i] || ''}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 15)
                              const newImeiNumbers = [...imeiNumbers]
                              newImeiNumbers[i] = digitsOnly
                              setImeiNumbers(newImeiNumbers)
                            }}
                            placeholder={`IMEI ${i + 1}`}
                            className="font-mono text-sm border-gray-200 focus:border-green-400 focus:ring-green-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color and Price Variant Configuration */}
                {numericQuantity > 0 && (
                  <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                    {/* Selling price configuration first */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price Configuration</label>
                        <select
                          value={priceVariant}
                          onChange={(e) => setPriceVariant(e.target.value as 'same' | 'different')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        >
                          <option value="same">Same price for all devices</option>
                          <option value="different">Different prices per device</option>
                        </select>
                      </div>

                      {priceVariant === 'same' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (all devices)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={watch('sellingPrice')}
                              onChange={(e) => setValue('sellingPrice', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="pl-8 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </div>
                        </div>
                      )}

                      {priceVariant === 'different' && (
                        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <h4 className="font-medium text-gray-900">Individual Selling Prices</h4>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Per Device</span>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: numericQuantity }, (_, i) => (
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

                      {/* Purchase price configuration comes after selling */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price Configuration</label>
                        <select
                          value={purchasePriceVariant}
                          onChange={(e) => setPurchasePriceVariant(e.target.value as 'same' | 'different')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        >
                          <option value="same">Same purchase price for all devices</option>
                          <option value="different">Different purchase prices per device</option>
                        </select>
                      </div>

                      {purchasePriceVariant === 'same' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price (all devices)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={watch('purchasePrice')}
                              onChange={(e) => setValue('purchasePrice', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="pl-8 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </div>
                        </div>
                      )}

                      {purchasePriceVariant === 'different' && (
                        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h4 className="font-medium text-gray-900">Individual Purchase Prices</h4>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Per Device</span>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: numericQuantity }, (_, i) => (
                              <div key={i} className="space-y-1">
                                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Device {i + 1} Purchase Price</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={purchasePrices[i] || ''}
                                    onChange={(e) => {
                                      const newPurchasePrices = [...purchasePrices]
                                      newPurchasePrices[i] = parseFloat(e.target.value) || 0
                                      setPurchasePrices(newPurchasePrices)
                                    }}
                                    placeholder="0.00"
                                    className="pl-8 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    
                  </div>
                )}
              </div>

                  {/* Color configuration (comes after pricing) */}
                  <div className="mt-2 space-y-4">
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

                  {/* Dynamic Color and Selling Price fields */
                  }
              {numericQuantity > 0 && (
                <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
                  {/* Dynamic Color Fields */}
                  {colorVariant === 'different' && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <h4 className="font-medium text-gray-900">Device Colors</h4>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Individual Colors</span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: numericQuantity }, (_, i) => (
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
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register('description')}
            placeholder="Product description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Pricing and stock (non-mobile inline only) */}
        {selectedCategory !== 'Mobile Phones' && (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Purchase Price</label>
              <Input type="number" step="0.01" {...register('purchasePrice')} />
            </div>
            <div>
              <label className="text-sm font-medium">Selling Price</label>
              <Input type="number" step="0.01" {...register('sellingPrice')} />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" {...register('quantity')} />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium">Minimum Stock Level</label>
            <Input type="number" {...register('minStock')} />
            {errors.minStock && <p className="text-sm text-red-500 mt-1">{String(errors.minStock.message)}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Barcode (Optional)</label>
            <Input {...register('barcode')} placeholder="EAN/UPC" />
          </div>
          <div>
            <label className="text-sm font-medium">Subcategory</label>
            <Input {...register('subcategory')} placeholder="e.g., Smartphones" />
          </div>
        </div>

        {/* Purchase Details Section */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purchase Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Information about the vendor/person you're purchasing from</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Vendor/Seller Name</label>
              <Input {...register('purchaseFromName')} placeholder="e.g., ABC Electronics" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input {...register('purchaseFromPhone')} placeholder="e.g., +92 300 1234567" />
            </div>
            <div>
              <label className="text-sm font-medium">CNIC</label>
              <Input {...register('purchaseFromCnic')} placeholder="e.g., 12345-1234567-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input {...register('purchaseFromAddress')} placeholder="e.g., Main Street, City" />
            </div>
          </div>
        </div>

        {/* Specifications grid (only for non-mobile categories to avoid duplication) */}
        {selectedCategory !== 'Mobile Phones' && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Specifications</p>
            <div className="grid md:grid-cols-3 gap-4">
              {['Screen', 'RAM', 'Storage', 'Camera', 'Battery', 'Processor', 'OS'].map((k) => (
                <div key={k}>
                  <label className="text-xs text-gray-600">{k}</label>
                  <Input value={specs[k] || ''} onChange={(e) => setSpecs({ ...specs, [k]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images upload */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Images (up to 3, auto-compressed, JPG/PNG/WebP)</p>
          <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <Upload className="h-5 w-5" />
            <span>{isProcessingImages ? 'Processing Images...' : 'Upload Images'}</span>
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
                  disabled={isProcessingImages}
                />
              )}
            />
          </label>
          {errors.images && <p className="text-sm text-red-500 mt-1">{String(errors.images.message)}</p>}
          
          {isProcessingImages && (
            <div className="flex items-center gap-2 mt-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Processing images...</span>
            </div>
          )}
          
          {uploadPreview.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-green-600 mb-2">✓ {uploadPreview.length} image(s) ready</p>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {uploadPreview.map((src, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-green-200">
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
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="min-w-[120px]"
          type="button"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            'Save Product'
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}