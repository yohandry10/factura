import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sistema de Facturas - Interbank',
  description: 'Sistema de generación de recibos bancarios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}