import { prisma } from '@/lib/prisma.js'
import { signToken } from '@/lib/jwt.js'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    // Validasi input
    if (!name || !email || !password) {
      return Response.json(
        { success: false, message: 'Nama, email, dan password wajib diisi.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, message: 'Password minimal 6 karakter.' },
        { status: 400 }
      )
    }

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return Response.json(
        { success: false, message: 'Email sudah terdaftar.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    })

    // Buat cart kosong untuk user baru
    await prisma.cart.create({
      data: { userId: user.id },
    })

    // Generate token
    const token = signToken({ id: user.id, email: user.email, role: user.role })

    const response = Response.json(
      {
        success: true,
        message: 'Registrasi berhasil!',
        data: { user, token },
      },
      { status: 201 }
    )

    response.headers.set(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    )

    return response
  } catch (error) {
    console.error('Register error:', error)
    return Response.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    )
  }
}
