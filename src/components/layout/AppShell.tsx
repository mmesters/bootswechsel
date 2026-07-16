import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white print:min-h-0">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 print:max-w-none print:p-0">{children}</main>
      <Footer />
    </div>
  )
}
