import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

// GET - Ambil cart user
export async function GET(request) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
                isActive: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!cart) {
      const newCart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: true },
      })
      return Response.json({ success: true, data: { ...newCart, items: [] } })
    }

    return Response.json({ success: true, data: cart })
  } catch (error) {
    console.error('Get cart error:', error)
    return Response.json(
      { success: false, message: 'Gagal mengambil data keranjang.' },
      { status: 500 }
    )
  }
}

// POST - Tambah item ke cart
export async function POST(request) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return Response.json(
        { success: false, message: 'Product ID wajib diisi.' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.isActive) {
      return Response.json(
        { success: false, message: 'Produk tidak ditemukan.' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return Response.json(
        { success: false, message: 'Stok produk tidak mencukupi.' },
        { status: 400 }
      )
    }

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    })

    let cartItem
    if (existingItem) {
      const newQty = existingItem.quantity + quantity
      if (newQty > product.stock) {
        return Response.json(
          { success: false, message: 'Jumlah melebihi stok yang tersedia.' },
          { status: 400 }
        )
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
        include: { product: true },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
        include: { product: true },
      })
    }

    return Response.json({
      success: true,
      message: 'Produk ditambahkan ke keranjang.',
      data: cartItem,
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    return Response.json(
      { success: false, message: 'Gagal menambahkan ke keranjang.' },
      { status: 500 }
    )
  }
}
