import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import { CartProvider } from '@/lib/context/CartContext'
import { Toaster } from 'react-hot-toast'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'MarketPlace',
  description: 'Platform belanja online terpercaya',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={geist.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '8px', background: '#333', color: '#fff' },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
