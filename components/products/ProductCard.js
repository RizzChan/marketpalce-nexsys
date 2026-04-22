'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  function handleAddToCart(e) {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    addToCart(product.id, 1)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
          {/* Image */}
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            <Image
              src={product.images?.[0] || 'https://placehold.co/400x400/f5f5f5/999?text=No+Image'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="text-sm">Habis</Badge>
              </div>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">
                Sisa {product.stock}
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-1">{product.category?.name}</p>
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-black">
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-500">
                  {product.averageRating.toFixed(1)} ({product.reviewCount})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-black hover:bg-gray-800 text-white h-8 w-8 p-0 rounded-lg"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
