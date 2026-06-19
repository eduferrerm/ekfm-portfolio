import Link from "next/link";

import { List } from "@/components/primitives/List";
import type { Landing } from "@/payload-types";
import { keywordLabels } from "@/features/experience/projections";
import { proseLines } from "@/lib/prose";

import { LandingCard } from "./LandingCard";
import type { LandingCardData } from "./projections";

/** Shared band container: consistent max-width + vertical rhythm across bands. */
const BAND = "mx-auto w-full max-w-5xl px-6 py-20";

/** Small uppercase band sub-label ("Drive", "Craft", "Dive into"). */
function BandLabel({ children }: { children: React.ReactNode }) {
	return (
		<h3 className='mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
			{children}
		</h3>
	);
}

/**
 * Hero — the un-anchored top band ("PRODUCT ENGINEERING" + Drive prose + Craft
 * keyword pills). Not a `sections` entry; the nav is hidden over it.
 */
export function HeroBand({ hero }: { hero: Landing["hero"] }) {
	const drive = proseLines(hero?.drive);
	const craft = keywordLabels(hero?.craft);

	return (
		<section className={BAND}>
			<h1 className='mb-16 text-5xl font-semibold tracking-tight sm:text-7xl'>
				{hero?.title}
			</h1>
			<div className='grid gap-10 sm:grid-cols-2'>
				{drive.length > 0 && (
					<div>
						{hero?.driveLabel && <BandLabel>{hero.driveLabel}</BandLabel>}
						<List variant='prose' items={drive} />
					</div>
				)}
				{craft.length > 0 && (
					<div>
						{hero?.craftLabel && <BandLabel>{hero.craftLabel}</BandLabel>}
						<List variant='tag' items={craft} />
					</div>
				)}
			</div>
		</section>
	);
}

/**
 * TL;DR — the "Hi there! I'm Edu" band: greeting + an array of titled prose
 * blocks (the bio "Background" block is the first).
 */
export function TldrBand({
	id,
	tldr,
	yearsLabel,
}: {
	id: string;
	tldr: Landing["tldr"];
	yearsLabel?: string;
}) {
	const blocks = tldr?.blocks ?? [];
	// Inject the computed years-of-experience wherever the author drops a `{years}`
	// token in the TL;DR copy — the surrounding words stay in the CMS, code supplies
	// only the figure. Resolves to '' when there is no datable experience.
	const fillYears = (text: string) =>
		text.replaceAll("{years}", yearsLabel ?? "");
	const greeting = tldr?.greeting ? fillYears(tldr.greeting) : "";

	return (
		<section id={id} className={`${BAND} scroll-mt-24`}>
			{greeting && (
				<h2 className='mb-12 text-4xl font-semibold tracking-tight'>
					{greeting}
				</h2>
			)}
			<div className='space-y-12'>
				{blocks.map((block, i) => (
					<div key={block.id ?? i}>
						<BandLabel>{block.title}</BandLabel>
						<List
							variant='prose'
							items={proseLines(block.body).map(fillYears)}
						/>
					</div>
				))}
			</div>
		</section>
	);
}

/**
 * Shared Experience/Portfolio band: heading + descriptive subheader, a labelled
 * "Dive into" list, and the projected cards. Same shape for both — only the copy
 * group, the card set, and the CTA label differ.
 */
export function LandingSectionBand({
	id,
	section,
	cards,
	ctaLabel,
}: {
	id: string;
	section: Landing["portfolio"];
	cards: LandingCardData[];
	ctaLabel: string;
}) {
	const diveItems = proseLines(section?.diveInto?.items);

	return (
		<section id={id} className={`${BAND} scroll-mt-24`}>
			<h2 className='text-3xl font-semibold tracking-tight'>
				{section?.heading}
			</h2>
			{section?.subheader && (
				<p className='mt-3 max-w-2xl text-muted-foreground'>
					{section.subheader}
				</p>
			)}

			<div className='mt-10 grid gap-10'>
				{diveItems.length > 0 && (
					<div>
						{section?.diveInto?.subheader && (
							<BandLabel>{section.diveInto.subheader}</BandLabel>
						)}
						<List variant='prose' items={diveItems} />
					</div>
				)}
				{cards.length > 0 && (
					<div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
						{cards.map((card, i) => (
							<LandingCard
								key={`${card.href}-${i}`}
								card={card}
								ctaLabel={ctaLabel}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}

/**
 * More About Me — heading + subheader, then space reserved for the relational
 * map (its own feature branch) above a teaser card that contextualises it. The
 * card has no link yet; the map feature wires it.
 */
export function MoreAboutMeBand({
	id,
	data,
}: {
	id: string;
	data: Landing["moreAboutMe"];
}) {
	const teaser = data?.teaser;
	const teaserItems = proseLines(teaser?.items);

	return (
		<section id={id} className={`${BAND} scroll-mt-24`}>
			<h2 className='text-3xl font-semibold tracking-tight'>{data?.heading}</h2>
			{data?.subheader && (
				<p className='mt-3 text-muted-foreground'>{data.subheader}</p>
			)}

			{/* Map renders here once its feature branch lands. */}
			<div className='mt-10 rounded-2xl border border-dashed border-border p-6 sm:p-10'>
				{teaser?.eyebrow && (
					<p className='text-xs font-semibold uppercase tracking-widest text-primary'>
						{teaser.eyebrow}
					</p>
				)}
				{teaser?.title && (
					<h3 className='mt-1 text-xl font-semibold tracking-tight'>
						{teaser.title}
					</h3>
				)}
				{teaser?.description && (
					<p className='mt-3 text-muted-foreground'>{teaser.description}</p>
				)}
				{teaserItems.length > 0 && (
					<List variant='prose' items={teaserItems} className='mt-6' />
				)}
				{teaser?.ctaLabel && (
					<span className='mt-8 inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground'>
						{teaser.ctaLabel}
					</span>
				)}
			</div>
		</section>
	);
}

/** Contact — closing band with a CTA out (the LinkedIn link in the mock). */
export function ContactBand({
	id,
	contact,
}: {
	id: string;
	contact: Landing["contact"];
}) {
	return (
		<section id={id} className={`${BAND} scroll-mt-24`}>
			<h2 className='text-3xl font-semibold tracking-tight'>
				{contact?.header}
			</h2>
			{contact?.subheader && (
				<p className='mt-3 max-w-2xl text-lg text-foreground/80'>
					{contact.subheader}
				</p>
			)}
			{contact?.description && (
				<p className='mt-3 max-w-2xl text-muted-foreground'>
					{contact.description}
				</p>
			)}
			{contact?.ctaUrl && contact?.ctaLabel && (
				<Link
					href={contact.ctaUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='mt-8 inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted'
				>
					{contact.ctaLabel}
				</Link>
			)}
		</section>
	);
}
