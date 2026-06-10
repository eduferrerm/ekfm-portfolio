type Args = {
  params: Promise<{ slug: string }>
}

export default async function PortfolioItemPage({ params }: Args) {
  const { slug } = await params
  return <main data-portfolio-slug={slug} />
}
