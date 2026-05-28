'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import {
  BarChart3,
  ShoppingBag,
  Wallet,
  Users,
  Trophy,
  ArrowRight,
} from 'lucide-react'

export default function AdminReportsPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/admin/reports')
        const data = await res.json()
        if (data.success) setReport(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  const summaryCards = report
    ? [
        {
          label: 'Total Omzet',
          value: formatPrice(report.summary.totalRevenue),
          icon: Wallet,
          color: 'bg-green-50 text-green-600',
          desc: 'Pembayaran sukses',
        },
        {
          label: 'Total Pesanan',
          value: report.summary.totalOrders,
          icon: ShoppingBag,
          color: 'bg-blue-50 text-blue-600',
          desc: 'Semua transaksi',
        },
        {
          label: 'Pesanan Selesai',
          value: report.summary.completedOrders,
          icon: BarChart3,
          color: 'bg-purple-50 text-purple-600',
          desc: 'Status completed',
        },
        {
          label: 'Customer Unik',
          value: report.summary.uniqueCustomers,
          icon: Users,
          color: 'bg-orange-50 text-orange-600',
          desc: 'Pernah melakukan order',
        },
      ]
    : []

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Penjualan</h1>
        <p className="text-sm text-gray-400 mt-1">
          Ringkasan performa penjualan dan aktivitas transaksi toko.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                <Skeleton className="h-7 w-28 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          : summaryCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Status */}
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
          ) : report?.ordersByStatus?.length ? (
            <div className="space-y-3">
              {report.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <OrderStatusBadge status={item.status} />
                  <span className="text-sm font-bold text-gray-900">
                    {item._count.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
          )}
        </div>

        {/* Top Products */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-4 h-4 text-gray-500" />
            <h2 className="font-bold text-gray-900">Produk Terlaris</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : report?.topProducts?.length ? (
            <div className="space-y-3">
              {report.topProducts.map((product, index) => (
                <div
                  key={`${product.productId}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {product.totalOrders} transaksi
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {product.totalSold} terjual
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada data produk</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Transaksi Terbaru</h2>
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
        ) : report?.recentOrders?.length ? (
          <div className="space-y-3">
            {report.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {order.user?.name} • {order.user?.email}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <OrderStatusBadge status={order.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">Belum ada transaksi</p>
        )}
      </div>
    </div>
  )
}