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
      FOOD: "DELCOHELP FOOD PANTRIES:\n1. Lifewerks (Wallingford) - Tues 6-8 PM - 610-872-3344\n2. DIFAN Wallingford - Tues/Fri - 484-326-5362\n3. Media Food Bank - Thurs/Sun - 610-566-3172\n\nReply with zip for closest to you.",

      HELP: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",
      INFO: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",
      MENU: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",
      START: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",

      SNAP: "SNAP/WIC APPLICATION:\nApply free at compass.state.pa.us\nOr call PA 211 (dial 211) for help applying.\n\nMight qualify if monthly income under:\n1 person: $1,580\n2 people: $2,137\n3 people: $2,694\n4 people: $3,250",

      CRISIS: "DELCOHELP CRISIS LINES:\n- 911 (immediate emergency)\n- 988 (suicide & crisis)\n- Text HOME to 741741 (text crisis)\n- PA 211 (dial 211 for any help)\n- Delco Crisis: 855-889-7827\n\nYou are not alone. Help is available 24/7.",

      HOUSING: "DELCOHELP HOUSING:\n- Delco Housing Authority: 610-876-4945\n- Legal Aid of SE PA: 877-429-5994\n- Catholic Social Services: 267-331-2490\n- PA 211 for emergency shelter",
    };

    const message = responses[keyword] ||
      "DELCOHELP HELPLINE\nText one of these:\nFOOD - Food pantries\nSNAP - Benefits\nCRISIS - Emergency help\nHOUSING - Housing help\nHELP - All options\n\nOr visit: delcohelp.org";

    sendTwiml(res, message);
  } catch (e) {
    sendTwiml(res, "DELCOHELP: Sorry, text replies are temporarily unavailable. For immediate help call PA 211, 988 for crisis support, or 911 for emergencies.", 200);
  }
}
