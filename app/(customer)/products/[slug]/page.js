'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  ShoppingCart, Star, Package, ArrowLeft,
  Truck, Shield, RotateCcw, User, Minus, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`)
        const data = await res.json()
        if (data.success) {
          setProduct(data.data)
        } else {
          toast.error('Produk tidak ditemukan')
          router.push('/products')
        }
      } catch (error) {
        toast.error('Gagal memuat produk')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  async function handleAddToCart() {
    if (!user) { router.push('/login'); return }
    setAddingToCart(true)
    const success = await addToCart(product.id, quantity)
    if (success) setQuantity(1)
    setAddingToCart(false)
  }

  function handleBuyNow() {
    if (!user) { router.push('/login'); return }
    addToCart(product.id, quantity)
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-black transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-black transition-colors">Produk</Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-black transition-colors"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-48">{product.name}</span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={product.images?.[activeImage] || 'https://placehold.co/600x600/f5f5f5/999?text=No+Image'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg px-6 py-2">Stok Habis</Badge>
              </div>
            )}
          </div>

          {/* Thumbnail images */}
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <Badge variant="outline" className="w-fit mb-3">
            {product.category?.name}
          </Badge>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {stars.map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.averageRating.toFixed(1)} ({product.reviewCount} ulasan)
              </span>
            </div>
          )}

          <div className="text-4xl font-bold text-gray-900 mb-6">
            {formatPrice(product.price)}
          </div>

          <p className="text-gray-500 leading-relaxed mb-6">{product.description}</p>

          <Separator className="mb-6" />

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-gray-400" />
            {product.stock > 0 ? (
              <span className="text-sm text-gray-600">
                Stok tersedia:{' '}
                <span className={`font-medium ${product.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                  {product.stock} item
                </span>
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">Stok habis</span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Jumlah:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-400">Maks. {product.stock}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-black text-black hover:bg-black hover:text-white"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {addingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-black hover:bg-gray-800"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Beli Sekarang
            </Button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Pengiriman Cepat' },
              { icon: Shield, label: 'Garansi Resmi' },
              { icon: RotateCcw, label: 'Retur 7 Hari' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center"
              >
                <item.icon className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ulasan Pelanggan
          {product.reviewCount > 0 && (
            <span className="text-gray-400 font-normal text-lg ml-2">
              ({product.reviewCount})
            </span>
          )}
        </h2>

        {product.reviews?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Star className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">Belum ada ulasan untuk produk ini.</p>
            <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Rating Summary */}
            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">
                  {product.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 justify-center mt-1">
                  {stars.map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-1">{product.reviewCount} ulasan</p>
              </div>
            </div>

            {/* Review List */}
            {product.reviews?.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-white border border-gray-100 rounded-2xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.user?.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {stars.map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
