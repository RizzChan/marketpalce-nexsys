import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        category: true,
        reviews: {
          where: { isVisible: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return Response.json(
        { success: false, message: 'Produk tidak ditemukan.' },
        { status: 404 }
      )
    }

    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

    return Response.json({
      success: true,
      data: { ...product, averageRating, reviewCount: product.reviews.length },
    })
  } catch (error) {
    console.error('Get product detail error:', error)
    return Response.json(
      { success: false, message: 'Gagal mengambil data produk.' },
      { status: 500 }
    )
  }
}
