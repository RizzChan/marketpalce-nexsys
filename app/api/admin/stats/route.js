import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/auth'

export async function GET(request) {
  const user = await getAuthUser(request)
  const authError = requireAdmin(user)
  if (authError) return authError

  try {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true } },
          items: { take: 1 },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    return Response.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalProducts,
        totalUsers,
        recentOrders,
        ordersByStatus,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return Response.json({ success: false, message: 'Gagal mengambil statistik.' }, { status: 500 })
  }
}
