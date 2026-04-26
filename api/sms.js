// Twilio SMS webhook handler
// Deploy as /api/sms.js on Vercel
// Requires env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { Body = "", From = "" } = req.body;
    const keyword = Body.trim().toUpperCase().split(/\s+/)[0];

    const responses = {
      FOOD: "DELCOHELP FOOD PANTRIES:\n1. Lifewerks (Wallingford) - Tues 6-8 PM - 610-872-3344\n2. DIFAN Wallingford - Tues/Fri - 484-326-5362\n3. Media Food Bank - Thurs/Sun - 610-566-3172\n\nReply with zip for closest to you.",

      HELP: "DELCOHELP RESOURCES:\n- Food: text FOOD\n- Benefits (SNAP/WIC): text SNAP\n- Crisis help: text CRISIS\n- Housing: text HOUSING\n- All: visit delcohelp.org",

      SNAP: "SNAP/WIC APPLICATION:\nApply free at compass.state.pa.us\nOr call PA 211 (dial 211) for help applying.\n\nMight qualify if monthly income under:\n1 person: $1,580\n2 people: $2,137\n3 people: $2,694\n4 people: $3,250",

      CRISIS: "DELCOHELP CRISIS LINES:\n- 911 (immediate emergency)\n- 988 (suicide & crisis)\n- Text HOME to 741741 (text crisis)\n- PA 211 (dial 211 for any help)\n- Delco Crisis: 855-889-7827\n\nYou are not alone. Help is available 24/7.",

      HOUSING: "DELCOHELP HOUSING:\n- Delco Housing Authority: 610-876-4945\n- Legal Aid of SE PA: 877-429-5994\n- Catholic Social Services: 267-331-2490\n- PA 211 for emergency shelter",
    };

    const message = responses[keyword] ||
      "DELCOHELP HELPLINE\nText one of these:\nFOOD - Food pantries\nSNAP - Benefits\nCRISIS - Emergency help\nHOUSING - Housing help\nHELP - All options\n\nOr visit: delcohelp.org";

    // Return TwiML response
    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`
    );
  } catch (e) {
    res.status(500).send("<Response></Response>");
  }
}
