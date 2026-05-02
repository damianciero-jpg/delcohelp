const twilio = require("twilio");

function parseTwilioBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  if (typeof req.body !== "string") return {};

  return Object.fromEntries(new URLSearchParams(req.body));
}

function getSmsResponse(messageBody) {
  const normalizedBody = String(messageBody || "").trim().toUpperCase();

  if (/\b(FOOD|PANTRY|MEAL)\b/.test(normalizedBody)) {
    return "DelcoHelp: For food resources, visit https://www.delcohelp.org and tap Food or Need Help Now. Please call ahead to confirm hours.";
  }

  if (/\b(SHELTER|HOUSING)\b/.test(normalizedBody)) {
    return "DelcoHelp: For shelter or housing help, visit https://www.delcohelp.org and tap Housing or Need Help Now. If this is an emergency, call 911.";
  }

  if (/\b(CRISIS|HOTLINE)\b/.test(normalizedBody)) {
    return "DelcoHelp: Delaware County Crisis Connections Team: 855-889-7827. If this is an emergency or someone is in danger, call 911.";
  }

  if (/\b(BENEFITS|SNAP|WIC)\b/.test(normalizedBody)) {
    return "DelcoHelp: For SNAP, WIC, utilities, and benefits help, visit https://www.delcohelp.org and tap Benefits.";
  }

  if (/\bNUTRITION\b/.test(normalizedBody)) {
    return "DelcoHelp: Use the Nutrition tab at https://www.delcohelp.org to check food information by barcode.";
  }

  return "DelcoHelp: Reply FOOD, SHELTER, CRISIS, BENEFITS, NUTRITION, or HELP. Visit https://www.delcohelp.org.";
}

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const body = parseTwilioBody(req);
  req.body = body;

  console.log("Twilio SMS received", { from: req.body.From, body: req.body.Body });

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(getSmsResponse(req.body.Body));

  res.setHeader("Cache-Control", "no-store");
  res.type("text/xml").send(twiml.toString());
};
