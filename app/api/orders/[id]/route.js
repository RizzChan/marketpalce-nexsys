import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export async function GET(request, { params }) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { id } = await params

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, slug: true },
            },
          },
        },
        payment: true,
        shipping: true,
        invoice: true,
      },
    })

    if (!order) {
      return Response.json(
        { success: false, message: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      )
    }

    return Response.json({ success: true, data: order })
  } catch (error) {
    console.error('Get order detail error:', error)
    return Response.json(
      { success: false, message: 'Gagal mengambil data pesanan.' },
      { status: 500 }
    )
  }
}
