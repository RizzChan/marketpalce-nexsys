'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import {
  Search, ShoppingBag, Eye, X, ChevronDown,
  MapPin, Truck, Package, Clock, CheckCircle,
  XCircle, Loader2, User, CreditCard, QrCode,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// CONFIG STATUS
// ============================================
const STATUS_CONFIG = {
  PAYMENT_PENDING: {
    label: 'Menunggu Bayar',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  PAID: {
    label: 'Sudah Dibayar',
    color: 'bg-blue-100 text-blue-700',
    icon: CreditCard,
  },
  PROCESSING: {
    label: 'Diproses',
    color: 'bg-purple-100 text-purple-700',
    icon: Package,
  },
  READY_FOR_PICKUP: {
    label: 'Siap Diambil',
    color: 'bg-indigo-100 text-indigo-700',
    icon: QrCode,
  },
  SHIPPED: {
    label: 'Dikirim',
    color: 'bg-orange-100 text-orange-700',
    icon: Truck,
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
}

// Next status yang bisa dipilih admin per status sekarang
const NEXT_STATUSES = {
  PAYMENT_PENDING: ['CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY_FOR_PICKUP', 'SHIPPED', 'CANCELLED'],
  READY_FOR_PICKUP: ['COMPLETED', 'CANCELLED'],
  SHIPPED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

// ============================================
// KOMPONEN STATUS BADGE
// ============================================
function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <Badge className={`${config.color} font-medium text-xs`}>
      {config.label}
    </Badge>
  )
}

// ============================================
// MODAL DETAIL ORDER
// ============================================
function OrderDetailModal({ orderId, onClose, onStatusUpdated }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`)
        const data = await res.json()
        if (data.success) {
          setOrder(data.data)
          setSelectedStatus(data.data.status)
          setCourierName(data.data.shipping?.courierName || '')
          setTrackingNumber(data.data.shipping?.trackingNumber || '')
        }
      } catch {
        toast.error('Gagal memuat detail order')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  async function handleUpdateStatus() {
    if (selectedStatus === order.status && !courierName && !trackingNumber) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, courierName, trackingNumber }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Status order diperbarui!')
        onStatusUpdated()
        onClose()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Gagal memperbarui status')
    } finally {
      setUpdating(false)
    }
  }

  const nextStatuses = order ? NEXT_STATUSES[order.status] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detail Pesanan</h2>
            {order && (
              <p className="text-sm text-gray-400 mt-0.5">{order.orderNumber}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !order ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Order tidak ditemukan</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Info Customer */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Informasi Customer
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  {order.user?.avatar ? (
                    <Image src={order.user.avatar} alt={order.user.name} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.user?.name}</p>
                  <p className="text-xs text-gray-400">{order.user?.email}</p>
                  {order.user?.phone && (
                    <p className="text-xs text-gray-400">{order.user.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Tanggal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Metode</p>
                <div className="flex items-center gap-1.5">
                  {order.shippingMethod === 'PICKUP' ? (
                    <><QrCode className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium text-gray-700">Pickup</span></>
                  ) : (
                    <><Truck className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium text-gray-700">Delivery</span></>
                  )}
                </div>
              </div>
            </div>

            {/* Alamat Pengiriman (kalau DELIVERY) */}
            {order.shippingMethod === 'DELIVERY' && order.shippingAddress && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  <MapPin className="inline w-3 h-3 mr-1" />Alamat Pengiriman
                </p>
                <p className="text-sm font-medium text-gray-900">{order.shippingName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.shippingPhone}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.shippingAddress}, {order.shippingCity}, {order.shippingProvince} {order.shippingPostCode}
                </p>
                {order.shipping?.courierName && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Kurir: <span className="font-medium text-gray-700">{order.shipping.courierName}</span>
                      {order.shipping.trackingNumber && (
                        <> · Resi: <span className="font-medium text-gray-700">{order.shipping.trackingNumber}</span></>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Kode Pickup */}
            {order.shippingMethod === 'PICKUP' && order.pickupCode && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Kode Pickup</p>
                <p className="text-lg font-mono font-bold text-gray-900 tracking-widest">{order.pickupCode}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Item Pesanan</p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={item.productImage || item.product?.images?.[0] || 'https://placehold.co/100x100/f5f5f5/999?text=IMG'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.quantity}x · {formatPrice(item.price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {Number(order.shippingCost) > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Ongkir</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Update Status */}
            {nextStatuses.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Update Status</p>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 pr-10 focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value={order.status}>{STATUS_CONFIG[order.status]?.label} (sekarang)</option>
                    {nextStatuses.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Input resi kalau DELIVERY dan status SHIPPED */}
                {order.shippingMethod === 'DELIVERY' && selectedStatus === 'SHIPPED' && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Nama kurir (JNE, SiCepat, dll)"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Nomor resi pengiriman"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}

                <Button
                  className="w-full bg-black hover:bg-gray-800"
                  onClick={handleUpdateStatus}
                  disabled={updating || selectedStatus === order.status}
                >
                  {updating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memperbarui...</>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </Button>
              </div>
            )}

            {/* Catatan */}
            {order.notes && (
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide mb-1">Catatan</p>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ============================================
// HALAMAN UTAMA ADMIN ORDERS
// ============================================
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
        setPagination(data.pagination)
      }
    } catch {
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-sm text-gray-400 mt-1">
            {pagination.total ? `${pagination.total} pesanan masuk` : ''}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nomor order / nama / email..."
            className="pl-9 w-72"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-black/10 h-10"
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">Order</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">Customer</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">Total</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">Metode</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">Tanggal</th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Belum ada pesanan</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.items.length} item</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {order.shippingMethod === 'PICKUP' ? (
                            <><QrCode className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-500">Pickup</span></>
                          ) : (
                            <><Truck className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-500">Delivery</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Halaman {page} dari {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedOrderId && (
          <OrderDetailModal
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
            onStatusUpdated={fetchOrders}
          />
        )}
      </AnimatePresence>
    </div>
  )
}