import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const categorySlug = searchParams.get('category') || ''
    const sortBy = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const skip = (page - 1) * limit

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categorySlug && {
        category: { slug: categorySlug },
      }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const productsWithRating = products.map((p) => ({
      ...p,
      averageRating:
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0,
      reviewCount: p.reviews.length,
      reviews: undefined,
    }))

    return Response.json({
      success: true,
      data: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return Response.json(
      { success: false, message: 'Gagal mengambil data produk.' },
      { status: 500 }
    )
  }
}
