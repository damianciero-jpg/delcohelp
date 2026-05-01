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

const TRUST_TRANSLATIONS = {
  en: {
    checkThisInfo:"Check This Info", trustIntro:"DelcoHelp can help you spot warning signs before you trust or share information.",
    pastePlaceholder:"Paste a link, article, message, rental listing, job post, or assistance offer here...",
    analyze:"Analyze", trustScore:"Trust Score", riskLevel:"Risk Level", scamSignals:"Scam Signals",
    biasSignals:"Bias Signals", aiWritingSignals:"AI-Writing Signals", whatToDoNext:"What To Do Next",
    noSignals:"No clear signals found in this category.",
    disclaimer:"This tool looks for warning signs. It does not prove whether something is true, false, biased, or AI-generated.",
  },
  es: {
    checkThisInfo:"Verificar esta información", trustIntro:"DelcoHelp puede ayudarle a detectar señales de advertencia antes de confiar o compartir información.",
    pastePlaceholder:"Pegue aquí un enlace, artículo, mensaje, anuncio de alquiler, oferta de trabajo u oferta de ayuda...",
    analyze:"Analizar", trustScore:"Puntaje de confianza", riskLevel:"Nivel de riesgo", scamSignals:"Señales de estafa",
    biasSignals:"Señales de sesgo", aiWritingSignals:"Señales de escritura con AI", whatToDoNext:"Qué hacer después",
    noSignals:"No se encontraron señales claras en esta categoría.",
    disclaimer:"Esta herramienta busca señales de advertencia. No prueba si algo es verdadero, falso, sesgado o generado por AI.",
  },
  vi: {
    checkThisInfo:"Kiểm tra thông tin này", trustIntro:"DelcoHelp có thể giúp bạn nhận ra dấu hiệu cảnh báo trước khi tin hoặc chia sẻ thông tin.",
    pastePlaceholder:"Dán liên kết, bài viết, tin nhắn, tin cho thuê, bài đăng việc làm hoặc đề nghị hỗ trợ tại đây...",
    analyze:"Phân tích", trustScore:"Điểm tin cậy", riskLevel:"Mức rủi ro", scamSignals:"Dấu hiệu lừa đảo",
    biasSignals:"Dấu hiệu thiên lệch", aiWritingSignals:"Dấu hiệu viết bằng AI", whatToDoNext:"Việc nên làm tiếp theo",
    noSignals:"Không tìm thấy dấu hiệu rõ ràng trong mục này.",
    disclaimer:"Công cụ này tìm dấu hiệu cảnh báo. Nó không chứng minh điều gì là đúng, sai, thiên lệch hoặc do AI tạo.",
  },
  zh: {
    checkThisInfo:"检查此信息", trustIntro:"DelcoHelp 可以帮助您在相信或分享信息前发现警示信号。",
    pastePlaceholder:"在此粘贴链接、文章、消息、租房信息、招聘信息或援助信息...",
    analyze:"分析", trustScore:"可信度分数", riskLevel:"风险等级", scamSignals:"诈骗信号",
    biasSignals:"偏见信号", aiWritingSignals:"AI 写作信号", whatToDoNext:"下一步建议",
    noSignals:"此类别未发现明显信号。",
    disclaimer:"此工具查找警示信号。它不能证明信息是真、假、有偏见或由 AI 生成。",
  },
};

function tt(lang, key) {
  return TRUST_TRANSLATIONS[lang]?.[key] || TRUST_TRANSLATIONS.en[key] || key;
}

function SignalList({ title, items, lang }) {
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
          {tt(lang, "noSignals")}
        </div>
      )}
    </div>
  );
}

export default function TrustCheck({ lang = "en" }) {
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
          {tt(lang, "checkThisInfo")}
        </div>
        <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>
          {tt(lang, "trustIntro")}
        </div>
      </div>

      <div className="dh-card" style={{ cursor: "default", marginBottom: 16, padding: 16 }}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={tt(lang, "pastePlaceholder")}
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
          {tt(lang, "analyze")}
        </button>
      </div>

      {result && (
        <div className="dh-card" style={{ cursor: "default", padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                {tt(lang, "trustScore")}
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                {result.trustScore}/100
              </div>
            </div>
            <div style={{ background: riskStyle.bg, borderRadius: 14, padding: 14, border: `1.5px solid ${riskStyle.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: riskStyle.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                {tt(lang, "riskLevel")}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: riskStyle.color, lineHeight: 1 }}>
                {result.riskLevel}
              </div>
            </div>
          </div>

          <SignalList title={tt(lang, "scamSignals")} items={result.scamSignals} lang={lang} />
          <SignalList title={tt(lang, "biasSignals")} items={result.biasSignals} lang={lang} />
          <SignalList title={tt(lang, "aiWritingSignals")} items={result.aiSignals} lang={lang} />
          <SignalList title={tt(lang, "whatToDoNext")} items={result.recommendations} lang={lang} />

          <div style={{ background: "#FFF8F0", border: "1px solid rgba(244,162,97,0.35)", borderRadius: 12, padding: 12, fontSize: 12, color: "#7B4B00", lineHeight: 1.45 }}>
            {tt(lang, "disclaimer")}
          </div>
        </div>
      )}
    </div>
  );
}


