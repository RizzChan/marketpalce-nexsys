import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/auth'

export async function GET(request) {
  const user = await getAuthUser(request)
  const authError = requireAdmin(user)
  if (authError) return authError

  try {
    const [
      totalOrders,
      completedOrders,
      totalRevenue,
      uniqueCustomers,
      ordersByStatus,
      topProductsRaw,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.order.findMany({
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        orderBy: {
          _count: {
            status: 'desc',
          },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: {
          quantity: true,
        },
        _count: {
          productId: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
          payment: {
            select: { status: true, paymentMethod: true, paidAt: true },
          },
          items: {
            take: 2,
            select: {
              quantity: true,
              productName: true,
              price: true,
            },
          },
        },
      }),
    ])

    const topProducts = topProductsRaw.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalSold: item._sum.quantity || 0,
      totalOrders: item._count.productId || 0,
    }))

    return Response.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          completedOrders,
          totalRevenue: totalRevenue._sum.amount || 0,
          uniqueCustomers: uniqueCustomers.length,
        },
        ordersByStatus,
        topProducts,
        recentOrders,
      },
    })
  } catch (error) {
    console.error('Admin reports error:', error)
    return Response.json(
      { success: false, message: 'Gagal mengambil data report penjualan.' },
      { status: 500 }
    )
  }
}