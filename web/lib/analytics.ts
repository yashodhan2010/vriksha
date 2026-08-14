export type AnalyticsEventName =
  | "strategy_card_view"
  | "strategy_card_open"
  | "strategy_backtest_link_click"
  | "backtest_acknowledgement_started"
  | "backtest_acknowledgement_completed"
  | "backtest_viewed"
  | "strategy_added_to_basket"
  | "dashboard_viewed"
  | "strategy_dashboard_opened"
  | "portfolio_viewed"
  | "rebalance_opened"
  | "rebalance_marked_reviewed"
  | "portfolio_downloaded"
  | "research_document_opened"
  | "subscription_details_opened";

export type AnalyticsProperties = {
  strategySlug?: string;
  strategyFamily?: string;
  source?: string;
  destination?: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    vrikshaAnalytics?: {
      track?: (event: AnalyticsEventName, properties?: AnalyticsProperties) => void;
    };
  }
}

export function trackEvent(event: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;
  window.vrikshaAnalytics?.track?.(event, properties);
}
