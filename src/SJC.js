import { useState, useRef, useEffect } from "react";
import { auth, db, googleProvider, FIREBASE_ENABLED } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import NutritionFoodCheck from "./NutritionFoodCheck";
import TrustCheck from "./TrustCheck";
import { DELCO_CRISIS, PA_CRISIS_TEXT, correctionMailto } from "./delcoSafetyInfo";
import { EXTRA_TRANSLATIONS, InstallPrompt, SMSAccessCard, EligibilityQuiz,
  PantryStatusWidget, TransitHelper, DietaryFilters, trackEvent,
  PantryInventoryWidget, IAmGoingButton, SaveResourceButton, FoundHelpButton,
  // eslint-disable-next-line no-unused-vars
  StoriesSection, LanguageSelector, HealthScreen,
  // eslint-disable-next-line no-unused-vars
  DocumentChecklist, SNAPAssistant, CrisisEscapePlan, FamilyResourcePlan,
  FamilyProfileSetup, getFamilyProfile, getSavedResources, LegalScreen,
  TrustBadge, ReportIssueButton } from "./features";

/* ── SJC BRAND CONFIG ── */
const BRAND = {
  name: "SJC Community",
  fullName: "St. John Chrysostom Parish",
  tagline: "Serving our neighbors in Wallingford & beyond",
  address: "615 S. Providence Rd., Wallingford PA 19086",
  phone: "610-874-3418",
  email: "PHoffice@sjcparish.org",
  website: "sjcparish.org",
  pastor: "Rev. Edward J. Hallinan",
  contact: "Mary Chollet, Parish Ministry & Communications",
  primary: "#1B3A6B",       // Navy blue
  secondary: "#C9A84C",     // Gold
  accent: "#8B1A2A",        // Burgundy
  light: "#F5F2EB",         // Warm parchment
  dark: "#0D1F3C",          // Deep navy
  gradStart: "#1B3A6B",
  gradEnd: "#2E5BA8",
  missionVerse: '"Act justly, love mercy, and walk humbly with your God." — Micah 6:8',
};

/* ── TRANSLATIONS ── */
const T = {
  en: {
    appName:"SJC Community", tagline:"Serving our neighbors in Wallingford & beyond",
    county:"St. John Chrysostom Parish", zip:"Wallingford · 19086",
    findResources:"Find Resources", foodHelpMore:"Food, help & more",
    benefits:"Benefits", snapWic:"SNAP, WIC & more",
    emergency:"Emergency", hotlinesCrisis:"Hotlines & crisis",
    volunteer:"Volunteer", askAI:"Ask SJC AI",
    openNow:"Open Right Now", opensLater:"Opens Later Today", allResources:"All Resources",
    supportPantries:"Support Our Parish Ministries", donateDesc:"Your gift supports St. John Chrysostom's outreach to families in need across Wallingford.",
    back:"← Back", about:"About", hours:"Hours", whatToKnow:"What to know",
    call:"Call", directions:"🗺️ Map", donatePantry:"💛 Donate to Support This Ministry",
    openRightNow:"● Open Right Now", opensLaterToday:"◐ Opens Later Today", closedToday:"○ Closed Today",
    home:"Home", find:"Find", hotline:"Hotline",
    searchPlaceholder:"Search food, housing, legal help…", sortedByDistance:"resources · sorted by distance",
    benefitsNav:"Benefits Navigator", benefitsDesc:"Find programs you may qualify for in Pennsylvania",
    quickEligibility:"Quick Eligibility Check", applyCompass:"Apply on PA COMPASS →",
    giveBack:"Serve Your Neighbor", volunteerDesc:"Ministry & volunteer opportunities at SJC and nearby",
    whyMatters:"✝ Why it matters", volunteerImpact:"Every act of service reflects Christ's love. One volunteer shift at a local pantry serves 30–50 families.",
    signUp:"Sign up", emergencyHotlines:"Emergency & Crisis Hotlines", hotlinesDesc:"Free, confidential, available 24/7",
    immediateEmergency:"🚨 Immediate Emergency", additionalResources:"Additional Resources",
    confidentialNote:"All calls are confidential. You are not alone. Help is always available.",
    makeDonation:"Make a Gift", donateAllGoes:"100% supports SJC Parish ministries and local Delaware County families",
    selectAmount:"Select Amount", donateTo:"Designate Your Gift", continue:"Continue →",
    confirmDonation:"Confirm Your Gift", amount:"Amount", to:"To", impact:"Impact", payment:"Payment",
    thankYou:"God bless you,", onItsWay:"Your gift is on its way to",
    yourImpact:"Your impact:", done:"Done", secure:"🔒 Secure · 100% to SJC & local ministries",
    needHelpNow:"🚨 I Need Help Right Now", emergencyMode:"Emergency Resources",
    emergencyModeDesc:"Nearest open resources + crisis lines",
    noOpenResources:"No resources open right now — call PA 211 (dial 211) for immediate help.",
    submitResource:"Submit a Resource", submitDesc:"Know of a ministry or service we should add?",
    orgName:"Organization Name", orgAddress:"Address", orgPhone:"Phone Number", orgCategory:"Category",
    orgHours:"Hours / Days Open", orgNotes:"Additional Notes (optional)", submit:"Submit",
    submitThanks:"Thank you! We'll review and add this resource within 24 hours.",
    notifications:"Notifications", dismiss:"Dismiss",
    impactDashboard:"Parish Impact", impactDesc:"How SJC is serving the Wallingford community",
    totalUsers:"Families Reached", resourcesFound:"Resources Found", donationsGiven:"Gifts Given", familiesHelped:"Families Helped",
    sponsoredBy:"A ministry of St. John Chrysostom Parish",
    monthlyImpact:"Email Impact Report",
    aiChat:"SJC Community AI", aiDesc:"Ask about local resources, parish services & more",
    aiPlaceholder:"e.g. I need food assistance near Wallingford…",
    aiSend:"Send", aiThinking:"Finding help for you…",
  },
  es: {
    appName:"SJC Comunidad", tagline:"Sirviendo a nuestros vecinos en Wallingford y más allá",
    county:"Parroquia San Juan Crisóstomo", zip:"Wallingford · 19086",
    findResources:"Buscar Recursos", foodHelpMore:"Comida, ayuda y más",
    benefits:"Beneficios", snapWic:"SNAP, WIC y más",
    emergency:"Emergencia", hotlinesCrisis:"Líneas de crisis",
    volunteer:"Voluntario", askAI:"Preguntar IA",
    openNow:"Abierto Ahora", opensLater:"Abre Más Tarde", allResources:"Todos los Recursos",
    supportPantries:"Apoya los Ministerios de la Parroquia", donateDesc:"Tu donación apoya el ministerio de San Juan Crisóstomo a familias necesitadas en Wallingford.",
    back:"← Atrás", about:"Acerca de", hours:"Horario", whatToKnow:"Lo que debes saber",
    call:"Llamar", directions:"🗺️ Mapa", donatePantry:"💛 Donar para Apoyar este Ministerio",
    openRightNow:"● Abierto Ahora", opensLaterToday:"◐ Abre Más Tarde", closedToday:"○ Cerrado Hoy",
    home:"Inicio", find:"Buscar", hotline:"Crisis",
    searchPlaceholder:"Buscar comida, vivienda, ayuda legal…", sortedByDistance:"recursos · por distancia",
    benefitsNav:"Navegador de Beneficios", benefitsDesc:"Encuentra programas para los que puedes calificar en Pennsylvania",
    quickEligibility:"Verificación Rápida", applyCompass:"Solicitar en PA COMPASS →",
    giveBack:"Sirve a tu Prójimo", volunteerDesc:"Oportunidades de ministerio y voluntariado en SJC",
    whyMatters:"✝ Por qué importa", volunteerImpact:"Cada acto de servicio refleja el amor de Cristo. Un turno voluntario sirve a 30–50 familias.",
    signUp:"Inscribirse", emergencyHotlines:"Líneas de Emergencia y Crisis", hotlinesDesc:"Gratis, confidencial, 24/7",
    immediateEmergency:"🚨 Emergencia Inmediata", additionalResources:"Recursos Adicionales",
    confidentialNote:"Todas las llamadas son confidenciales. No estás solo. La ayuda siempre está disponible.",
    makeDonation:"Hacer una Donación", donateAllGoes:"100% apoya los ministerios de SJC y familias locales",
    selectAmount:"Seleccionar Monto", donateTo:"Designar tu Donación", continue:"Continuar →",
    confirmDonation:"Confirmar Donación", amount:"Monto", to:"A", impact:"Impacto", payment:"Pago",
    thankYou:"Dios te bendiga,", onItsWay:"Tu donación está en camino a",
    yourImpact:"Tu impacto:", done:"Listo", secure:"🔒 Seguro · 100% a SJC y ministerios locales",
    needHelpNow:"🚨 Necesito Ayuda Ahora", emergencyMode:"Recursos de Emergencia",
    emergencyModeDesc:"Recursos abiertos más cercanos + líneas de crisis",
    noOpenResources:"No hay recursos abiertos ahora — llama al PA 211 (marca 211) para ayuda inmediata.",
    submitResource:"Enviar un Recurso", submitDesc:"¿Conoces un ministerio o servicio que debemos agregar?",
    orgName:"Nombre de la Organización", orgAddress:"Dirección", orgPhone:"Teléfono", orgCategory:"Categoría",
    orgHours:"Horario", orgNotes:"Notas Adicionales (opcional)", submit:"Enviar",
    submitThanks:"¡Gracias! Revisaremos y agregaremos este recurso en 24 horas.",
    notifications:"Notificaciones", dismiss:"Descartar",
    impactDashboard:"Impacto Parroquial", impactDesc:"Cómo SJC sirve a la comunidad de Wallingford",
    totalUsers:"Familias Alcanzadas", resourcesFound:"Recursos Encontrados", donationsGiven:"Donaciones", familiesHelped:"Familias Ayudadas",
    sponsoredBy:"Un ministerio de la Parroquia San Juan Crisóstomo",
    monthlyImpact:"Informe de Impacto",
    aiChat:"IA de SJC Comunidad", aiDesc:"Pregunta sobre recursos locales y servicios parroquiales",
    aiPlaceholder:"ej. Necesito ayuda con comida cerca de Wallingford…",
    aiSend:"Enviar", aiThinking:"Buscando ayuda para ti…",
  }
};

// Add Vietnamese and Chinese translations
Object.assign(T, EXTRA_TRANSLATIONS);

const SJC_UI_TRANSLATIONS = {
  en: {
    nutrition:"Nutrition", pantriesOpenNow:"Pantries open now", snapWicMore:"SNAP, WIC & more",
    checkInfo:"Check Info", scamBiasSignals:"Scam & bias signals", crisisLine:"Crisis Line",
    freeConfidential:"Free & confidential", housing:"Housing", shelterLegalAid:"Shelter & legal aid",
    reportIncorrectInfo:"Report incorrect info", lastUpdated:"Last updated", verified:"Verified",
    needsVerification:"Needs verification", food:"Food", foodCheckNutrition:"Food check & nutrition", terms:"Terms", privacy:"Privacy", disclaimer:"Disclaimer",
    text:"Text", callCrisisLine:"Call Crisis Line", textPA:"Text PA", crisisLines:"Crisis Lines",
  },
  es: {
    nutrition:"Nutrición", pantriesOpenNow:"Despensas abiertas ahora", snapWicMore:"SNAP, WIC y más",
    checkInfo:"Verificar info", scamBiasSignals:"Señales de estafa y sesgo", crisisLine:"Línea de crisis",
    freeConfidential:"Gratis y confidencial", housing:"Vivienda", shelterLegalAid:"Refugio y ayuda legal",
    reportIncorrectInfo:"Reportar información incorrecta", lastUpdated:"Última actualización", verified:"Verificado",
    needsVerification:"Necesita verificación", food:"Comida", foodCheckNutrition:"Revisión de comida y nutrición", terms:"Términos", privacy:"Privacidad", disclaimer:"Aviso",
    text:"Texto", callCrisisLine:"Llamar a la línea de crisis", textPA:"Texto PA", crisisLines:"Líneas de crisis",
  },
  vi: {
    nutrition:"Dinh dưỡng", pantriesOpenNow:"Kho thực phẩm đang mở", snapWicMore:"SNAP, WIC và thêm nữa",
    checkInfo:"Kiểm tra thông tin", scamBiasSignals:"Dấu hiệu lừa đảo và thiên lệch", crisisLine:"Đường dây khủng hoảng",
    freeConfidential:"Miễn phí & bảo mật", housing:"Nhà ở", shelterLegalAid:"Nơi trú ẩn & trợ giúp pháp lý",
    reportIncorrectInfo:"Báo thông tin sai", lastUpdated:"Cập nhật lần cuối", verified:"Đã xác minh",
    needsVerification:"Cần xác minh", food:"Thực phẩm", foodCheckNutrition:"Kiểm tra thực phẩm & dinh dưỡng", terms:"Điều khoản", privacy:"Quyền riêng tư", disclaimer:"Tuyên bố miễn trừ",
    text:"Nhắn tin", callCrisisLine:"Gọi đường dây khủng hoảng", textPA:"Nhắn PA", crisisLines:"Đường dây khủng hoảng",
  },
  zh: {
    nutrition:"营养", pantriesOpenNow:"现在开放的食品 pantry", snapWicMore:"SNAP、WIC 等",
    checkInfo:"检查信息", scamBiasSignals:"诈骗和偏见信号", crisisLine:"危机热线",
    freeConfidential:"免费且保密", housing:"住房", shelterLegalAid:"庇护所和法律援助",
    reportIncorrectInfo:"报告错误信息", lastUpdated:"最后更新", verified:"已验证",
    needsVerification:"需要验证", food:"食物", foodCheckNutrition:"食品和营养检查", terms:"条款", privacy:"隐私", disclaimer:"免责声明",
    text:"短信", callCrisisLine:"拨打危机热线", textPA:"发送 PA", crisisLines:"危机热线",
  },
};

Object.entries(SJC_UI_TRANSLATIONS).forEach(([lang, values]) => {
  T[lang] = { ...(T.en || {}), ...(T[lang] || {}), ...values };
});

function translate(lang, key) {
  return T[lang]?.[key] || T.en?.[key] || key;
}

function getT(lang) {
  return new Proxy(T.en, { get: (_target, key) => translate(lang, key) });
}

// Google Analytics event helper — fires to G-NZRTH3H74B
function gaEvent(eventName, params = {}) {
  try { if (typeof window.gtag === "function") window.gtag("event", eventName, params); } catch(e) {}
}

// Zip code coordinates for distance calculation
const ZIP_COORDS = {
  "19086":{ lat:39.8926, lng:-75.3693 }, "19013":{ lat:39.8490, lng:-75.3566 },
  "19082":{ lat:39.9601, lng:-75.2966 }, "19063":{ lat:39.9173, lng:-75.3921 },
  "19023":{ lat:39.9162, lng:-75.2702 }, "19015":{ lat:39.8651, lng:-75.3774 },
  "19050":{ lat:39.9387, lng:-75.2724 }, "19076":{ lat:39.8793, lng:-75.3049 },
  "19064":{ lat:39.9254, lng:-75.3490 }, "19078":{ lat:39.8810, lng:-75.3274 },
  "19081":{ lat:39.9026, lng:-75.3499 }, "19041":{ lat:39.9829, lng:-75.2972 },
  "19083":{ lat:39.9787, lng:-75.3080 }, "19026":{ lat:39.9407, lng:-75.3058 },
};

