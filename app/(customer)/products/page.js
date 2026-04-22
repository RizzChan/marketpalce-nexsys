'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('createdAt')
  const [page, setPage] = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
        order: sort === 'price' ? 'asc' : 'desc',
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
      })

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()

      if (data.success) {
        setProducts(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [page, sort, search, selectedCategory])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data) })
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Produk</h1>
        <p className="text-gray-500">
          {pagination.total ? `${pagination.total} produk ditemukan` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" className="bg-black hover:bg-gray-800">
            Cari
          </Button>
        </form>

        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Terbaru</SelectItem>
            <SelectItem value="price">Harga Terendah</SelectItem>
            <SelectItem value="name">Nama A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Badge
          variant={selectedCategory === '' ? 'default' : 'outline'}
          className={`px-3 py-1 cursor-pointer ${
            selectedCategory === ''
              ? 'bg-black text-white'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => { setSelectedCategory(''); setPage(1) }}
        >
          Semua
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={selectedCategory === cat.slug ? 'default' : 'outline'}
            className={`px-3 py-1 cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-black text-white'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-gray-500 mb-1">Produk tidak ditemukan</h3>
          <p className="text-sm">Coba kata kunci atau filter yang berbeda.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-gray-500 px-4">
            Halaman {page} dari {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  )
}
