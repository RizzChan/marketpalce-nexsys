import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

// PATCH - Update quantity
export async function PATCH(request, { params }) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { itemId } = await params
    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return Response.json(
        { success: false, message: 'Jumlah tidak valid.' },
        { status: 400 }
      )
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } })
    if (!cart) {
      return Response.json(
        { success: false, message: 'Keranjang tidak ditemukan.' },
        { status: 404 }
      )
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    })

    if (!cartItem) {
      return Response.json(
        { success: false, message: 'Item tidak ditemukan.' },
        { status: 404 }
      )
    }

    if (quantity > cartItem.product.stock) {
      return Response.json(
        { success: false, message: 'Jumlah melebihi stok yang tersedia.' },
        { status: 400 }
      )
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    })

    return Response.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update cart error:', error)
    return Response.json(
      { success: false, message: 'Gagal mengupdate keranjang.' },
      { status: 500 }
    )
  }
}

// DELETE - Hapus item dari cart
export async function DELETE(request, { params }) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { itemId } = await params

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } })
    if (!cart) {
      return Response.json(
        { success: false, message: 'Keranjang tidak ditemukan.' },
        { status: 404 }
      )
    }

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    })

    return Response.json({ success: true, message: 'Item dihapus dari keranjang.' })
  } catch (error) {
    console.error('Delete cart item error:', error)
    return Response.json(
      { success: false, message: 'Gagal menghapus item.' },
      { status: 500 }
    )
  }
}
