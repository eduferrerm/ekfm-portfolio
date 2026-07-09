import posthog from 'posthog-js'

/**
 * Analytics consent — the one piece of state we DO persist to the device.
 *
 * The tracking posture is storage-free (persistence: 'memory', no cross-day id),
 * but capturing is opt-out-BY-DEFAULT: nothing is sent until the visitor accepts.
 * The visitor's accept/decline choice is the single value written to localStorage,
 * which is the storage ePrivacy explicitly permits without consent (remembering a
 * user's own privacy decision is "strictly necessary"). See lib/posthog/provider.tsx
 * and the /privacy notice.
 */
export type ConsentChoice = 'accepted' | 'declined'

const CONSENT_KEY = 'ekfm:cookie-consent'

/** Read the stored choice. Returns null when unset or storage is unavailable. */
export function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    return raw === 'accepted' || raw === 'declined' ? raw : null
  } catch {
    return null // blocked/corrupt storage — treat as no choice yet
  }
}

/** Persist the choice. Best-effort — never throws on quota/availability errors. */
export function writeConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CONSENT_KEY, choice)
  } catch {
    // Ignore — the in-session opt-in/out below still takes effect.
  }
}

/**
 * Drive PostHog's capture state from a choice. `accepted` opts in; `declined`
 * (or no choice yet) keeps it opted out. Idempotent, so it's safe to call on
 * mount and again on the button click.
 */
export function syncPosthogConsent(choice: ConsentChoice | null): void {
  if (!posthog.__loaded) return // no key configured → nothing to gate
  if (choice === 'accepted') posthog.opt_in_capturing()
  else posthog.opt_out_capturing()
}

/**
 * Whether the browser is signalling Do-Not-Track. We honour it as a disclosed
 * courtesy: DNT visitors are never prompted and never tracked (PostHog's
 * `respect_dnt` also enforces the no-track half independently).
 */
export function hasDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false
  const dnt =
    navigator.doNotTrack ??
    (window as unknown as { doNotTrack?: string }).doNotTrack ??
    (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack
  return dnt === '1' || dnt === 'yes'
}
