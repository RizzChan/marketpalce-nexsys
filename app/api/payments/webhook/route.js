import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import QRCode from 'qrcode'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body

    // Verifikasi signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      console.error('Invalid Midtrans signature')
      return Response.json({ message: 'Invalid signature' }, { status: 401 })
    }

    // Cari order berdasarkan orderNumber
    const order = await prisma.order.findFirst({
      where: { orderNumber: order_id },
      include: { payment: true },
    })

    if (!order) {
      return Response.json({ message: 'Order not found' }, { status: 404 })
    }

    // Tentukan payment status
    let paymentStatus = 'PENDING'
    let orderStatus = order.status

    if (transaction_status === 'capture' && fraud_status === 'accept') {
      paymentStatus = 'SUCCESS'
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'SUCCESS'
    } else if (transaction_status === 'pending') {
      paymentStatus = 'PENDING'
    } else if (['deny', 'expire', 'cancel'].includes(transaction_status)) {
      paymentStatus = transaction_status === 'expire' ? 'EXPIRED' : 'FAILED'
    }

    // ✅ FIX: semua method cukup PAID dulu, admin yang ubah selanjutnya
    if (paymentStatus === 'SUCCESS') {
      orderStatus = 'PAID'
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED') {
      orderStatus = 'CANCELLED'
    }

    // Generate QR code untuk pickup (generate sekarang, tampil nanti saat READY_FOR_PICKUP)
    let pickupQrCode = order.pickupQrCode
    if (paymentStatus === 'SUCCESS' && order.shippingMethod === 'PICKUP' && order.pickupCode) {
      pickupQrCode = await QRCode.toDataURL(order.pickupCode, {
        width: 300,
        margin: 2,
      })
    }

    // Update database
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: paymentStatus,
          paymentMethod: payment_type,
          paidAt: paymentStatus === 'SUCCESS' ? new Date() : null,
          rawResponse: body,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus,
          ...(pickupQrCode && { pickupQrCode }),
        },
      }),
    ])

    return Response.json({ message: 'OK' })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}