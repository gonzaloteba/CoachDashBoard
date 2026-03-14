import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zalud Coach Dashboard',
  description: 'Dashboard interactivo para los coaches de Zalud',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
