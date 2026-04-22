"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  MapPin,
  Store,
  Truck,
  CreditCard,
  FileText,
  QrCode,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

// ✅ FIX: Status steps sesuai flow baru
const STATUS_STEPS = {
  PICKUP: [
    "PAYMENT_PENDING",
    "PAID",
    "PROCESSING",
    "READY_FOR_PICKUP",
    "COMPLETED",
  ],
  DELIVERY: ["PAYMENT_PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED"],
};

// ✅ FIX: Label sesuai status baru
const STEP_LABEL = {
  PAYMENT_PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Sedang Diproses",
  READY_FOR_PICKUP: "Siap Diambil",
  SHIPPED: "Dalam Pengiriman",
  COMPLETED: "Selesai",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error("Pesanan tidak ditemukan");
        router.push("/orders");
      }
    } catch (error) {
      toast.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchOrder();
    toast.success("Status diperbarui");
  }

  async function handleConfirmReceived() {
    setConfirming(true);
    try {
      const res = await fetch(`/api/orders/${id}/confirm`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Pesanan dikonfirmasi! Terima kasih 🎉");
        await fetchOrder(); // refresh data
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Gagal mengkonfirmasi pesanan");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) return null;

  const steps = STATUS_STEPS[order.shippingMethod] || STATUS_STEPS.PICKUP;
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  // ✅ FIX: cek dari order.status, bukan payment.status
  const isPending = order.status === "PAYMENT_PENDING";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/orders">
              <ArrowLeft className="w-4 h-4" /> Pesanan
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-400">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          {refreshing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Status Pesanan</h2>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Progress Steps */}
          {!isCancelled ? (
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{
                    width:
                      currentStepIndex < 0
                        ? "0%"
                        : `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="relative flex justify-between">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-2 z-10"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone
                            ? "bg-black border-black"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <span
                        className={`text-xs text-center max-w-16 leading-tight ${
                          isCurrent
                            ? "font-semibold text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {STEP_LABEL[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-700">Pesanan Dibatalkan</p>
                <p className="text-sm text-red-400">
                  Pesanan ini telah dibatalkan.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ✅ FIX: QR Code hanya muncul saat status READY_FOR_PICKUP */}
        {order.shippingMethod === "PICKUP" &&
          order.status === "READY_FOR_PICKUP" &&
          order.pickupQrCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-green-200 p-6 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
                <CheckCircle className="w-3 h-3" />
                Siap Diambil
              </div>
              <h2 className="font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                Kode Pengambilan
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Tunjukkan kode ini saat mengambil pesanan
              </p>

              {/* QR Code Image */}
              <div className="flex justify-center mb-4">
                <img
                  src={order.pickupQrCode}
                  alt="QR Code Pickup"
                  className="w-40 h-40 rounded-xl"
                />
              </div>

              {/* Kode teks */}
              <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-8 py-4">
                <p className="text-3xl font-bold tracking-widest text-gray-900 font-mono">
                  {order.pickupCode}
                </p>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                📍 Ambil di toko kami selama jam operasional
              </p>
            </motion.div>
          )}

        {/* Pending Payment Warning */}
        {isPending && !isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">
                  Menunggu Pembayaran
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  Selesaikan pembayaran sebelum pesanan diproses.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                  asChild
                >
                  <Link href="/checkout">Bayar Sekarang</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shipping Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            {order.shippingMethod === "PICKUP" ? (
              <>
                <Store className="w-5 h-5" /> Info Pengambilan
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" /> Alamat Pengiriman
              </>
            )}
          </h2>

          {order.shippingMethod === "PICKUP" ? (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Store className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Toko MarketPlace</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ambil langsung di toko kami. Bawa kode pickup saat
                  pengambilan.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Truck className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">
                  {order.shippingName}
                </p>
                {order.shippingPhone && (
                  <p className="text-sm text-gray-500">{order.shippingPhone}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {order.shippingAddress}
                  {order.shippingCity && `, ${order.shippingCity}`}
                  {order.shippingProvince && `, ${order.shippingProvince}`}
                  {order.shippingPostCode && ` ${order.shippingPostCode}`}
                </p>
                {/* Info resi kalau sudah SHIPPED */}
                {order.shipping?.courierName && (
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                    <p className="text-xs text-gray-500">
                      Kurir:{" "}
                      <span className="font-medium text-gray-700">
                        {order.shipping.courierName}
                      </span>
                      {order.shipping.trackingNumber && (
                        <>
                          {" "}
                          · Resi:{" "}
                          <span className="font-medium text-gray-700">
                            {order.shipping.trackingNumber}
                          </span>
                        </>
                      )}
                    </p>
                    {/* ✅ Tombol Cek Resi */}
                    {order.shipping.trackingNumber && (
                      <a
                        href={`https://cekresi.com/?noresi=${order.shipping.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Truck className="w-3 h-3" />
                        Cek Resi Pengiriman ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> Item Pesanan
          </h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <Image
                    src={
                      item.product?.images?.[0] ||
                      item.productImage ||
                      "https://placehold.co/100x100/f5f5f5/999?text=IMG"
                    }
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.quantity}x {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 text-sm shrink-0">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Ongkos Kirim</span>
              <span
                className={
                  Number(order.shippingCost) === 0 ? "text-green-600" : ""
                }
              >
                {Number(order.shippingCost) === 0
                  ? "Gratis"
                  : formatPrice(order.shippingCost)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Info Pembayaran
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <PaymentStatusBadge status={order.payment?.status || "PENDING"} />
            </div>
            {order.payment?.paymentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Metode</span>
                <span className="font-medium capitalize text-gray-700">
                  {order.payment.paymentMethod.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {order.payment?.paidAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dibayar pada</span>
                <span className="font-medium text-gray-700">
                  {formatDate(order.payment.paidAt)}
                </span>
              </div>
            )}
            {order.invoice?.invoiceNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> No. Invoice
                </span>
                <span className="font-medium text-gray-700">
                  {order.invoice.invoiceNumber}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Notes */}
        {order.notes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h2 className="font-bold text-gray-900 mb-2">Catatan</h2>
            <p className="text-sm text-gray-500">{order.notes}</p>
          </motion.div>
        )}

        {/* Tombol Konfirmasi Diterima - hanya muncul saat SHIPPED */}
        {order.status === "SHIPPED" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-800">
                  Paket Sudah Sampai?
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Klik tombol di bawah jika pesanan kamu sudah diterima dengan
                  baik.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={handleConfirmReceived}
                  disabled={confirming}
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      Mengkonfirmasi...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Konfirmasi Pesanan
                      Diterima
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <div className="flex gap-3 pt-2 pb-8">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/orders">Kembali ke Pesanan</Link>
          </Button>
          <Button className="flex-1 bg-black hover:bg-gray-800" asChild>
            <Link href="/products">Belanja Lagi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
