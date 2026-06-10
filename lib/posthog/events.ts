/**
 * Single source of truth for analytics event names and their payload shapes.
 *
 * Events fall into three buckets (the analytics domain spans all of them):
 *  - behavioral: what visitors do (page/section views, graph interaction)
 *  - ops:        operational signals (errors, slow loads, admin actions)
 *  - search:     search-palette usage (queries, result selection)
 *
 * Keep names stable — they become PostHog insight identifiers.
 */

export const AnalyticsEvent = {
  // behavioral
  SectionViewed: 'section_viewed',
  PortfolioItemOpened: 'portfolio_item_opened',
  GraphNodeClicked: 'graph_node_clicked',
  VisitorPageViewed: 'visitor_page_viewed',
  // ops
  AppError: 'app_error',
  SlowLoad: 'slow_load',
  // search
  SearchPerformed: 'search_performed',
  SearchResultSelected: 'search_result_selected',
} as const

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]

/** Payload contracts per event. Extend as features land. */
export type AnalyticsEventProperties = {
  [AnalyticsEvent.SectionViewed]: { section: string }
  [AnalyticsEvent.PortfolioItemOpened]: { slug: string; from?: string }
  [AnalyticsEvent.GraphNodeClicked]: { nodeId: string; nodeType?: string }
  [AnalyticsEvent.VisitorPageViewed]: { company: string }
  [AnalyticsEvent.AppError]: { message: string; context?: string }
  [AnalyticsEvent.SlowLoad]: { route: string; durationMs: number }
  [AnalyticsEvent.SearchPerformed]: { query: string; resultCount: number }
  [AnalyticsEvent.SearchResultSelected]: {
    query: string
    resultId: string
    rank: number
  }
}
