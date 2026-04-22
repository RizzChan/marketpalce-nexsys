"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: null,
    name: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleAdd() {
    setEditProduct(null);
    setModalOpen(true);
  }

  function handleEdit(product) {
    setEditProduct(product);
    setModalOpen(true);
  }

  function handleDelete(id, name) {
    setConfirmDialog({ open: true, id, name });
  }

  async function confirmDelete() {
    setDeletingId(confirmDialog.id);
    try {
      const res = await fetch(`/api/admin/products/${confirmDialog.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Produk dinonaktifkan");
        setConfirmDialog({ open: false, id: null, name: "" });
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Gagal menghapus produk");
    } finally {
      setDeletingId(null);
    }
  }

  function handleModalSuccess() {
    setModalOpen(false);
    fetchProducts();
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-400 mt-1">
            {pagination.total ? `${pagination.total} produk terdaftar` : ""}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-black hover:bg-gray-800 gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari produk..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Produk
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Kategori
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Harga
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Stok
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 px-6 py-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-8 w-20 ml-auto rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Produk tidak ditemukan</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {products.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={
                                product.images?.[0] ||
                                "https://placehold.co/100x100/f5f5f5/999?text=IMG"
                              }
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium text-gray-900 text-sm line-clamp-1 max-w-48">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {product.category?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium ${
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock <= 5
                              ? "text-orange-500"
                              : "text-gray-900"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }
                        >
                          {product.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            disabled={deletingId === product.id}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-400" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Halaman {page} dari {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        product={editProduct}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Nonaktifkan Produk?"
        description={`Produk "${confirmDialog.name}" akan dinonaktifkan dan tidak tampil di toko.`}
        confirmLabel="Nonaktifkan"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null, name: "" })}
      />
    </div>
  );
}
