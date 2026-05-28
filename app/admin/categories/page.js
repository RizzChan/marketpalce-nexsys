"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import CategoryFormModal from "@/components/admin/CategoryFormModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: null,
    name: "",
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search && { search }),
      });

      const res = await fetch(`/api/admin/categories?${params}`);
      const data = await res.json();

      if (data.success) {
        setCategories(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || "Gagal memuat kategori");
      }
    } catch (error) {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function handleAdd() {
    setEditCategory(null);
    setModalOpen(true);
  }

  function handleEdit(category) {
    setEditCategory(category);
    setModalOpen(true);
  }

  function handleDelete(id, name) {
    setConfirmDialog({ open: true, id, name });
  }

  async function confirmDelete() {
    setDeletingId(confirmDialog.id);

    try {
      const res = await fetch(`/api/admin/categories/${confirmDialog.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Kategori berhasil dihapus");
        setConfirmDialog({ open: false, id: null, name: "" });

        if (categories.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchCategories();
        }
      } else {
        toast.error(data.message || "Gagal menghapus kategori");
      }
    } catch (error) {
      toast.error("Gagal menghapus kategori");
    } finally {
      setDeletingId(null);
    }
  }

  function handleModalSuccess() {
    setModalOpen(false);
    fetchCategories();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
          <p className="text-sm text-gray-400 mt-1">
            {pagination.total ? `${pagination.total} kategori terdaftar` : ""}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-black hover:bg-gray-800 gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari kategori..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Kategori
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Slug
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Produk
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-4">
                  Dibuat
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
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-8 w-20 ml-auto rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Tag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Kategori tidak ditemukan</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {categories.map((category) => (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Tag className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {category.description || "Tidak ada deskripsi"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {category.slug}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {category._count?.products || 0} produk
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          className={
                            category.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }
                        >
                          {category.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(category.id, category.name)
                            }
                            disabled={deletingId === category.id}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            {deletingId === category.id ? (
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

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        category={editCategory}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Hapus Kategori?"
        description={`Kategori "${confirmDialog.name}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null, name: "" })}
      />
    </div>
  );
}