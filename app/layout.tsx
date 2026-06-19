import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: "AccessAudit — Audit d'accessibilité RGAA / EAA",
  description:
    "Testez gratuitement la conformité de votre site aux normes RGAA et EAA. Résultats en moins de 20 secondes, plan d'action inclus.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} antialiased bg-white text-gray-900`}>{children}</body>
    </html>
  )
}
