'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingCart, Trash2, Minus, Plus,
  ArrowRight, ShoppingBag, ArrowLeft, Loader2,
} from 'lucide-react'

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, cartTotal } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [updatingItems, setUpdatingItems] = useState({})
  const [removingItems, setRemovingItems] = useState({})

  async function handleUpdateQuantity(itemId, newQty) {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
    await updateQuantity(itemId, newQty)
    setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
  }

  async function handleRemove(itemId) {
    setRemovingItems((prev) => ({ ...prev, [itemId]: true }))
    await removeFromCart(itemId)
    setRemovingItems((prev) => ({ ...prev, [itemId]: false }))
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Login untuk melihat keranjang</h2>
        <Button className="mt-4 bg-black hover:bg-gray-800" asChild>
          <Link href="/login">Login Sekarang</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
        <p className="mt-3 text-gray-400">Memuat keranjang...</p>
      </div>
    )
  }

  const items = cart?.items || []
  const shippingEstimate = cartTotal > 0 ? 15000 : 0

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-200" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Keranjang kosong</h2>
          <p className="text-gray-400 mb-8">Yuk, mulai belanja dan tambahkan produk ke keranjang!</p>
          <Button size="lg" className="bg-black hover:bg-gray-800" asChild>
            <Link href="/products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Mulai Belanja
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
          <p className="text-sm text-gray-400">{items.length} produk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
              >
                {/* Image */}
                <Link href={`/products/${item.product.slug}`} className="shrink-0">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                    <Image
                      src={item.product.images?.[0] || 'https://placehold.co/200x200/f5f5f5/999?text=No+Image'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-medium text-gray-900 text-sm hover:underline line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Stok: {item.product.stock}
                  </p>
                  <p className="font-bold text-gray-900 mt-2">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400">
                      {formatPrice(item.product.price)} × {item.quantity}
                    </p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removingItems[item.id]}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    {removingItems[item.id]
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>

                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingItems[item.id]}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {updatingItems[item.id] ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock || updatingItems[item.id]}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)
                </span>
                <span className="font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimasi Ongkir</span>
                <span className="font-medium text-green-600">
                  {cartTotal > 500000 ? 'Gratis' : formatPrice(shippingEstimate)}
                </span>
              </div>
              {cartTotal > 500000 && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg p-2">
                  <Badge className="bg-green-500 text-white text-xs">Gratis Ongkir</Badge>
                  <span>Belanja di atas Rp 500.000</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>
                {formatPrice(cartTotal > 500000 ? cartTotal : cartTotal + shippingEstimate)}
              </span>
            </div>

            <Button
              className="w-full bg-black hover:bg-gray-800 h-12"
              onClick={() => router.push('/checkout')}
            >
              Lanjut ke Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button variant="ghost" className="w-full mt-2" asChild>
              <Link href="/products">Lanjut Belanja</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
