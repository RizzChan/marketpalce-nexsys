import { prisma } from '@/lib/prisma.js'
import { getAuthUser, requireAdmin } from '@/lib/auth.js'

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser(request)
    const authError = requireAdmin(user)
    if (authError) return authError

    const { id } = await params // ← await params dulu!

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
          },
        },
        payment: true,
        shipping: true,
        invoice: true,
      },
    })

    if (!order) {
      return Response.json({ success: false, message: 'Order tidak ditemukan.' }, { status: 404 })
    }

    return Response.json({ success: true, data: order })
  } catch (error) {
    console.error('Get order detail error:', error)
    return Response.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser(request)
    const authError = requireAdmin(user)
    if (authError) return authError

    const { id } = await params // ← await params dulu!
    const body = await request.json()
    const { status, courierName, trackingNumber } = body

    const validStatuses = [
      'PAYMENT_PENDING', 'PAID', 'PROCESSING',
      'READY_FOR_PICKUP', 'SHIPPED', 'COMPLETED', 'CANCELLED',
    ]

    if (!validStatuses.includes(status)) {
      return Response.json({ success: false, message: 'Status tidak valid.' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { shipping: true },
    })

    if (!order) {
      return Response.json({ success: false, message: 'Order tidak ditemukan.' }, { status: 404 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    })

    if (order.shippingMethod === 'DELIVERY' && (courierName || trackingNumber)) {
      await prisma.shipping.upsert({
        where: { orderId: id },
        update: {
          ...(courierName && { courierName }),
          ...(trackingNumber && { trackingNumber }),
          ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        },
        create: {
          orderId: id,
          courierName: courierName || null,
          trackingNumber: trackingNumber || null,
          shippedAt: status === 'SHIPPED' ? new Date() : null,
        },
      })
    }

    return Response.json({
      success: true,
      message: 'Status order berhasil diperbarui.',
      data: updatedOrder,
    })
  } catch (error) {
    console.error('Update order status error:', error)
    return Response.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}