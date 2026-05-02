import { useCallback, useMemo, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { trackEvent as trackImpactEvent } from "./utils/analytics";

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

const NUTRITION_TRANSLATIONS = {
  en: {
    nutrition:"Nutrition", nutritionCheck:"Nutrition Check", intro:"Scan or enter a food barcode to quickly understand what is in the food.",
    note:"Any food can help when you need it. This tool helps you make the best choice available.",
    barcode:"Barcode", enterBarcode:"Enter barcode number", checking:"Checking...", checkFood:"Check Food",
    stopCamera:"Stop Camera", useCamera:"Use Camera", lookingUp:"Looking up nutrition details...",
    showDemo:"Show Demo Product", foodResult:"Food result", unnamed:"Unnamed food item", notListed:"Not listed",
    calories:"Calories", nutritionFlags:"Nutrition flags", noFlags:"No major nutrition flags found from available data.",
    ingredients:"Ingredients", allergyWarning:"Allergy or traces warning",
    pairing:"If available, try pairing this with water, fruit, vegetables, whole grains, or protein.",
    scanAnother:"Scan Another Food", clearResults:"Clear Results",
    disclaimer:"This is general nutrition guidance, not medical advice. People with diabetes, kidney disease, food allergies, or other health needs should follow medical guidance when available.",
    enterFirst:"Enter a barcode number first.", unavailable:"Food lookup is unavailable right now.",
    notFound:"We could not find that barcode in Open Food Facts. Try another barcode or enter the food manually if needed.",
    connection:"Food lookup is unavailable right now. Check your connection and try again.",
    cameraUnavailable:"Camera is unavailable. You can still type the barcode number.",
  },
  es: {
    nutrition:"Nutrición", nutritionCheck:"Revisión nutricional", intro:"Escanee o ingrese un código de barras para entender rápidamente qué contiene la comida.",
    note:"Cualquier comida puede ayudar cuando la necesita. Esta herramienta le ayuda a elegir la mejor opción disponible.",
    barcode:"Código de barras", enterBarcode:"Ingrese el número de código de barras", checking:"Verificando...", checkFood:"Revisar comida",
    stopCamera:"Detener cámara", useCamera:"Usar cámara", lookingUp:"Buscando detalles nutricionales...",
    showDemo:"Mostrar producto de ejemplo", foodResult:"Resultado de comida", unnamed:"Alimento sin nombre", notListed:"No listado",
    calories:"Calorías", nutritionFlags:"Señales nutricionales", noFlags:"No se encontraron señales nutricionales importantes con los datos disponibles.",
    ingredients:"Ingredientes", allergyWarning:"Advertencia de alergias o trazas",
    pairing:"Si puede, acompáñelo con agua, fruta, verduras, granos integrales o proteína.",
    scanAnother:"Escanear otra comida", clearResults:"Limpiar resultados",
    disclaimer:"Esta es orientación nutricional general, no consejo médico. Personas con diabetes, enfermedad renal, alergias alimentarias u otras necesidades deben seguir orientación médica cuando esté disponible.",
    enterFirst:"Ingrese primero un código de barras.", unavailable:"La búsqueda de alimentos no está disponible ahora.",
    notFound:"No pudimos encontrar ese código en Open Food Facts. Pruebe otro código o ingrese la comida manualmente si es necesario.",
    connection:"La búsqueda de alimentos no está disponible ahora. Revise su conexión e inténtelo de nuevo.",
    cameraUnavailable:"La cámara no está disponible. Aún puede escribir el código de barras.",
  },
  vi: {
    nutrition:"Dinh dưỡng", nutritionCheck:"Kiểm tra dinh dưỡng", intro:"Quét hoặc nhập mã vạch thực phẩm để nhanh chóng hiểu thành phần.",
    note:"Bất kỳ thực phẩm nào cũng có thể giúp khi bạn cần. Công cụ này giúp bạn chọn lựa tốt nhất có sẵn.",
    barcode:"Mã vạch", enterBarcode:"Nhập số mã vạch", checking:"Đang kiểm tra...", checkFood:"Kiểm tra thực phẩm",
    stopCamera:"Dừng camera", useCamera:"Dùng camera", lookingUp:"Đang tra cứu dinh dưỡng...",
    showDemo:"Hiển thị sản phẩm mẫu", foodResult:"Kết quả thực phẩm", unnamed:"Thực phẩm chưa có tên", notListed:"Không có thông tin",
    calories:"Calo", nutritionFlags:"Dấu hiệu dinh dưỡng", noFlags:"Không tìm thấy dấu hiệu dinh dưỡng lớn từ dữ liệu hiện có.",
    ingredients:"Thành phần", allergyWarning:"Cảnh báo dị ứng hoặc vết thành phần",
    pairing:"Nếu có thể, hãy dùng cùng nước, trái cây, rau, ngũ cốc nguyên hạt hoặc protein.",
    scanAnother:"Quét thực phẩm khác", clearResults:"Xóa kết quả",
    disclaimer:"Đây là hướng dẫn dinh dưỡng chung, không phải lời khuyên y tế. Người có bệnh tiểu đường, bệnh thận, dị ứng thực phẩm hoặc nhu cầu sức khỏe khác nên theo hướng dẫn y tế khi có.",
    enterFirst:"Vui lòng nhập mã vạch trước.", unavailable:"Hiện không thể tra cứu thực phẩm.",
    notFound:"Không tìm thấy mã vạch đó trong Open Food Facts. Hãy thử mã khác hoặc nhập thủ công nếu cần.",
    connection:"Hiện không thể tra cứu thực phẩm. Kiểm tra kết nối và thử lại.",
    cameraUnavailable:"Camera không khả dụng. Bạn vẫn có thể nhập mã vạch.",
  },
  zh: {
    nutrition:"营养", nutritionCheck:"营养检查", intro:"扫描或输入食品条码，快速了解食品内容。",
    note:"需要时任何食物都能提供帮助。此工具帮助您在可选范围内做出更好选择。",
    barcode:"条码", enterBarcode:"输入条码号码", checking:"正在检查...", checkFood:"检查食品",
    stopCamera:"停止相机", useCamera:"使用相机", lookingUp:"正在查询营养信息...",
    showDemo:"显示示例产品", foodResult:"食品结果", unnamed:"未命名食品", notListed:"未列出",
    calories:"卡路里", nutritionFlags:"营养提示", noFlags:"根据现有数据未发现主要营养提示。",
    ingredients:"配料", allergyWarning:"过敏或微量成分警告",
    pairing:"如果可以，请搭配水、水果、蔬菜、全谷物或蛋白质。",
    scanAnother:"扫描其他食品", clearResults:"清除结果",
    disclaimer:"这是一般营养指导，不是医疗建议。有糖尿病、肾病、食物过敏或其他健康需求的人应遵循可用的医疗指导。",
    enterFirst:"请先输入条码号码。", unavailable:"食品查询暂时不可用。",
    notFound:"无法在 Open Food Facts 中找到该条码。请尝试其他条码，必要时手动输入食品。",
    connection:"食品查询暂时不可用。请检查连接并重试。",
    cameraUnavailable:"相机不可用。您仍可以输入条码号码。",
  },
};

function tt(lang, key) {
  return NUTRITION_TRANSLATIONS[lang]?.[key] || NUTRITION_TRANSLATIONS.en[key] || key;
}

function numberFrom(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getRating(grade) {
  const normalized = String(grade || "").toLowerCase();
  if (normalized === "a" || normalized === "b") return { label: "Healthy Choice", tone: "good", marker: "✓" };
  if (normalized === "c") return { label: "Okay Sometimes", tone: "ok", marker: "~" };
  if (normalized === "d" || normalized === "e") return { label: "Limit If Possible", tone: "limit", marker: "!" };
  return { label: "Not enough nutrition data", tone: "unknown", marker: "○" };
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

export default function NutritionFoodCheck({ variant = "delco", lang = "en" }) {
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
      accent: "#0ea5e9",
      accentDark: "#1e3a8a",
      deepBlue: "#002D72",
      yellow: "#facc15",
      red: "#ef4444",
      success: "#16a34a",
      bg: "#f8fafc",
      surface: "#FFFFFF",
      soft: "rgba(14,165,233,0.08)",
      border: "#e2e8f0",
      text: "#0f172a",
      muted: "#475569",
      font: "'DM Sans', sans-serif",
    };
  }, [variant]);

  const lookupFood = useCallback(async (rawBarcode, method = "manual") => {
    const cleanBarcode = String(rawBarcode || "").replace(/\D/g, "");
    if (!cleanBarcode) {
      setError(tt(lang, "enterFirst"));
      setProduct(null);
      return;
    }

    if (method === "manual") {
      trackImpactEvent("nutrition_scan_start", { method: "manual" });
    }
    setBarcode(cleanBarcode);
    setLoading(true);
    setError("");
    setProduct(null);

    try {
      const response = await fetch(`${FOOD_API}/${encodeURIComponent(cleanBarcode)}.json`);
      if (!response.ok) throw new Error(tt(lang, "unavailable"));
      const data = await response.json();
      if (data.status !== 1 || !data.product) {
        setError(tt(lang, "notFound"));
        trackImpactEvent("nutrition_result_view", { result_status: "not_found" });
        return;
      }
      setProduct(data.product);
      trackImpactEvent("nutrition_result_view", { result_status: "found" });
    } catch (err) {
      setError(tt(lang, "connection"));
      trackImpactEvent("nutrition_result_view", { result_status: "error" });
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const openScanner = useCallback(() => {
    trackImpactEvent("nutrition_scan_start", { method: "camera" });
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
    setError(tt(lang, "cameraUnavailable"));
  }, [lang]);

  const handleScannerResult = useCallback((detectedCodes) => {
    const value = firstDetectedValue(detectedCodes);
    if (!value || loading) return;
    setCameraOpen(false);
    lookupFood(value, "camera");
  }, [loading, lookupFood]);

  const rating = product ? getRating(product.nutriscore_grade) : null;
  const nutriments = product?.nutriments || {};
  const flags = product ? getNutritionFlags(nutriments) : [];
  const calories = product ? getCalories(nutriments) : "";
  const allergyText = product ? getAllergyText(product) : "";

  return (
    <div className="dfi" style={{ padding: 20, fontFamily: theme.font, color: theme.text, background: theme.bg, minHeight: "100%" }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 18, boxShadow: "0 4px 14px rgba(0,0,0,0.05)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 14, background: theme.soft, color: theme.accentDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            🍎
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 900, color: theme.accentDark, marginBottom: 3 }}>
              {tt(lang, "nutrition")}
            </div>
            <h1 style={{ margin: 0, fontSize: 26, lineHeight: 1.08 }}>{tt(lang, "nutritionCheck")}</h1>
          </div>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.45, color: theme.muted }}>
          {tt(lang, "intro")}
        </p>
        <div style={{ background: theme.soft, border: "1px solid rgba(14,165,233,0.18)", borderRadius: 14, padding: 13, fontSize: 13, lineHeight: 1.45, color: "#334155" }}>
          {tt(lang, "note")}
        </div>
      </div>

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,0.05)", marginBottom: 16 }}>
        <label htmlFor="nutrition-barcode" style={{ display: "block", fontSize: 12, fontWeight: 800, color: theme.muted, marginBottom: 8 }}>
          {tt(lang, "barcode")}
        </label>
        <input
          id="nutrition-barcode"
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          inputMode="numeric"
          placeholder={tt(lang, "enterBarcode")}
          style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${theme.border}`, borderRadius: 14, padding: "14px 14px", fontSize: 16, color: theme.text, outlineColor: theme.accent, marginBottom: 12 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            type="button"
            onClick={() => lookupFood(barcode, "manual")}
            disabled={loading}
            style={{ minHeight: 50, border: "none", borderRadius: 16, background: theme.yellow || "#facc15", color: "#0f172a", fontSize: 14, fontWeight: 900, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? tt(lang, "checking") : tt(lang, "checkFood")}
          </button>
          <button
            type="button"
            onClick={() => { if (cameraOpen) stopCamera(); else openScanner(); }}
            style={{ minHeight: 50, border: "none", borderRadius: 12, background: theme.accent, color: "white", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
          >
            {cameraOpen ? tt(lang, "stopCamera") : tt(lang, "useCamera")}
          </button>
        </div>
      </div>

      {cameraOpen && (
        <div style={{ background: "#0f172a", borderRadius: 20, overflow: "hidden", marginBottom: 16, border: `1px solid ${theme.border}`, boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
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
              style={{ width: "100%", minHeight: 46, border: "none", borderRadius: 12, background: theme.accent, color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
            >
              {tt(lang, "stopCamera")}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 16, fontSize: 14, color: theme.muted, marginBottom: 16 }}>
          {tt(lang, "lookingUp")}
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, lineHeight: 1.45, color: theme.red || "#ef4444", marginBottom: 12, fontWeight: 700 }}>{error}</div>
          <button
            type="button"
            onClick={() => { setError(""); setProduct(DEMO_PRODUCT); }}
            style={{ width: "100%", minHeight: 44, border: "none", borderRadius: 12, background: theme.accent, color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
          >
            {tt(lang, "showDemo")}
          </button>
        </div>
      )}

      {product && rating && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 18, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: theme.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: 4 }}>
              {tt(lang, "foodResult")}
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
          <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.15 }}>{product.product_name || tt(lang, "unnamed")}</h2>
          {product.brands && <div style={{ marginTop: 5, color: theme.muted, fontSize: 13 }}>{product.brands}</div>}

          <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
            <div style={{ background: rating.tone === "good" ? "#dcfce7" : rating.tone === "ok" ? "#fef9c3" : rating.tone === "limit" ? "#ffedd5" : "#f3f4f6", color: rating.tone === "good" ? "#166534" : rating.tone === "ok" ? "#854d0e" : rating.tone === "limit" ? "#9a3412" : "#374151", borderRadius: 14, padding: "12px 14px", fontSize: 15, fontWeight: 900 }}>
              {rating.marker} {rating.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <InfoTile label="Nutri-Score" value={product.nutriscore_grade ? String(product.nutriscore_grade).toUpperCase() : tt(lang, "notListed")} theme={theme} />
              <InfoTile label={tt(lang, "calories")} value={calories || tt(lang, "notListed")} theme={theme} />
            </div>
          </div>

          <Section title={tt(lang, "nutritionFlags")} theme={theme}>
            {flags.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {flags.map((flag) => (
                  <span key={flag} style={{ background: theme.soft, border: `1px solid ${theme.border}`, borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 800 }}>
                    {flag}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: theme.muted }}>{tt(lang, "noFlags")}</p>
            )}
          </Section>

          {product.ingredients_text && (
            <Section title={tt(lang, "ingredients")} theme={theme}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{product.ingredients_text}</p>
            </Section>
          )}

          {allergyText && (
            <Section title={tt(lang, "allergyWarning")} theme={theme}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{allergyText}</p>
            </Section>
          )}

          <div style={{ background: theme.soft, borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.45, marginTop: 14 }}>
            {tt(lang, "pairing")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            <button
              type="button"
              onClick={scanAnother}
              style={{ minHeight: 50, border: "none", borderRadius: 16, background: theme.yellow || "#facc15", color: "#0f172a", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
            >
              {tt(lang, "scanAnother")}
            </button>
            <button
              type="button"
              onClick={closeResult}
              style={{ minHeight: 50, border: "none", borderRadius: 12, background: theme.accent, color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
            >
              {tt(lang, "clearResults")}
            </button>
          </div>
        </div>
      )}

      <p style={{ margin: "16px 2px 0", fontSize: 11, lineHeight: 1.45, color: theme.muted }}>
        {tt(lang, "disclaimer")}
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

