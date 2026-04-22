'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductFormModal({ open, onClose, onSuccess, product }) {
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    weight: '',
    categoryId: '',
    images: [''],
    isActive: true,
  })

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data) })
  }, [])

  // Isi form saat edit
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        weight: product.weight?.toString() || '',
        categoryId: product.categoryId || '',
        images: product.images?.length > 0 ? product.images : [''],
        isActive: product.isActive ?? true,
      })
    } else {
      setForm({
        name: '', description: '', price: '', stock: '',
        weight: '', categoryId: '', images: [''], isActive: true,
      })
    }
  }, [product, open])

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleImageChange(index, value) {
    const newImages = [...form.images]
    newImages[index] = value
    setForm((prev) => ({ ...prev, images: newImages }))
  }

  function addImageField() {
    setForm((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  function removeImageField(index) {
    const newImages = form.images.filter((_, i) => i !== index)
    setForm((prev) => ({ ...prev, images: newImages.length > 0 ? newImages : [''] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Nama, harga, dan kategori wajib diisi.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        images: form.images.filter((img) => img.trim() !== ''),
      }

      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(isEdit ? 'Produk diupdate!' : 'Produk ditambahkan!')
        onSuccess()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Nama */}
          <div className="space-y-1.5">
            <Label>Nama Produk *</Label>
            <Input
              placeholder="Contoh: Wireless Earbuds Pro"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              placeholder="Deskripsi produk..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Harga, Stok, Berat */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Harga (Rp) *</Label>
              <Input
                type="number"
                placeholder="150000"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stok</Label>
              <Input
                type="number"
                placeholder="10"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Berat (gr)</Label>
              <Input
                type="number"
                placeholder="500"
                value={form.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
              />
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <Label>Kategori *</Label>
            <Select value={form.categoryId} onValueChange={(v) => handleChange('categoryId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status (khusus edit) */}
          {isEdit && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.isActive ? 'true' : 'false'}
                onValueChange={(v) => handleChange('isActive', v === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* URL Gambar */}
          <div className="space-y-1.5">
            <Label>URL Gambar</Label>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={img}
                  onChange={(e) => handleImageChange(i, e.target.value)}
                  className="flex-1"
                />
                {form.images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImageField(i)}
                    className="h-10 w-10 p-0 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImageField}
              className="gap-2 text-gray-500 w-full"
            >
              <Plus className="w-4 h-4" /> Tambah URL Gambar
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-black hover:bg-gray-800"
            disabled={loading}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
              : isEdit ? 'Update Produk' : 'Tambah Produk'
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
