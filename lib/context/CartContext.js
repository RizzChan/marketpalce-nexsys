'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); return }
    try {
      setLoading(true)
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCart(data.data)
      }
    } catch (error) {
      console.error('Fetch cart error:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  async function addToCart(productId, quantity = 1) {
    if (!user) {
      toast.error('Silakan login terlebih dahulu.')
      return false
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
        toast.success('Produk ditambahkan ke keranjang!')
        return true
      } else {
        toast.error(data.message)
        return false
      }
    } catch (error) {
      toast.error('Gagal menambahkan ke keranjang.')
      return false
    }
  }

  async function updateQuantity(itemId, quantity) {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      const data = await res.json()
      if (data.success) await fetchCart()
      else toast.error(data.message)
    } catch (error) {
      toast.error('Gagal mengupdate keranjang.')
    }
  }

  async function removeFromCart(itemId) {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
        toast.success('Item dihapus dari keranjang.')
      }
    } catch (error) {
      toast.error('Gagal menghapus item.')
    }
  }

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const cartTotal = cart?.items?.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0
  ) || 0

  return (
    <CartContext.Provider value={{
      cart, loading, cartCount, cartTotal,
      addToCart, updateQuantity, removeFromCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart harus digunakan dalam CartProvider')
  return context
}
