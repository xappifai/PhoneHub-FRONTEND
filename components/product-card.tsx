"use client"

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, MessageCircle, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { Product } from '@/lib/mock-data'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  onContact?: (product: Product) => void
}

export default function ProductCard({ product, onContact }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useCartStore()

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        vendorId: product.vendorId
      })
      toast.success('Added to wishlist')
    }
  }

  const handleContact = () => {
    if (onContact) {
      onContact(product)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              New
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute top-2 right-12 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Sale
            </span>
          )}
        </div>
        
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isInWishlist(product.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {product.brand} • {product.model}
        </p>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>

        {/* Key Features */}
        {product.features.length > 0 && (
          <ul className="text-xs text-gray-600 dark:text-gray-400 mb-3 space-y-1">
            {product.features.slice(0, 2).map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          {product.stock > 0 ? (
            <span className="text-sm text-secondary">
              {product.stock} in stock
            </span>
          ) : (
            <span className="text-sm text-red-500">Out of stock</span>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleContact}
          className="w-full"
          disabled={product.stock === 0}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Vendor
        </Button>
      </CardContent>
    </Card>
  )
}