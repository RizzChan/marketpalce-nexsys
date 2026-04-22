import { prisma } from '@/lib/prisma.js'
import { getAuthUser, requireAdmin } from '@/lib/auth.js'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    const authError = requireAdmin(user)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          items: { include: { product: { select: { name: true, images: true } } } },
          payment: { select: { status: true, paymentMethod: true, paidAt: true } },
          shipping: { select: { courierName: true, trackingNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return Response.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get admin orders error:', error)
    return Response.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}