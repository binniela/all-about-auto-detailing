import './globals.css'

export const metadata = {
  title: 'EZ Mobile Detailing',
  description: 'Mobile auto detailing in Los Angeles, CA. Book a detail at your home or office.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
