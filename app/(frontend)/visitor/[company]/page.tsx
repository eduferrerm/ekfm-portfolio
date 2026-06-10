// ISR: per-company pages are generated on-demand and revalidated hourly.
export const revalidate = 3600

type Args = {
  params: Promise<{ company: string }>
}

export default async function VisitorPage({ params }: Args) {
  const { company } = await params
  return <main data-visitor-company={company} />
}
