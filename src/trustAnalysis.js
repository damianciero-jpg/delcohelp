const SCAM_PHRASES = [
  "urgent",
  "act now",
  "limited time",
  "wire money",
  "gift card",
  "cash app",
  "venmo",
  "zelle",
  "no background check",
  "guaranteed approval",
  "send deposit",
  "click here",
  "password",
  "social security",
  "ssn",
  "bank account",
  "application fee",
  "too good to be true",
];

const BIAS_PHRASES = [
  "outrageous",
  "corrupt",
  "evil",
  "disgusting",
  "radical",
  "extremist",
  "destroy",
  "threat",
  "propaganda",
  "everyone knows",
  "they don't want you to know",
  "they don’t want you to know",
  "shocking",
  "exposed",
];

const AI_PHRASES = [
  "in today's world",
  "in today’s world",
  "it is important to note",
  "delve",
  "comprehensive",
  "game-changer",
  "game changer",
  "robust",
];

const TRANSITIONS = [
  "furthermore",
  "moreover",
  "additionally",
  "in conclusion",
  "ultimately",
  "therefore",
  "as a result",
];

function includesPhrase(text, phrase) {
  return text.includes(phrase.toLowerCase());
}

function hasNamedAuthor(text) {
  return /\b(by|author|posted by|written by)\s+[:-]?\s*[a-z][a-z'.-]+\s+[a-z][a-z'.-]+/i.test(text);
}

function hasSourceLink(text) {
  return /https?:\/\/|www\.|source:|sources:|via\s+[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
}

function hasLocalDetails(text) {
  return /\b(delaware county|delco|media|chester|upper darby|darby|ridley|springfield|swarthmore|wallingford|brookhaven|lansdowne|prospect park|havertown|drexel hill|pa\b|pennsylvania)\b/i.test(text);
}

function hasRepetitiveSentenceStructure(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length < 5) return false;

  const starters = sentences
    .map(sentence => sentence.trim().split(/\s+/).slice(0, 3).join(" ").toLowerCase())
    .filter(Boolean);
  const repeated = starters.filter((starter, index) => starters.indexOf(starter) !== index);
  return repeated.length >= 2;
}

function hasOverlyPolishedGenericPhrasing(text) {
  const genericWords = ["innovative", "seamless", "valuable", "essential", "significant", "dynamic", "effective"];
  const lower = text.toLowerCase();
  const hits = genericWords.filter(word => lower.includes(word)).length;
  return hits >= 3 && text.length > 350;
}

export function analyzeTrustText(text) {
  const input = String(text || "");
  const normalized = input.toLowerCase();

  const scamSignals = SCAM_PHRASES
    .filter(phrase => includesPhrase(normalized, phrase))
    .map(phrase => `Possible scam wording: "${phrase}"`);

  const biasSignals = BIAS_PHRASES
    .filter(phrase => includesPhrase(normalized, phrase))
    .map(phrase => `Loaded or emotional wording: "${phrase}"`);

  const aiSignals = AI_PHRASES
    .filter(phrase => includesPhrase(normalized, phrase))
    .map(phrase => `Common generic AI-writing phrase: "${phrase}"`);

  if (hasOverlyPolishedGenericPhrasing(input)) {
    aiSignals.push("Overly polished generic phrasing");
  }

  if (hasRepetitiveSentenceStructure(input)) {
    aiSignals.push("Repetitive sentence structure");
  }

  const transitionHits = TRANSITIONS.filter(phrase => includesPhrase(normalized, phrase));
  if (transitionHits.length >= 3) {
    aiSignals.push("Lots of transition phrases");
  }

  if (input.trim() && !hasNamedAuthor(input)) {
    aiSignals.push("No named author found");
  }

  if (input.trim() && !hasSourceLink(input)) {
    aiSignals.push("No source links found");
  }

  if (input.trim() && !hasLocalDetails(input)) {
    aiSignals.push("No local details found");
  }

  const trustScore = Math.max(
    0,
    100 - scamSignals.length * 10 - biasSignals.length * 6 - aiSignals.length * 5
  );

  let riskLevel = "High";
  if (trustScore >= 75) riskLevel = "Low";
  else if (trustScore >= 45) riskLevel = "Medium";

  const recommendations = [
    "Check the source before sharing.",
    "Look for a named author, date, and original source.",
    "Compare with at least one trusted local or official source.",
  ];

  if (riskLevel === "High") {
    recommendations.push("Do not send money or personal information.");
    recommendations.push("Contact the organization directly using an official website or phone number.");
  }

  return {
    trustScore,
    riskLevel,
    scamSignals,
    biasSignals,
    aiSignals,
    recommendations,
  };
}
