import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/auth'

export async function GET(request, { params }) {
  const user = await getAuthUser(request)
  const authError = requireAdmin(user)
  if (authError) return authError

  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!product) {
      return Response.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 })
    }
    return Response.json({ success: true, data: product })
  } catch (error) {
    return Response.json({ success: false, message: 'Gagal mengambil produk.' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const user = await getAuthUser(request)
  const authError = requireAdmin(user)
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, stock, categoryId, images, weight, isActive } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        images: images || [],
        weight: parseInt(weight) || 0,
        isActive: isActive ?? true,
      },
      include: { category: true },
    })

    return Response.json({ success: true, data: product })
  } catch (error) {
    console.error('Admin update product error:', error)
    return Response.json({ success: false, message: 'Gagal mengupdate produk.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request)
  const authError = requireAdmin(user)
  if (authError) return authError

  try {
    const { id } = await params
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })
    return Response.json({ success: true, message: 'Produk dinonaktifkan.' })
  } catch (error) {
    return Response.json({ success: false, message: 'Gagal menghapus produk.' }, { status: 500 })
  }
}
