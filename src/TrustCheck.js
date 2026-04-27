import { useState } from "react";
import { analyzeTrustText } from "./trustAnalysis";
import {
  checkGoogleFactCheckTools,
  checkMediaBiasFactCheck,
  checkAiDetectionProvider,
} from "./trustApiPlaceholders";

const RISK_STYLES = {
  Low: { bg: "#e0f2fe", color: "#075985", border: "#0ea5e9" },
  Medium: { bg: "#FFF3CD", color: "#7B5800", border: "#F4A261" },
  High: { bg: "#fee2e2", color: "#ef4444", border: "#ef4444" },
};

function SignalList({ title, items }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        {title}
      </div>
      {items.length > 0 ? (
        <div style={{ display: "grid", gap: 7 }}>
          {items.map((item, index) => (
            <div key={`${item}-${index}`} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 10px", fontSize: 13, color: "#334155", lineHeight: 1.4 }}>
              {item}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 10px", fontSize: 13, color: "#475569" }}>
          No clear signals found in this category.
        </div>
      )}
    </div>
  );
}

export default function TrustCheck() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  function analyze() {
    const analysis = analyzeTrustText(text);
    setResult(analysis);
    checkGoogleFactCheckTools();
    checkMediaBiasFactCheck();
    checkAiDetectionProvider();
  }

  const riskStyle = result ? RISK_STYLES[result.riskLevel] : RISK_STYLES.Low;

  return (
    <div className="dfi" style={{ padding: "20px 24px 26px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#0f172a", lineHeight: 1.15, marginBottom: 8 }}>
          Check This Info
        </div>
        <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>
          DelcoHelp can help you spot warning signs before you trust or share information.
        </div>
      </div>

      <div className="dh-card" style={{ cursor: "default", marginBottom: 16, padding: 16 }}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste a link, article, message, rental listing, job post, or assistance offer here..."
          style={{
            width: "100%",
            minHeight: 190,
            resize: "vertical",
            border: "1.5px solid rgba(14,165,233,0.18)",
            borderRadius: 14,
            padding: 14,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 15,
            lineHeight: 1.5,
            color: "#0f172a",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 12,
          }}
        />
        <button className="dh-btn-primary" onClick={analyze} disabled={!text.trim()} style={{ minHeight: 50, opacity: text.trim() ? 1 : 0.55 }}>
          Analyze
        </button>
      </div>

      {result && (
        <div className="dh-card" style={{ cursor: "default", padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Trust Score
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                {result.trustScore}/100
              </div>
            </div>
            <div style={{ background: riskStyle.bg, borderRadius: 14, padding: 14, border: `1.5px solid ${riskStyle.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: riskStyle.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Risk Level
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: riskStyle.color, lineHeight: 1 }}>
                {result.riskLevel}
              </div>
            </div>
          </div>

          <SignalList title="Scam Signals" items={result.scamSignals} />
          <SignalList title="Bias Signals" items={result.biasSignals} />
          <SignalList title="AI-Writing Signals" items={result.aiSignals} />
          <SignalList title="What To Do Next" items={result.recommendations} />

          <div style={{ background: "#FFF8F0", border: "1px solid rgba(244,162,97,0.35)", borderRadius: 12, padding: 12, fontSize: 12, color: "#7B4B00", lineHeight: 1.45 }}>
            This tool looks for warning signs. It does not prove whether something is true, false, biased, or AI-generated.
          </div>
        </div>
      )}
    </div>
  );
}


