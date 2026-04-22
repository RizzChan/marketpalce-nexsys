'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading, confirmLabel = 'Hapus', confirmVariant = 'destructive' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        {/* Text */}
        <h3 className="text-center font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-center text-sm text-gray-500 mb-6">{description}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...</>
              : confirmLabel
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
