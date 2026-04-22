import { prisma } from '@/lib/prisma.js'
import { signToken } from '@/lib/jwt.js'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      )
    }

    // Cari user
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.isActive) {
      return Response.json(
        { success: false, message: 'Email atau password salah.' },
        { status: 401 }
      )
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: 'Email atau password salah.' },
        { status: 401 }
      )
    }

    // Generate token
    const token = signToken({ id: user.id, email: user.email, role: user.role })

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    }

    const response = Response.json({
      success: true,
      message: 'Login berhasil!',
      data: { user: userData, token },
    })

    response.headers.set(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    )

    return response
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    )
  }
}
