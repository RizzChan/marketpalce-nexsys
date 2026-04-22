import { verifyToken } from './jwt.js'
import { prisma } from './prisma.js'

export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(';').map((c) => {
            const [key, ...v] = c.trim().split('=')
            return [key, v.join('=')]
          })
        )
        token = cookies['auth_token']
      }
    }

    if (!token) return null

    const decoded = verifyToken(token)
    if (!decoded) return null

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) return null

    return user
  } catch (error) {
    return null
  }
}

export function requireAuth(user) {
  if (!user) {
    return Response.json(
      { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }
  return null
}

export function requireAdmin(user) {
  if (!user) {
    return Response.json(
      { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' },
      { status: 401 }
    )
  }
  if (user.role !== 'ADMIN') {
    return Response.json(
      { success: false, message: 'Forbidden. Akses hanya untuk admin.' },
      { status: 403 }
    )
  }
  return null
}
