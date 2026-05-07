'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z" />
    </svg>
  )
}

const ERROR_MESSAGES = {
  google_auth_failed: 'Login Google dibatalkan.',
  google_token_failed: 'Gagal verifikasi Google. Coba lagi.',
  google_user_failed: 'Gagal ambil data Google. Coba lagi.',
  account_inactive: 'Akun kamu tidak aktif. Hubungi admin.',
  server_error: 'Terjadi kesalahan server.',
}

// Mode: 'password' | 'otp-email' | 'otp-verify'
function LoginContent() {
  const { login, loginWithToken } = useAuth()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState('password')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error && ERROR_MESSAGES[error]) {
      toast.error(ERROR_MESSAGES[error])
    }
  }, [searchParams])

  // Login dengan password (existing)
  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await login(formData.email, formData.password)
      if (!result.success) {
        toast.error(result.message)
      } else {
        toast.success('Selamat datang kembali!')
      }
    } catch {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Request OTP
  async function handleRequestOtp(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message)
        return
      }
      toast.success('Kode OTP telah dikirim ke email kamu!')
      setMode('otp-verify')
    } catch {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message)
        return
      }
      const result = await loginWithToken(data.token, data.user)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success('Selamat datang kembali!')
    } catch {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleLogin() {
    setIsGoogleLoading(true)
    window.location.href = '/api/auth/google'
  }

  function resetToPassword() {
    setMode('password')
    setOtpEmail('')
    setOtpCode('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/logo.png" alt="NEXSYS Logo" width={40} height={40} className="rounded-xl" />
          <span className="text-2xl font-bold text-gray-900">NEXSYS</span>
        </div>

        <Card className="border-0 shadow-lg">
          <AnimatePresence mode="wait">

            {/* ── MODE: LOGIN PASSWORD ── */}
            {mode === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold text-center">Masuk</CardTitle>
                  <CardDescription className="text-center">
                    Masukkan email dan password kamu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimal 6 karakter"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                      {isLoading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memproses...</>
                        : 'Masuk'}
                    </Button>
                  </form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-400">atau</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2 mb-3"
                    onClick={() => setMode('otp-email')}
                    disabled={isLoading || isGoogleLoading}
                  >
                    <Mail className="w-4 h-4" />
                    Masuk dengan Kode OTP
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                    Lanjutkan dengan Google
                  </Button>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">Demo Akun:</p>
                    <p className="text-xs text-gray-600">👤 Admin: admin@marketplace.com / admin123</p>
                    <p className="text-xs text-gray-600">🛒 Customer: customer@marketplace.com / customer123</p>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-black font-medium hover:underline">
                      Daftar sekarang
                    </Link>
                  </p>
                </CardContent>
              </motion.div>
            )}

            {/* ── MODE: INPUT EMAIL OTP ── */}
            {mode === 'otp-email' && (
              <motion.div
                key="otp-email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader className="space-y-1 pb-4">
                  <button
                    onClick={resetToPassword}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                  <CardTitle className="text-2xl font-bold text-center">Masuk dengan OTP</CardTitle>
                  <CardDescription className="text-center">
                    Masukkan email kamu, kami akan kirim kode verifikasi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-email">Email</Label>
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
                        : 'Kirim Kode OTP'}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* ── MODE: VERIFIKASI OTP ── */}
            {mode === 'otp-verify' && (
              <motion.div
                key="otp-verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CardHeader className="space-y-1 pb-4">
                  <button
                    onClick={() => setMode('otp-email')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                  <CardTitle className="text-2xl font-bold text-center">Cek Email Kamu</CardTitle>
                  <CardDescription className="text-center">
                    Kode OTP telah dikirim ke <strong>{otpEmail}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-code">Kode OTP</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                        disabled={isLoading}
                        className="text-center text-2xl tracking-widest font-bold"
                      />
                      <p className="text-xs text-gray-400 text-center">
                        Kode berlaku selama 5 menit
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otpCode.length !== 6}
                    >
                      {isLoading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memverifikasi...</>
                        : 'Verifikasi & Masuk'}
                    </Button>
                  </form>

                  <button
                    type="button"
                    onClick={() => setMode('otp-email')}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 hover:underline"
                  >
                    Kirim ulang kode
                  </button>
                </CardContent>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}