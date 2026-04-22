'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?limit=8&sort=createdAt&order=desc'),
          fetch('/api/categories'),
        ])
        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        if (productsData.success) setProducts(productsData.data)
        if (categoriesData.success) setCategories(categoriesData.data)
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 text-sm">
              🎉 Gratis ongkir untuk order pertama
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Temukan Produk
              <span className="block text-gray-400">Terbaik Untukmu</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Belanja ribuan produk berkualitas dengan harga terjangkau.
              Pengiriman cepat ke seluruh Indonesia.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-black hover:bg-gray-800" asChild>
                <Link href="/products">
                  Belanja Sekarang <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">Lihat Katalog</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Pengiriman Cepat', desc: 'Sampai dalam 1-3 hari' },
              { icon: Shield, title: 'Transaksi Aman', desc: 'Dijamin 100% aman' },
              { icon: ShoppingBag, title: 'Produk Original', desc: 'Garansi keaslian' },
              { icon: Headphones, title: 'Dukungan 24/7', desc: 'Siap membantu kamu' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Kategori</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-black hover:text-white hover:border-black transition-colors"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Produk Terbaru</h2>
          <Button variant="ghost" asChild>
            <Link href="/products" className="flex items-center gap-1">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada produk tersedia.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}
