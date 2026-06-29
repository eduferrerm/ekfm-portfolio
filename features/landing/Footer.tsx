/**
 * The closing site footer — pinned to the very bottom of the document, the same
 * height as the sticky nav (`--header-h`). It sits *behind* the page (`<main>`
 * is `relative z-10`, opaque), so it is never scrolled *to*: the Contact band's
 * matching bottom margin opens a gap the same height as the footer, and the
 * footer is revealed underneath as the reader scrolls past Contact.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className=" bg-primary fixed inset-x-0 bottom-0 z-0 flex h-(--header-h) items-center justify-center">
      <p className="text-subtitle text-primary-foreground"> That is all... 🚀 © {year}</p>
    </footer>
  )
}
