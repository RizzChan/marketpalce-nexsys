import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export async function POST(request, { params }) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const { id } = await params

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
    })

    if (!order) {
      return Response.json({ success: false, message: 'Pesanan tidak ditemukan.' }, { status: 404 })
    }

    // Hanya bisa konfirmasi kalau status SHIPPED
    if (order.status !== 'SHIPPED') {
      return Response.json(
        { success: false, message: 'Pesanan belum dalam status dikirim.' },
        { status: 400 }
      )
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' },
    })

    return Response.json({ success: true, message: 'Pesanan berhasil dikonfirmasi!' })
  } catch (error) {
    console.error('Confirm order error:', error)
    return Response.json({ success: false, message: 'Gagal mengkonfirmasi pesanan.' }, { status: 500 })
  }
}