import { PortfolioNav } from '@/features/menu/PortfolioNav'

/**
 * Shared layout for the portfolio section: a persistent sidebar (nav) plus the
 * server-rendered detail route in the content slot. The sidebar is not
 * remounted across soft-navigations, giving the section its SPA feel while each
 * detail route stays server-rendered. Section state lives in the URL
 * (e.g. ?decision=) — read it in the child routes, not here.
 */
export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border p-4">
        <PortfolioNav />
      </aside>
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  )
}
