import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return Response.json({ success: true, data: categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return Response.json(
      { success: false, message: 'Gagal mengambil data kategori.' },
      { status: 500 }
    )
  }
}
