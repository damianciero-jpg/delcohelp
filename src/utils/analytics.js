export function trackEvent(eventName, params = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  } else {
    console.log("GA event:", eventName, params);
  }
}

// Impact event meanings:
// help_now_click: Need Help Now CTA usage.
// call_click: public resource phone button usage.
// directions_click: public resource map/directions usage.
// crisis_line_click: crisis/hotline call or text button usage.
// nutrition_open, nutrition_scan: nutrition tool engagement.
// language_change: language switcher usage.
// text_us_click: SMS help entry point usage.
// report_incorrect_info: user intent to report stale resource data.
// benefits_click: benefits flow usage.
export function trackFlyerVisit() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") === "flyer" || params.get("utm_source") === "flyer") {
      trackEvent("flyer_qr_visit", { source: "flyer" });
    }
  } catch {}
}
