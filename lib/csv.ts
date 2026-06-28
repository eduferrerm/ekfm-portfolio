/**
 * Minimal RFC-4180-ish CSV parser: double-quoted fields, `""` escape, CRLF/LF.
 * Shared by the seed/build scripts (keyword seeding, the More-About-Me graph
 * pipeline) so the parser lives in one place rather than re-inlined per script.
 *
 * Returns rows of raw string cells; callers map the header row to column indices
 * and trim/validate. Blank lines survive as `['']` rows — filter them out with
 * `rows.filter((r) => r.some((c) => c.trim() !== ''))` if undesired.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}
