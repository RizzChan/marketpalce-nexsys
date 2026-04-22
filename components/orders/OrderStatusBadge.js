export const ORDER_STATUS = {
  PAYMENT_PENDING: {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-500',
  },
  PAID: {
    label: 'Sudah Dibayar',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  PROCESSING: {
    label: 'Sedang Diproses',
    color: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-500',
  },
  READY_FOR_PICKUP: {
    label: 'Siap Diambil',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  SHIPPED: {
    label: 'Dikirim',
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'bg-gray-100 text-gray-700',
    dot: 'bg-gray-500',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-400',
  },
}

export const PAYMENT_STATUS = {
  PENDING: { label: 'Belum Dibayar', color: 'bg-yellow-100 text-yellow-700' },
  SUCCESS: { label: 'Lunas', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Gagal', color: 'bg-red-100 text-red-700' },
  EXPIRED: { label: 'Kedaluwarsa', color: 'bg-gray-100 text-gray-500' },
}

export function OrderStatusBadge({ status }) {
  // ✅ fallback ke PAYMENT_PENDING bukan PENDING
  const config = ORDER_STATUS[status] || ORDER_STATUS.PAYMENT_PENDING

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STATUS[status] || PAYMENT_STATUS.PENDING

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}