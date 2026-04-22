import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { snap } from "@/lib/midtrans";

export async function POST(request) {
  const user = await getAuthUser(request);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return Response.json(
        { success: false, message: "Order ID wajib diisi." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { items: true, payment: true },
    });

    if (!order) {
      return Response.json(
        { success: false, message: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (order.payment?.status === "SUCCESS") {
      return Response.json(
        { success: false, message: "Pesanan sudah dibayar." },
        { status: 400 }
      );
    }

    // Buat Midtrans transaction parameter
    const parameter = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: Math.round(Number(order.total)),
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || "08000000000",
      },
      item_details: order.items.map((item) => ({
        id: item.productId,
        name: item.productName.substring(0, 50),
        price: Math.round(Number(item.price)),
        quantity: item.quantity,
      })),
      callbacks: {
        finish: `http://localhost:3000/orders/${order.id}`,
        error: `http://localhost:3000/checkout`,
        pending: `http://localhost:3000/orders/${order.id}`,
      },
    };

    // Tambah ongkir ke item_details kalau ada
    if (Number(order.shippingCost) > 0) {
      parameter.item_details.push({
        id: "SHIPPING",
        name: "Ongkos Kirim",
        price: Math.round(Number(order.shippingCost)),
        quantity: 1,
      });
    }

    // Request Snap token ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Simpan payment record
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        midtransToken: transaction.token,
        midtransOrderId: order.orderNumber,
        amount: order.total,
      },
      create: {
        orderId: order.id,
        midtransOrderId: order.orderNumber,
        midtransToken: transaction.token,
        amount: order.total,
        status: "PENDING",
      },
    });

    return Response.json({
      success: true,
      data: {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return Response.json(
      { success: false, message: "Gagal membuat transaksi pembayaran." },
      { status: 500 }
    );
  }
}
