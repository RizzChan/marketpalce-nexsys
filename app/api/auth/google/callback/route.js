import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.js'
import { signToken } from '@/lib/jwt.js'
import bcrypt from 'bcryptjs'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`)
  }

  try {
    // Step 1: Tukar code dengan access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${origin}/login?error=google_token_failed`)
    }

    // Step 2: Ambil data user dari Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const googleUser = await userInfoRes.json()

    if (!googleUser.email) {
      return NextResponse.redirect(`${origin}/login?error=google_user_failed`)
    }

    // Step 3: Cek user di database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (!user) {
      // Auto register kalau belum punya akun
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(),
        10
      )
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          password: randomPassword,
          avatar: googleUser.picture || null,
          role: 'CUSTOMER',
          isActive: true,
        },
      })
    } else if (!user.isActive) {
      return NextResponse.redirect(`${origin}/login?error=account_inactive`)
    }

    // Step 4: Generate JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Step 5: Redirect + set cookie
    const redirectUrl = user.role === 'ADMIN' ? `${origin}/admin` : `${origin}/`
    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    })

    return response
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(`${origin}/login?error=server_error`)
  }
}