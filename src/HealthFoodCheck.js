import { useCallback, useMemo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const FOOD_API = "https://world.openfoodfacts.org/api/v0/product";
const BARCODE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"];

const DEMO_PRODUCT = {
  product_name: "Demo whole grain cereal",
  brands: "Community Pantry Demo",
  nutriscore_grade: "b",
  nutriments: {
    "energy-kcal_100g": 365,
    sugars_100g: 7.2,
    salt_100g: 0.7,
    "saturated-fat_100g": 1.1,
    proteins_100g: 8.4,
    fiber_100g: 6.2,
  },
  ingredients_text: "Whole grain oats, wheat flakes, rice, a small amount of sugar, salt.",
  traces: "May contain milk or tree nuts.",
};

function numberFrom(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getRating(grade) {
  const normalized = String(grade || "").toLowerCase();
  if (normalized === "a" || normalized === "b") return { label: "Healthy Choice", tone: "good" };
  if (normalized === "c") return { label: "Okay Sometimes", tone: "ok" };
  if (normalized === "d" || normalized === "e") return { label: "Limit If Possible", tone: "limit" };
  return { label: "Not enough nutrition data", tone: "unknown" };
}

function getNutritionFlags(nutriments = {}) {
  const flags = [];
  const sugar = numberFrom(nutriments.sugars_100g);
  const salt = numberFrom(nutriments.salt_100g);
  const sodium = numberFrom(nutriments.sodium_100g);
  const saturatedFat = numberFrom(nutriments["saturated-fat_100g"]);
  const protein = numberFrom(nutriments.proteins_100g);
  const fiber = numberFrom(nutriments.fiber_100g);

  if (sugar !== null && sugar > 10) flags.push("High sugar");
  if ((salt !== null && salt > 1.5) || (salt === null && sodium !== null && sodium > 0.6)) flags.push("High sodium");
  if (saturatedFat !== null && saturatedFat > 5) flags.push("High saturated fat");
  if (protein !== null && protein >= 5) flags.push("Good protein");
  if (fiber !== null && fiber >= 3) flags.push("Good fiber");

  return flags;
}

function cleanTags(value) {
  if (!value) return "";
  if (Array.isArray(value)) {
    return value.map((item) => String(item).replace(/^[a-z]{2}:/i, "").replace(/-/g, " ")).join(", ");
  }
  return String(value).replace(/^[a-z]{2}:/i, "").replace(/,/g, ", ");
}

function getAllergyText(product) {
  const warnings = [
    cleanTags(product.allergens),
    cleanTags(product.traces),
    cleanTags(product.allergens_tags),
    cleanTags(product.traces_tags),
  ].filter(Boolean);

  return warnings.length ? warnings.join("; ") : "";
}

function getCalories(nutriments = {}) {
  const kcalServing = numberFrom(nutriments["energy-kcal_serving"]);
  const kcal100g = numberFrom(nutriments["energy-kcal_100g"]);
  if (kcalServing !== null) return `${Math.round(kcalServing)} calories per serving`;
  if (kcal100g !== null) return `${Math.round(kcal100g)} calories per 100g`;
  return "";
}

function firstDetectedValue(detectedCodes) {
  const code = Array.isArray(detectedCodes) ? detectedCodes[0] : detectedCodes;
  return String(code?.rawValue || code?.text || "").trim();
}

export default function HealthFoodCheck({ variant = "delco" }) {
  const [barcode, setBarcode] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [scannerKey, setScannerKey] = useState(0);

  const theme = useMemo(() => {
    if (variant === "sjc") {
      return {
        accent: "#1B3A6B",
        accentDark: "#0D1F3C",
        bg: "#F5F2EB",
        surface: "#FFFFFF",
        soft: "rgba(27,58,107,0.08)",
        border: "rgba(27,58,107,0.15)",
        text: "#0D1F3C",
        muted: "#6B7080",
        font: "'Source Sans 3', sans-serif",
      };
    }
    return {
      accent: "#2D6A4F",
      accentDark: "#1B4332",
      bg: "#F6FBF5",
      surface: "#FFFFFF",
      soft: "rgba(45,106,79,0.08)",
      border: "rgba(45,106,79,0.16)",
      text: "#1C2B1E",
      muted: "#6B7C6E",
      font: "'DM Sans', sans-serif",
    };
  }, [variant]);

  const lookupFood = useCallback(async (rawBarcode) => {
    const cleanBarcode = String(rawBarcode || "").replace(/\D/g, "");
    if (!cleanBarcode) {
      setError("Enter a barcode number first.");
      setProduct(null);
      return;
    }

    setBarcode(cleanBarcode);
    setLoading(true);
    setError("");
    setProduct(null);

    try {
      const response = await fetch(`${FOOD_API}/${encodeURIComponent(cleanBarcode)}.json`);
      if (!response.ok) throw new Error("Food lookup is unavailable right now.");
      const data = await response.json();
      if (data.status !== 1 || !data.product) {
        setError("We could not find that barcode in Open Food Facts. Try another barcode or enter the food manually if needed.");
        return;
      }
      setProduct(data.product);
    } catch (err) {
      setError("Food lookup is unavailable right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const openScanner = useCallback(() => {
    setCameraOpen(true);
    setScannerKey((key) => key + 1);
  }, []);

  const stopCamera = useCallback(() => {
    setCameraOpen(false);
  }, []);

  const scanAnother = useCallback(() => {
    setProduct(null);
    setError("");
    setBarcode("");
    setLoading(false);
    setCameraOpen(true);
    setScannerKey((key) => key + 1);
  }, []);

  const closeResult = useCallback(() => {
    setProduct(null);
    setError("");
    setLoading(false);
    setCameraOpen(false);
  }, []);

  const handleScannerError = useCallback(() => {
    setError("Camera is unavailable. You can still type the barcode number.");
  }, []);

  const handleScannerResult = useCallback((detectedCodes) => {
    const value = firstDetectedValue(detectedCodes);
    if (!value || loading) return;
    setCameraOpen(false);
    lookupFood(value);
  }, [loading, lookupFood]);

  const rating = product ? getRating(product.nutriscore_grade) : null;
  const nutriments = product?.nutriments || {};
  const flags = product ? getNutritionFlags(nutriments) : [];
  const calories = product ? getCalories(nutriments) : "";
  const allergyText = product ? getAllergyText(product) : "";

  return (
    <div className="dfi" style={{ padding: 20, fontFamily: theme.font, color: theme.text }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, color: theme.accent, marginBottom: 8 }}>
          Health
        </div>
        <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.08, letterSpacing: "-0.02em" }}>Food Health Check</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.45, color: theme.muted }}>
          Scan or enter a food barcode to understand nutrition quickly.
        </p>
      </div>

      <div style={{ background: theme.soft, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 14, fontSize: 13, lineHeight: 1.45, marginBottom: 16 }}>
        Any food can help when you need it. This tool is here to help you make the best choice available.
      </div>

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 16, boxShadow: "0 4px 18px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <label htmlFor="health-barcode" style={{ display: "block", fontSize: 12, fontWeight: 800, color: theme.muted, marginBottom: 8 }}>
          Barcode
        </label>
        <input
          id="health-barcode"
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          inputMode="numeric"
          placeholder="Enter barcode number"
          style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${theme.border}`, borderRadius: 14, padding: "14px 14px", fontSize: 16, color: theme.text, outlineColor: theme.accent, marginBottom: 12 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            type="button"
            onClick={() => lookupFood(barcode)}
            disabled={loading}
            style={{ minHeight: 48, border: "none", borderRadius: 14, background: theme.accent, color: "white", fontSize: 14, fontWeight: 800, cursor: loading ? "default" : "pointer" }}
          >
            {loading ? "Checking..." : "Check Food"}
          </button>
          <button
            type="button"
            onClick={() => { if (cameraOpen) stopCamera(); else openScanner(); }}
            style={{ minHeight: 48, border: `1.5px solid ${theme.accent}`, borderRadius: 14, background: cameraOpen ? theme.soft : "white", color: theme.accentDark, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
          >
            {cameraOpen ? "Stop Camera" : "Use Camera"}
          </button>
        </div>
      </div>

      {cameraOpen && (
        <div style={{ background: "#111", borderRadius: 20, overflow: "hidden", marginBottom: 16, border: `2px solid ${theme.border}` }}>
          <Scanner
            key={scannerKey}
            onScan={handleScannerResult}
            onError={handleScannerError}
            formats={BARCODE_FORMATS}
            constraints={{ facingMode: "environment", aspectRatio: 1 }}
            scanDelay={700}
            allowMultiple={false}
            styles={{ container: { width: "100%" }, video: { width: "100%" } }}
          />
          <div style={{ padding: 12, background: theme.surface }}>
            <button
              type="button"
              onClick={stopCamera}
              style={{ width: "100%", minHeight: 44, border: `1.5px solid ${theme.accent}`, borderRadius: 12, background: "white", color: theme.accentDark, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
            >
              Stop Camera
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, fontSize: 14, color: theme.muted, marginBottom: 16 }}>
          Looking up nutrition details...
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, lineHeight: 1.45, color: "#7C2D12", marginBottom: 12 }}>{error}</div>
          <button
            type="button"
            onClick={() => { setError(""); setProduct(DEMO_PRODUCT); }}
            style={{ width: "100%", minHeight: 44, border: "none", borderRadius: 12, background: "#9A3412", color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
          >
            Show Demo Product
          </button>
        </div>
      )}

      {product && rating && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 18, boxShadow: "0 6px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: theme.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 4 }}>
              Food result
            </div>
            <button
              type="button"
              onClick={closeResult}
              aria-label="Close food result"
              style={{ width: 34, height: 34, border: `1px solid ${theme.border}`, borderRadius: 12, background: theme.soft, color: theme.accentDark, fontSize: 18, fontWeight: 900, lineHeight: 1, cursor: "pointer" }}
            >
              x
            </button>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.15 }}>{product.product_name || "Unnamed food item"}</h2>
          {product.brands && <div style={{ marginTop: 5, color: theme.muted, fontSize: 13 }}>{product.brands}</div>}

          <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
            <div style={{ background: rating.tone === "good" ? "#DCFCE7" : rating.tone === "ok" ? "#FEF9C3" : rating.tone === "limit" ? "#FFEDD5" : "#F3F4F6", color: rating.tone === "good" ? "#166534" : rating.tone === "ok" ? "#854D0E" : rating.tone === "limit" ? "#9A3412" : "#374151", borderRadius: 14, padding: "12px 14px", fontSize: 15, fontWeight: 900 }}>
              {rating.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <InfoTile label="Nutri-Score" value={product.nutriscore_grade ? String(product.nutriscore_grade).toUpperCase() : "Not listed"} theme={theme} />
              <InfoTile label="Calories" value={calories || "Not listed"} theme={theme} />
            </div>
          </div>

          <Section title="Nutrition flags" theme={theme}>
            {flags.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {flags.map((flag) => (
                  <span key={flag} style={{ background: theme.soft, border: `1px solid ${theme.border}`, borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 800 }}>
                    {flag}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: theme.muted }}>No major nutrition flags found from available data.</p>
            )}
          </Section>

          {product.ingredients_text && (
            <Section title="Ingredients" theme={theme}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{product.ingredients_text}</p>
            </Section>
          )}

          {allergyText && (
            <Section title="Allergy or traces warning" theme={theme}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{allergyText}</p>
            </Section>
          )}

          <div style={{ background: theme.soft, borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.45, marginTop: 14 }}>
            If available, try pairing this with water, fruit, vegetables, whole grains, or protein.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            <button
              type="button"
              onClick={scanAnother}
              style={{ minHeight: 48, border: "none", borderRadius: 14, background: theme.accent, color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
            >
              Scan Another Food
            </button>
            <button
              type="button"
              onClick={closeResult}
              style={{ minHeight: 48, border: `1.5px solid ${theme.accent}`, borderRadius: 14, background: "white", color: theme.accentDark, fontSize: 13, fontWeight: 900, cursor: "pointer" }}
            >
              Clear Results
            </button>
          </div>
        </div>
      )}

      <p style={{ margin: "16px 2px 0", fontSize: 11, lineHeight: 1.45, color: theme.muted }}>
        This is general nutrition guidance, not medical advice. People with diabetes, kidney disease, food allergies, or other health needs should follow medical guidance when available.
      </p>
    </div>
  );
}

function InfoTile({ label, value, theme }) {
  return (
    <div style={{ background: theme.soft, borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 10, color: theme.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.25 }}>{value}</div>
    </div>
  );
}

function Section({ title, children, theme }) {
  return (
    <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 14, marginTop: 14 }}>
      <div style={{ fontSize: 11, color: theme.muted, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
