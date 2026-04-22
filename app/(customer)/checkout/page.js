'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatPrice } from '@/lib/utils'
import {
  MapPin, Store, Truck,
  CreditCard, Loader2, ArrowLeft, Package,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Script from 'next/script'

export default function CheckoutPage() {
  const { cart, cartTotal, fetchCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [shippingMethod, setShippingMethod] = useState('PICKUP')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [snapLoaded, setSnapLoaded] = useState(false)

  // ✅ Tambahan ini — deklarasi ref
  const orderIdRef = useRef(null)

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    province: '',
    postCode: '',
  })

  const items = cart?.items || []
  const shippingCost = shippingMethod === 'DELIVERY' ? (cartTotal > 500000 ? 0 : 15000) : 0
  const total = cartTotal + shippingCost

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

  useEffect(() => {
    if (items.length === 0 && cart !== null) {
      toast.error('Keranjang kosong.')
      router.push('/products')
    }
  }, [cart, items])

  async function handleCheckout() {
    if (!snapLoaded) {
      toast.error('Sistem pembayaran belum siap. Tunggu sebentar.')
      return
    }

    if (shippingMethod === 'DELIVERY') {
      if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city) {
        toast.error('Lengkapi data alamat pengiriman.')
        return
      }
    }

    setIsLoading(true)

    try {
      // 1. Buat order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingMethod, notes, shippingAddress }),
      })
      const orderData = await orderRes.json()

      if (!orderData.success) {
        toast.error(orderData.message)
        setIsLoading(false)
        return
      }

      // ✅ Simpan orderId ke ref
      orderIdRef.current = orderData.data.id

      // 2. Buat Midtrans payment token
      const paymentRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.data.id }),
      })
      const paymentData = await paymentRes.json()

      if (!paymentData.success) {
        toast.error(paymentData.message)
        setIsLoading(false)
        return
      }

      // 3. Buka Midtrans Snap popup
      window.snap.pay(paymentData.data.token, {
        onSuccess: async (result) => {
          toast.success('Pembayaran berhasil!')
          await fetchCart()
          // ✅ Hard redirect ke order detail
          window.location.href = `/orders/${orderIdRef.current}`
        },
        onPending: (result) => {
          toast('Pembayaran pending. Selesaikan pembayaran kamu.', { icon: '⏳' })
          window.location.href = `/orders/${orderIdRef.current}`
        },
        onError: (result) => {
          toast.error('Pembayaran gagal.')
          setIsLoading(false)
        },
        onClose: () => {
          toast('Pembayaran dibatalkan.', { icon: '❌' })
          setIsLoading(false)
        },
      })
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-300" />
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={clientKey}
        strategy="afterInteractive"
        onLoad={() => setSnapLoaded(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/cart"><ArrowLeft className="w-4 h-4" /> Keranjang</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-400">{items.length} produk</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Metode Pengiriman */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" /> Metode Pengiriman
              </h2>
              <RadioGroup
                value={shippingMethod}
                onValueChange={setShippingMethod}
                className="space-y-3"
              >
                <label
                  htmlFor="pickup"
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'PICKUP'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <RadioGroupItem value="PICKUP" id="pickup" className="mt-1" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Store className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ambil di Toko</p>
                      <p className="text-sm text-gray-400">Gratis · Siap dalam 1-2 jam</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-700">Gratis</Badge>
                  </div>
                </label>

                <label
                  htmlFor="delivery"
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'DELIVERY'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <RadioGroupItem value="DELIVERY" id="delivery" className="mt-1" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pengiriman ke Alamat</p>
                      <p className="text-sm text-gray-400">
                        {cartTotal > 500000 ? 'Gratis · ' : 'Rp 15.000 · '}
                        Estimasi 2-3 hari
                      </p>
                    </div>
                    {cartTotal > 500000
                      ? <Badge className="ml-auto bg-green-100 text-green-700">Gratis</Badge>
                      : <Badge variant="outline" className="ml-auto">{formatPrice(15000)}</Badge>
                    }
                  </div>
                </label>
              </RadioGroup>
            </motion.div>

            {/* Alamat Pengiriman */}
            {shippingMethod === 'DELIVERY' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Alamat Pengiriman
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Penerima *</Label>
                    <Input
                      placeholder="Nama lengkap"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor HP *</Label>
                    <Input
                      placeholder="08xxxxxxxxxx"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Alamat Lengkap *</Label>
                    <Textarea
                      placeholder="Jl. Contoh No. 123, RT/RW..."
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kota *</Label>
                    <Input
                      placeholder="Jakarta"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provinsi</Label>
                    <Input
                      placeholder="DKI Jakarta"
                      value={shippingAddress.province}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kode Pos</Label>
                    <Input
                      placeholder="12345"
                      value={shippingAddress.postCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postCode: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Catatan */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="font-bold text-gray-900 mb-4">Catatan Pesanan</h2>
              <Textarea
                placeholder="Catatan tambahan untuk pesanan kamu (opsional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </motion.div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24"
            >
              <h2 className="font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <Image
                        src={item.product.images?.[0] || 'https://placehold.co/100x100/f5f5f5/999?text=IMG'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity}x {formatPrice(item.product.price)}</p>
                    </div>
                    <p className="text-sm font-medium shrink-0">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                    {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button
                className="w-full bg-black hover:bg-gray-800 h-12"
                onClick={handleCheckout}
                disabled={isLoading || !snapLoaded}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : !snapLoaded ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memuat pembayaran...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Bayar Sekarang
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400 mt-3">
                Pembayaran aman diproses oleh Midtrans 🔒
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
