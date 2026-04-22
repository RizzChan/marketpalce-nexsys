'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  ShoppingBag, Package, Users, TrendingUp,
  ArrowRight, BarChart3,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        if (data.success) setStats(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = stats ? [
    {
      label: 'Total Pendapatan',
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      desc: 'Dari transaksi lunas',
    },
    {
      label: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      desc: 'Semua waktu',
    },
    {
      label: 'Produk Aktif',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
      desc: 'Tersedia di toko',
    },
    {
      label: 'Total Customer',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-orange-50 text-orange-600',
      desc: 'Terdaftar',
    },
  ] : []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Selamat datang kembali! Berikut ringkasan toko kamu.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <Skeleton className="h-10 w-10 rounded-xl mb-4" />
              <Skeleton className="h-7 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : (
          statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Pesanan Terbaru</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
            >
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : stats?.recentOrders?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders?.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{order.user?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Order by Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h2 className="font-bold text-gray-900">Status Pesanan</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.ordersByStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <OrderStatusBadge status={item.status} />
                  <span className="text-sm font-bold text-gray-900">
                    {item._count.status}
                  </span>
                </div>
              ))}
              {stats?.ordersByStatus?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
