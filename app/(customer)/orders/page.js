'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (data.success) setOrders(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
        <p className="text-sm text-gray-400 mt-1">Riwayat semua transaksi kamu</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum ada pesanan</h3>
          <p className="text-gray-400 text-sm mb-6">Yuk, mulai belanja dan buat pesanan pertamamu!</p>
          <Button className="bg-black hover:bg-gray-800" asChild>
            <Link href="/products">Mulai Belanja</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/orders/${order.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all p-5 group">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{formatDate(order.createdAt)}</p>
                      <p className="text-sm font-semibold text-gray-700">
                        #{order.orderNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white bg-gray-50"
                        >
                          <Image
                            src={item.product?.images?.[0] || item.productImage || 'https://placehold.co/100x100/f5f5f5/999?text=IMG'}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && ` +${order.items.length - 1} produk lain`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.shippingMethod === 'PICKUP' ? '🏪 Ambil di toko' : '🚚 Pengiriman'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <PaymentStatusBadge status={order.payment?.status || 'PENDING'} />
                    <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
