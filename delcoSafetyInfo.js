export const DELCO_CRISIS = {
  name: "Delaware County Crisis Connections Team",
  displayName: "Delaware County Crisis Connections Team — 24/7 Crisis Line",
  phone: "855-889-7827",
  phoneHref: "tel:18558897827",
  availability: "24/7",
  description: "Call 855-889-7827 for 24/7 Delaware County crisis support.",
  emergencyDisclaimer: "If this is an immediate emergency or someone is in danger, call 911.",
  callToConfirm: "Resource information can change. Please call ahead when possible.",
  verified: true,
  verifiedBy: "Delaware County / Elwyn public crisis information",
  lastUpdated: "2026-04-29",
};

export const PA_CRISIS_TEXT = {
  name: "PA Crisis Text Line",
  phone: "741741",
  phoneHref: "sms:741741?body=PA",
  displayText: "PA Crisis Text Line — Text PA to 741741",
  description: "Text PA to 741741 for free 24/7 crisis text support.",
  availability: "24/7",
  verified: true,
  verifiedBy: "Pennsylvania public crisis text information",
  lastUpdated: "2026-04-29",
};

export const DELCO_HOUSING_ENTRY = {
  name: "Housing Help / Coordinated Entry",
  phone: "",
  status: "Needs verification",
  description: "For homelessness or immediate housing needs in Delaware County, residents may need a Coordinated Entry assessment to connect with housing crisis services.",
  guidance: "Call Delaware County Human Services or visit the official county housing/homeless services page to confirm the correct Coordinated Entry access point.",
  officialUrl: "https://www.delcopa.gov/human-services/adult-and-family-service",
  verified: false,
  verifiedBy: "Needs verification before listing a Coordinated Entry phone number",
  lastUpdated: "2026-04-29",
};

export function correctionMailto(resourceName) {
  const subject = encodeURIComponent(`DelcoHelp correction needed: ${resourceName}`);
  const body = encodeURIComponent("Resource:\nIssue:\nCorrect info:\nSource if available:\n");
  return `mailto:cierolink@gmail.com?subject=${subject}&body=${body}`;
}
