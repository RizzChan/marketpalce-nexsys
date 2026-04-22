import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { generateOrderNumber, generateInvoiceNumber, generatePickupCode } from '@/lib/utils'

export async function GET(request) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
        payment: true,
        shipping: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ success: true, data: orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return Response.json({ success: false, message: 'Gagal mengambil data pesanan.' }, { status: 500 })
  }
}

export async function POST(request) {
  const user = await getAuthUser(request)
  const authError = requireAuth(user)
  if (authError) return authError

  try {
    const body = await request.json()
    const { shippingMethod, notes, shippingAddress } = body

    if (!shippingMethod || !['PICKUP', 'DELIVERY'].includes(shippingMethod)) {
      return Response.json({ success: false, message: 'Metode pengiriman tidak valid.' }, { status: 400 })
    }

    if (shippingMethod === 'DELIVERY') {
      if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.name) {
        return Response.json({ success: false, message: 'Alamat pengiriman wajib diisi.' }, { status: 400 })
      }
    }

    // Ambil cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) {
      return Response.json({ success: false, message: 'Keranjang kosong.' }, { status: 400 })
    }

    // Validasi stok
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return Response.json({ success: false, message: `Produk "${item.product.name}" sudah tidak tersedia.` }, { status: 400 })
      }
      if (item.product.stock < item.quantity) {
        return Response.json({ success: false, message: `Stok "${item.product.name}" tidak mencukupi.` }, { status: 400 })
      }
    }

    // Hitung total
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
    const shippingCost = shippingMethod === 'DELIVERY' ? (subtotal > 500000 ? 0 : 15000) : 0
    const total = subtotal + shippingCost

    // Generate kode unik
    const orderNumber = generateOrderNumber()
    const invoiceNumber = generateInvoiceNumber()
    const pickupCode = shippingMethod === 'PICKUP' ? generatePickupCode() : null

    // Buat order dalam transaction
    const order = await prisma.$transaction(async (tx) => {
      // Buat order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          shippingMethod,
          notes: notes || null,
          subtotal,
          shippingCost,
          total,
          pickupCode,
          ...(shippingMethod === 'DELIVERY' && {
            shippingName: shippingAddress.name,
            shippingPhone: shippingAddress.phone,
            shippingAddress: shippingAddress.address,
            shippingCity: shippingAddress.city,
            shippingProvince: shippingAddress.province,
            shippingPostCode: shippingAddress.postCode,
          }),
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
              productName: item.product.name,
              productImage: item.product.images?.[0] || null,
            })),
          },
        },
        include: { items: true },
      })

      // Buat invoice
      await tx.invoice.create({
        data: { orderId: newOrder.id, invoiceNumber },
      })

      // Kurangi stok
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Kosongkan cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return Response.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return Response.json({ success: false, message: 'Gagal membuat pesanan.' }, { status: 500 })
  }
}
