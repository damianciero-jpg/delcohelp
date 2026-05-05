// Twilio SMS webhook handler
// Deploys as /api/sms on Vercel.

function parseIncomingBody(req) {
  if (req.method === "GET") return req.query || {};
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  if (typeof req.body !== "string") return {};

  try {
    const parsed = JSON.parse(req.body);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}

  return Object.fromEntries(new URLSearchParams(req.body));
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sendTwiml(res, message, status = 200) {
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`);
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).end();
  }

  try {
    const body = parseIncomingBody(req);
    const rawMessage = body.Body || body.body || body.message || body.text || "";
    const keyword = String(rawMessage).trim().toUpperCase().split(/\s+/)[0];

    const responses = {
      FOOD: "DELCOHELP FOOD PANTRIES:\n1. Lifewerks (28 Walnut Road, Wallingford) - Tues 6-8 PM - 610-872-3344\n2. Media Food Bank - Thurs/Sun - 610-566-3172\n\nReply with zip for closest to you.",

      HELP: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",
      INFO: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",
      MENU: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",
      START: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",

      SNAP: "SNAP/WIC APPLICATION:\nApply free at compass.state.pa.us\nOr call PA 211 (dial 211) for help applying.\n\nMight qualify if monthly income under:\n1 person: $1,580\n2 people: $2,137\n3 people: $2,694\n4 people: $3,250",

      CRISIS: "DELCOHELP CRISIS LINES:\n- If immediate emergency or danger: call 911\n- Delaware County Crisis Connections Team: 855-889-7827 (24/7)\n- 988 Suicide & Crisis: call/text 988\n- PA Crisis Text Line: text PA to 741741\n- PA 211: dial 211 for any help\n\nResource info can change. Please call ahead when possible.",

      HOUSING: "DELCOHELP HOUSING:\nFor homelessness or immediate housing needs in Delaware County, residents may need a Coordinated Entry assessment.\nNeeds verification: call Delaware County Human Services or visit delcopa.gov human services housing/homeless resources to confirm the correct access point.\nCrisis line: 855-889-7827\nEmergency danger: call 911.",
    };

    const message = responses[keyword] ||
      "DELCOHELP HELPLINE\nText one of these:\nFOOD - Food pantries\nSNAP - Benefits\nCRISIS - Emergency help\nHOUSING - Housing help\nHELP - All options\n\nOr visit: delcohelp.org";

    sendTwiml(res, message);
  } catch (e) {
    sendTwiml(res, "DELCOHELP: Sorry, text replies are temporarily unavailable. For immediate help call PA 211, 988 for crisis support, or 911 for emergencies.", 200);
  }
}