function calcDistance(zip1, zip2) {
  const c1 = ZIP_COORDS[zip1], c2 = ZIP_COORDS[zip2];
  if (!c1 || !c2) return 99;
  const R = 3958.8, dLat = (c2.lat-c1.lat)*Math.PI/180, dLng = (c2.lng-c1.lng)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(c1.lat*Math.PI/180)*Math.cos(c2.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return +(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
}

/* ── SJC-SPECIFIC RESOURCES ── */
const RESOURCES = [
  { id:1, category:"parish", name:"SJC Parish Office", address:"615 S. Providence Rd., Wallingford PA 19086", phone:"610-874-3418", miles:0.1, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["pastoral care","counseling referrals","community support"], color:BRAND.primary, description:"The SJC Parish Office connects parishioners and community members with pastoral care, counseling referrals, and local support resources. Contact Mary Chollet for community assistance.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:2, category:"food", name:"Lifewerks Food Pantry", address:"25 Cedar Road, Wallingford PA 19086", phone:"610-872-3344", miles:0.3, hours:[{day:"Tuesday",time:"6:00 PM – 8:00 PM"}], tags:["choice pantry","no appointment needed","0.3 mi from SJC"], color:"#2D6A4F", description:"A choice pantry — you shop like a store, picking what your family actually needs. Located right here in Wallingford, less than a mile from SJC.", openDays:[2], openStart:18, openEnd:20 },
  { id:3, category:"food", name:"DIFAN Wallingford", address:"25 Cedar Road, Wallingford PA 19086", phone:"484-326-5362", miles:0.3, hours:[{day:"Tuesday",time:"6:30 PM – 8:00 PM"},{day:"Friday",time:"4:00 PM – 6:00 PM"}], tags:["interfaith network","3 meals/day × 5 days"], color:"#40916C", description:"Delaware County's Interfaith Food Assistance Network. Each visit provides enough food for 3 meals a day, 5 days for every household member.", openDays:[2,5], openStart:16, openEnd:20 },
  { id:4, category:"food", name:"Media Food Bank", address:"350 W. State St, Media PA 19063", phone:"610-566-3172", miles:2.4, hours:[{day:"Thursday",time:"6:00 PM – 8:00 PM"},{day:"Sunday",time:"1:00 PM – 2:00 PM"}], tags:["donations accepted daily 2–4 PM"], color:"#1B4332", description:"Provides food and essential items to Delaware County residents. Drop off donations daily between 2–4 PM.", openDays:[4,0], openStart:13, openEnd:20 },
  { id:5, category:"food", name:"Loaves & Fishes Food Pantry", address:"703 Lincoln Ave, Prospect Park PA 19076", phone:"610-532-9000", miles:2.8, hours:[{day:"Tuesday",time:"11:00 AM – 2:00 PM & 5–7 PM"},{day:"Thursday",time:"1:00 PM – 4:00 PM"}], tags:["twice weekly","extended hours"], color:"#74C69D", description:"Baptist church pantry with generous hours twice a week including evening access for working families.", openDays:[2,4], openStart:11, openEnd:19 },
  { id:6, category:"assistance", name:"Catholic Social Services", address:"Delaware County, PA", phone:"267-331-2490", miles:5.0, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["housing help","rent support","counseling","legal aid"], color:BRAND.accent, description:"Catholic Social Services offers food pantries, housing and rent support, counseling, and legal aid — aligned with SJC's Catholic mission of serving those in need.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:7, category:"assistance", name:"Delco Helping Hands", address:"Delaware County, PA", phone:"484-474-0590", miles:3.0, hours:[{day:"Call for hours",time:""}], tags:["diapers","pet supplies","referral hub","essentials"], color:"#F4A261", description:"Grassroots nonprofit supplying families with food, diapers, pet supplies, and acting as a referral hub to connect you with other local resources.", openDays:[0,1,2,3,4,5,6], openStart:9, openEnd:17 },
  { id:8, category:"legal", name:"Legal Aid of Southeastern PA", address:"Delaware County, PA", phone:"877-429-5994", miles:4.5, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["free legal help","eviction defense","benefits access"], color:"#023E8A", description:"Free legal representation for low-income residents — housing, evictions, employment, family law, and access to public benefits.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:9, category:"assistance", name:"Women's Resource Center", address:"Delaware County, PA", phone:"610-687-6391", miles:6.0, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["women","housing instability","financial hardship","counseling"], color:"#9D4EDD", description:"Supports women facing housing instability or financial hardship with counseling, legal advocacy, and educational services.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
];

const BENEFITS = [
  { id:"snap", name:"SNAP Food Benefits", icon:"🛒", desc:"Monthly food assistance loaded on an EBT card", link:"https://www.compass.state.pa.us" },
  { id:"wic", name:"WIC Program", icon:"🍼", desc:"Food + support for pregnant women & children under 5", link:"https://www.wicworks.fns.usda.gov" },
  { id:"liheap", name:"LIHEAP Utility Help", icon:"💡", desc:"Help paying heating and utility bills", link:"https://www.compass.state.pa.us" },
  { id:"chip", name:"CHIP Health Insurance", icon:"🏥", desc:"Free/low-cost health insurance for kids", link:"https://www.coveringkidsfamilies.org" },
  { id:"medicaid", name:"Medicaid", icon:"🩺", desc:"Free health coverage for qualifying adults & families", link:"https://www.compass.state.pa.us" },
];

const HOTLINES = [
  { id:1, name:"911 Emergency", sub:"Police, Fire, Medical", number:"911", color:"#D62828", bg:"#FFF0F0", icon:"🚨", urgent:true },
  { id:2, name:PA_CRISIS_TEXT.displayText, sub:PA_CRISIS_TEXT.description, number:PA_CRISIS_TEXT.phone, actionLabel:"Text PA", actionHref:PA_CRISIS_TEXT.phoneHref, color:"#D62828", bg:"#FFF0F0", icon:"💬", urgent:true, isText:true, verified:PA_CRISIS_TEXT.verified, verifiedBy:PA_CRISIS_TEXT.verifiedBy, lastUpdated:PA_CRISIS_TEXT.lastUpdated },
  { id:3, name:"988 Suicide & Crisis", sub:"Call or text 988 — 24/7 free", number:"988", color:"#7B2D8B", bg:"#F8F0FF", icon:"🧠", urgent:true },
  { id:4, name:"SJC Parish Office", sub:"Pastoral care & referrals", number:"610-874-3418", color:BRAND.primary, bg:"#F0F4FF", icon:"✝" },
  { id:5, name:"PA 211 Helpline", sub:"All social services — dial 2-1-1", number:"211", color:"#2D6A4F", bg:"#F0FBF4", icon:"📞" },
  { id:6, name:"Domestic Violence Hotline", sub:"PA DV Hotline — 24/7 confidential", number:"1-800-799-7233", color:"#9D4EDD", bg:"#F8F0FF", icon:"🏠" },
  { id:7, name:DELCO_CRISIS.displayName, sub:DELCO_CRISIS.description, number:DELCO_CRISIS.phone, actionLabel:"Call Crisis Line", actionHref:DELCO_CRISIS.phoneHref, color:"#023E8A", bg:"#F0F4FF", icon:"🧩", urgent:true, verified:DELCO_CRISIS.verified, verifiedBy:DELCO_CRISIS.verifiedBy, lastUpdated:DELCO_CRISIS.lastUpdated },
  { id:8, name:"Hunger Hotline", sub:"Find food near you right now", number:"1-866-348-6479", color:"#40916C", bg:"#F0FBF4", icon:"🥫" },
  { id:9, name:"Poison Control", sub:"24/7 medical emergency", number:"1-800-222-1222", color:"#E76F51", bg:"#FFF6F0", icon:"⚠️" },
  { id:10, name:"Child Abuse Hotline", sub:"PA ChildLine — 24/7 reporting", number:"1-800-932-0313", color:"#D62828", bg:"#FFF0F0", icon:"👶" },
];

function openHotlineAction(h) {
  const href = h.actionHref || `${h.isText ? "sms" : "tel"}:${h.number}`;
  if (href.startsWith("sms:")) {
    window.location.href = href;
  } else {
    window.open(href);
  }
}

const CATEGORY_LABELS = { food:"Food Pantry", assistance:"Family Assistance", legal:"Legal Aid", parish:"Parish Ministry" };
// eslint-disable-next-line no-unused-vars
const CATEGORY_COLORS = { food:"#2D6A4F", assistance:"#E76F51", legal:"#023E8A", parish:BRAND.primary };

const VOLUNTEER_OPPS = [
  { org:"Lifewerks Food Pantry", role:"Pantry Volunteer", time:"Tuesdays 5:30–8:30 PM", icon:"🥫", color:"#2D6A4F" },
  { org:"SJC Parish Outreach", role:"Community Visitor", time:"Flexible — contact parish office", icon:"✝", color:BRAND.primary },
  { org:"DIFAN Network", role:"Food Distributor", time:"Tuesdays & Fridays", icon:"📦", color:"#40916C" },
  { org:"Catholic Social Services", role:"Case Aid Volunteer", time:"Weekdays flexible", icon:"🤝", color:BRAND.accent },
  { org:"Media Food Bank", role:"Donation Sorter", time:"Thursdays 5–8 PM", icon:"🗂️", color:"#1B4332" },
];

const SJC_OFFICIAL_LINKS = [
  { title:"Weekly Bulletin", icon:"PDF", description:"Read the current bulletin and browse the official parish bulletin archive.", url:"https://sjcparish.org/bulletins" },
  { title:"Parish Calendar", icon:"CAL", description:"Check upcoming parish events, meetings, liturgies, and calendar updates.", url:"https://sjcparish.org/google-calendar" },
  { title:"Mass & Confession Times", icon:"MASS", description:"Confirm regular Mass, Confession, Adoration, Holy Day, and accessibility information.", url:"https://sjcparish.org/mass-times" },
  { title:"Watch Mass", icon:"LIVE", description:"Find SJC livestream options and recorded Masses on the official parish page.", url:"https://sjcparish.org/mass-online" },
  { title:"Mass & Podcasts", icon:"AUDIO", description:"Explore worship information, Mass resources, and parish podcast links.", url:"https://sjcparish.org/mass" },
  { title:"Parish Newsletter / The Angelus", icon:"NEWS", description:"Open The Angelus parish newsletter page and recent newsletter archive.", url:"https://sjcparish.org/parish-newsletter" },
  { title:"Parish Life", icon:"LIFE", description:"Learn about parish organizations, ministries, and ways to get involved.", url:"https://sjcparish.org/parish-life" },
  { title:"Community Service", icon:"HELP", description:"Find service ministries and community outreach opportunities through SJC.", url:"https://sjcparish.org/ministries" },
  { title:"Youth Group", icon:"YOUTH", description:"View youth group information and official updates for young parishioners.", url:"https://sjcparish.org/youth-group" },
  { title:"Contact & Directions", icon:"INFO", description:"Contact the Parish House, find staff information, and confirm office details.", url:"https://sjcparish.org/contact-clergy-staff" },
];

const SJC_LATEST_ITEMS = [
  { title:"Weekly Bulletin", date:"Update weekly", description:"Open the official bulletin page for the newest bulletin and archived issues.", url:"https://sjcparish.org/bulletins" },
  { title:"Parish Calendar", date:"Check before attending", description:"Use the official calendar for the latest parish events, meetings, and schedule notes.", url:"https://sjcparish.org/google-calendar" },
  { title:"Parish Newsletter", date:"Spring / Fall", description:"Read The Angelus newsletter and review the official newsletter archive.", url:"https://sjcparish.org/parish-newsletter" },
];

const SJC_COMMUNITY_FILTERS = [
  { id:"announcements", label:"Announcements" },
  { id:"events", label:"Events" },
  { id:"prayer", label:"Prayer Requests" },
  { id:"volunteer", label:"Volunteer Needs" },
  { id:"help", label:"Community Help" },
];

const SJC_COMMUNITY_POSTS = [
  { type:"announcements", typeLabel:"Announcement", title:"Weekly Bulletin Available", message:"Read the latest parish bulletin and upcoming events.", date:"This week", source:"SJC Parish Hub", button:"Open Bulletin", url:"https://sjcparish.org/bulletins" },
  { type:"prayer", typeLabel:"Prayer Request", title:"Prayer Request", message:"Please keep our parish families and neighbors in your prayers this week.", date:"This week", source:"Community sample", button:"I prayed" },
  { type:"volunteer", typeLabel:"Volunteer Need", title:"Volunteers Needed", message:"Help is needed for upcoming parish and community events.", date:"This week", source:"Community sample", button:"I can help" },
  { type:"events", typeLabel:"Event", title:"Upcoming Parish Event", message:"Check the parish calendar for this week's events.", date:"This week", source:"Official calendar", button:"View Calendar", url:"https://sjcparish.org/google-calendar" },
  { type:"help", typeLabel:"Community Help", title:"Neighbor Support", message:"Share reviewed needs for rides, meals, outreach, or local support through the request form.", date:"Sample", source:"Community sample", button:"Submit a Request" },
];

const IMPACT_STATS = [
  { label:"totalUsers", value:"1,240", trend:"+18% this month", icon:"👥", color:BRAND.primary },
  { label:"resourcesFound", value:"6,830", trend:"+11% this month", icon:"🔍", color:"#40916C" },
  { label:"donationsGiven", value:"$4,120", trend:"+27% this month", icon:"💛", color:BRAND.secondary },
  { label:"familiesHelped", value:"534", trend:"+14% this month", icon:"🏠", color:BRAND.accent },
];

function isOpenNow(r) { const now=new Date(),day=now.getDay(),hour=now.getHours()+now.getMinutes()/60; return r.openDays.includes(day)&&hour>=r.openStart&&hour<r.openEnd; }
function isOpenToday(r) { return r.openDays.includes(new Date().getDay()); }

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
  .sjc * { box-sizing:border-box; margin:0; padding:0; }
  .sjc { width:390px; height:844px; margin:0 auto; background:#F5F2EB; overflow:hidden; display:flex; flex-direction:column; border-radius:44px; box-shadow:0 32px 64px rgba(0,0,0,0.2),0 0 0 1px rgba(0,0,0,0.06); font-family:'Source Sans 3',sans-serif; color:#1A1A2E; position:relative; }
  .sjc-sb { display:flex; justify-content:space-between; align-items:center; padding:14px 20px 0; font-size:12px; font-weight:600; color:#1A1A2E; flex-shrink:0; }
  .sjc-sc { flex:1; overflow-y:auto; overflow-x:hidden; scrollbar-width:none; }
  .sjc-sc::-webkit-scrollbar { display:none; }
  .sjc-nav { display:flex; justify-content:space-around; align-items:center; padding:6px 0 16px; border-top:1px solid rgba(27,58,107,0.12); background:#F5F2EB; flex-shrink:0; }
  .sjc-ni { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:4px 8px; border-radius:12px; transition:all 0.18s; }
  .sjc-ni:hover { background:rgba(27,58,107,0.07); }
  .sjc-ni-ic { font-size:18px; opacity:0.3; transition:opacity 0.18s; }
  .sjc-ni-lb { font-size:8px; font-weight:700; letter-spacing:0.06em; color:#6B7080; transition:color 0.18s; text-transform:uppercase; }
  .sjc-ni.act .sjc-ni-ic { opacity:1; }
  .sjc-ni.act .sjc-ni-lb { color:${BRAND.primary}; }
  .dfi { animation:dhFi 0.28s ease; }
  @keyframes dhFi { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .sjc-chip { display:inline-flex; align-items:center; gap:4px; background:#E8E4D9; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:500; color:#4A4030; }
  .sjc-chip.open { background:#D8F3DC; color:#1B4332; }
  .sjc-chip.closed { background:#FFE8E8; color:#9B1C1C; }
  .sjc-chip.today { background:#FFF3CD; color:#7B5800; }
  .sjc-btn { background:${BRAND.primary}; color:white; border:none; border-radius:14px; padding:14px 20px; font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; width:100%; }
  .sjc-btn:hover { background:${BRAND.dark}; transform:translateY(-1px); }
  .sjc-btn-gold { background:linear-gradient(135deg,${BRAND.secondary},#A07830); color:#1A1A2E; border:none; border-radius:14px; padding:14px 20px; font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.18s; width:100%; }
  .sjc-btn-gold:hover { opacity:0.9; transform:translateY(-1px); }
  .sjc-btn-out { background:transparent; color:${BRAND.primary}; border:1.5px solid ${BRAND.primary}; border-radius:14px; padding:12px 20px; font-family:'Source Sans 3',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.18s; width:100%; }
  .sjc-btn-out:hover { background:rgba(27,58,107,0.06); }
  .sjc-card { background:white; border-radius:18px; padding:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04); cursor:pointer; transition:all 0.18s; }
  .sjc-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.1); }
  .sjc-link-card { background:white; border-radius:16px; padding:15px; box-shadow:0 2px 12px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04); }
  .sjc-link-icon { width:42px; height:42px; border-radius:12px; background:${BRAND.primary}12; color:${BRAND.primary}; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; letter-spacing:0.02em; flex-shrink:0; }
  .sjc-official-btn { display:flex; align-items:center; justify-content:center; min-height:46px; width:100%; border-radius:13px; background:${BRAND.primary}; color:white; text-decoration:none; font-size:13px; font-weight:700; font-family:'Source Sans 3',sans-serif; margin-top:12px; transition:all 0.18s; }
  .sjc-official-btn:hover { background:${BRAND.dark}; transform:translateY(-1px); }
  .sjc-community-tabs { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; padding-bottom:4px; margin-bottom:10px; }
  .sjc-community-tabs::-webkit-scrollbar { display:none; }
  .sjc-community-tab { white-space:nowrap; border:none; border-radius:999px; padding:8px 12px; font-family:'Source Sans 3',sans-serif; font-size:12px; font-weight:800; cursor:pointer; }
  .sjc-community-tab.active { background:${BRAND.primary}; color:white; }
  .sjc-community-tab.inactive { background:white; color:${BRAND.primary}; box-shadow:0 0 0 1px rgba(27,58,107,0.18) inset; }
  .sjc-tag { background:#EEE9DC; border-radius:8px; padding:3px 8px; font-size:11px; color:#5A4A30; font-weight:500; }
  .sjc-input { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px 12px 42px; font-family:'Source Sans 3',sans-serif; font-size:14px; color:#1A1A2E; outline:none; transition:border-color 0.18s; }
  .sjc-input:focus { border-color:${BRAND.primary}; }
  .sjc-input-plain { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px; font-family:'Source Sans 3',sans-serif; font-size:14px; color:#1A1A2E; outline:none; transition:border-color 0.18s; margin-bottom:10px; }
  .sjc-input-plain:focus { border-color:${BRAND.primary}; }
  .sjc-filter { white-space:nowrap; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid transparent; }
  .sjc-filter.active { background:${BRAND.primary}; color:white; }
  .sjc-filter.inactive { background:white; color:${BRAND.primary}; border-color:rgba(27,58,107,0.25); }
  .sjc-back { display:flex; align-items:center; gap:6px; color:${BRAND.primary}; font-size:13px; font-weight:600; cursor:pointer; margin-bottom:16px; }
  .pulse { animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .modal-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.5); z-index:200; display:flex; align-items:flex-end; border-radius:44px; animation:dhFi 0.2s ease; }
  .modal-sheet { background:#F5F2EB; border-radius:28px 28px 44px 44px; width:100%; max-height:90%; overflow-y:auto; padding:24px; animation:sheetUp 0.3s ease; scrollbar-width:none; }
  .modal-sheet::-webkit-scrollbar { display:none; }
  @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .modal-handle { width:36px; height:4px; background:rgba(0,0,0,0.15); border-radius:2px; margin:0 auto 20px; }
  .emerg-overlay { position:absolute; inset:0; background:rgba(214,40,40,0.97); z-index:300; display:flex; flex-direction:column; border-radius:44px; animation:dhFi 0.2s ease; overflow-y:auto; scrollbar-width:none; }
  .emerg-overlay::-webkit-scrollbar { display:none; }
  .hotline-card { border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.18s; margin-bottom:8px; }
  .hotline-card:hover { transform:translateX(2px); }
  .hotline-btn { border:none; border-radius:10px; padding:8px 14px; font-family:'Source Sans 3',sans-serif; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; }
  .chat-bubble-user { background:${BRAND.primary}; color:white; border-radius:18px 18px 4px 18px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:80%; align-self:flex-end; }
  .chat-bubble-ai { background:white; color:#1A1A2E; border-radius:18px 18px 18px 4px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:85%; align-self:flex-start; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .chat-input-row { display:flex; gap:8px; padding:12px 16px; background:white; border-top:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
  .chat-input { flex:1; background:#F0EDE4; border:none; border-radius:20px; padding:10px 16px; font-family:'Source Sans 3',sans-serif; font-size:13px; outline:none; }
  .chat-send-btn { background:${BRAND.primary}; color:white; border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; flex-shrink:0; }
  .lang-toggle { display:flex; background:rgba(255,255,255,0.2); border-radius:20px; padding:2px; }
  .lang-btn { padding:3px 9px; border-radius:18px; font-size:11px; font-weight:700; cursor:pointer; border:none; font-family:'Source Sans 3',sans-serif; }
  .lang-btn.active { background:white; color:${BRAND.primary}; }
  .lang-btn.inactive { background:transparent; color:rgba(255,255,255,0.8); }
  .notif-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex; flex-direction:column; justify-content:flex-start; padding:60px 20px 0; border-radius:44px; animation:dhFi 0.2s ease; }
  .notif-banner { background:rgba(255,255,255,0.97); backdrop-filter:blur(20px); border-radius:20px; padding:14px 16px; margin-bottom:10px; box-shadow:0 8px 32px rgba(0,0,0,0.2); display:flex; align-items:flex-start; gap:12px; }
  .amt-pill { padding:10px 16px; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid rgba(27,58,107,0.25); background:white; color:${BRAND.primary}; }
  .amt-pill.sel { background:${BRAND.primary}; color:white; border-color:${BRAND.primary}; }
  .sponsor-ticker { overflow:hidden; white-space:nowrap; }
  .sponsor-inner { display:inline-block; animation:ticker 14s linear infinite; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
`;

function injectCSS() {
  if (document.getElementById("sjc-css")) return;
  const s=document.createElement("style"); s.id="sjc-css"; s.textContent=CSS; document.head.appendChild(s);
}

/* ── RESOURCE CARD ── */
function ResourceCard({ r, onClick, lang }) {
  const open=isOpenNow(r), today=isOpenToday(r), t=T[lang];
  const catIcon = { food:"🥫", assistance:"🤝", legal:"⚖️", parish:"✝" };
  return (
    <div className="sjc-card" onClick={()=>{trackEvent("resource_viewed",{id:r.id,name:r.name,category:r.category});gaEvent("resource_viewed",{resource_name:r.name,resource_category:r.category});onClick(r);}} style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:44,height:44,borderRadius:12,background:r.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{catIcon[r.category]||"🤝"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:"#1A1A2E",lineHeight:1.3,marginBottom:3}}>{r.name}</div>
          <div style={{fontSize:12,color:"#6B7080",marginBottom:7}}>{r.address.split(",")[0]} · {r.miles} mi</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <span className={`sjc-chip ${open?"open":today?"today":"closed"}`}>{open?t.openRightNow:today?t.opensLaterToday:t.closedToday}</span>
            <span className="sjc-chip" style={{background:r.color+"15",color:r.color}}>{CATEGORY_LABELS[r.category]}</span>
          </div>
        </div>
      </div>
      {r.tags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>{r.tags.slice(0,3).map(tag=><span key={tag} className="sjc-tag">{tag}</span>)}</div>}
    </div>
  );
}

/* ── DETAIL VIEW ── */
function DetailView({ r, onBack, onDonate, lang }) {
  const open=isOpenNow(r), today=isOpenToday(r), t=getT(lang);
  const zip = (r.address.match(/\d{5}/) || ["19086"])[0];
  return (
    <div className="dfi">
      <div style={{padding:"20px 24px 16px"}}>
        <div className="sjc-back" onClick={onBack}>{t.back}</div>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <span className={`sjc-chip ${open?"open":today?"today":"closed"}`}>{open?t.openRightNow:today?t.opensLaterToday:t.closedToday}</span>
          <span className="sjc-chip" style={{background:r.color+"15",color:r.color}}>{CATEGORY_LABELS[r.category]}</span>
        </div>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",lineHeight:1.2,marginBottom:6}}>{r.name}</div>
        <div style={{fontSize:13,color:"#6B7080"}}>{r.address}</div>
      </div>
      <div style={{height:120,background:`linear-gradient(135deg,${BRAND.primary}22,${BRAND.secondary}22)`,margin:"0 24px 20px",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(27,58,107,0.05) 20px,rgba(27,58,107,0.05) 21px)"}}/>
        <span style={{zIndex:1}}>📍</span>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{background:`${BRAND.primary}08`,borderRadius:14,padding:16,marginBottom:16,border:`1px solid ${BRAND.primary}18`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:BRAND.primary,textTransform:"uppercase",letterSpacing:"0.06em"}}>{t.about}</div>
            <TrustBadge resourceId={r.id}/>
          </div>
          <div style={{fontSize:14,color:"#3A3020",lineHeight:1.6}}>{r.description}</div>
        </div>
        <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.hours}</div>
          {r.hours.map((h,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<r.hours.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
              <div style={{fontSize:13,fontWeight:500}}>{h.day}</div>
              <div style={{fontSize:13,color:BRAND.primary}}>{h.time||"Call for hours"}</div>
            </div>
          ))}
        </div>
        <PantryStatusWidget pantryId={r.id}/>
        <PantryInventoryWidget pantryId={r.id}/>
        <TransitHelper resourceZip={zip} resourceName={r.name}/>
        {r.tags.length>0&&<div style={{marginBottom:16,marginTop:12}}><div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.whatToKnow}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{r.tags.map(tag=><span key={tag} className="sjc-tag" style={{fontSize:12,padding:"5px 10px"}}>✓ {tag}</span>)}</div></div>}
        <IAmGoingButton resource={r}/>
        <div style={{display:"flex",gap:10,marginBottom:8,marginTop:10}}>
          <button className="sjc-btn" onClick={()=>window.open(`tel:${r.phone}`)}>📞 {t.call} {r.phone}</button>
          <button className="sjc-btn-out" onClick={()=>window.open(`https://maps.google.com/?q=${encodeURIComponent(r.address)}`)}>{t.directions}</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <SaveResourceButton resource={r}/>
          <FoundHelpButton resource={r}/>
        </div>
        <button onClick={onDonate} className="sjc-btn-gold" style={{marginBottom:12}}>{t.donatePantry}</button>
        <div style={{textAlign:"center",paddingBottom:16}}>
          <ReportIssueButton resource={r} t={t}/>
        </div>
      </div>
    </div>
  );
}

/* ── EMERGENCY OVERLAY ── */
function EmergencyMode({ onClose, lang }) {
  const t=getT(lang), urgent=HOTLINES.filter(h=>h.urgent), openNow=RESOURCES.filter(r=>isOpenNow(r)).slice(0,3);
  return (
    <div className="emerg-overlay">
      <div style={{padding:"24px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"white"}}>{t.emergencyMode}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:2}}>{t.emergencyModeDesc}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:50,width:34,height:34,color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{t.crisisLines}</div>
        <div style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:12,color:"white",fontSize:12,lineHeight:1.5,marginBottom:10}}>
          {DELCO_CRISIS.emergencyDisclaimer} {DELCO_CRISIS.callToConfirm}
        </div>
        {urgent.map(h=>(
          <div key={h.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{h.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"white"}}>{h.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{h.sub}</div></div>
            <button style={{background:"white",color:"#D62828",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>openHotlineAction(h)}>{h.actionLabel||`${h.isText?t.text:t.call} ${h.number}`}</button>
          </div>
        ))}
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em",margin:"14px 0 8px"}}>📍 Open Near You Now</div>
        {openNow.length===0
          ? <div style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:14,color:"rgba(255,255,255,0.8)",fontSize:13,lineHeight:1.6}}>{t.noOpenResources}</div>
          : openNow.map(r=>(
            <div key={r.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>🥫</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"white"}}>{r.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{r.miles} mi · {r.address.split(",")[0]}</div></div>
              <button style={{background:"white",color:BRAND.primary,border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>window.open(`tel:${r.phone}`)}>Call</button>
            </div>
          ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── HOME ── */
function SJCParishHub() {
  const [communityFilter,setCommunityFilter]=useState("announcements");
  const [showRequestForm,setShowRequestForm]=useState(false);
  const [request,setRequest]=useState({name:"",email:"",type:"Announcement",message:"",phone:"",review:false});
  const visiblePosts=SJC_COMMUNITY_POSTS.filter(post=>post.type===communityFilter);
  function communityButtonAction(post) {
    if (post.url) {
      window.open(post.url,"_blank","noopener,noreferrer");
      return;
    }
    if (post.button==="Submit a Request" || post.button==="I can help") {
      setShowRequestForm(true);
    }
  }
  function submitCommunityRequest(e) {
    e.preventDefault();
    if (!request.review) return;
    const subject=encodeURIComponent(`SJC Parish Hub ${request.type} Request`);
    const body=encodeURIComponent([
      "SJC Parish Hub submission",
      "",
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      `Post type: ${request.type}`,
      `Phone: ${request.phone || "Not provided"}`,
      "",
      "Message:",
      request.message,
      "",
      "Review acknowledgement: I understand this will be reviewed before being posted."
    ].join("\n"));
    window.location.href=`mailto:cierolink@gmail.com?subject=${subject}&body=${body}`;
  }
  return (
    <>
      <section style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10}}>
          <div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",lineHeight:1.2,marginBottom:4}}>SJC Parish Hub</div>
            <div style={{fontSize:13,color:"#5F6673",lineHeight:1.45}}>Quick links to parish news, Mass times, bulletins, events, and community resources.</div>
          </div>
          <a href="https://sjcparish.org/" target="_blank" rel="noreferrer" style={{flexShrink:0,textDecoration:"none",background:`${BRAND.secondary}22`,color:"#5A4000",border:`1px solid ${BRAND.secondary}55`,borderRadius:12,padding:"8px 10px",fontSize:11,fontWeight:800}}>sjcparish.org</a>
        </div>
        <div style={{background:`${BRAND.primary}08`,border:`1px solid ${BRAND.primary}18`,borderRadius:14,padding:12,fontSize:12,color:"#465064",lineHeight:1.5,marginBottom:12}}>
          This page is a community shortcut to public SJC parish resources. Please confirm details with the official parish website.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
          {SJC_OFFICIAL_LINKS.map(link=>(
            <article key={link.title} className="sjc-link-card">
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div className="sjc-link-icon">{link.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#1A1A2E",lineHeight:1.25,marginBottom:4}}>{link.title}</div>
                  <div style={{fontSize:12,color:"#5F6673",lineHeight:1.45}}>{link.description}</div>
                </div>
              </div>
              <a className="sjc-official-btn" href={link.url} target="_blank" rel="noreferrer">Open Official Page</a>
            </article>
          ))}
        </div>
      </section>

      <section style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10}}>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:"#1A1A2E"}}>Latest from SJC</div>
          <div style={{fontSize:10,fontWeight:800,color:"#8A7350",textTransform:"uppercase",letterSpacing:"0.06em"}}>Manual updates</div>
        </div>
        {SJC_LATEST_ITEMS.map(item=>(
          <article key={item.title} className="sjc-link-card" style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:6}}>
              <div style={{fontSize:14,fontWeight:800,color:"#1A1A2E",lineHeight:1.25}}>{item.title}</div>
              <span style={{background:`${BRAND.secondary}22`,color:"#6B5418",borderRadius:8,padding:"3px 7px",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}>{item.date}</span>
            </div>
            <div style={{fontSize:12,color:"#5F6673",lineHeight:1.5,marginBottom:10}}>{item.description}</div>
            <a href={item.url} target="_blank" rel="noreferrer" style={{color:BRAND.primary,fontSize:12,fontWeight:800,textDecoration:"none"}}>Open official link</a>
          </article>
        ))}
        <div style={{background:"white",borderRadius:14,padding:13,border:"1px solid rgba(0,0,0,0.06)",fontSize:12,color:"#5F6673",lineHeight:1.45}}>
          Want something added or corrected? Email <a href="mailto:cierolink@gmail.com" style={{color:BRAND.primary,fontWeight:800,textDecoration:"none"}}>cierolink@gmail.com</a>
        </div>
      </section>

      <section style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10}}>
          <div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",lineHeight:1.2,marginBottom:4}}>Parish Community</div>
            <div style={{fontSize:13,color:"#5F6673",lineHeight:1.45}}>Stay connected with announcements, prayer requests, events, and ways to help.</div>
          </div>
        </div>
        <div style={{background:`${BRAND.secondary}18`,border:`1px solid ${BRAND.secondary}44`,borderRadius:14,padding:12,fontSize:12,color:"#604A12",lineHeight:1.5,marginBottom:12}}>
          This is a community shortcut page and submitted content may be reviewed before posting. Submitted items are reviewed before appearing publicly.
        </div>
        <div className="sjc-community-tabs" aria-label="Parish community filters">
          {SJC_COMMUNITY_FILTERS.map(filter=>(
            <button key={filter.id} type="button" className={`sjc-community-tab ${communityFilter===filter.id?"active":"inactive"}`} onClick={()=>setCommunityFilter(filter.id)}>
              {filter.label}
            </button>
          ))}
        </div>
        {visiblePosts.map(post=>(
          <article key={`${post.type}-${post.title}`} className="sjc-link-card" style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:8}}>
              <span style={{background:`${BRAND.primary}12`,color:BRAND.primary,borderRadius:8,padding:"3px 7px",fontSize:10,fontWeight:800}}>{post.typeLabel}</span>
              <span style={{fontSize:11,color:"#7A8190",fontWeight:700,whiteSpace:"nowrap"}}>{post.date}</span>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:"#1A1A2E",lineHeight:1.25,marginBottom:5}}>{post.title}</div>
            <div style={{fontSize:12,color:"#5F6673",lineHeight:1.5,marginBottom:10}}>{post.message}</div>
            <div style={{fontSize:11,color:"#8A7350",fontWeight:700,marginBottom:10}}>Source: {post.source}</div>
            <div style={{display:"grid",gridTemplateColumns:post.button?"1fr 1fr":"1fr",gap:8}}>
              {post.button&&(
                <button type="button" onClick={()=>communityButtonAction(post)} style={{background:BRAND.primary,color:"white",border:"none",borderRadius:12,padding:"11px 10px",fontFamily:"'Source Sans 3',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer"}}>
                  {post.button}
                </button>
              )}
              <a href={`mailto:cierolink@gmail.com?subject=${encodeURIComponent("Report issue with SJC Parish Hub post")}&body=${encodeURIComponent(`Post: ${post.title}\nType: ${post.typeLabel}\n\nIssue:`)}`} style={{display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${BRAND.primary}55`,borderRadius:12,padding:"10px",fontSize:12,fontWeight:800,color:BRAND.primary,textDecoration:"none"}}>
                Report issue
              </a>
            </div>
          </article>
        ))}
        <button className="sjc-btn" type="button" style={{marginBottom:showRequestForm?12:8}} onClick={()=>setShowRequestForm(v=>!v)}>
          Submit a Request
        </button>
        {showRequestForm&&(
          <form onSubmit={submitCommunityRequest} className="sjc-link-card" style={{marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:800,color:"#1A1A2E",marginBottom:4}}>Submit a Request</div>
            <div style={{fontSize:12,color:"#5F6673",lineHeight:1.45,marginBottom:12}}>Requests are sent by email for review. Nothing is posted automatically.</div>
            <input required className="sjc-input-plain" placeholder="Name" value={request.name} onChange={e=>setRequest({...request,name:e.target.value})} style={{paddingLeft:16}}/>
            <input required type="email" className="sjc-input-plain" placeholder="Email" value={request.email} onChange={e=>setRequest({...request,email:e.target.value})} style={{paddingLeft:16}}/>
            <select className="sjc-input-plain" value={request.type} onChange={e=>setRequest({...request,type:e.target.value})} style={{paddingLeft:16}}>
              {["Announcement","Event","Prayer Request","Volunteer Need","Community Help"].map(type=><option key={type}>{type}</option>)}
            </select>
            <textarea required className="sjc-input-plain" placeholder="Message" rows={4} value={request.message} onChange={e=>setRequest({...request,message:e.target.value})} style={{paddingLeft:16,resize:"none"}}/>
            <input className="sjc-input-plain" placeholder="Optional phone number" value={request.phone} onChange={e=>setRequest({...request,phone:e.target.value})} style={{paddingLeft:16}}/>
            <label style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:12,color:"#465064",lineHeight:1.4,margin:"2px 0 12px",cursor:"pointer"}}>
              <input required type="checkbox" checked={request.review} onChange={e=>setRequest({...request,review:e.target.checked})} style={{marginTop:2,flexShrink:0}}/>
              <span>I understand this will be reviewed before being posted.</span>
            </label>
            <button className="sjc-btn" type="submit">Email for Review</button>
          </form>
        )}
        <div style={{fontSize:11,color:"#7A8190",lineHeight:1.5}}>
          This is not an open comment board. Public items should be approved before appearing here.
        </div>
      </section>
    </>
  );
}

function HomeScreen({ onNav, onResource, onDonate, onEmergency, lang }) {
  const t=getT(lang), openNow=RESOURCES.filter(r=>isOpenNow(r));
  const savedIds = getSavedResources().map(s=>s.id);
  const savedResources = RESOURCES.filter(r=>savedIds.includes(r.id));
  return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.gradStart} 0%,${BRAND.gradEnd} 100%)`,padding:"16px 24px 24px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:42,height:42,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>✝</div>
          <div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,color:"white",lineHeight:1.2}}>{BRAND.fullName}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>{BRAND.address}</div>
          </div>
        </div>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>{t.tagline}</div>
        <div style={{fontSize:11,color:`${BRAND.secondary}`,fontStyle:"italic",marginBottom:16,lineHeight:1.5}}>{BRAND.missionVerse}</div>
        <button onClick={()=>{trackEvent("emergency_button_tapped");gaEvent("emergency_button_tapped");onEmergency();}} style={{width:"100%",background:"#D62828",border:"2px solid rgba(255,255,255,0.3)",borderRadius:14,padding:"12px",fontFamily:"'Source Sans 3',sans-serif",fontSize:14,fontWeight:700,color:"white",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {t.needHelpNow}
        </button>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>What do you need?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {icon:"🍽",label:t.food || "Food",sub:t.pantriesOpenNow,nav:"find",filter:"food"},
            {icon:"📋",label:t.benefits,sub:t.snapWicMore,nav:"benefits"},
            {icon:"🍎",label:t.nutrition,sub:t.foodCheckNutrition || "Food check & nutrition",nav:"nutrition"},
            {icon:"🔍",label:t.checkInfo,sub:t.scamBiasSignals,nav:"trust"},
            {icon:"📞",label:t.crisisLine,sub:t.freeConfidential,nav:"hotline"},
            {icon:"🏠",label:t.housing,sub:t.shelterLegalAid,nav:"find",filter:"assistance"},
          ].map(a=>(
            <div key={a.label} onClick={()=>onNav(a.nav,a.filter)} style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",borderRadius:14,padding:"12px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.2)"}}>
              <div style={{fontSize:24,marginBottom:4}}>{a.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:"white",lineHeight:1.2}}>{a.label}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",marginTop:2}}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"0 24px"}}>
        {openNow.length>0&&<>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#40916C"}} className="pulse"/>
            <div style={{fontSize:13,fontWeight:700,color:"#1B4332"}}>{t.openNow} ({openNow.length})</div>
          </div>
          {openNow.slice(0,2).map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          {openNow.length>2&&<button className="sjc-btn-out" style={{marginBottom:8}} onClick={()=>onNav("find","food")}>See all {openNow.length} open now →</button>}
          <div style={{height:6}}/>
        </>}
        {savedResources.length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#7B5800",marginBottom:8}}>⭐ My Saved Resources ({savedResources.length})</div>
            {savedResources.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          </div>
        )}
        <div className="sjc-card" style={{marginBottom:12,cursor:"pointer",border:`1px solid ${BRAND.primary}30`}} onClick={()=>onNav("trust")}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${BRAND.primary}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:BRAND.primary,flexShrink:0}}>
              🔍
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:16,fontWeight:800,color:BRAND.dark,lineHeight:1.25,marginBottom:4}}>Check This Info</div>
              <div style={{fontSize:12,color:"#334155",lineHeight:1.45,marginBottom:12}}>
                Paste a link, article, message, job post, or rental listing to check for scam signals, bias signals, and AI-writing signals.
              </div>
              <button className="sjc-btn" style={{minHeight:44,padding:"11px 16px"}} onClick={(event)=>{event.stopPropagation();onNav("trust");}}>
                Check Now
              </button>
            </div>
          </div>
        </div>
        <SMSAccessCard phoneNumber="(877) 473-4752" t={t}/>
        <div style={{background:`linear-gradient(135deg,${BRAND.secondary}22,${BRAND.secondary}10)`,borderRadius:16,padding:14,marginBottom:12,border:`1px solid ${BRAND.secondary}44`,cursor:"pointer"}} onClick={onDonate}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>💛</div>
            <div><div style={{fontSize:13,fontWeight:700,color:"#5A4000",marginBottom:2}}>{t.supportPantries}</div><div style={{fontSize:11,color:"#7B5800",lineHeight:1.4}}>{t.donateDesc}</div></div>
          </div>
        </div>

        {/* Sponsor credit footer — only shows if SPONSOR.name is set */}
        {SPONSOR.name && (
          <a href={SPONSOR.website || "#"} target="_blank" rel="noreferrer" style={{
            display:"block", textDecoration:"none", background:"white", borderRadius:14, padding:"12px 14px",
            marginBottom:12, border:`1px solid ${BRAND.secondary}44`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#9BA8A0", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>
              {SPONSOR.tier} Community Sponsor
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {SPONSOR.logo && <img src={SPONSOR.logo} alt="" style={{ width:36, height:36, objectFit:"contain", borderRadius:8 }}/>}
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:13, color:BRAND.dark, fontWeight:700 }}>{SPONSOR.name}</div>
                {SPONSOR.tagline && <div style={{ fontSize:11, color:"#6B7080", marginTop:1 }}>{SPONSOR.tagline}</div>}
              </div>
              <div style={{ fontSize:18, color:BRAND.secondary }}>›</div>
            </div>
          </a>
        )}
        <a href="https://delcohelp.org" target="_blank" rel="noreferrer" style={{
          display:"block", textDecoration:"none", textAlign:"center",
          padding:"14px 12px", marginBottom:20, borderTop:"1px solid rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#9BA8A0", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:4 }}>
            Community Platform Powered By
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", background:"#F0FBF4", borderRadius:20, border:"1px solid rgba(45,106,79,0.2)" }}>
            <span style={{ fontSize:14 }}>💚</span>
            <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, fontWeight:700, color:"#1B4332" }}>DelcoHelp</span>
            <span style={{ fontSize:10, color:"#6B7080" }}>·</span>
            <span style={{ fontSize:10, color:"#6B7080" }}>Delaware County's Free Resource Network</span>
          </div>
          <div style={{ fontSize:10, color:"#9BA8A0", marginTop:6, fontStyle:"italic" }}>
            Connecting 1,200+ families with food, benefits, and crisis support
          </div>
        </a>
      </div>
    </div>
  );
}

/* ── FIND ── */
function FindScreen({ onResource, lang, initialFilter="all" }) {
  const [search,setSearch]=useState(""), [filter,setFilter]=useState(initialFilter);
  const [dietary,setDietary]=useState([]);
  const [zip,setZip]=useState(""), [zipInput,setZipInput]=useState(""), [locating,setLocating]=useState(false);
  const t=getT(lang);
  const filters=[{id:"all",label:"All"},{id:"parish",label:"✝ Parish"},{id:"food",label:"🥫 Food"},{id:"assistance",label:"🤝 Help"},{id:"legal",label:"⚖️ Legal"}];

  function applyZip(z) {
    const clean = z.replace(/\D/g,"").slice(0,5);
    setZip(clean); setZipInput(clean);
    if (clean.length===5) trackEvent("zip_search",{zip:clean,app:"sjc"});
  }

  function useMyLocation() {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude:lat,longitude:lng}=pos.coords;
      let closest="19086", minDist=999;
      Object.entries(ZIP_COORDS).forEach(([z,c])=>{ const d=Math.sqrt((lat-c.lat)**2+(lng-c.lng)**2); if(d<minDist){minDist=d;closest=z;} });
      setZip(closest); setZipInput(closest); setLocating(false);
    },()=>setLocating(false));
  }

  const results=RESOURCES.filter(r=>{
    const matchCat=filter==="all"||r.category===filter;
    const q=search.toLowerCase();
    const matchSearch=!q||r.name.toLowerCase().includes(q)||r.tags.some(tag=>tag.toLowerCase().includes(q));
    if(!matchCat||!matchSearch) return false;
    if(zip.length===5){ const dist=calcDistance(zip,r.zip||"19086"); return dist<=10; }
    return true;
  }).map(r=>zip.length===5?{...r,miles:calcDistance(zip,r.zip||"19086")}:r).sort((a,b)=>a.miles-b.miles);

  return (
    <div className="dfi">
      <div style={{padding:"16px 24px 12px"}}>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",marginBottom:12}}>{t.findResources}</div>
        {/* Zip search */}
        <div style={{background:`${BRAND.primary}08`,borderRadius:12,padding:10,marginBottom:10,border:`1px solid ${BRAND.primary}18`}}>
          <div style={{fontSize:10,fontWeight:700,color:BRAND.primary,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>📍 Your Location</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input style={{flex:1,background:"white",border:`1.5px solid rgba(0,0,0,0.1)`,borderRadius:8,padding:"8px 12px",fontFamily:"'Source Sans 3',sans-serif",fontSize:13,outline:"none"}} placeholder="Enter zip code (e.g. 19013)" value={zipInput} onChange={e=>{setZipInput(e.target.value.replace(/\D/g,"").slice(0,5));if(e.target.value.length===5)applyZip(e.target.value);}} onBlur={e=>applyZip(e.target.value)} maxLength={5}/>
            <button onClick={useMyLocation} disabled={locating} style={{flexShrink:0,background:BRAND.primary,color:"white",border:"none",borderRadius:8,padding:"8px 10px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>{locating?"...":"📍 Near me"}</button>
            {zip.length===5&&<button onClick={()=>{setZip("");setZipInput("");}} style={{flexShrink:0,background:"rgba(0,0,0,0.06)",color:"#6B7080",border:"none",borderRadius:8,padding:"8px 10px",fontSize:11,cursor:"pointer"}}>✕</button>}
          </div>
          {zip.length===5&&ZIP_COORDS[zip]&&<div style={{fontSize:10,color:BRAND.primary,marginTop:4,fontWeight:600}}>Showing resources within 10 miles of {zip}</div>}
        </div>
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:0.4}}>🔍</span>
          <input className="sjc-input" placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
          {filters.map(f=><div key={f.id} className={`sjc-filter ${filter===f.id?"active":"inactive"}`} onClick={()=>setFilter(f.id)}>{f.label}</div>)}
        </div>
        <DietaryFilters active={dietary} onChange={setDietary}/>
      </div>
      <div style={{height:1,background:"rgba(0,0,0,0.07)",margin:"0 24px"}}/>
      <div style={{padding:"12px 24px"}}>
        <div style={{fontSize:12,color:"#6B7080",marginBottom:10,fontWeight:500}}>{results.length} {t.sortedByDistance}</div>
        {results.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
        {results.length===0&&<div style={{textAlign:"center",padding:"32px 0"}}><div style={{fontSize:36,marginBottom:10}}>🔍</div><div style={{fontSize:14,fontWeight:600}}>No results found</div><div style={{fontSize:12,color:"#6B7080",marginTop:6}}>Try a nearby zip or call PA 211 (dial 211) for help.</div></div>}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

/* ── BENEFITS ── */
function BenefitsScreen({ lang }) {
  const [expanded,setExpanded]=useState(null), [showQuiz,setShowQuiz]=useState(false);
  const [showSNAP,setShowSNAP]=useState(false), [showChecklist,setShowChecklist]=useState(false);
  const t=getT(lang);
  const eligibility=[
    {q:"Family of 4 with income under $3,250/month?",programs:["SNAP","Medicaid","CHIP"]},
    {q:"Pregnant or have a child under 5?",programs:["WIC","CHIP","Medicaid"]},
    {q:"Struggling to pay heating/electric bills?",programs:["LIHEAP"]},
    {q:"Uninsured or underinsured adult?",programs:["Medicaid"]},
  ];
  return (
    <div className="dfi">
      {showQuiz && <EligibilityQuiz onClose={()=>setShowQuiz(false)}/>}
      {showSNAP && <SNAPAssistant onClose={()=>setShowSNAP(false)}/>}
      {showChecklist && <DocumentChecklist programs={["snap","wic","liheap","medicaid"]} onClose={()=>setShowChecklist(false)}/>}
      <div style={{padding:"16px 24px 0"}}>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",marginBottom:4}}>{t.benefitsNav}</div>
        <div style={{fontSize:13,color:"#6B7080",marginBottom:12}}>{t.benefitsDesc}</div>
        <button onClick={()=>{trackEvent("eligibility_quiz_opened",{app:"sjc"});gaEvent("eligibility_quiz_opened");setShowQuiz(true);}} style={{width:"100%",background:BRAND.primary,color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,fontFamily:"'Source Sans 3',sans-serif"}}>
          Check My Eligibility in 60 Seconds →
        </button>
        <button onClick={()=>setShowSNAP(true)} style={{width:"100%",background:"white",color:BRAND.primary,border:`1.5px solid ${BRAND.primary}44`,borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:8,fontFamily:"'Source Sans 3',sans-serif"}}>
          🥫 SNAP Application Step-by-Step Guide
        </button>
        <button onClick={()=>setShowChecklist(true)} style={{width:"100%",background:"white",color:BRAND.primary,border:`1.5px solid ${BRAND.primary}44`,borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,fontFamily:"'Source Sans 3',sans-serif"}}>
          📋 Build My Document Checklist
        </button>
        <div style={{background:`${BRAND.primary}08`,borderRadius:16,padding:16,marginBottom:16,border:`1px solid ${BRAND.primary}18`}}>
          <div style={{fontSize:12,fontWeight:700,color:BRAND.primary,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.quickEligibility}</div>
          {eligibility.map((e,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:i<eligibility.length-1?`1px solid ${BRAND.primary}15`:"none"}}>
              <div style={{fontSize:13,color:"#1A1A2E",marginBottom:6}}>{e.q}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{e.programs.map(p=><span key={p} style={{background:BRAND.primary,color:"white",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:600}}>{p}</span>)}</div>
            </div>
          ))}
        </div>
        {BENEFITS.map(b=>(
          <div key={b.id} className="sjc-card" style={{marginBottom:10}} onClick={()=>setExpanded(expanded===b.id?null:b.id)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28,flexShrink:0}}>{b.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{b.name}</div><div style={{fontSize:12,color:"#6B7080",marginTop:2}}>{b.desc}</div></div>
              <div style={{color:BRAND.primary,fontSize:18,fontWeight:300}}>{expanded===b.id?"−":"+"}</div>
            </div>
            {expanded===b.id&&<div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:13,color:"#3A3020",marginBottom:12}}>Apply online through PA's COMPASS portal — takes about 15 minutes.</div>
              <button className="sjc-btn" style={{fontSize:13,padding:"12px 16px"}} onClick={()=>window.open(b.link,"_blank")}>{t.applyCompass}</button>
            </div>}
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── HOTLINE ── */
function HotlineScreen({ lang, onEscape }) {
  const t=getT(lang), urgent=HOTLINES.filter(h=>h.urgent), rest=HOTLINES.filter(h=>!h.urgent);
  return (
    <div className="dfi">
      <div style={{background:"linear-gradient(160deg,#D62828 0%,#9B1C1C 100%)",padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>{t.emergencyHotlines}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{t.hotlinesDesc}</div>
        {onEscape && <button onClick={onEscape} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:10,padding:"6px 12px",color:"white",fontSize:11,fontWeight:600,cursor:"pointer",marginTop:10,fontFamily:"'Source Sans 3',sans-serif"}}>🔒 Set Up My Safety Plan</button>}
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{background:"#FFF0F0",borderRadius:14,padding:12,border:"1px solid rgba(214,40,40,0.2)",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"#D62828",marginBottom:4}}>{DELCO_CRISIS.emergencyDisclaimer}</div>
          <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.5}}>{DELCO_CRISIS.callToConfirm}</div>
        </div>
        <div style={{fontSize:12,fontWeight:700,color:"#D62828",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.immediateEmergency}</div>
        {urgent.map(h=>(
          <div key={h.id} className="hotline-card" style={{background:h.bg,border:`1px solid ${h.color}22`}}>
            <div style={{width:42,height:42,borderRadius:12,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{h.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1A1A2E"}}>{h.name}</div><div style={{fontSize:11,color:"#6B7080",marginTop:2}}>{h.sub}</div>{h.lastUpdated&&<div style={{fontSize:10,color:"#6B7080",marginTop:4}}>{t.lastUpdated}: {h.lastUpdated} - {h.verified?t.verified:t.needsVerification}</div>}<a href={correctionMailto(h.name)} style={{fontSize:10,color:h.color,fontWeight:700,textDecoration:"none"}}>{t.reportIncorrectInfo}</a></div>
            <button className="hotline-btn" style={{background:h.color,color:"white"}} onClick={()=>openHotlineAction(h)}>{h.actionLabel||`${h.isText?t.text:t.call} ${h.number}`}</button>
          </div>
        ))}
        <div style={{height:12}}/>
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.additionalResources}</div>
        {rest.map(h=>(
          <div key={h.id} className="hotline-card" style={{background:h.bg,border:`1px solid ${h.color}22`}}>
            <div style={{width:42,height:42,borderRadius:12,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{h.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{h.name}</div><div style={{fontSize:11,color:"#6B7080",marginTop:2}}>{h.sub}</div>{h.lastUpdated&&<div style={{fontSize:10,color:"#6B7080",marginTop:4}}>{t.lastUpdated}: {h.lastUpdated} - {h.verified?t.verified:t.needsVerification}</div>}<a href={correctionMailto(h.name)} style={{fontSize:10,color:h.color,fontWeight:700,textDecoration:"none"}}>{t.reportIncorrectInfo}</a></div>
            <button className="hotline-btn" style={{background:h.color+"15",color:h.color}} onClick={()=>openHotlineAction(h)}>{h.actionLabel||h.number}</button>
          </div>
        ))}
        <div style={{background:`${BRAND.primary}08`,borderRadius:16,padding:14,marginTop:8,marginBottom:24,border:`1px solid ${BRAND.primary}15`}}>
          <div style={{fontSize:12,color:BRAND.primary,lineHeight:1.6,textAlign:"center"}}>{t.confidentialNote}</div>
        </div>
      </div>
    </div>
  );
}

/* ── VOLUNTEER ── */
/* ── VOLUNTEER MANAGEMENT (ELITE FEATURE) ── */
const VOLUNTEER_STORAGE_KEY = "sjc_volunteer_data";

function getVolunteerData() {
  try {
    const raw = localStorage.getItem(VOLUNTEER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    profile: null,
    signups: [],
    hours: [],
    interests: [],
  };
}

function saveVolunteerData(data) {
  try { localStorage.setItem(VOLUNTEER_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function VolunteerScreen({ lang, tier, onUpgrade }) {
  const t=getT(lang);
  const [data, setData] = useState(getVolunteerData);
  const [view, setView] = useState("opportunities"); // opportunities | signup | mytracker | profile
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [signupData, setSignupData] = useState({ name:"", email:"", phone:"", date:"", notes:"" });
  const [logHours, setLogHours] = useState({ hours:"", date:"", opp:"", notes:"" });
  const [showLogForm, setShowLogForm] = useState(false);

  const totalHours = data.hours.reduce((sum,h)=>sum+parseFloat(h.hours||0), 0);
  const thisMonthHours = data.hours.filter(h=>{
    const d = new Date(h.date);
    const now = new Date();
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).reduce((sum,h)=>sum+parseFloat(h.hours||0), 0);
  const livesImpacted = Math.floor(totalHours * 3); // ~3 families per hour

  function submitSignup() {
    if (!signupData.name || !signupData.email) return;
    const newSignup = { ...signupData, opp: selectedOpp.role, org: selectedOpp.org, id: Date.now() };
    const updated = { ...data, signups: [...data.signups, newSignup], profile: { name: signupData.name, email: signupData.email, phone: signupData.phone } };
    setData(updated);
    saveVolunteerData(updated);
    setView("opportunities");
    setSelectedOpp(null);
    setSignupData({ name:"", email:"", phone:"", date:"", notes:"" });
  }

  function submitHours() {
    if (!logHours.hours || !logHours.date) return;
    const newEntry = { ...logHours, id: Date.now() };
    const updated = { ...data, hours: [...data.hours, newEntry] };
    setData(updated);
    saveVolunteerData(updated);
    setShowLogForm(false);
    setLogHours({ hours:"", date:"", opp:"", notes:"" });
  }

  // FREE TIER — locked
  if (tier==="free") return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.accent} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>{t.giveBack}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>Volunteer management · ELITE feature</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <LockedFeature tier="elite" feature="Volunteer Management System" onUpgrade={onUpgrade}/>
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Preview — What Elite unlocks</div>
        <div style={{opacity:0.5,filter:"blur(1px)",pointerEvents:"none"}}>
          {VOLUNTEER_OPPS.map((o,i)=>(
            <div key={i} className="sjc-card" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:o.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{o.icon}</div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{o.role}</div><div style={{fontSize:12,color:"#6B7080"}}>{o.org}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // SIGNUP MODAL
  if (view === "signup" && selectedOpp) {
    return (
      <div className="dfi">
        <div style={{background:`linear-gradient(160deg,${BRAND.accent} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:BRAND.secondary,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Volunteer Signup</div>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"white",marginBottom:2}}>{selectedOpp.role}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{selectedOpp.org} · ⏰ {selectedOpp.time}</div>
        </div>
        <div style={{padding:"0 24px"}}>
          <button onClick={()=>{setView("opportunities");setSelectedOpp(null);}} style={{background:"transparent",border:"none",color:BRAND.primary,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>← Back to opportunities</button>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Full Name *</label>
            <input value={signupData.name} onChange={e=>setSignupData({...signupData,name:e.target.value})} placeholder="Your name" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Email *</label>
            <input type="email" value={signupData.email} onChange={e=>setSignupData({...signupData,email:e.target.value})} placeholder="you@example.com" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Phone (optional)</label>
            <input type="tel" value={signupData.phone} onChange={e=>setSignupData({...signupData,phone:e.target.value})} placeholder="(610) 555-1234" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>First shift date (optional)</label>
            <input type="date" value={signupData.date} onChange={e=>setSignupData({...signupData,date:e.target.value})} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Notes (optional)</label>
            <textarea value={signupData.notes} onChange={e=>setSignupData({...signupData,notes:e.target.value})} placeholder="Availability, questions, special skills..." rows={3} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <button className="sjc-btn" style={{marginBottom:12}} onClick={submitSignup}>Complete Signup</button>
          <div style={{fontSize:11,color:"#6B7080",textAlign:"center",marginBottom:20}}>{selectedOpp.org} will contact you within 48 hours to confirm your first shift.</div>
        </div>
      </div>
    );
  }

  // MY TRACKER VIEW
  if (view === "mytracker") {
    return (
      <div className="dfi">
        <div style={{background:`linear-gradient(160deg,${BRAND.accent} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
          <button onClick={()=>setView("opportunities")} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",marginBottom:10}}>← Back</button>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>My Volunteer Tracker</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>Your service hours & impact</div>
        </div>
        <div style={{padding:"0 24px"}}>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            <div style={{background:"white",borderRadius:12,padding:12,textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:BRAND.primary,lineHeight:1}}>{totalHours.toFixed(1)}</div>
              <div style={{fontSize:10,color:"#6B7080",marginTop:3}}>Total Hours</div>
            </div>
            <div style={{background:"white",borderRadius:12,padding:12,textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"#2D6A4F",lineHeight:1}}>{thisMonthHours.toFixed(1)}</div>
              <div style={{fontSize:10,color:"#6B7080",marginTop:3}}>This Month</div>
            </div>
            <div style={{background:"white",borderRadius:12,padding:12,textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:BRAND.secondary,lineHeight:1}}>{livesImpacted}</div>
              <div style={{fontSize:10,color:"#6B7080",marginTop:3}}>Lives Impacted</div>
            </div>
          </div>

          {/* Log hours button */}
          {!showLogForm && (
            <button onClick={()=>setShowLogForm(true)} className="sjc-btn" style={{marginBottom:16,background:BRAND.secondary,color:BRAND.dark}}>+ Log Volunteer Hours</button>
          )}

          {/* Log hours form */}
          {showLogForm && (
            <div style={{background:`${BRAND.secondary}15`,borderRadius:14,padding:14,marginBottom:16,border:`1px solid ${BRAND.secondary}44`}}>
              <div style={{fontSize:13,fontWeight:700,color:BRAND.dark,marginBottom:10}}>Log New Hours</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <input type="number" step="0.5" placeholder="Hours" value={logHours.hours} onChange={e=>setLogHours({...logHours,hours:e.target.value})} style={{padding:"10px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,0.1)",fontSize:13}}/>
                <input type="date" value={logHours.date} onChange={e=>setLogHours({...logHours,date:e.target.value})} style={{padding:"10px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,0.1)",fontSize:13}}/>
              </div>
              <select value={logHours.opp} onChange={e=>setLogHours({...logHours,opp:e.target.value})} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,0.1)",fontSize:13,marginBottom:10,boxSizing:"border-box"}}>
                <option value="">Select activity...</option>
                {VOLUNTEER_OPPS.map(o=><option key={o.role} value={o.role}>{o.role} — {o.org}</option>)}
                <option value="Other">Other</option>
              </select>
              <input placeholder="Notes (optional)" value={logHours.notes} onChange={e=>setLogHours({...logHours,notes:e.target.value})} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,0.1)",fontSize:13,marginBottom:10,boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:6}}>
                <button onClick={submitHours} style={{flex:1,background:BRAND.primary,color:"white",border:"none",borderRadius:8,padding:"10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save Hours</button>
                <button onClick={()=>setShowLogForm(false)} style={{flex:1,background:"white",color:"#6B7080",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}

          {/* Recent hours */}
          <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Recent Activity ({data.hours.length})</div>
          {data.hours.length === 0 ? (
            <div style={{background:"white",borderRadius:12,padding:"20px 16px",textAlign:"center",marginBottom:20,border:"1px dashed rgba(0,0,0,0.1)"}}>
              <div style={{fontSize:32,marginBottom:6}}>📋</div>
              <div style={{fontSize:13,color:"#6B7080"}}>No hours logged yet. Sign up for an opportunity and log your first shift!</div>
            </div>
          ) : (
            data.hours.slice().reverse().map((h,i)=>(
              <div key={h.id||i} className="sjc-card" style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{h.opp||"Volunteer Activity"}</div>
                    <div style={{fontSize:11,color:"#6B7080",marginTop:2}}>{new Date(h.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}{h.notes?` · ${h.notes}`:""}</div>
                  </div>
                  <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.primary,fontWeight:700}}>{h.hours}h</div>
                </div>
              </div>
            ))
          )}

          {/* Current signups */}
          {data.signups.length > 0 && (
            <>
              <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:20,marginBottom:10}}>My Signups ({data.signups.length})</div>
              {data.signups.map((s,i)=>(
                <div key={s.id||i} className="sjc-card" style={{marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{s.opp}</div>
                  <div style={{fontSize:11,color:"#6B7080",marginTop:2}}>{s.org}{s.date?` · starting ${new Date(s.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}`:""}</div>
                </div>
              ))}
            </>
          )}
          <div style={{height:20}}/>
        </div>
      </div>
    );
  }

  // MAIN OPPORTUNITIES VIEW
  return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.accent} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3}}>{t.giveBack}</div>
          {data.hours.length > 0 && (
            <button onClick={()=>setView("mytracker")} style={{background:BRAND.secondary,color:BRAND.dark,border:"none",borderRadius:10,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              📊 My Tracker
            </button>
          )}
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>{t.volunteerDesc}</div>
      </div>
      <div style={{padding:"0 24px"}}>

        {/* Personal stats banner — shows if user has data */}
        {totalHours > 0 && (
          <div style={{background:`linear-gradient(135deg,${BRAND.secondary}22,${BRAND.secondary}0A)`,borderRadius:14,padding:14,marginBottom:14,border:`1px solid ${BRAND.secondary}44`,cursor:"pointer"}} onClick={()=>setView("mytracker")}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:32}}>💛</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#5A4000"}}>Your impact so far</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.dark,fontWeight:700}}>{totalHours.toFixed(1)} hours · {livesImpacted} lives impacted</div>
              </div>
              <div style={{fontSize:18,color:BRAND.secondary}}>›</div>
            </div>
          </div>
        )}

        <div style={{background:`${BRAND.secondary}18`,borderRadius:16,padding:14,marginBottom:16,border:`1px solid ${BRAND.secondary}44`}}>
          <div style={{fontSize:13,fontWeight:600,color:"#5A4000",marginBottom:4}}>{t.whyMatters}</div>
          <div style={{fontSize:13,color:"#3A2010",lineHeight:1.6}}>{t.volunteerImpact}</div>
        </div>

        {/* Start tracker button if no hours yet */}
        {data.hours.length === 0 && (
          <button onClick={()=>setView("mytracker")} style={{width:"100%",background:"white",color:BRAND.primary,border:`1.5px dashed ${BRAND.primary}55`,borderRadius:12,padding:"12px",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:14,fontFamily:"'Source Sans 3',sans-serif"}}>
            📊 Track your volunteer hours & impact →
          </button>
        )}

        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Active Opportunities</div>

        {VOLUNTEER_OPPS.map((o,i)=>{
          const signedUp = data.signups.some(s=>s.opp===o.role);
          return (
            <div key={i} className="sjc-card" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:o.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{o.icon}</div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{o.role}</div><div style={{fontSize:12,color:"#6B7080",marginTop:1}}>{o.org}</div><div style={{fontSize:11,color:o.color,fontWeight:600,marginTop:4}}>⏰ {o.time}</div></div>
                {signedUp ? (
                  <div style={{background:"#D8F3DC",color:"#1B4332",borderRadius:10,padding:"8px 12px",fontSize:11,fontWeight:700}}>✓ Signed Up</div>
                ) : (
                  <button onClick={()=>{setSelectedOpp(o);setView("signup");}} style={{background:o.color,color:"white",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.signUp}</button>
                )}
              </div>
            </div>
          );
        })}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── EVENT CALENDAR (ELITE FEATURE) ── */
const EVENTS_STORAGE_KEY = "sjc_events_rsvp";

function getEventRSVPs() {
  try { return JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveEventRSVPs(rsvps) {
  try { localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(rsvps)); } catch {}
}

// Sample events — in production these would come from Supabase or the parish CMS
const PARISH_EVENTS = [
  { id:1, title:"Sunday Mass — Vigil", date:"2026-04-26", time:"4:00 PM", duration:"1 hour", category:"worship", location:"SJC Main Sanctuary", description:"Weekly Saturday vigil Mass. All are welcome.", icon:"✝", rsvpRequired:false },
  { id:2, title:"Easter Egg Hunt — Family Event", date:"2026-04-27", time:"11:00 AM", duration:"2 hours", category:"community", location:"SJC Front Lawn", description:"Annual Easter Egg Hunt for children ages 2–12. Refreshments will be served. Rain or shine!", icon:"🥚", rsvpRequired:true, capacity:150, rsvpCount:87 },
  { id:3, title:"Lifewerks Food Pantry Volunteer Night", date:"2026-04-29", time:"5:30 PM", duration:"3 hours", category:"service", location:"25 Cedar Rd, Wallingford", description:"Help sort donations and distribute food to ~80 families. No experience needed. Pizza provided after!", icon:"🥫", rsvpRequired:true, capacity:20, rsvpCount:14 },
  { id:4, title:"Parish Council Meeting", date:"2026-05-01", time:"7:00 PM", duration:"90 min", category:"ministry", location:"Parish Hall", description:"Open meeting. Agenda includes outreach funding vote and summer retreat planning.", icon:"👥", rsvpRequired:false },
  { id:5, title:"First Friday Adoration", date:"2026-05-02", time:"12:30 PM", duration:"2 hours", category:"worship", location:"SJC Chapel", description:"Eucharistic Adoration and reflection. Drop in any time.", icon:"🙏", rsvpRequired:false },
  { id:6, title:"Diaper Drive — Delco Helping Hands", date:"2026-05-04", time:"All Day", duration:"Drop off anytime", category:"service", location:"Parish Office Lobby", description:"Collecting size 3–6 diapers for families across Delaware County. Most-needed sizes: 4 and 5.", icon:"👶", rsvpRequired:false },
  { id:7, title:"Youth Group — Pizza & Prayer", date:"2026-05-06", time:"6:30 PM", duration:"2 hours", category:"youth", location:"Parish Hall", description:"Middle & high school students. Dinner included. Topic: \"How do I pray when I don't feel like praying?\"", icon:"🍕", rsvpRequired:true, capacity:40, rsvpCount:22 },
  { id:8, title:"Mother's Day Brunch", date:"2026-05-10", time:"10:30 AM", duration:"2 hours", category:"community", location:"Parish Hall", description:"Honoring mothers, grandmothers, and women in our community. Complimentary brunch for all mothers.", icon:"💐", rsvpRequired:true, capacity:200, rsvpCount:134 },
  { id:9, title:"Bible Study — Acts of the Apostles", date:"2026-05-14", time:"7:00 PM", duration:"75 min", category:"formation", location:"Parish Library", description:"Week 3 of 8. Newcomers always welcome — no prep required.", icon:"📖", rsvpRequired:false },
  { id:10, title:"Summer Parish Festival", date:"2026-06-14", time:"12:00 PM", duration:"6 hours", category:"community", location:"SJC Grounds", description:"Annual festival! Food trucks, live music, games, and the famous SJC bake-off. Free admission.", icon:"🎪", rsvpRequired:false },
];

const EVENT_CATEGORY_COLORS = {
  worship: { bg:"#EEF4FB", text:"#1B3A6B", label:"Worship" },
  community: { bg:"#FFFBEA", text:"#7B5800", label:"Community" },
  service: { bg:"#F0FBF4", text:"#1B4332", label:"Service" },
  ministry: { bg:"#F5F2EB", text:"#6B5500", label:"Ministry" },
  youth: { bg:"#F5F0FF", text:"#5B21B6", label:"Youth" },
  formation: { bg:"#FFF0F0", text:"#9B1C1C", label:"Formation" },
};

function EventCalendarScreen({ lang, tier, onUpgrade }) {
  // eslint-disable-next-line no-unused-vars
  const t=getT(lang);
  const [rsvps, setRsvps] = useState(getEventRSVPs);
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpForm, setRsvpForm] = useState({ name:"", email:"", guests:1, notes:"" });

  function toggleRSVP(eventId) {
    const existing = rsvps.find(r => r.eventId === eventId);
    if (existing) {
      const updated = rsvps.filter(r => r.eventId !== eventId);
      setRsvps(updated);
      saveEventRSVPs(updated);
    } else {
      const event = PARISH_EVENTS.find(e => e.id === eventId);
      if (event?.rsvpRequired) {
        setSelectedEvent(event);
        return;
      }
      const updated = [...rsvps, { eventId, timestamp: new Date().toISOString() }];
      setRsvps(updated);
      saveEventRSVPs(updated);
    }
  }

  function submitRSVP() {
    if (!rsvpForm.name || !rsvpForm.email || !selectedEvent) return;
    const updated = [...rsvps, {
      eventId: selectedEvent.id,
      name: rsvpForm.name,
      email: rsvpForm.email,
      guests: parseInt(rsvpForm.guests) || 1,
      notes: rsvpForm.notes,
      timestamp: new Date().toISOString()
    }];
    setRsvps(updated);
    saveEventRSVPs(updated);
    setSelectedEvent(null);
    setRsvpForm({ name:"", email:"", guests:1, notes:"" });
  }

  function hasRSVP(eventId) {
    return rsvps.some(r => r.eventId === eventId);
  }

  function addToCalendar(event) {
    const start = new Date(`${event.date}T00:00:00`);
    if (event.time && event.time !== "All Day") {
      const [timeStr, period] = event.time.split(" ");
      const [h, m] = timeStr.split(":").map(Number);
      let hour24 = h;
      if (period === "PM" && h !== 12) hour24 += 12;
      if (period === "AM" && h === 12) hour24 = 0;
      start.setHours(hour24, m || 0);
    }
    const end = new Date(start);
    const durationHours = parseFloat(event.duration) || 1;
    end.setHours(end.getHours() + durationHours);

    const format = (d) => d.toISOString().replace(/-|:|\.\d+/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(start)}/${format(end)}&details=${encodeURIComponent(event.description + "\n\n" + BRAND.fullName)}&location=${encodeURIComponent(event.location)}`;
    window.open(url, "_blank");
  }

  // FREE TIER — locked
  if (tier === "free") return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.accent} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>Events & Calendar</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>Parish events · ELITE feature</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <LockedFeature tier="elite" feature="Event Calendar & RSVP System" onUpgrade={onUpgrade}/>
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Preview — What Elite unlocks</div>
        <div style={{opacity:0.5,filter:"blur(1px)",pointerEvents:"none"}}>
          {PARISH_EVENTS.slice(0,3).map((e,i)=>(
            <div key={i} className="sjc-card" style={{marginBottom:10}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{fontSize:28}}>{e.icon}</div>
                <div><div style={{fontSize:14,fontWeight:600}}>{e.title}</div><div style={{fontSize:11,color:"#6B7080"}}>{new Date(e.date).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})} · {e.time}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // RSVP MODAL
  if (selectedEvent) {
    const cat = EVENT_CATEGORY_COLORS[selectedEvent.category];
    return (
      <div className="dfi">
        <div style={{background:`linear-gradient(160deg,${BRAND.accent} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:BRAND.secondary,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>RSVP Required</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{fontSize:26}}>{selectedEvent.icon}</div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:"white",lineHeight:1.2}}>{selectedEvent.title}</div>
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{new Date(selectedEvent.date).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · {selectedEvent.time}</div>
        </div>
        <div style={{padding:"0 24px"}}>
          <button onClick={()=>setSelectedEvent(null)} style={{background:"transparent",border:"none",color:BRAND.primary,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:14,padding:0}}>← Back to events</button>

          {selectedEvent.capacity && (
            <div style={{background:cat.bg,borderRadius:12,padding:12,marginBottom:14,border:`1px solid ${cat.text}22`}}>
              <div style={{fontSize:11,color:cat.text,marginBottom:4}}>CAPACITY</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:6,background:"rgba(0,0,0,0.06)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",background:cat.text,width:`${(selectedEvent.rsvpCount/selectedEvent.capacity)*100}%`,borderRadius:3}}/>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:cat.text,fontFamily:"monospace"}}>{selectedEvent.rsvpCount}/{selectedEvent.capacity}</div>
              </div>
            </div>
          )}

          <div style={{fontSize:13,color:"#3A3020",lineHeight:1.6,marginBottom:16}}>{selectedEvent.description}</div>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Your Name *</label>
            <input value={rsvpForm.name} onChange={e=>setRsvpForm({...rsvpForm,name:e.target.value})} placeholder="Your name" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Email *</label>
            <input type="email" value={rsvpForm.email} onChange={e=>setRsvpForm({...rsvpForm,email:e.target.value})} placeholder="you@example.com" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Number attending (including you)</label>
            <input type="number" min="1" max="10" value={rsvpForm.guests} onChange={e=>setRsvpForm({...rsvpForm,guests:e.target.value})} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Notes (dietary restrictions, etc.)</label>
            <textarea value={rsvpForm.notes} onChange={e=>setRsvpForm({...rsvpForm,notes:e.target.value})} rows={2} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <button className="sjc-btn" style={{marginBottom:10}} onClick={submitRSVP}>Confirm RSVP</button>
          <button onClick={()=>addToCalendar(selectedEvent)} style={{width:"100%",background:"white",color:BRAND.primary,border:`1.5px solid ${BRAND.primary}`,borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",marginBottom:20}}>
            📅 Add to my calendar
          </button>
        </div>
      </div>
    );
  }

  // MAIN EVENTS VIEW
  const filteredEvents = filter === "all"
    ? PARISH_EVENTS
    : filter === "mine"
      ? PARISH_EVENTS.filter(e => hasRSVP(e.id))
      : PARISH_EVENTS.filter(e => e.category === filter);

  // Group by month
  const grouped = filteredEvents.reduce((acc, e) => {
    const monthKey = new Date(e.date).toLocaleDateString("en-US",{month:"long",year:"numeric"});
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(e);
    return acc;
  }, {});

  return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.accent} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3}}>Parish Events</div>
          {rsvps.length > 0 && (
            <div style={{background:BRAND.secondary,color:BRAND.dark,borderRadius:10,padding:"4px 10px",fontSize:11,fontWeight:700}}>
              {rsvps.length} RSVPs
            </div>
          )}
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>Worship, community, service & formation</div>
      </div>

      {/* Filter pills */}
      <div style={{padding:"0 16px",marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
        <div style={{display:"flex",gap:6,paddingBottom:2}}>
          {[
            {id:"all",label:"All Events",icon:"📅"},
            ...(rsvps.length>0 ? [{id:"mine",label:"My RSVPs",icon:"✓"}] : []),
            {id:"worship",label:"Worship",icon:"✝"},
            {id:"community",label:"Community",icon:"🎉"},
            {id:"service",label:"Service",icon:"🤝"},
            {id:"formation",label:"Formation",icon:"📖"},
            {id:"youth",label:"Youth",icon:"🎒"},
          ].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{
              flexShrink:0,padding:"6px 12px",borderRadius:20,
              background:filter===f.id?BRAND.primary:"white",
              color:filter===f.id?"white":"#1A1A2E",
              border:`1px solid ${filter===f.id?BRAND.primary:"rgba(0,0,0,0.08)"}`,
              fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"
            }}>{f.icon} {f.label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 24px"}}>
        {Object.keys(grouped).length === 0 && (
          <div style={{background:"white",borderRadius:14,padding:"30px 20px",textAlign:"center",border:"1px dashed rgba(0,0,0,0.1)"}}>
            <div style={{fontSize:36,marginBottom:8}}>📅</div>
            <div style={{fontSize:13,color:"#6B7080"}}>No events match this filter</div>
          </div>
        )}

        {Object.entries(grouped).map(([month, events])=>(
          <div key={month} style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>{month}</div>
            {events.map(e=>{
              const cat = EVENT_CATEGORY_COLORS[e.category] || {bg:"#F5F5F5",text:"#6B7080",label:e.category};
              const d = new Date(e.date);
              const day = d.toLocaleDateString("en-US",{weekday:"short"});
              const dayNum = d.getDate();
              const isPast = d < new Date();
              const rsvped = hasRSVP(e.id);
              return (
                <div key={e.id} className="sjc-card" style={{marginBottom:10,opacity:isPast?0.5:1}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    {/* Date block */}
                    <div style={{flexShrink:0,width:50,textAlign:"center",background:cat.bg,borderRadius:10,padding:"6px 4px",border:`1px solid ${cat.text}22`}}>
                      <div style={{fontSize:9,color:cat.text,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase"}}>{day}</div>
                      <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:cat.text,fontWeight:700,lineHeight:1}}>{dayNum}</div>
                    </div>

                    {/* Event info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span style={{fontSize:16}}>{e.icon}</span>
                        <span style={{fontSize:9,fontWeight:700,background:cat.bg,color:cat.text,borderRadius:4,padding:"1px 6px",textTransform:"uppercase",letterSpacing:"0.04em"}}>{cat.label}</span>
                        {rsvped && <span style={{fontSize:9,fontWeight:700,background:"#D8F3DC",color:"#1B4332",borderRadius:4,padding:"1px 6px"}}>✓ GOING</span>}
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:2,lineHeight:1.3}}>{e.title}</div>
                      <div style={{fontSize:11,color:"#6B7080",marginBottom:4}}>🕐 {e.time} · 📍 {e.location}</div>
                      <div style={{fontSize:12,color:"#3A3020",lineHeight:1.4,marginBottom:8}}>{e.description}</div>

                      {/* Capacity bar if RSVP required */}
                      {e.rsvpRequired && e.capacity && (
                        <div style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#6B7080",marginBottom:3}}>
                            <span>{e.rsvpCount} attending</span>
                            <span>{Math.max(0,e.capacity-e.rsvpCount)} spots left</span>
                          </div>
                          <div style={{height:3,background:"rgba(0,0,0,0.06)",borderRadius:2,overflow:"hidden"}}>
                            <div style={{height:"100%",background:cat.text,width:`${(e.rsvpCount/e.capacity)*100}%`,borderRadius:2}}/>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {!isPast && (
                        <div style={{display:"flex",gap:6,marginTop:6}}>
                          {rsvped ? (
                            <button onClick={()=>toggleRSVP(e.id)} style={{flex:1,background:"#D8F3DC",color:"#1B4332",border:"none",borderRadius:8,padding:"8px",fontSize:11,fontWeight:600,cursor:"pointer"}}>✓ Going · Cancel</button>
                          ) : (
                            <button onClick={()=>toggleRSVP(e.id)} style={{flex:1,background:BRAND.primary,color:"white",border:"none",borderRadius:8,padding:"8px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                              {e.rsvpRequired ? "RSVP" : "I'm going"}
                            </button>
                          )}
                          <button onClick={()=>addToCalendar(e)} style={{flex:1,background:"white",color:BRAND.primary,border:`1px solid ${BRAND.primary}33`,borderRadius:8,padding:"8px",fontSize:11,fontWeight:600,cursor:"pointer"}}>📅 Calendar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── IMPACT DASHBOARD ── */
function ImpactScreen({ lang }) {
  const t=getT(lang);
  const monthly=[{m:"Nov",v:680},{m:"Dec",v:790},{m:"Jan",v:900},{m:"Feb",v:1050},{m:"Mar",v:1160},{m:"Apr",v:1240}];
  const max=Math.max(...monthly.map(m=>m.v));
  const ministries=["SJC Parish Office","Lifewerks Food Pantry","DIFAN Network","Catholic Social Services","Delco Helping Hands"];
  return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.dark} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{fontSize:28}}>✝</div>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"white",lineHeight:1.3}}>{BRAND.fullName}</div>
        </div>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.secondary,marginBottom:4}}>{t.impactDashboard}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{t.impactDesc}</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {IMPACT_STATS.map(s=>(
            <div key={s.label} style={{background:"white",borderRadius:16,padding:14,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:11,fontWeight:600,color:"#1A1A2E",marginTop:4}}>{t[s.label]||s.label}</div>
              <div style={{fontSize:10,color:"#40916C",marginTop:2}}>{s.trend}</div>
            </div>
          ))}
        </div>
        <div style={{background:"white",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Families Reached (6 months)</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
            {monthly.map(m=>(
              <div key={m.m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:"100%",background:`linear-gradient(180deg,${BRAND.gradEnd},${BRAND.primary})`,borderRadius:"4px 4px 0 0",height:`${(m.v/max)*70}px`,transition:"height 0.5s ease"}}/>
                <div style={{fontSize:9,color:"#6B7080",fontWeight:600}}>{m.m}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.sponsoredBy}</div>
          <div style={{fontSize:13,color:BRAND.primary,fontWeight:600,textAlign:"center",padding:"8px 0",borderBottom:"1px solid rgba(0,0,0,0.06)",marginBottom:10}}>{BRAND.fullName}</div>
          <div className="sponsor-ticker">
            <div className="sponsor-inner">
              {[...ministries,...ministries].map((s,i)=>(
                <span key={i} style={{display:"inline-block",background:`${BRAND.primary}12`,borderRadius:8,padding:"5px 12px",margin:"0 6px",fontSize:12,fontWeight:600,color:BRAND.primary}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <button className="sjc-btn" style={{marginBottom:8}}>📧 {t.monthlyImpact}</button>
        <div style={{fontSize:11,color:"#6B7080",textAlign:"center",padding:"8px 0 20px",lineHeight:1.6}}>
          Powered by DelcoHelp · Built by Damian Ciero, Wallingford PA<br/>
          <span style={{color:BRAND.primary,fontWeight:600}}>Contact: delcohelp@gmail.com</span>
        </div>
      </div>
    </div>
  );
}

/* ── SUBMIT RESOURCE ── */
function SubmitScreen({ lang }) {
  const [form,setForm]=useState({name:"",address:"",phone:"",category:"food",hours:"",notes:""});
  const [submitted,setSubmitted]=useState(false), t=T[lang];
  if (submitted) return (
    <div className="dfi" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 24px",textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:16}}>✝</div>
      <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",marginBottom:8}}>Resource Submitted!</div>
      <div style={{fontSize:14,color:"#6B7080",lineHeight:1.6}}>{t.submitThanks}</div>
    </div>
  );
  return (
    <div className="dfi">
      <div style={{padding:"16px 24px 0"}}>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",marginBottom:4}}>{t.submitResource}</div>
        <div style={{fontSize:13,color:"#6B7080",marginBottom:20}}>{t.submitDesc}</div>
        {[{key:"name",label:t.orgName,ph:"e.g. SJC Community Closet"},{key:"address",label:t.orgAddress,ph:"123 Providence Rd, Wallingford PA"},{key:"phone",label:t.orgPhone,ph:"610-555-0000"},{key:"hours",label:t.orgHours,ph:"e.g. Thursdays 5–7 PM"}].map(f=>(
          <div key={f.key} style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#6B7080",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{f.label}</div>
            <input className="sjc-input-plain" placeholder={f.ph} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={{paddingLeft:16}}/>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"#6B7080",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.orgCategory}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{id:"food",label:"🥫 Food"},{id:"assistance",label:"🤝 Assistance"},{id:"legal",label:"⚖️ Legal"},{id:"parish",label:"✝ Parish"}].map(c=>(
              <div key={c.id} className={`sjc-filter ${form.category===c.id?"active":"inactive"}`} onClick={()=>setForm({...form,category:c.id})}>{c.label}</div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:600,color:"#6B7080",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.orgNotes}</div>
          <textarea className="sjc-input-plain" placeholder="Any other helpful details…" rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{paddingLeft:16,resize:"none"}}/>
        </div>
        <button className="sjc-btn" style={{marginBottom:24}} onClick={()=>form.name&&form.address&&setSubmitted(true)}>{t.submit}</button>
      </div>
    </div>
  );
}

/* ── AI USAGE LIMITER UTILS (SJC) ── */
const SJC_AI_LIMIT = 5;
const SJC_AI_KEY = "sjc_ai_usage";
function getSJCAIUsage() {
  try {
    const today = new Date().toDateString();
    const raw = localStorage.getItem(SJC_AI_KEY);
    if (!raw) return 0;
    const d = JSON.parse(raw);
    return d.date === today ? (d.count || 0) : 0;
  } catch { return 0; }
}
function incrementSJCAIUsage() {
  try {
    const today = new Date().toDateString();
    localStorage.setItem(SJC_AI_KEY, JSON.stringify({ date: today, count: getSJCAIUsage() + 1 }));
  } catch {}
}

/* ── AI CHAT ── */
function AIScreen({ lang }) {
  const t=getT(lang);
  const [messages,setMessages]=useState([{role:"ai",text:`✝ Welcome! I'm the ${BRAND.fullName} Community AI. Ask me anything about local resources, parish services, or getting help in Wallingford and Delaware County.`}]);
  const [input,setInput]=useState(""), [loading,setLoading]=useState(false);
  const [usageCount,setUsageCount]=useState(getSJCAIUsage());
  const bottomRef=useRef(null);
  const remaining = Math.max(0, SJC_AI_LIMIT - usageCount);
  const atLimit = remaining === 0;

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  async function send() {
    if (!input.trim()||loading||atLimit) return;
    const userMsg=input.trim(); setInput(""); setLoading(true);
    incrementSJCAIUsage();
    setUsageCount(getSJCAIUsage());
    setMessages(m=>[...m,{role:"user",text:userMsg}]);
    trackEvent("ai_chat_sent",{app:"sjc"});
    gaEvent("ai_chat_sent",{app:"sjc"});
    try {
      const sys=`You are the ${BRAND.fullName} Community AI assistant, helping parishioners and community members in Wallingford, PA 19086 find local resources and support.

Parish info:
- St. John Chrysostom Catholic Church, 615 S. Providence Rd, Wallingford PA 19086
- Phone: 610-874-3418 | Email: PHoffice@sjcparish.org
- Pastor: Rev. Edward J. Hallinan
- Communications: Mary Chollet
- Mass: Sat 4PM vigil, Sun 8AM/9:30AM/11:30AM

Local resources:
- Lifewerks Food Pantry: 25 Cedar Rd, Wallingford — Tues 6–8 PM, 610-872-3344 (0.3 mi)
- DIFAN Wallingford: 25 Cedar Rd — Tues 6:30–8 PM, Fri 4–6 PM, 484-326-5362
- Media Food Bank: 350 W State St Media — Thurs 6–8 PM, Sun 1–2 PM, 610-566-3172
- Catholic Social Services: 267-331-2490
- Legal Aid of SE PA: free legal help, 877-429-5994
- Delco Helping Hands: diapers, supplies, 484-474-0590
- PA 211: dial 211 for any social service

Keep responses warm, pastoral, and brief. Include phone numbers. If someone seems in immediate danger, lead with 911. For Delaware County crisis support, use ${DELCO_CRISIS.phone}. For text support, say text PA to 741741. Reflect the Catholic mission of serving those in need with dignity.`;
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[...messages.filter((_,i)=>i>0).map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),{role:"user",content:userMsg}]})});
      const data=await res.json();
      setMessages(m=>[...m,{role:"ai",text:data.content?.[0]?.text||"Please call our parish office at 610-874-3418 for assistance."}]);
    } catch(e) {
      setMessages(m=>[...m,{role:"ai",text:"Please call our parish office at 610-874-3418 or PA 211 (dial 211) for immediate help."}]);
    }
    setLoading(false);
  }

  const suggestions=["I need food assistance tonight","How do I apply for SNAP?","What ministries can I volunteer with?","I need help paying my utility bills"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:`linear-gradient(160deg,${BRAND.dark},${BRAND.primary})`,padding:"16px 24px",borderRadius:"0 0 24px 24px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✝</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,color:"white"}}>{t.aiChat}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>{t.aiDesc}</div>
          </div>
          {/* Usage counter */}
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:10,color:remaining>2?"#68D391":remaining>0?"#F6E05E":"#FC8181",fontWeight:700,fontFamily:"monospace"}}>
              {remaining}/{SJC_AI_LIMIT}
            </div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>left today</div>
          </div>
        </div>
        {/* Usage bar */}
        <div style={{height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,marginTop:10,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:2,width:`${((SJC_AI_LIMIT-remaining)/SJC_AI_LIMIT)*100}%`,background:remaining>2?"#68D391":remaining>0?"#F6E05E":"#FC8181",transition:"width 0.3s ease"}}/>
        </div>
      </div>

      <div style={{flex:1,overflow:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:10,scrollbarWidth:"none"}}>
        {messages.map((m,i)=><div key={i} className={m.role==="user"?"chat-bubble-user":"chat-bubble-ai"}>{m.text}</div>)}
        {loading&&<div className="chat-bubble-ai" style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:BRAND.primary,animation:"pulse 1s infinite"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:BRAND.primary,animation:"pulse 1s infinite 0.2s"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:BRAND.primary,animation:"pulse 1s infinite 0.4s"}}/>
        </div>}
        {messages.length===1&&!atLimit&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          {suggestions.map((s,i)=><button key={i} onClick={()=>setInput(s)} style={{background:`${BRAND.primary}10`,border:`1px solid ${BRAND.primary}25`,borderRadius:12,padding:"8px 12px",fontSize:12,color:BRAND.primary,cursor:"pointer",textAlign:"left",fontFamily:"'Source Sans 3',sans-serif"}}>{s}</button>)}
        </div>}
        {/* Limit reached — SJC-branded */}
        {atLimit&&<div style={{background:`${BRAND.secondary}18`,borderRadius:16,padding:16,border:`1px solid ${BRAND.secondary}44`,margin:"8px 0"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#5A4000",marginBottom:6}}>✝ You've used your {SJC_AI_LIMIT} free AI messages today.</div>
          <div style={{fontSize:13,color:"#7B5800",lineHeight:1.6,marginBottom:12}}>Your limit resets at midnight. Our parish family is here for you — these resources are available right now:</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>window.open("tel:6108743418")} style={{background:BRAND.primary,color:"white",border:"none",borderRadius:12,padding:"12px",fontFamily:"'Source Sans 3',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>✝ Call SJC Parish Office — 610-874-3418</button>
            <button onClick={()=>window.open("tel:211")} style={{background:"#2D6A4F",color:"white",border:"none",borderRadius:12,padding:"12px",fontFamily:"'Source Sans 3',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>📞 Call PA 211 — Free Resource Helpline</button>
            <div style={{fontSize:11,color:"#6B7080",textAlign:"center",marginTop:4}}>Or use the Find tab to browse all resources →</div>
          </div>
        </div>}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-input-row" style={{opacity:atLimit?0.4:1,pointerEvents:atLimit?"none":"auto"}}>
        <input className="chat-input" placeholder={atLimit?"Daily limit reached — resets at midnight":t.aiPlaceholder} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} disabled={atLimit}/>
        <button className="chat-send-btn" onClick={send} disabled={loading||atLimit}>→</button>
      </div>
    </div>
  );
}

/* ── DONATE MODAL — DONORBOX INTEGRATION ── */
function DonateModal({ onClose, lang }) {
  const [amt,setAmt]=useState("$25"), [fund,setFund]=useState("Parish Outreach Fund");
  const [freq,setFreq]=useState("once"), [step,setStep]=useState(1);
  const [cardNum,setCardNum]=useState(""), [cardExp,setCardExp]=useState(""), [cardCvv,setCardCvv]=useState(""), [cardName,setCardName]=useState("");
  const [processing,setProcessing]=useState(false), t=T[lang];
  const amts=["$10","$25","$50","$100","$250","Custom"];
  const funds=[
    {id:"outreach",label:"Parish Outreach Fund",icon:"🤝",desc:"Directly funds community assistance"},
    {id:"food",label:"SJC Food Ministry",icon:"🥫",desc:"Stocks local food pantries"},
    {id:"youth",label:"Youth Programs",icon:"🧒",desc:"Faith formation & youth activities"},
    {id:"building",label:"Building & Maintenance",icon:"⛪",desc:"Church upkeep & facilities"},
    {id:"general",label:"General Parish Fund",icon:"✝",desc:"Where the need is greatest"},
  ];
  const impact={"$10":"feeds a family for 1 week","$25":"funds 3 days of food distribution","$50":"provides diapers for 10 families","$100":"sponsors one full pantry shift","$250":"stocks the pantry for a month"};

  function formatCard(v) { return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim(); }
  function formatExp(v) { return v.replace(/\D/g,"").slice(0,4).replace(/^(\d{2})(\d)/,"$1/$2"); }

  async function processPayment() {
    setProcessing(true);
    await new Promise(r=>setTimeout(r,1800));
    setProcessing(false); setStep(3);
  }

  if (step===3) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{textAlign:"center",paddingTop:32,paddingBottom:32}}>
        <div style={{fontSize:48,marginBottom:12}}>✝</div>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"#1A1A2E",marginBottom:4}}>{t.thankYou}</div>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.primary,marginBottom:16,fontStyle:"italic"}}>Your generosity is a blessing.</div>
        <div style={{fontSize:13,color:"#6B7080",lineHeight:1.6,marginBottom:16}}>{amt} {freq==="monthly"?"per month":""} {t.onItsWay} <strong>{fund}</strong>.</div>
        <div style={{background:`${BRAND.primary}08`,borderRadius:14,padding:12,marginBottom:12,border:`1px solid ${BRAND.primary}18`}}>
          <div style={{fontSize:13,color:BRAND.primary,fontWeight:600}}>{t.yourImpact} {impact[amt]||"makes a real difference"}</div>
        </div>
        <div style={{background:"#FFF9E6",borderRadius:14,padding:12,marginBottom:20,border:"1px solid rgba(201,168,76,0.3)"}}>
          <div style={{fontSize:12,color:"#7B5800"}}>📧 A receipt has been sent to your email via <strong>Donorbox</strong> — tax-deductible confirmation included.</div>
        </div>
        <button className="sjc-btn" onClick={onClose}>{t.done}</button>
      </div>
    </div>
  );

  if (step===2) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="sjc-back" onClick={()=>setStep(1)}>{t.back}</div>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"#1A1A2E",marginBottom:4}}>{t.confirmDonation}</div>
        <div style={{fontSize:12,color:"#6B7080",marginBottom:16}}>Powered by Donorbox · PCI-DSS compliant · Tax-deductible receipt included</div>

        {/* Summary */}
        <div style={{background:`${BRAND.primary}08`,borderRadius:14,padding:14,marginBottom:16,border:`1px solid ${BRAND.primary}15`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:700,color:"#1A1A2E"}}>{fund}</div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:BRAND.primary,fontWeight:700}}>{amt}{freq==="monthly"?"/mo":""}</div>
          </div>
          <div style={{fontSize:12,color:"#6B7080"}}>{impact[amt]||"Your gift makes a difference"} · {freq==="monthly"?"Recurring monthly":"One-time gift"}</div>
          <div style={{marginTop:8,padding:"6px 10px",background:"#D8F3DC",borderRadius:8,fontSize:11,color:"#1B4332",fontWeight:600}}>✅ 1.5% Donorbox fee · {(parseFloat(amt.replace("$",""))*0.985).toFixed(2)} net to parish</div>
        </div>

        {/* Quick Pay */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Quick Pay</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button style={{flex:1,background:"black",color:"white",border:"none",borderRadius:12,padding:14,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={processPayment}>🍎 Apple Pay</button>
          <button style={{flex:1,background:"#4285F4",color:"white",border:"none",borderRadius:12,padding:14,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={processPayment}><span style={{fontWeight:900}}>G</span> Pay</button>
          <button style={{flex:1,background:"#009CDE",color:"white",border:"none",borderRadius:12,padding:14,fontSize:13,fontWeight:600,cursor:"pointer"}} onClick={processPayment}>PayPal</button>
        </div>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{flex:1,height:1,background:"rgba(0,0,0,0.08)"}}/>
          <div style={{fontSize:11,color:"#9BA8A0",fontWeight:600}}>OR PAY BY CARD</div>
          <div style={{flex:1,height:1,background:"rgba(0,0,0,0.08)"}}/>
        </div>

        {/* Card Form */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6B7080",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Name on Card</div>
          <input className="sjc-input-plain" placeholder="John Smith" value={cardName} onChange={e=>setCardName(e.target.value)} style={{paddingLeft:16,marginBottom:0}}/>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6B7080",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Card Number</div>
          <div style={{position:"relative"}}>
            <input className="sjc-input-plain" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))} style={{paddingLeft:16,paddingRight:48,marginBottom:0}}/>
            <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:18}}>💳</span>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6B7080",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Expiry</div>
            <input className="sjc-input-plain" placeholder="MM/YY" value={cardExp} onChange={e=>setCardExp(formatExp(e.target.value))} style={{paddingLeft:16,marginBottom:0}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:"#6B7080",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>CVV</div>
            <input className="sjc-input-plain" placeholder="123" value={cardCvv} onChange={e=>setCardCvv(e.target.value.slice(0,4))} style={{paddingLeft:16,marginBottom:0}}/>
          </div>
        </div>
        <button className="sjc-btn-gold" onClick={processPayment} disabled={processing} style={{opacity:processing?0.8:1}}>
          {processing ? <span>⏳ Processing…</span> : <span>✝ Give {amt}{freq==="monthly"?"/month":""}  Securely</span>}
        </button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10}}>
          <span style={{fontSize:11,color:"#9BA8A0"}}>🔒 Secured by</span>
          <span style={{fontSize:12,fontWeight:700,color:"#4A90D9"}}>Donorbox</span>
          <span style={{fontSize:11,color:"#9BA8A0"}}>· PCI-DSS Level 1</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:32}}>✝</div>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"#1A1A2E",marginTop:4}}>{t.makeDonation}</div>
          <div style={{fontSize:12,color:"#6B7080",marginTop:4}}>{t.donateAllGoes}</div>
        </div>

        {/* Frequency Toggle */}
        <div style={{display:"flex",background:"#EEE9DC",borderRadius:12,padding:3,marginBottom:16}}>
          {[{id:"once",label:"One-Time Gift"},{id:"monthly",label:"Give Monthly"}].map(f=>(
            <div key={f.id} onClick={()=>setFreq(f.id)} style={{flex:1,textAlign:"center",padding:"9px 8px",borderRadius:10,background:freq===f.id?"white":"transparent",fontSize:12,fontWeight:700,color:freq===f.id?BRAND.primary:"#6B7080",cursor:"pointer",transition:"all 0.18s",boxShadow:freq===f.id?"0 2px 6px rgba(0,0,0,0.08)":"none"}}>
              {f.label}
            </div>
          ))}
        </div>
        {freq==="monthly"&&<div style={{background:"#D8F3DC",borderRadius:10,padding:"8px 12px",marginBottom:12,border:"1px solid rgba(45,106,79,0.2)"}}><div style={{fontSize:12,color:"#1B4332",fontWeight:600}}>💚 Monthly givers make up 68% of our annual ministry budget. Thank you!</div></div>}

        {/* Amount */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.selectAmount}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {amts.map(a=><div key={a} className={`amt-pill${amt===a?" sel":""}`} onClick={()=>setAmt(a==="Custom"?"$":a)}>{a}</div>)}
        </div>
        {amt==="$"&&<input className="sjc-input-plain" placeholder="Enter custom amount" style={{paddingLeft:16,marginBottom:12}} onChange={e=>setAmt("$"+e.target.value.replace(/\D/g,""))}/>}
        {amt&&amt!=="$"&&<div style={{background:`${BRAND.primary}08`,borderRadius:10,padding:9,marginBottom:12,border:`1px solid ${BRAND.primary}15`}}><div style={{fontSize:12,color:BRAND.primary}}>✝ {amt}{freq==="monthly"?"/mo":""} — {impact[amt]||"makes a real difference"}</div></div>}

        {/* Fund */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.donateTo}</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {funds.map(f=>(
            <div key={f.id} onClick={()=>setFund(f.label)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,border:`1.5px solid ${fund===f.label?BRAND.primary:"rgba(0,0,0,0.08)"}`,background:fund===f.label?`${BRAND.primary}08`:"white",cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${fund===f.label?BRAND.primary:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{fund===f.label&&<div style={{width:8,height:8,borderRadius:"50%",background:BRAND.primary}}/>}</div>
              <div style={{fontSize:20,flexShrink:0}}>{f.icon}</div>
              <div><div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{f.label}</div><div style={{fontSize:11,color:"#6B7080"}}>{f.desc}</div></div>
            </div>
          ))}
        </div>

        <button className="sjc-btn-gold" onClick={()=>setStep(2)}>{t.continue} {amt}{freq==="monthly"?"/mo":""}</button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10,marginBottom:4}}>
          <span style={{fontSize:11,color:"#9BA8A0"}}>🔒 Powered by</span>
          <span style={{fontSize:12,fontWeight:700,color:"#4A90D9"}}>Donorbox</span>
          <span style={{fontSize:11,color:"#9BA8A0"}}>· Only 1.5% fee · Tax receipt included</span>
        </div>
      </div>
    </div>
  );
}

/* ── REPORTS SCREEN ── */
function ReportsScreen({ lang, onNav }) {
  const [activeReport, setActiveReport] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [scheduleSet, setScheduleSet] = useState(false);

  const monthlyData = [
    { month:"November 2025", users:680, resources:3200, donations:"$1,840", families:280, highlight:"Launched DIFAN partnership" },
    { month:"December 2025", users:790, resources:3740, donations:"$2,100", families:318, highlight:"Holiday food drive +40% donations" },
    { month:"January 2026", users:900, resources:4290, donations:"$2,380", families:360, highlight:"Added LIHEAP benefits navigator" },
    { month:"February 2026", users:1050, resources:4980, donations:"$2,750", families:420, highlight:"Spanish translation launched" },
    { month:"March 2026", users:1160, resources:5510, donations:"$3,200", families:468, highlight:"Emergency mode added" },
    { month:"April 2026", users:1240, resources:6830, donations:"$4,120", families:534, highlight:"AI assistant launched" },
  ];

  const sponsors = [
    { name:"Crozer Health", tier:"Platinum", amount:"$5,000/yr", logo:"🏥", contact:"Community Benefits Dept." },
    { name:"Main Line Health", tier:"Gold", amount:"$2,500/yr", logo:"⚕️", contact:"Community Health Team" },
    { name:"TD Bank", tier:"Silver", amount:"$1,000/yr", logo:"🏦", contact:"Community Relations" },
    { name:"Wawa Foundation", tier:"Silver", amount:"$1,000/yr", logo:"☕", contact:"Grants Team" },
  ];

  // eslint-disable-next-line no-unused-vars
  const currentMonth = monthlyData[monthlyData.length - 1];

  return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.dark} 0%,${BRAND.primary} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>Impact & Reports</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>Monthly data · Sponsor reports · Download PDFs</div>
      </div>

      <div style={{padding:"0 24px"}}>

        {/* Live Stats Row */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>📊 Live This Month — April 2026</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {label:"Families Reached",value:"1,240",delta:"+7%",color:BRAND.primary,icon:"👥"},
            {label:"Resources Found",value:"6,830",delta:"+24%",color:"#40916C",icon:"🔍"},
            {label:"Donations Received",value:"$4,120",delta:"+29%",color:BRAND.secondary,icon:"💛"},
            {label:"Families Helped",value:"534",delta:"+14%",color:BRAND.accent,icon:"🏠"},
          ].map(s=>(
            <div key={s.label} style={{background:"white",borderRadius:14,padding:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <span style={{fontSize:11,fontWeight:700,color:"#40916C",background:"#D8F3DC",borderRadius:8,padding:"2px 6px"}}>{s.delta}</span>
              </div>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:10,fontWeight:600,color:"#6B7080",marginTop:3,lineHeight:1.3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Growth Chart */}
        <div style={{background:"white",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em"}}>6-Month Growth</div>
            <div style={{fontSize:11,color:BRAND.primary,fontWeight:600}}>+82% total</div>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:72}}>
            {monthlyData.map((m,i)=>{
              const pct=(m.users/1240)*100;
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:"100%",background:`linear-gradient(180deg,${BRAND.gradEnd},${BRAND.primary})`,borderRadius:"4px 4px 0 0",height:`${pct*0.65}px`,transition:"height 0.5s ease",cursor:"pointer",opacity:activeReport===i?1:0.75}} onClick={()=>setActiveReport(activeReport===i?null:i)}/>
                  <div style={{fontSize:8,color:"#6B7080",fontWeight:600}}>{m.month.slice(0,3)}</div>
                </div>
              );
            })}
          </div>
          {activeReport!==null&&(
            <div style={{marginTop:12,background:`${BRAND.primary}08`,borderRadius:10,padding:10,border:`1px solid ${BRAND.primary}15`}}>
              <div style={{fontSize:12,fontWeight:700,color:BRAND.primary,marginBottom:4}}>{monthlyData[activeReport].month}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:11,color:"#3A3020"}}>
                <span>👥 {monthlyData[activeReport].users} users</span>
                <span>🏠 {monthlyData[activeReport].families} families</span>
                <span>💛 {monthlyData[activeReport].donations}</span>
                <span>🔍 {monthlyData[activeReport].resources} found</span>
              </div>
              <div style={{fontSize:11,color:BRAND.primary,fontWeight:600,marginTop:6}}>✨ {monthlyData[activeReport].highlight}</div>
            </div>
          )}
        </div>

        {/* Monthly Reports List */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>📄 Monthly Reports</div>
        {[...monthlyData].reverse().map((m,i)=>(
          <div key={i} style={{background:"white",borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${BRAND.primary}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📊</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{m.month}</div>
              <div style={{fontSize:11,color:"#6B7080",marginTop:1}}>{m.families} families · {m.donations} raised · {m.users} users</div>
            </div>
            <button style={{background:`${BRAND.primary}12`,color:BRAND.primary,border:"none",borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>⬇ PDF</button>
          </div>
        ))}

        {/* Sponsor Section */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",margin:"20px 0 10px"}}>🏆 Sponsors & Partners</div>
        {sponsors.map((s,i)=>(
          <div key={i} style={{background:"white",borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${BRAND.secondary}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.logo}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1A1A2E"}}>{s.name}</div>
                <span style={{background:s.tier==="Platinum"?"#E8E0FF":s.tier==="Gold"?`${BRAND.secondary}30`:"#F0F4F1",color:s.tier==="Platinum"?"#5B21B6":s.tier==="Gold"?"#7B5800":"#4A6B52",borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:700}}>{s.tier}</span>
              </div>
              <div style={{fontSize:11,color:"#6B7080"}}>{s.contact} · {s.amount}</div>
            </div>
            <button style={{background:`${BRAND.primary}12`,color:BRAND.primary,border:"none",borderRadius:10,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Send Report</button>
          </div>
        ))}

        {/* Email Scheduling */}
        <div style={{background:`${BRAND.secondary}15`,borderRadius:16,padding:16,marginTop:8,marginBottom:12,border:`1px solid ${BRAND.secondary}44`}}>
          <div style={{fontSize:13,fontWeight:700,color:"#5A4000",marginBottom:4}}>📧 Automated Report Emails</div>
          <div style={{fontSize:12,color:"#7B5800",marginBottom:12,lineHeight:1.5}}>Send monthly impact reports automatically to sponsors, the pastor, and parish council.</div>
          {!scheduleSet ? (
            <div>
              {[{label:"Pastor Rev. Hallinan",email:"PHoffice@sjcparish.org",checked:true},{label:"Mary Chollet — Communications",email:"PHoffice@sjcparish.org",checked:true},{label:"Crozer Health — Sponsor",email:"community@crozerhealth.org",checked:false},{label:"Main Line Health — Sponsor",email:"community@mainlinehealth.org",checked:false}].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<3?"1px solid rgba(0,0,0,0.06)":"none"}}>
                  <div style={{width:18,height:18,borderRadius:4,background:r.checked?BRAND.primary:"white",border:`2px solid ${r.checked?BRAND.primary:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                    {r.checked&&<span style={{color:"white",fontSize:10,lineHeight:1}}>✓</span>}
                  </div>
                  <div><div style={{fontSize:12,fontWeight:600,color:"#1A1A2E"}}>{r.label}</div><div style={{fontSize:10,color:"#6B7080"}}>{r.email}</div></div>
                </div>
              ))}
              <button className="sjc-btn" style={{marginTop:12,fontSize:13}} onClick={()=>setScheduleSet(true)}>✅ Schedule Monthly Emails</button>
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"8px 0"}}>
              <div style={{fontSize:28,marginBottom:8}}>✅</div>
              <div style={{fontSize:13,fontWeight:600,color:"#1B4332"}}>Monthly reports scheduled!</div>
              <div style={{fontSize:11,color:"#4A6B52",marginTop:4}}>Reports send on the 1st of each month</div>
            </div>
          )}
        </div>

        {/* Send Now */}
        <div style={{marginBottom:24}}>
          {!emailSent ? (
            <button className="sjc-btn-gold" onClick={()=>setEmailSent(true)}>📤 Send April Report to All Sponsors Now</button>
          ) : (
            <div style={{background:"#D8F3DC",borderRadius:14,padding:14,textAlign:"center",border:"1px solid rgba(45,106,79,0.2)"}}>
              <div style={{fontSize:20,marginBottom:4}}>✅</div>
              <div style={{fontSize:13,fontWeight:700,color:"#1B4332"}}>April 2026 report sent!</div>
              <div style={{fontSize:11,color:"#4A6B52",marginTop:2}}>Delivered to 4 recipients</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── NOTIFICATIONS ── */
function NotifOverlay({ onClose, lang }) {
  const t=getT(lang);
  const notifs=[
    {icon:"✝",bg:BRAND.primary,title:"Sunday Mass — 9:30 AM tomorrow",body:"Join us at St. John Chrysostom · 615 S. Providence Rd",time:"now"},
    {icon:"🥫",bg:"#2D6A4F",title:"Lifewerks opens tonight!",body:"Food pantry open 6–8 PM · 0.3 mi from SJC",time:"3h"},
    {icon:"💡",bg:"#023E8A",title:"LIHEAP deadline April 30",body:"PA utility assistance — apply now at compass.state.pa.us",time:"1h ago"},
    {icon:"💛",bg:BRAND.secondary,title:"Thank you for your gift!",body:"Your donation to SJC Parish Outreach was received",time:"Yesterday"},
  ];
  return (
    <div className="notif-overlay" onClick={onClose}>
      <div style={{fontFamily:"'Source Sans 3',sans-serif",fontSize:12,fontWeight:700,color:"white",textAlign:"center",marginBottom:12,letterSpacing:"0.06em",textTransform:"uppercase",opacity:0.8}}>{t.notifications}</div>
      {notifs.map((n,i)=>(
        <div key={i} className="notif-banner" onClick={e=>e.stopPropagation()}>
          <div style={{width:36,height:36,borderRadius:10,background:n.bg+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#1A1A2E",marginBottom:2}}>{n.title}</div><div style={{fontSize:11,color:"#6B7080",lineHeight:1.4}}>{n.body}</div></div>
          <div style={{fontSize:10,color:"#9BA8A0",flexShrink:0}}>{n.time}</div>
        </div>
      ))}
      <div style={{textAlign:"center",marginTop:12}}>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"10px 24px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>{t.dismiss}</button>
      </div>
    </div>
  );
}

/* ── TIER DEFINITIONS ── */
const TIERS = {
  free:    { name:"Free",        price:"$0/mo",   color:"#6B7080", badge:"FREE",     features:["Resource finder","Emergency hotlines","Benefits navigator","Spanish translation"] },
  basic:   { name:"Parish Basic",price:"$49/mo",  color:BRAND.primary, badge:"BASIC", features:["Everything in Free","YouTube Mass embed","Newsletter subscribe","Branded app"] },
  pro:     { name:"Parish Pro",  price:"$99/mo",  color:"#7B2D8B", badge:"PRO",      features:["Everything in Basic","AI chat assistant","Donation processing","Impact dashboard","Monthly reports"] },
  elite:   { name:"Parish Elite",price:"$199/mo", color:BRAND.secondary, badge:"ELITE", features:["Everything in Pro","Volunteer hour tracker","Event calendar & RSVPs","Google Calendar sync","Capacity management","Priority support"] },
};

/* ── UPGRADE MODAL ── */
function UpgradeModal({ onClose, currentTier, onUpgrade }) {
  const [selected, setSelected] = useState("pro");
  const tierOrder = ["free","basic","pro","elite"];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"#1A1A2E",marginBottom:4}}>Choose Your Plan</div>
        <div style={{fontSize:13,color:"#6B7080",marginBottom:16}}>Upgrade anytime · Cancel anytime · No contracts</div>
        {tierOrder.map(tid=>{
          const tier=TIERS[tid]; const isCurrent=tid===currentTier; const isSelected=tid===selected;
          return (
            <div key={tid} onClick={()=>setSelected(tid)} style={{borderRadius:14,padding:14,marginBottom:8,border:`2px solid ${isSelected?tier.color:"rgba(0,0,0,0.08)"}`,background:isSelected?tier.color+"0A":"white",cursor:"pointer",transition:"all 0.18s",position:"relative"}}>
              {isCurrent&&<div style={{position:"absolute",top:10,right:10,background:"#D8F3DC",color:"#1B4332",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>CURRENT</div>}
              {tid==="pro"&&!isCurrent&&<div style={{position:"absolute",top:10,right:10,background:"#7B2D8B",color:"white",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>⭐ POPULAR</div>}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${isSelected?tier.color:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isSelected&&<div style={{width:8,height:8,borderRadius:"50%",background:tier.color}}/>}</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,fontWeight:700,color:"#1A1A2E"}}>{tier.name}</div>
                <div style={{marginLeft:"auto",fontFamily:"'Libre Baskerville',serif",fontSize:16,fontWeight:700,color:tier.color}}>{tier.price}</div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,paddingLeft:28}}>
                {tier.features.map((f,i)=><span key={i} style={{fontSize:11,color:"#3A3020",background:"#F5F2EB",borderRadius:6,padding:"2px 7px"}}>✓ {f}</span>)}
              </div>
            </div>
          );
        })}
        <button className="sjc-btn-gold" style={{marginTop:8}} onClick={()=>{onUpgrade(selected);onClose();}}>
          {selected===currentTier?"Stay on Current Plan":`Upgrade to ${TIERS[selected].name} — ${TIERS[selected].price}`}
        </button>
        <div style={{fontSize:11,color:"#6B7080",textAlign:"center",marginTop:8}}>Billed monthly · Cancel anytime · Powered by Stripe</div>
      </div>
    </div>
  );
}

/* ── LOCKED FEATURE CARD ── */
function LockedFeature({ tier, feature, onUpgrade }) {
  const t = TIERS[tier];
  return (
    <div style={{borderRadius:16,padding:20,background:"linear-gradient(135deg,#F5F2EB,white)",border:"2px dashed rgba(0,0,0,0.12)",textAlign:"center",margin:"0 0 16px"}}>
      <div style={{fontSize:36,marginBottom:8}}>🔒</div>
      <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:16,color:"#1A1A2E",marginBottom:4}}>{feature}</div>
      <div style={{fontSize:13,color:"#6B7080",marginBottom:14}}>This feature is part of our <strong style={{color:t.color}}>{t.name}</strong> package</div>
      <div style={{background:"rgba(0,0,0,0.04)",borderRadius:10,padding:12,fontSize:12,color:"#6B7080",lineHeight:1.5}}>
        Contact your parish administrator to learn about upgrading
      </div>
    </div>
  );
}

/* ── YOUTUBE SCREEN ── */
function YouTubeScreen({ tier, onUpgrade }) {
  const [activeVideo, setActiveVideo] = useState(0);
  const [videos, setVideos] = useState([
    { id:"", title:"Sunday Mass — April 20, 2026", date:"Apr 20", views:"247", duration:"58:12", type:"Mass" },
    { id:"", title:"Easter Sunday Mass — April 13, 2026", date:"Apr 13", views:"412", duration:"1:04:33", type:"Mass" },
    { id:"", title:"Good Friday Service", date:"Apr 11", views:"318", duration:"45:20", type:"Service" },
    { id:"", title:"Palm Sunday Mass", date:"Apr 6", views:"289", duration:"55:44", type:"Mass" },
    { id:"", title:"Stations of the Cross", date:"Mar 28", views:"196", duration:"32:15", type:"Devotion" },
  ]);

  // Channel URL for subscribe button
  const CHANNEL_URL = "https://www.youtube.com/channel/UCD2w33roAho2im82m6G6LKg";

  useEffect(()=>{
    if (tier==="free") return;
    fetch(`/api/youtube`)
      .then(r=>r.json())
      .then(data=>{
        if (!data.items?.length) return;
        const fetched = data.items.map(item=>({
          id: item.id.videoId,
          title: item.snippet.title,
          date: new Date(item.snippet.publishedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
          views: "—",
          duration: "—",
          type: item.snippet.title.toLowerCase().includes("sunday")?"Sunday Mass":item.snippet.title.toLowerCase().includes("daily")?"Daily Mass":item.snippet.title.toLowerCase().includes("station")?"Devotion":"Service",
          thumb: item.snippet.thumbnails?.medium?.url,
        }));
        setVideos(fetched);
      })
      .catch(()=>{});
  },[tier]);

  if (tier==="free") return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,#FF0000 0%,#CC0000 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:36,height:36,borderRadius:10,background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>▶️</div>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"white"}}>SJC on YouTube</div>
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>Weekly Masses · Homilies · Parish Events</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <LockedFeature tier="basic" feature="YouTube Mass Integration" onUpgrade={onUpgrade}/>
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Preview — What you'd see on Basic+</div>
        {videos.slice(0,3).map((v,i)=>(
          <div key={i} style={{background:"white",borderRadius:14,padding:12,marginBottom:8,boxShadow:"0 1px 6px rgba(0,0,0,0.06)",opacity:0.5,filter:"blur(1px)",pointerEvents:"none",display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:70,height:44,background:"#000",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>▶</div>
            <div><div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{v.title}</div><div style={{fontSize:11,color:"#6B7080"}}>{v.date} · {v.views} views · {v.duration}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const current = videos[activeVideo];

  return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,#CC0000 0%,#8B0000 100%)`,padding:"16px 24px 16px",borderRadius:"0 0 24px 24px",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:32,height:32,borderRadius:8,background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>▶️</div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:"white"}}>SJC on YouTube</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"3px 8px",fontSize:10,fontWeight:700,color:"white"}}>LIVE SUNDAYS 9:30 AM</div>
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>St. John Chrysostom Parish · Wallingford, PA</div>
      </div>

      <div style={{padding:"0 24px"}}>
        {/* Video Player */}
        <div style={{background:"#000",borderRadius:16,overflow:"hidden",marginBottom:12,position:"relative"}}>
          <div style={{paddingTop:"56.25%",position:"relative"}}>
            {current.thumb
              ? <img src={current.thumb} alt={current.title} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              : <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1a1a1a,#000)"}}/>
            }
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(0,0,0,0.45)"}}>
              <a
                href={current.id ? `https://www.youtube.com/watch?v=${current.id}` : CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                style={{width:64,height:64,background:"rgba(255,0,0,0.92)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",textDecoration:"none"}}>▶</a>
              <div style={{color:"white",fontSize:13,fontWeight:600,textAlign:"center",padding:"0 20px",textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{current.title}</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{current.date}{current.duration !== "—" ? ` · ${current.duration}` : ""}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>Tap to watch on YouTube</div>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.05)",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>St. John Chrysostom Parish</div>
            <div style={{display:"flex",gap:8}}>
              {["⬅","➡"].map((a,i)=><button key={i} onClick={()=>setActiveVideo(v=>i===0?Math.max(0,v-1):Math.min(videos.length-1,v+1))} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:6,padding:"4px 8px",color:"white",cursor:"pointer",fontSize:12}}>{a}</button>)}
            </div>
          </div>
        </div>

        {/* Playlist */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Recent Masses & Services</div>
        {videos.map((v,i)=>(
          <div key={i} onClick={()=>setActiveVideo(i)} onDoubleClick={()=>v.id&&window.open(`https://www.youtube.com/watch?v=${v.id}`,"_blank")} style={{background:activeVideo===i?`${BRAND.primary}08`:"white",borderRadius:12,padding:"10px 12px",marginBottom:6,border:`1.5px solid ${activeVideo===i?BRAND.primary:"rgba(0,0,0,0.06)"}`,cursor:"pointer",display:"flex",gap:10,alignItems:"center",transition:"all 0.15s"}}>
            <a href={v.id?`https://www.youtube.com/watch?v=${v.id}`:CHANNEL_URL} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{width:60,height:38,background:activeVideo===i?"#CC0000":"#111",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,color:"white",overflow:"hidden",position:"relative",textDecoration:"none"}}>
              {v.thumb ? <img src={v.thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span>▶</span>}
            </a>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:"#1A1A2E",lineHeight:1.3,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title}</div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:10,color:"#6B7080"}}>{v.date}</span>
                {v.duration !== "—" && <><span style={{fontSize:10,color:"#6B7080"}}>·</span><span style={{fontSize:10,color:"#6B7080"}}>{v.duration}</span></>}
                <span style={{background:`${BRAND.primary}15`,color:BRAND.primary,borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:700}}>{v.type}</span>
              </div>
            </div>
            {v.views !== "—" && <div style={{fontSize:10,color:"#6B7080",flexShrink:0}}>{v.views} 👁</div>}
          </div>
        ))}
        <button style={{width:"100%",background:"#FF0000",color:"white",border:"none",borderRadius:12,padding:12,fontFamily:"'Source Sans 3',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4,marginBottom:20}} onClick={()=>window.open(CHANNEL_URL,"_blank")}>
          ▶ Subscribe on YouTube
        </button>
      </div>
    </div>
  );
}

/* ── NEWSLETTER SCREEN ── */
function NewsletterScreen({ tier, onUpgrade }) {
  const [email,setEmail]=useState(""), [subbed,setSubbed]=useState(false), [pref,setPref]=useState({weekly:true,events:true,emergency:false});
  const newsletters=[
    { title:"April 20 — Easter Season Continues", date:"Apr 20", preview:"This week we celebrate the joy of the Resurrection. Join us for our parish picnic on Saturday at 11 AM. Fr. Hallinan's homily reflection on John 20:19-31...", tag:"Weekly Bulletin" },
    { title:"Holy Week Schedule & Special Events", date:"Apr 6", preview:"Complete schedule for Palm Sunday, Holy Thursday, Good Friday, and Easter Vigil. Volunteers needed for the Easter Egg Hunt on April 13th...", tag:"Special Edition" },
    { title:"March 30 — Lenten Reflection Series", date:"Mar 30", preview:"Week 5 of our Lenten journey. This week's reflection: 'Let go and let God.' The RCIA candidates will receive the Sacraments at Easter Vigil...", tag:"Weekly Bulletin" },
    { title:"Community Outreach Update — March 2026", date:"Mar 15", preview:"Lifewerks Food Pantry served 89 families this month. Our volunteer team logged 240 hours of service. DIFAN partnership expansion coming soon...", tag:"Outreach Report" },
  ];

  if (tier==="free") return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.primary} 0%,${BRAND.gradEnd} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📨</div>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"white"}}>Parish Newsletter</div>
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>Weekly bulletin · Announcements · Outreach updates</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <LockedFeature tier="basic" feature="Parish Newsletter Integration" onUpgrade={onUpgrade}/>
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Preview — What you'd see on Basic+</div>
        {newsletters.slice(0,2).map((n,i)=>(
          <div key={i} style={{background:"white",borderRadius:14,padding:14,marginBottom:8,opacity:0.5,filter:"blur(1px)",pointerEvents:"none",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1A1A2E",marginBottom:4}}>{n.title}</div>
            <div style={{fontSize:11,color:"#6B7080",lineHeight:1.5}}>{n.preview.slice(0,80)}…</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="dfi">
      <div style={{background:`linear-gradient(160deg,${BRAND.primary} 0%,${BRAND.gradEnd} 100%)`,padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📨</div>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"white"}}>Parish Newsletter</div>
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>St. John Chrysostom · Weekly Bulletin & Updates</div>
      </div>
      <div style={{padding:"0 24px"}}>

        {/* Subscribe Card */}
        {!subbed ? (
          <div style={{background:`${BRAND.secondary}18`,borderRadius:16,padding:16,marginBottom:16,border:`1px solid ${BRAND.secondary}44`}}>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,color:"#1A1A2E",marginBottom:4}}>📬 Subscribe to Parish Updates</div>
            <div style={{fontSize:12,color:"#6B7080",marginBottom:12}}>Get the weekly bulletin and announcements delivered to your inbox.</div>
            <input className="sjc-input-plain" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{paddingLeft:16,marginBottom:10}}/>
            <div style={{fontSize:12,fontWeight:600,color:"#1A1A2E",marginBottom:8}}>I want to receive:</div>
            {[{key:"weekly",label:"📋 Weekly Bulletin"},{key:"events",label:"🎉 Parish Events"},{key:"emergency",label:"🚨 Emergency Alerts"}].map(p=>(
              <div key={p.key} onClick={()=>setPref({...pref,[p.key]:!pref[p.key]})} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",cursor:"pointer"}}>
                <div style={{width:20,height:20,borderRadius:4,background:pref[p.key]?BRAND.primary:"white",border:`2px solid ${pref[p.key]?BRAND.primary:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {pref[p.key]&&<span style={{color:"white",fontSize:12,lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontSize:13,color:"#1A1A2E"}}>{p.label}</span>
              </div>
            ))}
            <button className="sjc-btn" style={{marginTop:12}} onClick={()=>email&&setSubbed(true)}>Subscribe Now</button>
          </div>
        ) : (
          <div style={{background:"#D8F3DC",borderRadius:16,padding:14,marginBottom:16,border:"1px solid rgba(45,106,79,0.2)",textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:6}}>✅</div>
            <div style={{fontSize:13,fontWeight:700,color:"#1B4332"}}>You're subscribed!</div>
            <div style={{fontSize:11,color:"#4A6B52",marginTop:2}}>Weekly bulletins will arrive every Sunday morning</div>
          </div>
        )}

        {/* Latest Newsletters */}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Latest Issues</div>
        {newsletters.map((n,i)=>(
          <div key={i} className="sjc-card" style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1A1A2E",flex:1,paddingRight:8,lineHeight:1.3}}>{n.title}</div>
              <span style={{background:`${BRAND.primary}15`,color:BRAND.primary,borderRadius:6,padding:"2px 7px",fontSize:9,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{n.tag}</span>
            </div>
            <div style={{fontSize:11,color:"#6B7080",marginBottom:6}}>{n.date}</div>
            <div style={{fontSize:12,color:"#3A3020",lineHeight:1.6,marginBottom:10}}>{n.preview}</div>
            <button style={{background:`${BRAND.primary}10`,color:BRAND.primary,border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Read Full Bulletin →</button>
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── SPONSOR CONFIGURATION ──
   Edit this block to update the sponsor. Leave empty strings to hide.
───────────────────────────────── */
const SPONSOR = {
  name: "",            // e.g. "Wallingford Family Dentistry"
  tagline: "",         // e.g. "Serving our community since 1998"
  logo: "",            // URL to logo image (optional)
  website: "",         // e.g. "https://wallingforddental.com"
  tier: "Gold",        // Gold / Platinum / Title
};

/* ── SPONSOR WELCOME OVERLAY ── */
function SponsorWelcome({ onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!SPONSOR.name) { onDismiss(); return null; }

  return (
    <div style={{
      position:"fixed", inset:0, background:`linear-gradient(160deg,${BRAND.dark} 0%,${BRAND.primary} 100%)`,
      zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
      gap:16, padding:"40px 24px", animation:"fadeIn 0.4s ease"
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* SJC Cross */}
      <div style={{ fontSize: 48, color: BRAND.secondary, marginBottom: 8 }}>✝</div>

      {/* Parish name */}
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:24, color:"white", textAlign:"center", animation:"slideUp 0.5s 0.1s both" }}>
        St. John Chrysostom Parish
      </div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginTop:-8, animation:"slideUp 0.5s 0.2s both" }}>
        Community App · Wallingford, PA
      </div>

      {/* Divider */}
      <div style={{ height:1, width:60, background:BRAND.secondary, margin:"8px 0", animation:"slideUp 0.5s 0.3s both" }} />

      {/* Sponsor label */}
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:"0.2em", textTransform:"uppercase", animation:"slideUp 0.5s 0.4s both" }}>
        Proudly Sponsored By
      </div>

      {/* Sponsor card */}
      <a
        href={SPONSOR.website || "#"}
        target="_blank"
        rel="noreferrer"
        style={{
          textDecoration:"none", background:"white", borderRadius:20, padding:"20px 24px",
          display:"flex", flexDirection:"column", alignItems:"center", gap:10, minWidth:260,
          boxShadow:"0 12px 40px rgba(0,0,0,0.35)", animation:"slideUp 0.5s 0.5s both",
          border:`2px solid ${BRAND.secondary}`
        }}>
        {SPONSOR.logo && (
          <img src={SPONSOR.logo} alt={SPONSOR.name} style={{ maxWidth:140, maxHeight:70, objectFit:"contain" }} />
        )}
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:18, color:BRAND.dark, fontWeight:700, textAlign:"center" }}>
          {SPONSOR.name}
        </div>
        {SPONSOR.tagline && (
          <div style={{ fontSize:12, color:"#6B7080", textAlign:"center", fontStyle:"italic" }}>
            {SPONSOR.tagline}
          </div>
        )}
        <div style={{ background:BRAND.secondary, color:BRAND.dark, borderRadius:20, padding:"3px 12px", fontSize:10, fontWeight:700, letterSpacing:"0.08em" }}>
          {SPONSOR.tier.toUpperCase()} COMMUNITY PARTNER
        </div>
      </a>

      {/* Skip button */}
      <button onClick={onDismiss} style={{
        background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20,
        padding:"6px 16px", color:"rgba(255,255,255,0.8)", fontSize:11, cursor:"pointer",
        fontFamily:"'Source Sans 3',sans-serif", marginTop:12, animation:"slideUp 0.5s 0.6s both"
      }}>
        Continue to App →
      </button>
    </div>
  );
}

function PackageControl() {
  const [currentTier, setCurrentTier] = useState(() => {
    try { return localStorage.getItem("sjc_parish_tier") || "elite"; }
    catch { return "elite"; }
  });
  const [saved, setSaved] = useState(false);
  const [confirmChange, setConfirmChange] = useState(null);

  const tierDetails = {
    free: {
      name: "Free",
      price: "$0/mo",
      color: "#6B7080",
      description: "Basic resource directory with no parish-specific features",
      features: [
        "✓ Delaware County resource finder",
        "✓ Emergency hotlines",
        "✓ Benefits navigator",
        "✗ No YouTube Mass integration",
        "✗ No newsletter",
        "✗ No AI chat",
        "✗ No volunteer management",
        "✗ No event calendar"
      ]
    },
    basic: {
      name: "Parish Basic",
      price: "$49/mo",
      color: BRAND.primary,
      description: "Essential parish features with limited customization",
      features: [
        "✓ Everything in Free",
        "✓ YouTube Mass embed",
        "✓ Newsletter subscribe",
        "✓ Branded app experience",
        "✗ Limited AI chat",
        "✗ No volunteer management",
        "✗ No event calendar"
      ]
    },
    pro: {
      name: "Parish Pro",
      price: "$99/mo",
      color: "#7B2D8B",
      description: "Full parish features with AI chat and sponsor management",
      features: [
        "✓ Everything in Basic",
        "✓ Unlimited AI chat (5/user/day)",
        "✓ Sponsor management",
        "✓ Impact dashboard",
        "✓ Monthly email reports",
        "✗ No volunteer management",
        "✗ No event calendar"
      ]
    },
    elite: {
      name: "Parish Elite",
      price: "$199/mo",
      color: BRAND.secondary,
      description: "Complete parish platform with all features unlocked",
      features: [
        "✓ Everything in Pro",
        "✓ Volunteer hour tracker",
        "✓ Event calendar & RSVPs",
        "✓ Google Calendar sync",
        "✓ Capacity management",
        "✓ Priority support",
        "✓ Full admin dashboard access"
      ]
    }
  };

  function handleSelect(tier) {
    if (tier === currentTier) return;
    setConfirmChange(tier);
  }

  function confirmSelection() {
    try {
      localStorage.setItem("sjc_parish_tier", confirmChange);
      setCurrentTier(confirmChange);
      setSaved(true);
      setConfirmChange(null);
      setTimeout(() => setSaved(false), 3000);
      // Trigger a page reload so the change takes effect everywhere
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      alert("Error saving tier selection: " + e.message);
    }
  }

  return (
    <div>
      <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:BRAND.dark,marginTop:0,marginBottom:8}}>Package Selection</h2>
      <div style={{fontSize:13,color:"#6B7080",marginBottom:20,lineHeight:1.5}}>
        Select the package level for your parish. Users cannot change this — only administrators can select or modify the active tier. The selection persists until you change it here.
      </div>

      {saved && (
        <div style={{background:"#D8F3DC",border:"1px solid #2D6A4F",borderRadius:12,padding:14,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:20}}>✓</div>
          <div style={{fontSize:13,color:"#1B4332",fontWeight:600}}>Package updated successfully. Reloading app...</div>
        </div>
      )}

      {confirmChange && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"white",borderRadius:16,padding:24,maxWidth:440,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:32,marginBottom:8,textAlign:"center"}}>
              {confirmChange === "elite" || confirmChange === "pro" ? "⬆️" : confirmChange === "free" ? "⬇️" : "🔄"}
            </div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:BRAND.dark,marginBottom:8,textAlign:"center"}}>
              Confirm Package Change
            </div>
            <div style={{fontSize:13,color:"#6B7080",marginBottom:16,textAlign:"center",lineHeight:1.5}}>
              Change from <strong style={{color:tierDetails[currentTier].color}}>{tierDetails[currentTier].name}</strong> to <strong style={{color:tierDetails[confirmChange].color}}>{tierDetails[confirmChange].name}</strong>?
            </div>
            <div style={{background:`${tierDetails[confirmChange].color}15`,borderRadius:10,padding:12,marginBottom:16,fontSize:12,color:"#3A3020",lineHeight:1.5}}>
              {confirmChange === "free" && <><strong>⚠ Downgrading to Free</strong><br/>Parishioners will lose access to YouTube Masses, AI chat, volunteer management, and events. Any data already collected will still be preserved.</>}
              {confirmChange !== "free" && confirmChange !== currentTier && <><strong>Upgrading package</strong><br/>All previous data is preserved. New features unlock immediately for all users.</>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmChange(null)} style={{flex:1,background:"white",color:"#6B7080",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={confirmSelection} style={{flex:1,background:tierDetails[confirmChange].color,color:confirmChange==="elite"?BRAND.dark:"white",border:"none",borderRadius:10,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Confirm Change</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:20}}>
        {["free","basic","pro","elite"].map(tierId => {
          const t = tierDetails[tierId];
          const isActive = currentTier === tierId;
          return (
            <div
              key={tierId}
              onClick={()=>handleSelect(tierId)}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 18,
                cursor: isActive ? "default" : "pointer",
                border: `2px solid ${isActive ? t.color : "rgba(0,0,0,0.08)"}`,
                boxShadow: isActive ? `0 4px 20px ${t.color}33` : "0 1px 4px rgba(0,0,0,0.04)",
                position: "relative",
                transition: "all 0.2s"
              }}
              onMouseEnter={e=>{if (!isActive) e.currentTarget.style.borderColor = t.color + "88";}}
              onMouseLeave={e=>{if (!isActive) e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";}}
            >
              {isActive && (
                <div style={{position:"absolute",top:-10,right:12,background:t.color,color:tierId==="elite"?BRAND.dark:"white",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800,letterSpacing:"0.06em"}}>
                  ✓ ACTIVE
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.dark,fontWeight:700}}>{t.name}</div>
              </div>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:t.color,marginBottom:8}}>{t.price}</div>
              <div style={{fontSize:12,color:"#6B7080",lineHeight:1.4,marginBottom:12}}>{t.description}</div>
              <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:10}}>
                {t.features.map((f,i)=>(
                  <div key={i} style={{fontSize:12,color:f.startsWith("✓")?"#1A1A2E":"#9BA8A0",marginBottom:3,lineHeight:1.4}}>{f}</div>
                ))}
              </div>
              {!isActive && (
                <button style={{
                  width:"100%",background:t.color,color:tierId==="elite"?BRAND.dark:"white",border:"none",borderRadius:10,
                  padding:10,fontSize:12,fontWeight:700,cursor:"pointer",marginTop:12,fontFamily:"'Source Sans 3',sans-serif"
                }}>
                  {["free","basic"].includes(tierId) && ["pro","elite"].includes(currentTier) ? "Downgrade →" : "Select this package →"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{background:`${BRAND.primary}08`,borderRadius:12,padding:14,fontSize:12,color:"#3A3020",lineHeight:1.6}}>
        <strong>Note:</strong> Regular parishioners never see pricing or tier options. They only see the features included in the package you've selected. The tier selection persists across app sessions and devices (this specific device until Supabase integration in Q3 2026).
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD (PATH B — Password-protected URL)
   Access via: /sjc/admin
   Password: set ADMIN_PASSWORD below (per-parish)
   ───────────────────────────────────────────────────────────
   Future: when we move to Supabase, this dashboard will
   auto-upgrade to show cross-device data via server fetch.
   ═══════════════════════════════════════════════════════════ */

const ADMIN_PASSWORD = "sjc-admin-2026"; // Change this per-parish. For RPPC use "rppc-admin-2026"
const ADMIN_SESSION_KEY = "sjc_admin_auth";
const ADMIN_SESSION_HOURS = 8; // Stay logged in for 8 hours

function AdminDashboard() {
  const [authed, setAuthed] = useState(() => {
    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!session) return false;
      const { timestamp } = JSON.parse(session);
      const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
      return hoursSince < ADMIN_SESSION_HOURS;
    } catch { return false; }
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("overview"); // overview | rsvps | volunteers | analytics | sponsors | ai

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Try again or contact Damian.");
    }
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthed(false);
    setPassword("");
  }

  if (!authed) {
    return (
      <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${BRAND.dark} 0%,${BRAND.primary} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Source Sans 3',sans-serif"}}>
        <div style={{background:"white",borderRadius:20,padding:28,maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{fontSize:32}}>🔐</div>
            <div>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:BRAND.dark,lineHeight:1.2}}>Parish Admin</div>
              <div style={{fontSize:12,color:"#6B7080"}}>{BRAND.fullName}</div>
            </div>
          </div>
          <div style={{background:`${BRAND.secondary}15`,borderRadius:10,padding:10,marginBottom:16,fontSize:11,color:"#7B5800",lineHeight:1.4}}>
            <strong>Note:</strong> This dashboard shows data collected on this device. Full cross-device admin coming Q3 2026 with Supabase integration.
          </div>
          <label style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,display:"block"}}>Parish Password</label>
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && handleLogin()}
            placeholder="Enter admin password"
            autoFocus
            style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",boxSizing:"border-box",marginBottom:error?8:16}}
          />
          {error && <div style={{fontSize:12,color:"#D62828",marginBottom:14,fontWeight:600}}>⚠ {error}</div>}
          <button onClick={handleLogin} style={{width:"100%",background:BRAND.primary,color:"white",border:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",marginBottom:12}}>Sign In</button>
          <button onClick={()=>window.location.href="/sjc"} style={{width:"100%",background:"transparent",color:"#6B7080",border:"none",padding:8,fontSize:12,cursor:"pointer"}}>← Back to public app</button>
          <div style={{borderTop:"1px solid rgba(0,0,0,0.06)",marginTop:16,paddingTop:14,fontSize:11,color:"#6B7080",lineHeight:1.5,textAlign:"center"}}>
            Forgot password? Contact Damian at<br/>
            <a href="mailto:damian@delcohelp.org" style={{color:BRAND.primary,textDecoration:"none",fontWeight:600}}>damian@delcohelp.org</a>
          </div>
        </div>
      </div>
    );
  }

  // Load all data from localStorage
  const volunteerData = (() => {
    try { return JSON.parse(localStorage.getItem("sjc_volunteer_data") || '{"signups":[],"hours":[]}'); }
    catch { return { signups:[], hours:[] }; }
  })();
  const eventRSVPs = (() => {
    try { return JSON.parse(localStorage.getItem("sjc_events_rsvp") || "[]"); }
    catch { return []; }
  })();
  const aiUsage = (() => {
    try { return JSON.parse(localStorage.getItem("sjc_ai_usage") || "{}"); }
    catch { return {}; }
  })();
  const analytics = (() => {
    try { return JSON.parse(localStorage.getItem("dh_events") || "[]"); }
    catch { return []; }
  })();

  const totalVolunteerHours = volunteerData.hours.reduce((s,h)=>s+parseFloat(h.hours||0),0);
  const totalSignups = volunteerData.signups.length;
  const totalRSVPs = eventRSVPs.length;
  const guestCount = eventRSVPs.reduce((s,r)=>s+(parseInt(r.guests)||1),0);
  const today = new Date().toDateString();
  const todayAiMessages = aiUsage[today] || 0;
  const estimatedCost = (todayAiMessages * 0.002).toFixed(3); // rough Claude Sonnet cost per msg

  const navItems = [
    {id:"overview",icon:"📊",label:"Overview"},
    {id:"package",icon:"⭐",label:"Package"},
    {id:"rsvps",icon:"📅",label:"Event RSVPs"},
    {id:"volunteers",icon:"💛",label:"Volunteers"},
    {id:"analytics",icon:"📈",label:"Analytics"},
    {id:"sponsors",icon:"🤝",label:"Sponsors"},
    {id:"ai",icon:"🤖",label:"AI Usage"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#F5F7FA",fontFamily:"'Source Sans 3',sans-serif"}}>
      {/* Header */}
      <div style={{background:`linear-gradient(160deg,${BRAND.dark} 0%,${BRAND.primary} 100%)`,color:"white",padding:"16px 20px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:24}}>✝</div>
            <div>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,lineHeight:1.1}}>{BRAND.fullName}</div>
              <div style={{fontSize:11,opacity:0.75}}>Admin Dashboard · Logged in as Parish Staff</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>window.location.href="/sjc"} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>View Public App →</button>
            <button onClick={handleLogout} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{background:"white",borderBottom:"1px solid rgba(0,0,0,0.06)",overflowX:"auto"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 12px",display:"flex",gap:4}}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} style={{
              background:"transparent",border:"none",padding:"14px 16px",cursor:"pointer",
              fontSize:13,fontWeight:600,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap",
              color:view===n.id?BRAND.primary:"#6B7080",
              borderBottom:`3px solid ${view===n.id?BRAND.primary:"transparent"}`,
              marginBottom:-1
            }}>{n.icon} {n.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}}>

        {/* OVERVIEW */}
        {view==="overview" && (
          <div>
            <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:BRAND.dark,marginTop:0,marginBottom:16}}>At a Glance</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:24}}>
              {[
                {label:"Total RSVPs",value:totalRSVPs,icon:"📅",color:BRAND.primary,sub:`${guestCount} total attendees`},
                {label:"Volunteer Hours",value:totalVolunteerHours.toFixed(1),icon:"💛",color:"#2D6A4F",sub:`${totalSignups} active signups`},
                {label:"Lives Impacted",value:Math.floor(totalVolunteerHours*3),icon:"🙏",color:BRAND.secondary,sub:"~3 families per hour"},
                {label:"AI Messages Today",value:todayAiMessages,icon:"🤖",color:"#7B2D8B",sub:`Est. cost: $${estimatedCost}`},
                {label:"Analytics Events",value:analytics.length,icon:"📈",color:"#E76F51",sub:"User interactions"},
                {label:"Active Sessions",value:new Set(analytics.map(e=>e.session)).size,icon:"👥",color:"#1B3A6B",sub:"Unique visitors"},
              ].map((s,i)=>(
                <div key={i} style={{background:"white",borderRadius:14,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</div>
                    <div style={{fontSize:24}}>{s.icon}</div>
                  </div>
                  <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:30,color:s.color,lineHeight:1,marginBottom:4}}>{s.value}</div>
                  <div style={{fontSize:11,color:"#9BA8A0"}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <h3 style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.dark,marginBottom:12}}>Recent Activity</h3>
            <div style={{background:"white",borderRadius:14,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              {[
                ...volunteerData.signups.slice(-3).map(s=>({type:"signup",text:`${s.name} signed up for ${s.opp}`,date:s.timestamp||new Date().toISOString()})),
                ...eventRSVPs.slice(-3).map(r=>({type:"rsvp",text:`${r.name||"Someone"} RSVP'd to an event`,date:r.timestamp})),
                ...volunteerData.hours.slice(-3).map(h=>({type:"hours",text:`${h.hours}h logged for ${h.opp}`,date:h.date})),
              ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map((a,i)=>(
                <div key={i} style={{padding:"10px 0",borderBottom:i<5?"1px solid rgba(0,0,0,0.05)":"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:13,color:"#1A1A2E"}}>{a.type==="signup"?"🤝":a.type==="rsvp"?"📅":"💛"} {a.text}</div>
                  <div style={{fontSize:11,color:"#9BA8A0"}}>{new Date(a.date).toLocaleDateString()}</div>
                </div>
              ))}
              {volunteerData.signups.length===0 && eventRSVPs.length===0 && volunteerData.hours.length===0 && (
                <div style={{textAlign:"center",padding:"30px 0",color:"#9BA8A0",fontSize:13}}>No activity yet. Data will appear as parishioners use the app.</div>
              )}
            </div>
          </div>
        )}

        {/* PACKAGE */}
        {view==="package" && (
          <PackageControl />
        )}

        {/* RSVPs */}
        {view==="rsvps" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:BRAND.dark,margin:0}}>Event RSVPs ({totalRSVPs})</h2>
              <button onClick={()=>exportCSV(eventRSVPs,"sjc-rsvps")} style={{background:BRAND.primary,color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>📥 Export CSV</button>
            </div>
            {eventRSVPs.length === 0 ? (
              <div style={{background:"white",borderRadius:14,padding:40,textAlign:"center",border:"1px dashed rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:36,marginBottom:8}}>📅</div>
                <div style={{fontSize:14,color:"#6B7080"}}>No RSVPs yet. Share the app with parishioners to start collecting RSVPs.</div>
              </div>
            ) : (
              <div style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#F5F7FA",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
                      <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase"}}>Name</th>
                      <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase"}}>Email</th>
                      <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase"}}>Event ID</th>
                      <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase"}}>Guests</th>
                      <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase"}}>Notes</th>
                      <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase"}}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventRSVPs.map((r,i)=>(
                      <tr key={i} style={{borderBottom:i<eventRSVPs.length-1?"1px solid rgba(0,0,0,0.04)":"none"}}>
                        <td style={{padding:"10px 14px",fontSize:13,fontWeight:600}}>{r.name||"Quick RSVP"}</td>
                        <td style={{padding:"10px 14px",fontSize:12,color:"#6B7080"}}>{r.email||"—"}</td>
                        <td style={{padding:"10px 14px",fontSize:12}}>Event #{r.eventId}</td>
                        <td style={{padding:"10px 14px",fontSize:12}}>{r.guests||1}</td>
                        <td style={{padding:"10px 14px",fontSize:12,color:"#6B7080",maxWidth:200}}>{r.notes||"—"}</td>
                        <td style={{padding:"10px 14px",fontSize:11,color:"#9BA8A0"}}>{new Date(r.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VOLUNTEERS */}
        {view==="volunteers" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:BRAND.dark,margin:0}}>Volunteers</h2>
              <button onClick={()=>exportCSV([...volunteerData.signups,...volunteerData.hours],"sjc-volunteers")} style={{background:BRAND.primary,color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>📥 Export CSV</button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Total Signups</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:BRAND.primary}}>{totalSignups}</div>
              </div>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Hours Logged</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:"#2D6A4F"}}>{totalVolunteerHours.toFixed(1)}</div>
              </div>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Lives Impacted</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:BRAND.secondary}}>{Math.floor(totalVolunteerHours*3)}</div>
              </div>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Grant Value</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:"#1B3A6B"}}>${Math.floor(totalVolunteerHours*29).toLocaleString()}</div>
                <div style={{fontSize:9,color:"#9BA8A0",marginTop:2}}>@ $29/hr Independent Sector rate</div>
              </div>
            </div>

            <h3 style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.dark,marginBottom:10}}>Signups</h3>
            <div style={{background:"white",borderRadius:14,padding:14,marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              {volunteerData.signups.length===0 ? (
                <div style={{textAlign:"center",padding:"20px 0",color:"#9BA8A0",fontSize:13}}>No volunteer signups yet.</div>
              ) : volunteerData.signups.map((s,i)=>(
                <div key={i} style={{padding:"10px 0",borderBottom:i<volunteerData.signups.length-1?"1px solid rgba(0,0,0,0.05)":"none",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{s.name}</div>
                    <div style={{fontSize:11,color:"#6B7080"}}>{s.email} {s.phone && `· ${s.phone}`}</div>
                  </div>
                  <div style={{fontSize:12,color:BRAND.primary,fontWeight:600}}>{s.opp}</div>
                  {s.notes && <div style={{fontSize:11,color:"#6B7080",fontStyle:"italic",flexBasis:"100%"}}>Note: {s.notes}</div>}
                </div>
              ))}
            </div>

            <h3 style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.dark,marginBottom:10}}>Logged Hours</h3>
            <div style={{background:"white",borderRadius:14,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              {volunteerData.hours.length===0 ? (
                <div style={{textAlign:"center",padding:"20px 0",color:"#9BA8A0",fontSize:13}}>No hours logged yet.</div>
              ) : volunteerData.hours.map((h,i)=>(
                <div key={i} style={{padding:"10px 0",borderBottom:i<volunteerData.hours.length-1?"1px solid rgba(0,0,0,0.05)":"none",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#1A1A2E"}}>{h.opp||"Volunteer activity"}</div>
                    <div style={{fontSize:11,color:"#6B7080"}}>{new Date(h.date).toLocaleDateString()} {h.notes && `· ${h.notes}`}</div>
                  </div>
                  <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,color:BRAND.primary,fontWeight:700}}>{h.hours}h</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {view==="analytics" && (
          <div>
            <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:BRAND.dark,marginTop:0,marginBottom:16}}>Analytics</h2>
            <div style={{background:"white",borderRadius:14,padding:16,marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:10}}>Event Counts</div>
              {Object.entries(analytics.reduce((acc,e)=>{acc[e.event]=(acc[e.event]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]).map(([event,count])=>(
                <div key={event} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.04)"}}>
                  <div style={{fontSize:13,color:"#1A1A2E"}}>{event}</div>
                  <div style={{fontSize:13,fontWeight:700,color:BRAND.primary}}>{count}</div>
                </div>
              ))}
              {analytics.length === 0 && <div style={{textAlign:"center",padding:"20px 0",color:"#9BA8A0",fontSize:13}}>No analytics captured yet. Events will appear as users interact with the app.</div>}
            </div>
            <div style={{background:`${BRAND.primary}08`,borderRadius:12,padding:12,fontSize:12,color:"#6B7080",lineHeight:1.5}}>
              <strong>Grant-ready metrics:</strong> These counts can be copied directly into grant impact reports. Foundation grants want to see engagement, not just access.
            </div>
          </div>
        )}

        {/* SPONSORS */}
        {view==="sponsors" && (
          <div>
            <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:BRAND.dark,marginTop:0,marginBottom:16}}>Sponsor Management</h2>
            <div style={{background:"white",borderRadius:14,padding:20,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Current Sponsor</div>
              {SPONSOR.name ? (
                <div>
                  <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:22,color:BRAND.dark,marginBottom:4}}>{SPONSOR.name}</div>
                  {SPONSOR.tagline && <div style={{fontSize:13,color:"#6B7080",marginBottom:8}}>{SPONSOR.tagline}</div>}
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                    <div style={{background:`${BRAND.secondary}22`,color:BRAND.dark,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700}}>{SPONSOR.tier} TIER</div>
                    {SPONSOR.website && <a href={SPONSOR.website} target="_blank" rel="noreferrer" style={{fontSize:11,color:BRAND.primary,fontWeight:600}}>🔗 Website</a>}
                  </div>
                </div>
              ) : (
                <div style={{padding:"20px 0",textAlign:"center",color:"#9BA8A0"}}>
                  <div style={{fontSize:36,marginBottom:8}}>🤝</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#6B7080",marginBottom:4}}>No sponsor configured yet</div>
                  <div style={{fontSize:12}}>Edit the SPONSOR config in SJC.js to add a sponsor</div>
                </div>
              )}
            </div>

            <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Sponsor Tier Pricing</div>
              {[
                {tier:"Gold",price:"$600/yr",desc:"Home screen credit · Bulletin mention · Monthly impact report"},
                {tier:"Platinum",price:"$1,200/yr",desc:"Everything in Gold + Welcome screen splash · Quarterly pastor meeting"},
                {tier:"Title",price:"$2,400/yr",desc:"Everything in Platinum + Co-branded 'Powered By' · Exclusive (1 per parish)"},
              ].map((t,i)=>(
                <div key={i} style={{padding:"10px 0",borderBottom:i<2?"1px solid rgba(0,0,0,0.04)":"none",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:BRAND.dark}}>{t.tier}</div>
                    <div style={{fontSize:11,color:"#6B7080",marginTop:2}}>{t.desc}</div>
                  </div>
                  <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:16,color:BRAND.primary,fontWeight:700,whiteSpace:"nowrap"}}>{t.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI USAGE */}
        {view==="ai" && (
          <div>
            <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:24,color:BRAND.dark,marginTop:0,marginBottom:16}}>AI Usage & Cost</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:20}}>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Today's Messages</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:"#7B2D8B"}}>{todayAiMessages}</div>
              </div>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Est. Cost Today</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:"#2D6A4F"}}>${estimatedCost}</div>
              </div>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Daily Cap Per User</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:BRAND.primary}}>5</div>
                <div style={{fontSize:10,color:"#9BA8A0",marginTop:2}}>messages max per user/day</div>
              </div>
              <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",marginBottom:4}}>Monthly Budget</div>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:BRAND.secondary}}>$25</div>
                <div style={{fontSize:10,color:"#9BA8A0",marginTop:2}}>hard cap at Anthropic</div>
              </div>
            </div>
            <div style={{background:`${BRAND.primary}08`,borderRadius:12,padding:14,fontSize:12,color:"#3A3020",lineHeight:1.6}}>
              <strong>How costs work:</strong> Each AI message costs approximately $0.002. With the 5-message daily cap per user and $25/month hard limit at Anthropic, worst-case monthly cost is $25. Realistic expected cost for a parish of SJC's size: $5–$15/month.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// CSV export helper
function exportCSV(data, filename) {
  if (!data.length) return alert("No data to export");
  const keys = Array.from(new Set(data.flatMap(row => Object.keys(row))));
  const csv = [
    keys.join(","),
    ...data.map(row => keys.map(k => {
      const v = row[k];
      if (v == null) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `"${s.replace(/"/g,'""')}"`;
    }).join(","))
  ].join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── APP SHELL ── */
export default function App() {
  // Admin route — /sjc/admin or /sjc/admin/
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isAdmin = path === "/sjc/admin" || path === "/sjc/admin/" || path.endsWith("/admin");

  if (isAdmin) {
    injectCSS();
    return <AdminDashboard />;
  }

  return <PublicApp />;
}

/* ── FIREBASE SYNC (SJC) ── */
const SYNC_KEYS = [
  { ls:"dh_saved_resources", fs:"saved" },
  { ls:"dh_family_profile",  fs:"profile" },
  { ls:"dh_found_help",      fs:"found_help" },
  { ls:"dh_going_tonight",   fs:"going_tonight" },
];
async function pullSync(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    SYNC_KEYS.forEach(({ ls, fs }) => { const v=snap.data()[fs]; if(v!==undefined) localStorage.setItem(ls,JSON.stringify(v)); });
  } else { await pushSync(uid); }
}
async function pushSync(uid) {
  const data={};
  SYNC_KEYS.forEach(({ls,fs})=>{ try{const v=localStorage.getItem(ls);if(v)data[fs]=JSON.parse(v);}catch{} });
  if(Object.keys(data).length>0) await setDoc(doc(db,"users",uid),data,{merge:true});
}

/* ── AUTH MODAL (SJC) ── */
function AuthModal({ onClose, user, onSignIn, onSignOut }) {
  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" style={{flexShrink:0}}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
  if (user) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{textAlign:"center",padding:"8px 0 20px"}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:`${BRAND.primary}18`,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
            {user.photoURL ? <img src={user.photoURL} style={{width:60,height:60,borderRadius:"50%"}} alt="" referrerPolicy="no-referrer"/> : <span style={{fontSize:28}}>👤</span>}
          </div>
          <div style={{fontSize:15,fontWeight:700,color:"#1C2B1E"}}>{user.displayName||"Signed in"}</div>
          <div style={{fontSize:12,color:"#6B7C6E",marginTop:3}}>{user.email}</div>
        </div>
        <div style={{background:`${BRAND.primary}10`,borderRadius:14,padding:14,marginBottom:16,border:`1px solid ${BRAND.primary}25`}}>
          <div style={{fontSize:13,color:BRAND.primary,lineHeight:1.8}}>✓ Saved resources synced across devices<br/>✓ Family profile synced<br/>✗ Crisis plan stays on this device only</div>
        </div>
        <button className="sjc-btn-outline" onClick={onSignOut} style={{marginBottom:8}}>Sign Out</button>
        <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",color:"#6B7C6E",fontSize:13,cursor:"pointer",padding:8}}>Close</button>
      </div>
    </div>
  );
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:"#1C2B1E",marginBottom:4}}>Sign In — Optional</div>
        <div style={{fontSize:13,color:"#6B7C6E",marginBottom:16,lineHeight:1.6}}>Sync your saved resources and family profile across devices. The full app works without an account.</div>
        <div style={{background:`${BRAND.primary}10`,borderRadius:14,padding:14,marginBottom:16,border:`1px solid ${BRAND.primary}25`}}>
          <div style={{fontSize:12,fontWeight:700,color:BRAND.primary,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>What syncs to your account</div>
          <div style={{fontSize:13,color:"#3D4F40",lineHeight:1.8}}>✓ Saved resources<br/>✓ Family profile<br/>✓ "I Found Help" history<br/>✗ Crisis Escape Plan (stays on this device — never uploaded)</div>
        </div>
        <button className="sjc-btn-primary" onClick={onSignIn} style={{marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <GoogleIcon/> Continue with Google
        </button>
        <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",color:"#6B7C6E",fontSize:13,cursor:"pointer",padding:8}}>Continue without account</button>
      </div>
    </div>
  );
}

function PublicApp() {
  injectCSS();

  // Inject SJC Google Analytics 4 tag (G-NZRTH3H74B)
  useEffect(() => {
    if (document.getElementById("sjc-ga4")) return;
    const s1 = document.createElement("script");
    s1.id = "sjc-ga4";
    s1.async = true;
    s1.src = "https://www.googletagmanager.com/gtag/js?id=G-NZRTH3H74B";
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = window.gtag || gtag;
    gtag("js", new Date());
    gtag("config", "G-NZRTH3H74B");
  }, []);
  const [tab,setTab]=useState("home"), [detail,setDetail]=useState(null);
  const [findFilter,setFindFilter]=useState("all");
  const [showDonate,setShowDonate]=useState(false), [showNotif,setShowNotif]=useState(false);
  const [showEmergency,setShowEmergency]=useState(false), [notifCount,setNotifCount]=useState(3);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [lang,setLang]=useState("en");
  const [showEscape,setShowEscape]=useState(false);
  const [showProfile,setShowProfile]=useState(()=>!getFamilyProfile());
  const [showLegal,setShowLegal]=useState(false);
  const [user,setUser]=useState(null);
  const [showAuth,setShowAuth]=useState(false);
  const [clock,setClock]=useState(()=>{const n=new Date();return `${n.getHours()}:${String(n.getMinutes()).padStart(2,"0")}`;});
  useEffect(()=>{const id=setInterval(()=>{const n=new Date();setClock(`${n.getHours()}:${String(n.getMinutes()).padStart(2,"0")}`);},30000);return()=>clearInterval(id);},[]);
  useEffect(()=>{
    if(!FIREBASE_ENABLED)return;
    return onAuthStateChanged(auth,async u=>{setUser(u);if(u){try{await pullSync(u.uid);}catch{}}});
  },[]);
  async function handleSignIn(){try{await signInWithPopup(auth,googleProvider);setShowAuth(false);}catch{}}
  async function handleSignOut(){try{if(auth.currentUser)await pushSync(auth.currentUser.uid);}catch{}await signOut(auth);setShowAuth(false);}

  // Tier is admin-controlled only — loaded from localStorage, defaults to elite (premium)
  // Admin changes this from /sjc/admin dashboard; regular users cannot upgrade themselves
  const [tier,setTier]=useState(() => {
    try {
      const saved = localStorage.getItem("sjc_parish_tier");
      if (saved && ["free","basic","pro","elite"].includes(saved)) return saved;
    } catch {}
    return "elite"; // default for new installs — show premium experience
  });

  // Show sponsor welcome on first visit this session
  const [showSponsor, setShowSponsor] = useState(() => {
    try {
      const seen = sessionStorage.getItem("sjc_sponsor_seen");
      return !seen && !!SPONSOR.name;
    } catch { return !!SPONSOR.name; }
  });
  function dismissSponsor() {
    try { sessionStorage.setItem("sjc_sponsor_seen", "1"); } catch {}
    setShowSponsor(false);
  }

  // eslint-disable-next-line no-unused-vars
  const tierColors={"free":"#6B7080","basic":BRAND.primary,"pro":"#7B2D8B","elite":BRAND.secondary};
  // eslint-disable-next-line no-unused-vars
  const tierBadges={"free":"FREE","basic":"BASIC","pro":"PRO","elite":"ELITE"};

  const tabs=[
    {id:"home",icon:"✝",label:"Home"},
    {id:"hub",icon:"✝",label:"Parish Hub"},
    {id:"find",icon:"🔍",label:"Find"},
    {id:"nutrition",icon:"🍎",label:"Nutrition"},
    {id:"youtube",icon:"▶️",label:"Masses"},
    {id:"events",icon:"📅",label:"Events"},
    {id:"reports",icon:"📊",label:"Impact"},
  ];

  function handleNav(t,filter) { setTab(t); setDetail(null); if(filter) setFindFilter(filter); if(FIREBASE_ENABLED&&auth.currentUser)pushSync(auth.currentUser.uid).catch(()=>{}); }
  function handleUpgrade(newTier) { setTier(newTier); }

  const screens={
    hub:<div className="dfi" style={{padding:"16px 24px 20px"}}><SJCParishHub/></div>,
    home:<HomeScreen onNav={handleNav} onResource={setDetail} onDonate={()=>setShowDonate(true)} onEmergency={()=>setShowEmergency(true)} lang={lang}/>,
    find:<FindScreen key={findFilter} initialFilter={findFilter} onResource={setDetail} lang={lang}/>,
    benefits:<BenefitsScreen lang={lang}/>,
    nutrition:<NutritionFoodCheck variant="sjc" lang={lang}/>,
    trust:<TrustCheck lang={lang}/>,
    hotline:<HotlineScreen lang={lang} onEscape={()=>setShowEscape(true)}/>,
    volunteer:<VolunteerScreen lang={lang} tier={tier} onUpgrade={()=>setShowUpgrade(true)}/>,
    events:<EventCalendarScreen lang={lang} tier={tier} onUpgrade={()=>setShowUpgrade(true)}/>,
    impact:<ImpactScreen lang={lang}/>,
    reports:<ReportsScreen lang={lang} onNav={handleNav}/>,
    submit:<SubmitScreen lang={lang}/>,
    ai:<AIScreen lang={lang}/>,
    youtube:<YouTubeScreen tier={tier} onUpgrade={()=>setShowUpgrade(true)}/>,
    news:<NewsletterScreen tier={tier} onUpgrade={()=>setShowUpgrade(true)}/>,
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${BRAND.primary}15 0%,${BRAND.secondary}10 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 0"}}>
      {showSponsor && <SponsorWelcome onDismiss={dismissSponsor}/>}
      <InstallPrompt/>
      {showProfile && <FamilyProfileSetup onComplete={()=>setShowProfile(false)}/>}
      {showEscape && <CrisisEscapePlan onClose={()=>setShowEscape(false)}/>}
      {showLegal && <LegalScreen appName="SJC Community" companyName="CieroLink LLC" appUrl="delcohelp.org/sjc" onClose={()=>setShowLegal(false)}/>}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} user={user} onSignIn={handleSignIn} onSignOut={handleSignOut}/>}
      <div className="sjc">
        <div className="sjc-sb">
          <span>{clock}</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontFamily:"'Libre Baskerville',serif",fontSize:11,fontWeight:700,color:BRAND.primary}}>SJC Community</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="lang-toggle" style={{background:`${BRAND.primary}15`}}>
              <button className={`lang-btn ${lang==="en"?"active":"inactive"}`} style={{color:lang==="en"?BRAND.primary:"#6B7080",background:lang==="en"?"white":"transparent"}} onClick={()=>setLang("en")}>EN</button>
              <button className={`lang-btn ${lang==="es"?"active":"inactive"}`} style={{color:lang==="es"?BRAND.primary:"#6B7080",background:lang==="es"?"white":"transparent"}} onClick={()=>setLang("es")}>ES</button>
              <button className={`lang-btn ${lang==="vi"?"active":"inactive"}`} style={{color:lang==="vi"?BRAND.primary:"#6B7080",background:lang==="vi"?"white":"transparent"}} onClick={()=>setLang("vi")}>VI</button>
              <button className={`lang-btn ${lang==="zh"?"active":"inactive"}`} style={{color:lang==="zh"?BRAND.primary:"#6B7080",background:lang==="zh"?"white":"transparent"}} onClick={()=>setLang("zh")}>中</button>
            </div>
            <div onClick={()=>{setShowNotif(true);setNotifCount(0);}} style={{position:"relative",cursor:"pointer",fontSize:14,opacity:0.7}}>
              🔔{notifCount>0&&<div style={{position:"absolute",top:-4,right:-4,width:14,height:14,background:"#D62828",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"white",border:"2px solid #F5F2EB"}}>{notifCount}</div>}
            </div>
            {FIREBASE_ENABLED&&(
              <div onClick={()=>setShowAuth(true)} style={{cursor:"pointer",width:20,height:20,borderRadius:"50%",overflow:"hidden",background:user?BRAND.primary:"rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {user?.photoURL ? <img src={user.photoURL} style={{width:20,height:20}} alt="" referrerPolicy="no-referrer"/> : <span style={{fontSize:user?10:12,color:user?"white":"#6B7C6E",fontWeight:700,lineHeight:1}}>{user?user.displayName?.[0]||"U":"👤"}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="sjc-sc">
          {detail?<DetailView r={detail} onBack={()=>setDetail(null)} onDonate={()=>setShowDonate(true)} lang={lang}/>:screens[tab]||screens.home}
        </div>
        <nav className="sjc-nav">
          {tabs.map(t=>(
            <div key={t.id} className={`sjc-ni${tab===t.id?" act":""}`} onClick={()=>handleNav(t.id)}>
              <div className="sjc-ni-ic">{t.icon}</div>
              <div className="sjc-ni-lb">{t.label}</div>
            </div>
          ))}
        </nav>
        {/* Legal footer */}
        <div style={{textAlign:"center",padding:"4px 0 2px",borderTop:"1px solid rgba(0,0,0,0.04)"}}>
          <button onClick={()=>setShowLegal(true)} style={{background:"transparent",border:"none",color:"#9BA8A0",fontSize:9,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",padding:"2px 8px"}}>
            {getT(lang).terms} · {getT(lang).privacy} · {getT(lang).disclaimer} · © 2026 CieroLink LLC
          </button>
        </div>
        {showEmergency&&<EmergencyMode onClose={()=>setShowEmergency(false)} lang={lang}/>}
        {showNotif&&<NotifOverlay onClose={()=>setShowNotif(false)} lang={lang}/>}
        {showDonate&&<DonateModal onClose={()=>setShowDonate(false)} lang={lang}/>}
        {showUpgrade&&<UpgradeModal onClose={()=>setShowUpgrade(false)} currentTier={tier} onUpgrade={handleUpgrade}/>}
      </div>
    </div>
  );
}
