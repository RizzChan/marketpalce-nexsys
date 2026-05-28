import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const name = body.name?.trim();
    const description = body.description?.trim() || null;
    const image = body.image?.trim() || null;
    const isActive = body.isActive ?? true;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const current = await prisma.category.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const duplicateName = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (duplicateName) {
      return NextResponse.json(
        { success: false, message: "Nama kategori sudah digunakan" },
        { status: 400 }
      );
    }

    let baseSlug = slugify(name, { lower: true, strict: true });
    if (!baseSlug) {
      baseSlug = `kategori-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const duplicateSlug = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (!duplicateSlug) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diupdate",
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak bisa dihapus karena masih memiliki produk",
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}