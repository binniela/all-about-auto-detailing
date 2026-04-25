import './globals.css'

export const metadata = {
  title: 'All About Auto Detailing',
  description: 'Professional auto detailing in Canyon Lake, CA. Paint correction, interior deep clean, hand wax & more. Family owned since 2010.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
