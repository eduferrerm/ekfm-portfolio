import { SectionNav } from '@/features/menu/SectionNav'

/**
 * Shared layout for the experience section, mirroring the portfolio layout: a
 * persistent sidebar (nav) plus the server-rendered per-role detail route in the
 * content slot. The sidebar is not remounted across soft-navigations, giving the
 * section its SPA feel while each detail route stays server-rendered.
 */
export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border p-4">
        <SectionNav />
      </aside>
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  )
}
