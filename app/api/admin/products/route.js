import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAdmin } from '@/lib/auth'

export async function GET(request) {
  const user = await getAuthUser(request)
  const authError = requireAdmin(user)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ],
    } : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return Response.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin get products error:', error)
    return Response.json({ success: false, message: 'Gagal mengambil data produk.' }, { status: 500 })
  }
}

export async function POST(request) {
  const user = await getAuthUser(request)
  const authError = requireAdmin(user)
  if (authError) return authError

  try {
    const body = await request.json()
    const { name, description, price, stock, categoryId, images, weight } = body

    if (!name || !price || !categoryId) {
      return Response.json(
        { success: false, message: 'Nama, harga, dan kategori wajib diisi.' },
        { status: 400 }
      )
    }

    // Generate slug dari nama
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Pastikan slug unik
    let slug = baseSlug
    let counter = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId,
        images: images || [],
        weight: parseInt(weight) || 0,
      },
      include: { category: true },
    })

    return Response.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    console.error('Admin create product error:', error)
    return Response.json({ success: false, message: 'Gagal membuat produk.' }, { status: 500 })
  }
}
