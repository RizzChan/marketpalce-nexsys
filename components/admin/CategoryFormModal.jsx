"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoryFormModal({
  open,
  onClose,
  onSuccess,
  category,
}) {
  const isEdit = !!category;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive ?? true,
      });
    } else {
      setForm({
        name: "",
        description: "",
        image: "",
        isActive: true,
      });
    }
  }, [category, open]);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e?.preventDefault();

    if (!form.name.trim()) {
      toast.error("Nama kategori wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isEdit ? "Kategori diupdate!" : "Kategori ditambahkan!");
        onSuccess();
      } else {
        toast.error(data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">
            {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Nama Kategori *</Label>
            <Input
              placeholder="Contoh: Electronics"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              placeholder="Deskripsi kategori..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>URL Gambar</Label>
            <Input
              placeholder="https://example.com/category.jpg"
              value={form.image}
              onChange={(e) => handleChange("image", e.target.value)}
            />
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.isActive ? "true" : "false"}
                onValueChange={(v) => handleChange("isActive", v === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-black hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : isEdit ? (
              "Update Kategori"
            ) : (
              "Tambah Kategori"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}