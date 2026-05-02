// Privacy-friendly GA4 impact events.
// Event meanings:
// help_now_click: emergency help CTA usage.
// category_click: aggregate interest in high-level resource categories.
// resource_call_click, directions_click, website_click: resource action usage.
// crisis_call_click: crisis/hotline action usage.
// nutrition_scan_start, nutrition_result_view: nutrition tool funnel usage without barcodes.
// language_change: language switcher usage.
// report_info_click: correction/reporting intent.
// sms_help_click: SMS access interest.
// flyer_qr_visit: visits attributed to printed flyer QR codes.
export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        app_name: "DelcoHelp",
        ...params,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Analytics event failed:", eventName, error);
    }
  }
}
