/* ═══════════════════════════════════════════════════════════
   DELCOHELP FEATURE MODULES v1
   Drop this file into src/features.js and import what you need.
   Each export is a self-contained React component or utility.
═══════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from "react";

/* ── FEATURE 1: INSTALL PROMPT ── */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(ios);
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("dh_install_dismissed")) return;
    const timer = setTimeout(() => setVisible(true), 30000);
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handler); };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null); setVisible(false);
    localStorage.setItem("dh_install_dismissed", "1");
  }
  function dismiss() { setVisible(false); localStorage.setItem("dh_install_dismissed", "1"); }
  if (!visible) return null;

  return (
    <div style={{ position:"fixed",bottom:80,left:12,right:12,zIndex:9998,background:"white",borderRadius:16,padding:14,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",border:"1px solid rgba(0,0,0,0.06)",animation:"slideUp 0.4s ease",maxWidth:380,margin:"0 auto" }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
        <div style={{ fontSize:28,flexShrink:0 }}>📲</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:4 }}>Add DelcoHelp to your phone</div>
          <div style={{ fontSize:12,color:"#6B7080",lineHeight:1.4,marginBottom:10 }}>
            {isIOS ? `Tap the Share button (↗) below, then "Add to Home Screen" for instant access.` : "Install for faster access, offline support, and notifications when pantries open."}
          </div>
          <div style={{ display:"flex",gap:6 }}>
            {!isIOS && deferredPrompt && (
              <button onClick={install} style={{ background:"#2D6A4F",color:"white",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer" }}>Install App</button>
            )}
            <button onClick={dismiss} style={{ background:"transparent",color:"#6B7080",border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer" }}>Not now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FEATURE 2: PANTRY STATUS ── */
const STATUS_KEY = "dh_pantry_reports";

export function getPantryReports(pantryId) {
  try {
    const all = JSON.parse(localStorage.getItem(STATUS_KEY) || "{}");
    const today = new Date().toDateString();
    return all[pantryId]?.[today] || { open:0, closed:0, lastUpdated:null };
  } catch { return { open:0, closed:0, lastUpdated:null }; }
}

export function reportPantryStatus(pantryId, isOpen) {
  try {
    const all = JSON.parse(localStorage.getItem(STATUS_KEY) || "{}");
    const today = new Date().toDateString();
    if (!all[pantryId]) all[pantryId] = {};
    if (!all[pantryId][today]) all[pantryId][today] = { open:0, closed:0, lastUpdated:null };
    all[pantryId][today][isOpen ? "open" : "closed"]++;
    all[pantryId][today].lastUpdated = new Date().toISOString();
    localStorage.setItem(STATUS_KEY, JSON.stringify(all));
    return all[pantryId][today];
  } catch { return null; }
}

export function PantryStatusWidget({ pantryId }) {
  const [report, setReport] = useState(getPantryReports(pantryId));
  const [submitted, setSubmitted] = useState(false);
  const totalReports = report.open + report.closed;
  const confirmedOpen = report.open > report.closed;

  function submit(isOpen) {
    const updated = reportPantryStatus(pantryId, isOpen);
    setReport(updated); setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div style={{ background:"#F8FAF9",borderRadius:12,padding:12,marginTop:12,border:"1px solid rgba(45,106,79,0.15)" }}>
      <div style={{ fontSize:11,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Community Status · Today</div>
      {totalReports > 0 && (
        <div style={{ marginBottom:10,padding:"6px 10px",background:confirmedOpen?"#D8F3DC":"#FFE5E5",borderRadius:8,fontSize:12,color:confirmedOpen?"#1B4332":"#8B0000",fontWeight:600 }}>
          {confirmedOpen?"✓":"✗"} {totalReports} {totalReports===1?"user":"users"} report {confirmedOpen?"OPEN":"CLOSED"} today
        </div>
      )}
      {submitted ? (
        <div style={{ fontSize:12,color:"#2D6A4F",textAlign:"center",padding:8 }}>✓ Thank you! Your report helps other families.</div>
      ) : (
        <div style={{ display:"flex",gap:6 }}>
          <button onClick={() => submit(true)} style={{ flex:1,background:"#2D6A4F",color:"white",border:"none",borderRadius:8,padding:"8px 4px",fontSize:11,fontWeight:600,cursor:"pointer" }}>✓ Open Today</button>
          <button onClick={() => submit(false)} style={{ flex:1,background:"rgba(214,40,40,0.1)",color:"#D62828",border:"1px solid rgba(214,40,40,0.3)",borderRadius:8,padding:"8px 4px",fontSize:11,fontWeight:600,cursor:"pointer" }}>✗ Closed Today</button>
        </div>
      )}
    </div>
  );
}

/* ── FEATURE 3: ELIGIBILITY QUIZ ── */
export function EligibilityQuiz({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ household:null,income:null,children:null,employment:null,citizen:null });
  const [done, setDone] = useState(false);

  const questions = [
    { key:"household", q:"How many people live in your household?", options:[{label:"1 person",value:1},{label:"2 people",value:2},{label:"3 people",value:3},{label:"4 people",value:4},{label:"5+ people",value:5}] },
    { key:"income", q:"What's your approximate monthly household income?", options:[{label:"Less than $1,500",value:"low"},{label:"$1,500 – $3,000",value:"mid-low"},{label:"$3,000 – $5,000",value:"mid"},{label:"More than $5,000",value:"high"},{label:"I'd rather not say",value:"unknown"}] },
    { key:"children", q:"Do you have children under 5 or are you pregnant?", options:[{label:"Yes",value:true},{label:"No",value:false}] },
    { key:"employment", q:"What's your current work situation?", options:[{label:"Working full-time",value:"full"},{label:"Working part-time",value:"part"},{label:"Unemployed",value:"unemployed"},{label:"Unable to work / disabled",value:"disabled"},{label:"Retired",value:"retired"}] },
    { key:"citizen", q:"Are you a U.S. citizen, green card holder, or qualified immigrant?", options:[{label:"Yes",value:true},{label:"No / Not sure",value:false},{label:"I'd rather not say",value:"unknown"}] },
  ];

  function answer(value) {
    const q = questions[step];
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step < questions.length - 1) setStep(step + 1);
    else setDone(true);
  }

  function calculateEligibility() {
    const { household, income, children, employment, citizen } = answers;
    const results = [];
    const snapIncomeLimit = { 1:1580,2:2137,3:2694,4:3250,5:3807 };
    if ((income==="low"||income==="mid-low") && citizen!==false) {
      results.push({ name:"SNAP (Food Stamps)",emoji:"🥫",likely:true,reason:`Monthly income likely below $${snapIncomeLimit[household]||3807} limit`,link:"https://www.compass.state.pa.us",benefit:"Up to $291/month per person for food" });
    }
    if (children && (income==="low"||income==="mid-low"||income==="mid")) {
      results.push({ name:"WIC (Women, Infants & Children)",emoji:"👶",likely:true,reason:"You have young children or are pregnant",link:"https://www.health.pa.gov/topics/programs/wic",benefit:"Free healthy food, formula, and nutrition support" });
    }
    if (income==="low"||income==="mid-low") {
      results.push({ name:"LIHEAP (Utility Assistance)",emoji:"⚡",likely:true,reason:"Income-qualified households get help with heating bills",link:"https://www.compass.state.pa.us",benefit:"Up to $1,000+ in winter utility assistance" });
    }
    if (income==="low"||income==="mid-low"||employment==="unemployed"||employment==="disabled") {
      results.push({ name:"Medicaid / CHIP",emoji:"🏥",likely:true,reason:"Based on income and employment status",link:"https://www.compass.state.pa.us",benefit:"Free or low-cost healthcare for you and your family" });
    }
    if (children) {
      results.push({ name:"CHIP (Children's Health Insurance)",emoji:"💉",likely:true,reason:"Coverage for children under 19 regardless of income",link:"https://www.chipcoverspakids.com",benefit:"Free or low-cost health coverage for kids" });
    }
    results.push({ name:"Emergency Food Pantry (No Application)",emoji:"🆘",likely:true,reason:"Local pantries serve all regardless of status",link:"#find",benefit:"No paperwork needed — tap Find tab for locations" });
    return results;
  }

  const overlayStyle = { position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center" };
  const sheetStyle = { background:"white",width:"100%",maxWidth:480,borderRadius:"24px 24px 0 0",padding:20 };

  if (done) {
    const results = calculateEligibility();
    return (
      <div style={overlayStyle}>
        <div style={{ ...sheetStyle, maxHeight:"92vh", overflow:"auto" }}>
          <div style={{ width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px" }} />
          <div style={{ fontSize:20,fontWeight:700,color:"#1A1A2E",marginBottom:4 }}>You likely qualify for {results.length} programs</div>
          <div style={{ fontSize:13,color:"#6B7080",marginBottom:16 }}>Based on your answers. Official eligibility is determined at application.</div>
          {results.map((r,i) => (
            <div key={i} style={{ background:"#F8FAF9",borderRadius:14,padding:14,marginBottom:10,border:"1px solid rgba(45,106,79,0.15)" }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                <div style={{ fontSize:28 }}>{r.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15,fontWeight:700,color:"#1A1A2E",marginBottom:2 }}>{r.name}</div>
                  <div style={{ fontSize:12,color:"#2D6A4F",fontWeight:600,marginBottom:4 }}>{r.benefit}</div>
                  <div style={{ fontSize:11,color:"#6B7080",marginBottom:8 }}>Why: {r.reason}</div>
                  <a href={r.link} target={r.link.startsWith("http")?"_blank":"_self"} rel="noreferrer" style={{ display:"inline-block",background:"#2D6A4F",color:"white",textDecoration:"none",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600 }}>Apply →</a>
                </div>
              </div>
            </div>
          ))}
          <button onClick={onClose} style={{ width:"100%",background:"#F0F0F0",color:"#1A1A2E",border:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:600,cursor:"pointer",marginTop:12 }}>Done</button>
        </div>
      </div>
    );
  }

  const q = questions[step];
  return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
        <div style={{ width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px" }} />
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
          <div style={{ fontSize:12,fontWeight:700,color:"#2D6A4F",letterSpacing:"0.08em",textTransform:"uppercase" }}>Quick Eligibility Check</div>
          <div style={{ fontSize:12,color:"#6B7080" }}>Step {step+1} of {questions.length}</div>
        </div>
        <div style={{ height:4,background:"#E2E8F0",borderRadius:2,marginBottom:20,overflow:"hidden" }}>
          <div style={{ height:"100%",background:"#2D6A4F",width:`${((step+1)/questions.length)*100}%`,transition:"width 0.3s" }} />
        </div>
        <div style={{ fontSize:18,fontWeight:700,color:"#1A1A2E",marginBottom:16,lineHeight:1.3 }}>{q.q}</div>
        {q.options.map((opt,i) => (
          <button key={i} onClick={() => answer(opt.value)} style={{ width:"100%",background:"white",color:"#1A1A2E",border:"2px solid rgba(0,0,0,0.08)",borderRadius:12,padding:"14px 16px",fontSize:14,fontWeight:500,cursor:"pointer",marginBottom:8,textAlign:"left" }}>
            {opt.label}
          </button>
        ))}
        <button onClick={onClose} style={{ width:"100%",background:"transparent",color:"#6B7080",border:"none",padding:12,fontSize:13,cursor:"pointer",marginTop:8 }}>Cancel</button>
      </div>
    </div>
  );
}

/* ── FEATURE 4: TRANSIT HELPER ── */
const SEPTA_ROUTES_BY_ZIP = {
  "19086":[{route:"109",type:"Bus",direction:"Chester ↔ Wallingford",fare:"$2.00"},{route:"MBW",type:"Media/Wawa Line",direction:"Center City",fare:"$5.25"}],
  "19063":[{route:"109",type:"Bus",direction:"Chester ↔ Wallingford",fare:"$2.00"},{route:"118",type:"Bus",direction:"Newtown Square",fare:"$2.00"},{route:"MBW",type:"Media/Wawa Line",direction:"Center City",fare:"$5.25"}],
  "19082":[{route:"109",type:"Bus",direction:"Chester ↔ Wallingford",fare:"$2.00"},{route:"MFL",type:"Market-Frankford Line",direction:"69th Street ↔ Center City",fare:"$2.50"}],
  "19013":[{route:"109",type:"Bus",direction:"Chester ↔ Wallingford",fare:"$2.00"},{route:"113",type:"Bus",direction:"Chester ↔ Marcus Hook",fare:"$2.00"}],
  "default":[{route:"109",type:"Bus",direction:"Chester ↔ Wallingford",fare:"$2.00"}],
};

export function TransitHelper({ resourceZip="19086" }) {
  const routes = SEPTA_ROUTES_BY_ZIP[resourceZip] || SEPTA_ROUTES_BY_ZIP.default;
  return (
    <div style={{ background:"#EEF4FB",borderRadius:12,padding:12,marginTop:12,border:"1px solid rgba(27,58,107,0.15)" }}>
      <div style={{ fontSize:11,fontWeight:700,color:"#1B3A6B",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>🚌 Getting There by SEPTA</div>
      {routes.map((r,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<routes.length-1?"1px solid rgba(0,0,0,0.05)":"none" }}>
          <div style={{ background:"#1B3A6B",color:"white",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,minWidth:40,textAlign:"center" }}>{r.route}</div>
          <div style={{ flex:1,fontSize:12,color:"#1A1A2E" }}>{r.direction}</div>
          <div style={{ fontSize:11,color:"#2D6A4F",fontWeight:600 }}>{r.fare}</div>
        </div>
      ))}
      <a href="https://www.septa.org/schedules" target="_blank" rel="noreferrer" style={{ display:"block",marginTop:8,fontSize:11,color:"#1B3A6B",fontWeight:600,textDecoration:"none" }}>View full SEPTA schedule →</a>
    </div>
  );
}

/* ── FEATURE 5: STORIES ── */
const STORIES = [
  { name:"Maria, Chester", story:"Found a food pantry using DelcoHelp during the holiday shutdown when I thought everything was closed. Saved Christmas for my kids.", date:"Dec 2025", tag:"Food" },
  { name:"James, Upper Darby", story:"The benefits navigator helped me realize I qualified for SNAP. I had been too embarrassed to ask anyone for help. Took 15 minutes to apply.", date:"Jan 2026", tag:"Benefits" },
  { name:"Linda, Wallingford", story:"My mom needed emergency crisis help at 2 AM. The hotline button connected us immediately. She's safe now.", date:"Feb 2026", tag:"Crisis" },
  { name:"Carlos, Ridley Park", story:"Como hispanohablante, fue un alivio encontrar recursos en español. Pude ayudar a mi madre con SNAP sin necesitar un traductor.", date:"Mar 2026", tag:"Bilingual" },
  { name:"Deborah, Darby", story:"The app showed me SEPTA routes to the pantry. I don't have a car and didn't know the 109 bus stopped right there.", date:"Apr 2026", tag:"Transit" },
];

export function StoriesSection() {
  return (
    <div style={{ padding:"0 24px",marginTop:20,marginBottom:20 }}>
      <div style={{ fontSize:13,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12 }}>💬 Neighbors Helping Neighbors</div>
      <div style={{ display:"flex",gap:12,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4 }}>
        {STORIES.map((s,i) => (
          <div key={i} style={{ minWidth:260,background:"white",borderRadius:14,padding:14,boxShadow:"0 1px 6px rgba(0,0,0,0.06)",flexShrink:0,border:"1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
              <span style={{ background:"#D8F3DC",color:"#1B4332",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>{s.tag}</span>
              <span style={{ fontSize:10,color:"#9BA8A0" }}>{s.date}</span>
            </div>
            <div style={{ fontSize:13,color:"#1A1A2E",lineHeight:1.5,marginBottom:8,fontStyle:"italic" }}>"{s.story}"</div>
            <div style={{ fontSize:11,color:"#2D6A4F",fontWeight:700 }}>— {s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── FEATURE 6: DIETARY FILTERS ── */
export function DietaryFilters({ onChange, active=[] }) {
  const options = [
    { id:"halal",label:"Halal",icon:"☪" },
    { id:"kosher",label:"Kosher",icon:"✡" },
    { id:"vegetarian",label:"Vegetarian",icon:"🌱" },
    { id:"glutenfree",label:"Gluten-Free",icon:"🌾" },
    { id:"dairyfree",label:"Dairy-Free",icon:"🥛" },
  ];
  function toggle(id) {
    const next = active.includes(id) ? active.filter(a=>a!==id) : [...active, id];
    onChange(next);
  }
  return (
    <div style={{ padding:"8px 0",marginBottom:12 }}>
      <div style={{ fontSize:10,fontWeight:700,color:"#6B7080",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,paddingLeft:2 }}>Dietary & Religious Needs</div>
      <div style={{ display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none" }}>
        {options.map(o => {
          const isActive = active.includes(o.id);
          return (
            <button key={o.id} onClick={() => toggle(o.id)} style={{ flexShrink:0,padding:"5px 12px",borderRadius:20,background:isActive?"#2D6A4F":"white",color:isActive?"white":"#1A1A2E",border:`1px solid ${isActive?"#2D6A4F":"rgba(0,0,0,0.1)"}`,fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" }}>
              {o.icon} {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── FEATURE 7: LANGUAGE SELECTOR ── */
export const EXTRA_TRANSLATIONS = {
  vi: { appName:"DelcoHelp",tagline:"Tìm sự giúp đỡ gần bạn, ngay bây giờ.",findResources:"Tìm tài nguyên",emergency:"Khẩn cấp",benefits:"Lợi ích",askAI:"Hỏi AI",home:"Trang chủ",find:"Tìm kiếm",hotline:"Đường dây nóng",openNow:"Đang mở",allResources:"Tất cả tài nguyên",call:"Gọi",directions:"🗺️ Bản đồ",back:"← Quay lại" },
  zh: { appName:"DelcoHelp",tagline:"在您附近找到帮助",findResources:"查找资源",emergency:"紧急情况",benefits:"福利",askAI:"问AI",home:"主页",find:"查找",hotline:"热线",openNow:"现在开放",allResources:"所有资源",call:"呼叫",directions:"🗺️ 地图",back:"← 返回" },
};

export function LanguageSelector({ currentLang, onChange }) {
  const languages = [
    { code:"en",label:"English",flag:"🇺🇸" },
    { code:"es",label:"Español",flag:"🇲🇽" },
    { code:"vi",label:"Tiếng Việt",flag:"🇻🇳" },
    { code:"zh",label:"中文",flag:"🇨🇳" },
  ];
  return (
    <div style={{ display:"flex",gap:4,background:"rgba(0,0,0,0.04)",borderRadius:10,padding:3,overflowX:"auto" }}>
      {languages.map(l => (
        <button key={l.code} onClick={() => onChange(l.code)} style={{ padding:"4px 8px",borderRadius:7,background:currentLang===l.code?"white":"transparent",color:currentLang===l.code?"#1A1A2E":"#6B7080",border:"none",fontSize:10,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",boxShadow:currentLang===l.code?"0 1px 4px rgba(0,0,0,0.1)":"none" }}>
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}

/* ── FEATURE 8: SMS ACCESS CARD ── */
export function SMSAccessCard({ phoneNumber="", t={} }) {
  if (!phoneNumber) return null;
  const smsUrl = (keyword) => `sms:${phoneNumber.replace(/\D/g,"")}?&body=${encodeURIComponent(keyword)}`;
  const label = (key, fallback) => t[key] || fallback;
  const format = (template, values = {}) => String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  return (
    <div style={{ background:"linear-gradient(135deg,#FFF8F0,#FFF3E0)",borderRadius:16,padding:16,marginTop:12,marginBottom:12,border:"1px solid rgba(231,111,81,0.2)" }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
        <div style={{ fontSize:24 }}>📱</div>
        <div>
          <div style={{ fontSize:13,fontWeight:700,color:"#7B4B00" }}>{label("noSmartphoneTextUs", "No smartphone? Text us!")}</div>
          <div style={{ fontSize:11,color:"#A06000" }}>{label("worksOnAnyPhone", "Works on any phone, even flip phones")}</div>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
        {[["FOOD","#E76F51"],["INFO","#E76F51"],["SNAP","#E76F51"],["CRISIS","#D62828"]].map(([kw,bg]) => (
          <a key={kw} href={smsUrl(kw)} style={{ background:bg,color:"white",textDecoration:"none",padding:"8px 10px",borderRadius:8,fontSize:11,fontWeight:600,textAlign:"center" }}>{format(label("textKeyword", "Text {keyword}"), { keyword: kw })}</a>
        ))}
      </div>
      <div style={{ fontSize:10,color:"#6B7080",textAlign:"center",marginTop:8 }}>{label("replyZip", "Reply with your zip code to get nearest resources")}</div>
    </div>
  );
}

/* ── FEATURE 9: ANALYTICS ── */
export function trackEvent(eventName, properties={}) {
  try {
    const events = JSON.parse(localStorage.getItem("dh_events") || "[]");
    events.push({ event:eventName, properties, timestamp:new Date().toISOString(), session:sessionStorage.getItem("dh_session_id")||initSession() });
    if (events.length > 1000) events.splice(0, events.length - 1000);
    localStorage.setItem("dh_events", JSON.stringify(events));
  } catch {}
}
function initSession() {
  const id = "ses_"+Date.now()+"_"+Math.random().toString(36).slice(2,9);
  try { sessionStorage.setItem("dh_session_id", id); } catch {}
  return id;
}
export function getAnalytics() {
  try {
    const events = JSON.parse(localStorage.getItem("dh_events") || "[]");
    const today = new Date().toDateString();
    return { totalEvents:events.length, todayEvents:events.filter(e=>new Date(e.timestamp).toDateString()===today).length, uniqueSessions:new Set(events.map(e=>e.session)).size, eventCounts:events.reduce((acc,e)=>{ acc[e.event]=(acc[e.event]||0)+1; return acc; },{}) };
  } catch { return { totalEvents:0,todayEvents:0,uniqueSessions:0,eventCounts:{} }; }
}

/* ── FEATURE 10: PANTRY INVENTORY ── */
const INVENTORY_KEY = "dh_pantry_inventory";
export function getPantryInventory(pantryId) {
  try { const all=JSON.parse(localStorage.getItem(INVENTORY_KEY)||"{}"); const today=new Date().toDateString(); return all[pantryId]?.[today]||{items:[],lastUpdated:null}; }
  catch { return {items:[],lastUpdated:null}; }
}
export function updatePantryInventory(pantryId, items) {
  try { const all=JSON.parse(localStorage.getItem(INVENTORY_KEY)||"{}"); const today=new Date().toDateString(); if(!all[pantryId])all[pantryId]={}; all[pantryId][today]={items,lastUpdated:new Date().toISOString()}; localStorage.setItem(INVENTORY_KEY,JSON.stringify(all)); } catch {}
}
export function PantryInventoryWidget({ pantryId }) {
  const [inventory, setInventory] = useState(getPantryInventory(pantryId));
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState([]);
  const COMMON_ITEMS = ["🥫 Canned goods","🍞 Bread/Bakery","🥩 Meat/Protein","🥛 Dairy","🥦 Fresh produce","🍼 Baby formula","👶 Diapers","🧴 Toiletries","🐾 Pet food","🌾 Dry goods"];
  function toggle(item) { setSelected(s=>s.includes(item)?s.filter(i=>i!==item):[...s,item]); }
  function submit() { updatePantryInventory(pantryId,selected); setInventory({items:selected,lastUpdated:new Date().toISOString()}); setSubmitted(true); setTimeout(()=>setSubmitted(false),3000); setSelected([]); }
  const hasData = inventory.items.length > 0;
  return (
    <div style={{ background:"#F0FBF4",borderRadius:12,padding:12,marginTop:10,border:"1px solid rgba(45,106,79,0.15)" }}>
      <div style={{ fontSize:11,fontWeight:700,color:"#2D6A4F",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>📦 Available Today</div>
      {hasData && (
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:10 }}>
          {inventory.items.map((item,i) => <span key={i} style={{ background:"#D8F3DC",color:"#1B4332",borderRadius:8,padding:"3px 8px",fontSize:11,fontWeight:600 }}>{item}</span>)}
          <div style={{ fontSize:10,color:"#9BA8A0",width:"100%",marginTop:2 }}>Reported {inventory.lastUpdated?new Date(inventory.lastUpdated).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"today"}</div>
        </div>
      )}
      {!submitted ? (
        <>
          <div style={{ fontSize:11,color:"#6B7080",marginBottom:8 }}>Tap what's available right now:</div>
          <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
            {COMMON_ITEMS.map(item => (
              <button key={item} onClick={()=>toggle(item)} style={{ padding:"4px 8px",borderRadius:8,fontSize:11,cursor:"pointer",background:selected.includes(item)?"#2D6A4F":"white",color:selected.includes(item)?"white":"#1A1A2E",border:`1px solid ${selected.includes(item)?"#2D6A4F":"rgba(0,0,0,0.1)"}` }}>{item}</button>
            ))}
          </div>
          {selected.length>0 && <button onClick={submit} style={{ background:"#2D6A4F",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer" }}>Submit Inventory Report</button>}
        </>
      ) : <div style={{ fontSize:12,color:"#2D6A4F",fontWeight:600 }}>✓ Thanks! This helps families plan their visit.</div>}
    </div>
  );
}

/* ── FEATURE 11: I'M GOING TONIGHT ── */
const GOING_KEY = "dh_going_tonight";
export function IAmGoingButton({ resource }) {
  const [going, setGoing] = useState(() => { try { const saved=JSON.parse(localStorage.getItem(GOING_KEY)||"{}"); const today=new Date().toDateString(); return saved[resource.id]?.date===today; } catch { return false; } });
  const [confirmed, setConfirmed] = useState(false);
  function handleGoing() {
    try { const saved=JSON.parse(localStorage.getItem(GOING_KEY)||"{}"); const today=new Date().toDateString(); saved[resource.id]={date:today,name:resource.name,phone:resource.phone,address:resource.address}; localStorage.setItem(GOING_KEY,JSON.stringify(saved)); } catch {}
    setGoing(true); setConfirmed(true);
    trackEvent("going_tonight",{resource:resource.name});
    if("Notification" in window && Notification.permission==="granted") {
      const closeHour=resource.openEnd||20; const now=new Date(); const reminderTime=new Date(); reminderTime.setHours(closeHour-1,0,0,0); const delay=reminderTime-now;
      if(delay>0) setTimeout(()=>new Notification(`⏰ ${resource.name} closes in 1 hour!`,{body:`Open until ${closeHour}:00 PM tonight.`,icon:"/icon-192.png"}),delay);
    }
    setTimeout(()=>setConfirmed(false),3000);
  }
  function requestDirections() { window.open(`https://maps.google.com/?q=${encodeURIComponent(resource.address)}`); }
  if (going) return (
    <div style={{ display:"flex",gap:8,marginTop:10 }}>
      <div style={{ flex:1,background:"#D8F3DC",borderRadius:10,padding:"10px 12px",fontSize:12,fontWeight:600,color:"#1B4332",textAlign:"center" }}>✓ You're going tonight! {confirmed&&"Reminder set."}</div>
      <button onClick={requestDirections} style={{ background:"#2D6A4F",color:"white",border:"none",borderRadius:10,padding:"10px 12px",fontSize:12,fontWeight:600,cursor:"pointer" }}>🗺️ Directions</button>
    </div>
  );
  return (
    <button onClick={handleGoing} style={{ width:"100%",background:"linear-gradient(135deg,#2D6A4F,#40916C)",color:"white",border:"none",borderRadius:12,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
      🟢 I'm Going Tonight — Remind Me
    </button>
  );
}

/* ── FEATURE 12: SAVED RESOURCES + FAMILY PROFILE ── */
const PROFILE_KEY = "dh_family_profile";
const SAVED_KEY = "dh_saved_resources";
export function getFamilyProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null"); } catch { return null; } }
export function saveFamilyProfile(profile) { try { localStorage.setItem(PROFILE_KEY,JSON.stringify(profile)); } catch {} }
export function getSavedResources() { try { return JSON.parse(localStorage.getItem(SAVED_KEY)||"[]"); } catch { return []; } }
export function toggleSavedResource(resourceId, resourceName) {
  const saved=getSavedResources(); const exists=saved.find(r=>r.id===resourceId);
  let updated = exists ? saved.filter(r=>r.id!==resourceId) : [...saved,{id:resourceId,name:resourceName,savedAt:new Date().toISOString()}];
  try { localStorage.setItem(SAVED_KEY,JSON.stringify(updated)); } catch {}
  return updated;
}
export function SaveResourceButton({ resource, onSave }) {
  const [saved, setSaved] = useState(()=>getSavedResources().some(r=>r.id===resource.id));
  function toggle() { const updated=toggleSavedResource(resource.id,resource.name); setSaved(updated.some(r=>r.id===resource.id)); trackEvent("resource_saved",{resource:resource.name,saved:!saved}); if(onSave)onSave(updated); }
  return (
    <button onClick={toggle} style={{ background:saved?"#FFF3CD":"white",color:saved?"#7B5800":"#6B7080",border:`1px solid ${saved?"#C9A84C":"rgba(0,0,0,0.1)"}`,borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:600,cursor:"pointer" }}>
      {saved?"⭐ Saved":"☆ Save"}
    </button>
  );
}

export function FamilyProfileSetup({ onComplete }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ household:1,zip:"",hasKids:false,hasEldercare:false,dietary:[],lang:"en" });
  function finish() { saveFamilyProfile({...profile,createdAt:new Date().toISOString()}); trackEvent("profile_created",{zip:profile.zip,household:profile.household}); onComplete(profile); }
  const steps = [
    { title:"Welcome to DelcoHelp", subtitle:"Quick setup personalizes your experience",
      content:(
        <div>
          <div style={{ fontSize:13,color:"#6B7080",marginBottom:12 }}>How many people are in your household?</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {[1,2,3,4,5,"6+"].map(n=>(
              <button key={n} onClick={()=>setProfile(p=>({...p,household:n}))} style={{ padding:"12px 16px",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",background:profile.household===n?"#2D6A4F":"white",color:profile.household===n?"white":"#1A1A2E",border:`2px solid ${profile.household===n?"#2D6A4F":"rgba(0,0,0,0.1)"}` }}>{n}</button>
            ))}
          </div>
        </div>
      )
    },
    { title:"Your zip code", subtitle:"We'll show resources nearest to you",
      content:(
        <input type="text" inputMode="numeric" maxLength={5} value={profile.zip} onChange={e=>setProfile(p=>({...p,zip:e.target.value.replace(/\D/g,"").slice(0,5)}))} placeholder="19086" style={{ width:"100%",padding:"14px 16px",borderRadius:12,border:"2px solid rgba(0,0,0,0.1)",fontSize:24,textAlign:"center",fontFamily:"monospace",boxSizing:"border-box",outline:"none" }} />
      )
    },
    { title:"Any special needs?", subtitle:"We'll highlight relevant resources",
      content:(
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[{key:"hasKids",label:"👶 Children under 5 or infant formula needs"},{key:"hasEldercare",label:"👴 Senior or elderly household member"},{key:"hasPets",label:"🐾 Pets (we know pantries that allow pet food)"},{key:"needsTranslation",label:"🌍 Non-English speaking household member"}].map(opt=>(
            <button key={opt.key} onClick={()=>setProfile(p=>({...p,[opt.key]:!p[opt.key]}))} style={{ textAlign:"left",padding:"12px 14px",borderRadius:12,fontSize:13,cursor:"pointer",background:profile[opt.key]?"#D8F3DC":"white",color:profile[opt.key]?"#1B4332":"#1A1A2E",border:`2px solid ${profile[opt.key]?"#2D6A4F":"rgba(0,0,0,0.1)"}`,fontFamily:"sans-serif",fontWeight:profile[opt.key]?700:400 }}>{opt.label}</button>
          ))}
        </div>
      )
    }
  ];
  const current = steps[step];
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div style={{ background:"white",width:"100%",maxWidth:480,borderRadius:"24px 24px 0 0",padding:24 }}>
        <div style={{ width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px" }} />
        <div style={{ display:"flex",gap:6,marginBottom:16 }}>{steps.map((_,i)=><div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=step?"#2D6A4F":"#E2E8F0" }} />)}</div>
        <div style={{ fontSize:20,fontWeight:700,marginBottom:4 }}>{current.title}</div>
        <div style={{ fontSize:13,color:"#6B7080",marginBottom:20 }}>{current.subtitle}</div>
        {current.content}
        <div style={{ display:"flex",gap:8,marginTop:20 }}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ flex:1,background:"#F0F0F0",color:"#6B7080",border:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:600,cursor:"pointer" }}>Back</button>}
          <button onClick={()=>step<steps.length-1?setStep(s=>s+1):finish()} style={{ flex:2,background:"#2D6A4F",color:"white",border:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,cursor:"pointer" }}>{step<steps.length-1?"Next →":"Get Started →"}</button>
        </div>
        <button onClick={()=>onComplete(null)} style={{ width:"100%",background:"transparent",border:"none",color:"#9BA8A0",padding:10,fontSize:12,cursor:"pointer",marginTop:4 }}>Skip for now</button>
      </div>
    </div>
  );
}

/* ── FEATURE 13: I FOUND HELP ── */
const FOUND_HELP_KEY = "dh_found_help";
export function FoundHelpButton({ resource }) {
  const [confirmed, setConfirmed] = useState(()=>{ try { return JSON.parse(localStorage.getItem(FOUND_HELP_KEY)||"[]").some(r=>r.id===resource.id); } catch { return false; } });
  const [justConfirmed, setJustConfirmed] = useState(false);
  function confirm() {
    try { const saved=JSON.parse(localStorage.getItem(FOUND_HELP_KEY)||"[]"); saved.push({id:resource.id,name:resource.name,date:new Date().toISOString()}); localStorage.setItem(FOUND_HELP_KEY,JSON.stringify(saved)); } catch {}
    setConfirmed(true); setJustConfirmed(true); trackEvent("found_help",{resource:resource.name,resourceId:resource.id}); setTimeout(()=>setJustConfirmed(false),4000);
  }
  if (confirmed) return (
    <div style={{ background:"#D8F3DC",borderRadius:12,padding:12,marginTop:10,display:"flex",alignItems:"center",gap:10 }}>
      <div style={{ fontSize:20 }}>💚</div>
      <div>
        <div style={{ fontSize:13,fontWeight:700,color:"#1B4332" }}>{justConfirmed?"Thank you for sharing!":"You found help here"}</div>
        <div style={{ fontSize:11,color:"#2D6A4F" }}>{justConfirmed?"This helps us show others where to find real help.":"Your experience helps other families."}</div>
      </div>
    </div>
  );
  return <button onClick={confirm} style={{ width:"100%",background:"white",color:"#2D6A4F",border:"2px solid rgba(45,106,79,0.3)",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:8 }}>💚 I Found Help Here</button>;
}

/* ── FEATURE 14: DOCUMENT CHECKLIST ── */
const CHECKLIST_ITEMS = {
  snap:{ name:"SNAP Food Benefits", docs:[{item:"Photo ID",required:true},{item:"Proof of address",required:true},{item:"Proof of income",required:true},{item:"Social Security numbers for all household members",required:true},{item:"Immigration documents if applicable",required:false}] },
  wic:{ name:"WIC Program", docs:[{item:"Proof of identity",required:true},{item:"Proof of address",required:true},{item:"Proof of income or participation in SNAP/Medicaid",required:true},{item:"Child's immunization records (if applying for child)",required:false}] },
  liheap:{ name:"LIHEAP Utility Help", docs:[{item:"Most recent utility or heating bill",required:true},{item:"Social Security numbers for all household members",required:true},{item:"Proof of income for all household members",required:true},{item:"Rental or lease agreement (if renting)",required:false}] },
  medicaid:{ name:"Medicaid / CHIP", docs:[{item:"Proof of identity",required:true},{item:"Social Security number",required:true},{item:"Proof of income or unemployment documentation",required:true},{item:"Immigration documents if applicable",required:false}] },
  pantry:{ name:"Food Pantry Visit", docs:[{item:"Most pantries require NO documentation — just show up",required:false},{item:"Some pantries ask for a zip code or address proof",required:false},{item:"Photo ID may be helpful but usually not required",required:false}] },
};
export function DocumentChecklist({ programs=["snap"], onClose }) {
  const [checked, setChecked] = useState({});
  function toggle(key) { setChecked(c=>({...c,[key]:!c[key]})); }
  const allItems = programs.flatMap(prog=>{ const data=CHECKLIST_ITEMS[prog]; if(!data)return []; return data.docs.map((doc,i)=>({...doc,key:`${prog}-${i}`,program:data.name})); });
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = allItems.length ? Math.round((checkedCount/allItems.length)*100) : 0;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"flex-end" }}>
      <div style={{ background:"white",width:"100%",maxWidth:480,maxHeight:"90vh",borderRadius:"24px 24px 0 0",overflow:"auto",padding:20 }}>
        <div style={{ width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
          <div style={{ fontSize:18,fontWeight:700 }}>Document Checklist</div>
          <button onClick={onClose} style={{ background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#6B7080" }}>×</button>
        </div>
        <div style={{ fontSize:12,color:"#6B7080",marginBottom:14 }}>{checkedCount} of {allItems.length} items gathered</div>
        <div style={{ height:4,background:"#E2E8F0",borderRadius:2,marginBottom:16,overflow:"hidden" }}><div style={{ height:"100%",background:"#2D6A4F",width:`${progress}%`,borderRadius:2,transition:"width 0.3s" }} /></div>
        {programs.map(prog=>{ const data=CHECKLIST_ITEMS[prog]; if(!data)return null; return (
          <div key={prog} style={{ marginBottom:20 }}>
            <div style={{ fontSize:13,fontWeight:700,color:"#2D6A4F",marginBottom:10 }}>{data.name}</div>
            {data.docs.map((doc,i)=>{ const key=`${prog}-${i}`; return (
              <div key={key} onClick={()=>toggle(key)} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,0.05)",cursor:"pointer" }}>
                <div style={{ width:20,height:20,borderRadius:4,border:`2px solid ${checked[key]?"#2D6A4F":"rgba(0,0,0,0.2)"}`,background:checked[key]?"#2D6A4F":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,fontSize:11,color:"white",fontWeight:700 }}>{checked[key]&&"✓"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,color:checked[key]?"#9BA8A0":"#1A1A2E",textDecoration:checked[key]?"line-through":"none" }}>{doc.item}</div>
                  {doc.required&&<div style={{ fontSize:10,color:"#E76F51",fontWeight:700,marginTop:2 }}>REQUIRED</div>}
                </div>
              </div>
            ); })}
          </div>
        ); })}
        <button onClick={onClose} style={{ width:"100%",background:"#2D6A4F",color:"white",border:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8 }}>Done</button>
      </div>
    </div>
  );
}

/* ── FEATURE 15: SNAP ASSISTANT ── */
export function SNAPAssistant({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"🥫",title:"Let's get you enrolled in SNAP",body:"SNAP provides monthly money loaded on an EBT card you can use at any grocery store. The average benefit is $291/month per person. Takes about 15 minutes to apply online.",action:"Let's start" },
    { icon:"📋",title:"What you'll need",body:null,checklist:["Photo ID (driver's license or state ID)","Proof of address (utility bill or rent receipt)","Last month's pay stub OR employer letter OR benefit award letter","Social Security numbers for everyone in your household"],action:"I have these →" },
    { icon:"🔗",title:"Apply on PA COMPASS",body:"PA COMPASS is Pennsylvania's official benefits portal. It's secure, free, and available 24/7. You can save your application and come back to it later.",subtext:"Tap the button below — COMPASS will open in a new tab.",action:null,compassLink:true },
    { icon:"⏰",title:"What happens next",body:"After you apply:\n\n• You'll get a confirmation number immediately\n• Pennsylvania will contact you within 30 days\n• Most applicants hear back in 7-10 days\n• If approved, benefits start within days of approval",action:"Done — close" },
  ];
  const current = steps[step];
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"flex-end" }}>
      <div style={{ background:"white",width:"100%",maxWidth:480,borderRadius:"24px 24px 0 0",padding:24 }}>
        <div style={{ width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px" }} />
        <div style={{ display:"flex",gap:6,marginBottom:20 }}>{steps.map((_,i)=><div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=step?"#2D6A4F":"#E2E8F0" }} />)}</div>
        <div style={{ fontSize:32,marginBottom:8,textAlign:"center" }}>{current.icon}</div>
        <div style={{ fontSize:18,fontWeight:700,marginBottom:10,textAlign:"center" }}>{current.title}</div>
        {current.body&&<div style={{ fontSize:13,color:"#3A3020",lineHeight:1.7,marginBottom:16,whiteSpace:"pre-line" }}>{current.body}</div>}
        {current.checklist&&<div style={{ background:"#F0F9F4",borderRadius:12,padding:14,marginBottom:16 }}>{current.checklist.map((item,i)=><div key={i} style={{ display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderBottom:i<current.checklist.length-1?"1px solid rgba(45,106,79,0.1)":"none" }}><div style={{ color:"#2D6A4F",fontWeight:700,marginTop:1 }}>✓</div><div style={{ fontSize:13,color:"#1A1A2E" }}>{item}</div></div>)}</div>}
        {current.subtext&&<div style={{ fontSize:12,color:"#6B7080",marginBottom:14,textAlign:"center",fontStyle:"italic" }}>{current.subtext}</div>}
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {current.compassLink&&<a href="https://www.compass.state.pa.us" target="_blank" rel="noreferrer" style={{ background:"#2D6A4F",color:"white",textDecoration:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,textAlign:"center",display:"block" }}>Open PA COMPASS to Apply →</a>}
          {current.action&&<button onClick={()=>step<steps.length-1?setStep(s=>s+1):onClose()} style={{ background:current.compassLink?"white":"#2D6A4F",color:current.compassLink?"#6B7080":"white",border:current.compassLink?"1px solid rgba(0,0,0,0.1)":"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,cursor:"pointer" }}>{current.action}</button>}
          <button onClick={onClose} style={{ background:"transparent",border:"none",color:"#9BA8A0",padding:8,fontSize:12,cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── FEATURE 16: CRISIS ESCAPE PLAN ── */
const ESCAPE_PLAN_KEY = "dh_escape_plan";
export function getCrisisEscapePlan() { try { return JSON.parse(localStorage.getItem(ESCAPE_PLAN_KEY)||"null"); } catch { return null; } }
export function CrisisEscapePlan({ onClose }) {
  const [plan, setPlan] = useState(()=>getCrisisEscapePlan()||{step1:"",step2:"",step3:"",safeContact:"",safeContactPhone:""});
  const [saved, setSaved] = useState(false);
  function save() { try { localStorage.setItem(ESCAPE_PLAN_KEY,JSON.stringify(plan)); } catch {} setSaved(true); setTimeout(()=>setSaved(false),2000); }
  const fields = [{key:"step1",label:"Step 1 — First call I make",placeholder:"e.g. Call 855-889-7827, call 988, or text PA to 741741"},{key:"step2",label:"Step 2 — First place I go",placeholder:"e.g. 25 Cedar Rd, Wallingford (Lifewerks)"},{key:"step3",label:"Step 3 — What I say when I get there",placeholder:"e.g. I need emergency help, I'm not safe at home"},{key:"safeContact",label:"My trusted contact",placeholder:"e.g. Sister Maria"},{key:"safeContactPhone",label:"Their phone number",placeholder:"e.g. 610-555-0000"}];
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(100,0,0,0.92)",zIndex:9999,display:"flex",alignItems:"flex-end" }}>
      <div style={{ background:"white",width:"100%",maxWidth:480,maxHeight:"92vh",borderRadius:"24px 24px 0 0",overflow:"auto",padding:20 }}>
        <div style={{ width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div style={{ fontSize:16,fontWeight:700,color:"#D62828" }}>🚨 My Safety Plan</div>
          <button onClick={onClose} style={{ background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#6B7080" }}>×</button>
        </div>
        <div style={{ fontSize:12,color:"#6B7080",marginBottom:16,lineHeight:1.5 }}>Fill this out when you're calm. It will be here when you need it — even offline.</div>
        {fields.map(f=>(
          <div key={f.key} style={{ marginBottom:14 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#D62828",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em" }}>{f.label}</div>
            <input value={plan[f.key]||""} onChange={e=>setPlan(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{ width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:13,fontFamily:"sans-serif",boxSizing:"border-box" }} />
          </div>
        ))}
        {plan.safeContactPhone&&<a href={`tel:${plan.safeContactPhone}`} style={{ display:"block",background:"#D62828",color:"white",textDecoration:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,textAlign:"center",marginBottom:10 }}>📞 Call {plan.safeContact||"My Contact"} Now</a>}
        <button onClick={save} style={{ width:"100%",background:"#2D6A4F",color:"white",border:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8 }}>{saved?"✓ Saved!":"Save My Plan"}</button>
        <div style={{ display:"flex",gap:8 }}>
          <a href="tel:988" style={{ flex:1,background:"#7B2D8B",color:"white",textDecoration:"none",borderRadius:10,padding:10,fontSize:12,fontWeight:700,textAlign:"center" }}>Call 988</a>
          <a href="tel:911" style={{ flex:1,background:"#D62828",color:"white",textDecoration:"none",borderRadius:10,padding:10,fontSize:12,fontWeight:700,textAlign:"center" }}>Call 911</a>
          <a href="sms:741741?body=PA" style={{ flex:1,background:"#023E8A",color:"white",textDecoration:"none",borderRadius:10,padding:10,fontSize:12,fontWeight:700,textAlign:"center" }}>Text PA to 741741</a>
        </div>
        <div style={{ marginTop:12,fontSize:10,color:"#9BA8A0",textAlign:"center" }}>This plan is stored only on your device. It is never shared or uploaded.</div>
      </div>
    </div>
  );
}

/* ── FEATURE 17: IMPACT STATS ── */
export function getImpactStats() {
  try {
    const foundHelp=JSON.parse(localStorage.getItem(FOUND_HELP_KEY)||"[]");
    const going=JSON.parse(localStorage.getItem(GOING_KEY)||"{}");
    const saved=JSON.parse(localStorage.getItem(SAVED_KEY)||"[]");
    const events=JSON.parse(localStorage.getItem("dh_events")||"[]");
    return { helpConfirmed:foundHelp.length, goingTonight:Object.keys(going).length, savedResources:saved.length, totalActions:events.length, topResources:foundHelp.slice(0,3).map(r=>r.name) };
  } catch { return { helpConfirmed:0,goingTonight:0,savedResources:0,totalActions:0,topResources:[] }; }
}

/* ── FEATURE 18: FAMILY RESOURCE PLAN ── */
export function FamilyResourcePlan({ resources, onClose }) {
  const [title, setTitle] = useState("My Resource Plan");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const planText = `${title}\n\n${resources.map((r,i)=>`${i+1}. ${r.name}\n   📍 ${r.address}\n   📞 ${r.phone}\n   ⏰ ${r.hours?.[0]?.day||"See listing"}: ${r.hours?.[0]?.time||""}`).join("\n\n")}${notes?`\n\nNotes: ${notes}`:""}\n\nSource: delcohelp.org`;
  function copyPlan() { navigator.clipboard?.writeText(planText).catch(()=>{}); setCopied(true); trackEvent("plan_shared"); setTimeout(()=>setCopied(false),2500); }
  function sharePlan() { if(navigator.share){ navigator.share({title,text:planText}).catch(()=>{}); }else{ copyPlan(); } }
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"flex-end" }}>
      <div style={{ background:"white",width:"100%",maxWidth:480,maxHeight:"90vh",borderRadius:"24px 24px 0 0",overflow:"auto",padding:20 }}>
        <div style={{ width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px" }} />
        <div style={{ fontSize:16,fontWeight:700,marginBottom:12 }}>📋 My Resource Plan</div>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"sans-serif",boxSizing:"border-box",marginBottom:12 }} placeholder="Plan title…" />
        {resources.map((r,i)=>(
          <div key={i} style={{ background:"#F8FAF9",borderRadius:10,padding:12,marginBottom:8,border:"1px solid rgba(45,106,79,0.1)" }}>
            <div style={{ fontSize:13,fontWeight:700 }}>{i+1}. {r.name}</div>
            <div style={{ fontSize:11,color:"#6B7080",marginTop:3 }}>{r.address} · {r.phone}</div>
            {r.hours?.[0]&&<div style={{ fontSize:11,color:"#2D6A4F",marginTop:2 }}>⏰ {r.hours[0].day} {r.hours[0].time}</div>}
          </div>
        ))}
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add personal notes…" rows={3} style={{ width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:13,fontFamily:"sans-serif",resize:"vertical",boxSizing:"border-box",marginBottom:12 }} />
        <div style={{ display:"flex",gap:8,marginBottom:8 }}>
          <button onClick={sharePlan} style={{ flex:1,background:"#2D6A4F",color:"white",border:"none",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer" }}>📤 Share Plan</button>
          <button onClick={copyPlan} style={{ flex:1,background:copied?"#D8F3DC":"white",color:copied?"#1B4332":"#2D6A4F",border:"1.5px solid rgba(45,106,79,0.3)",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer" }}>{copied?"✓ Copied!":"📋 Copy Text"}</button>
        </div>
        <button onClick={onClose} style={{ width:"100%",background:"transparent",border:"none",color:"#9BA8A0",padding:8,fontSize:12,cursor:"pointer" }}>Close</button>
      </div>
    </div>
  );
}

/* ── LEGAL SCREEN ── */
export function LegalScreen({ appName="DelcoHelp", companyName="CieroLink LLC", onClose }) {
  const [section, setSection] = useState("terms");
  const sections = [{id:"terms",label:"Terms"},{id:"privacy",label:"Privacy"},{id:"disclaimer",label:"Disclaimer"},{id:"ai",label:"AI Use"}];
  const EFFECTIVE_DATE = "April 24, 2026";
  const CONTACT_EMAIL = "damian@cierolink.com";
  const H = ({children})=><div style={{ fontSize:13,fontWeight:700,color:"#1A1A2E",marginTop:16,marginBottom:6 }}>{children}</div>;
  const P = ({children})=><div style={{ fontSize:12,color:"#3A3020",lineHeight:1.7,marginBottom:8 }}>{children}</div>;
  const Li = ({children})=><div style={{ display:"flex",gap:8,marginBottom:4,paddingLeft:4 }}><div style={{ color:"#2D6A4F",fontWeight:700,marginTop:1,flexShrink:0 }}>•</div><div style={{ fontSize:12,color:"#3A3020",lineHeight:1.6 }}>{children}</div></div>;
  return (
    <div style={{ position:"fixed",inset:0,background:"white",zIndex:9999,display:"flex",flexDirection:"column",fontFamily:"sans-serif" }}>
      <div style={{ background:"#1A1A2E",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 12px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer" }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15,fontWeight:700,color:"white" }}>Legal & Privacy</div>
          <div style={{ fontSize:11,color:"rgba(255,255,255,0.6)" }}>{appName} · {companyName}</div>
        </div>
      </div>
      <div style={{ display:"flex",borderBottom:"1px solid rgba(0,0,0,0.08)",background:"white",flexShrink:0 }}>
        {sections.map(s=><button key={s.id} onClick={()=>setSection(s.id)} style={{ flex:1,padding:"12px 4px",border:"none",background:"transparent",fontSize:12,fontWeight:600,cursor:"pointer",color:section===s.id?"#1A1A2E":"#9BA8A0",borderBottom:`3px solid ${section===s.id?"#2D6A4F":"transparent"}` }}>{s.label}</button>)}
      </div>
      <div style={{ flex:1,overflow:"auto",padding:20 }}>
        {section==="terms"&&(
          <div>
            <div style={{ fontSize:18,fontWeight:700,marginBottom:4 }}>Terms of Use</div>
            <div style={{ fontSize:11,color:"#9BA8A0",marginBottom:20 }}>Effective: {EFFECTIVE_DATE}</div>
            <H>1. Acceptance</H><P>By accessing or using {appName} ("the App"), operated by {companyName} ("we," "us," or "our"), you agree to these Terms of Use. If you do not agree, do not use the App.</P>
            <H>2. Description of Service</H><P>The App provides an informational directory of community resources, social service programs, crisis hotlines, and government benefits information in Delaware County, Pennsylvania.</P>
            <H>3. No Professional Advice</H><P>The App does not provide legal, medical, financial, or professional advice of any kind. For medical emergencies, call 911. For mental health crises, call 988.</P>
            <H>4. Resource Accuracy</H><P>{companyName} makes reasonable efforts to maintain accurate listings but does not guarantee accuracy, completeness, or current availability of any listed organization or service.</P>
            <H>5. AI Chat Disclaimer</H><P>The AI assistant is powered by Anthropic's Claude and is for general informational purposes only. AI responses may be incomplete, inaccurate, or outdated. Do not rely on AI responses for medical, legal, financial, or crisis decisions.</P>
            <H>6. Limitation of Liability</H><P>TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP. {companyName.toUpperCase()}'S TOTAL LIABILITY SHALL NOT EXCEED $100.</P>
            <H>7. Governing Law</H><P>These Terms are governed by the laws of the Commonwealth of Pennsylvania.</P>
            <H>8. Contact</H><P>Questions: {CONTACT_EMAIL}</P>
          </div>
        )}
        {section==="privacy"&&(
          <div>
            <div style={{ fontSize:18,fontWeight:700,marginBottom:4 }}>Privacy Policy</div>
            <div style={{ fontSize:11,color:"#9BA8A0",marginBottom:20 }}>Effective: {EFFECTIVE_DATE}</div>
            <H>Information We Collect</H><P>The App stores the following data locally on your device only — it is never transmitted to our servers unless you explicitly submit a form:</P>
            <Li>Your zip code and household preferences</Li><Li>Resources you have saved or bookmarked</Li><Li>Volunteer hours and event RSVPs you have logged</Li><Li>Pantry status reports you submit</Li><Li>Your family safety plan (stored only on your device)</Li>
            <H>AI Chat</H><P>Messages sent to the AI assistant are transmitted to Anthropic, Inc. for processing. {companyName} does not store AI conversation history.</P>
            <H>Analytics</H><P>The App uses anonymized usage data (page views, feature interactions). No personally identifiable information is collected through analytics.</P>
            <H>Children's Privacy</H><P>The App is not directed to children under 13. Contact {CONTACT_EMAIL} if you believe a child has provided personal information.</P>
            <H>Contact</H><P>Privacy questions: {CONTACT_EMAIL}</P>
          </div>
        )}
        {section==="disclaimer"&&(
          <div>
            <div style={{ fontSize:18,fontWeight:700,marginBottom:4 }}>Important Disclaimers</div>
            <div style={{ background:"#FFF0F0",borderRadius:12,padding:14,marginBottom:16,border:"1px solid rgba(214,40,40,0.2)" }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#D62828",marginBottom:6 }}>🚨 In any emergency, call 911 immediately</div>
              <div style={{ fontSize:12,color:"#9B1C1C",lineHeight:1.6 }}>This App is not a substitute for emergency services. Never delay calling 911 because of information shown in this App.</div>
            </div>
            <H>Resource Information Disclaimer</H><P>{appName} provides a directory of community resources for informational purposes only. Hours, locations, and availability change frequently. Always call ahead to confirm.</P>
            <H>Benefits Eligibility Disclaimer</H><P>The benefits eligibility screener provides general estimates. Actual eligibility is determined by the Pennsylvania Department of Human Services through the official PA COMPASS application process.</P>
            <H>No Endorsement</H><P>Listing of an organization does not constitute an endorsement by {companyName} of that organization's services, quality, or practices.</P>
            <H>No Warranties</H><P>THE APP IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. {companyName.toUpperCase()} DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</P>
          </div>
        )}
        {section==="ai"&&(
          <div>
            <div style={{ fontSize:18,fontWeight:700,marginBottom:4 }}>AI Use Policy</div>
            <div style={{ fontSize:11,color:"#9BA8A0",marginBottom:20 }}>Effective: {EFFECTIVE_DATE}</div>
            <div style={{ background:"#F0F4FF",borderRadius:12,padding:14,marginBottom:16,border:"1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#3730A3",marginBottom:6 }}>🤖 Powered by Anthropic Claude</div>
              <div style={{ fontSize:12,color:"#4338CA",lineHeight:1.6 }}>The AI assistant uses Anthropic's Claude AI model to provide general information about local resources — not professional advice.</div>
            </div>
            <H>What the AI Can Help With</H>
            <Li>Finding local food pantries, shelters, or community resources</Li><Li>General information about SNAP, WIC, LIHEAP, and Medicaid</Li><Li>Answering questions about organization hours and locations</Li><Li>Helping you understand what documents you may need</Li>
            <H>What the AI Cannot Do</H>
            <Li>Provide legal, medical, financial, or psychological advice</Li><Li>Determine your actual eligibility for any program</Li><Li>Access real-time information about resource availability</Li>
            <H>Data Handling</H><P>Messages you send to the AI are transmitted to Anthropic, Inc. for processing. {companyName} does not store your AI conversation history. Do not share sensitive personal information (SSNs, financial details) in AI chat.</P>
            <H>Crisis Situations</H><P>If you are in crisis, contact emergency services directly. The AI is not a crisis counselor and cannot provide real-time crisis support.</P>
            <H>Feedback</H><P>Report inaccurate or harmful AI responses to {CONTACT_EMAIL}.</P>
          </div>
        )}
        <div style={{ height:40 }} />
      </div>
    </div>
  );
}

/* ── TRUST BADGE ── */
const VERIFIED_DATES = { 1:"Apr 2026",2:"Apr 2026",3:"Mar 2026",4:"Apr 2026",5:"Mar 2026",6:"Apr 2026",7:"Apr 2026",8:"Feb 2026",9:"Mar 2026",10:"Mar 2026",20:"Feb 2026",21:"Feb 2026",22:"Mar 2026",23:"Mar 2026",24:"Apr 2026",25:"Apr 2026",26:"Apr 2026",27:"Mar 2026",28:"Feb 2026",29:"Mar 2026",30:"Feb 2026",31:"Mar 2026",32:"Feb 2026",33:"Apr 2026",34:"Apr 2026",35:"Mar 2026",36:"Mar 2026",37:"Feb 2026",38:"Mar 2026",39:"Apr 2026",40:"Apr 2026" };
export function TrustBadge({ resourceId }) {
  const date = VERIFIED_DATES[resourceId];
  const isRecent = date && (date.includes("Apr 2026")||date.includes("Mar 2026"));
  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:5,background:isRecent?"#F0FBF4":"#FFF8F0",border:`1px solid ${isRecent?"rgba(45,106,79,0.2)":"rgba(244,162,97,0.3)"}`,borderRadius:8,padding:"4px 8px",fontSize:10,fontWeight:600,color:isRecent?"#1B4332":"#7B4B00" }}>
      <span style={{ fontSize:10 }}>{isRecent?"✓":"⚠"}</span>
      {date?`Verified ${date}`:"Verify before visiting"}
    </div>
  );
}

/* ── REPORT ISSUE BUTTON ── */
export function ReportIssueButton({ resource, t={} }) {
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [issue, setIssue] = useState("");
  const [issueType, setIssueType] = useState("hours");
  const issueTypes = [{id:"hours",label:"Wrong hours"},{id:"closed",label:"Permanently closed"},{id:"phone",label:"Wrong phone number"},{id:"address",label:"Wrong address"},{id:"other",label:"Other issue"}];
  function submit() {
    trackEvent("issue_reported",{resourceId:resource.id,resourceName:resource.name,issueType});
    try { const reports=JSON.parse(localStorage.getItem("dh_issue_reports")||"[]"); reports.push({resourceId:resource.id,resourceName:resource.name,issueType,details:issue,date:new Date().toISOString()}); localStorage.setItem("dh_issue_reports",JSON.stringify(reports)); } catch {}
    setSubmitted(true); setShowForm(false);
  }
  if (submitted) return <div style={{ fontSize:11,color:"#2D6A4F",fontWeight:600,padding:"6px 0" }}>✓ Report received — thank you for helping keep this accurate.</div>;
  if (showForm) return (
    <div style={{ background:"#FFF8F0",borderRadius:12,padding:12,marginTop:8,border:"1px solid rgba(244,162,97,0.3)" }}>
      <div style={{ fontSize:12,fontWeight:700,color:"#7B4B00",marginBottom:10 }}>What's wrong?</div>
      <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
        {issueTypes.map(t=><button key={t.id} onClick={()=>setIssueType(t.id)} style={{ padding:"5px 10px",borderRadius:8,fontSize:11,cursor:"pointer",background:issueType===t.id?"#E76F51":"white",color:issueType===t.id?"white":"#1A1A2E",border:`1px solid ${issueType===t.id?"#E76F51":"rgba(0,0,0,0.1)"}`,fontFamily:"sans-serif",fontWeight:600 }}>{t.label}</button>)}
      </div>
      <input value={issue} onChange={e=>setIssue(e.target.value)} placeholder="Optional: add details…" style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid rgba(0,0,0,0.1)",fontSize:12,fontFamily:"sans-serif",boxSizing:"border-box",marginBottom:8 }} />
      <div style={{ display:"flex",gap:6 }}>
        <button onClick={submit} style={{ flex:1,background:"#E76F51",color:"white",border:"none",borderRadius:8,padding:"8px",fontSize:12,fontWeight:600,cursor:"pointer" }}>Submit Report</button>
        <button onClick={()=>setShowForm(false)} style={{ flex:1,background:"white",color:"#6B7080",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"8px",fontSize:12,cursor:"pointer" }}>Cancel</button>
      </div>
    </div>
  );
  return <button onClick={()=>setShowForm(true)} style={{ background:"transparent",border:"none",color:"#9BA8A0",fontSize:11,cursor:"pointer",padding:"4px 0",textDecoration:"underline",fontFamily:"sans-serif" }}>? {t.reportIncorrectInfo || "Report incorrect info"}</button>;
}

/* ── HEALTH SCREEN ── */
const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";
const OFF_API = "https://world.openfoodfacts.org/api/v2/product";

function scoreNutrition(product) {
  const n = product.nutriments || {};
  const score = { red:0,yellow:0,green:0,warnings:[],reasons:[],positives:[] };
  const sugar=n["sugars_100g"]; if(sugar!==undefined){ if(sugar>22.5){score.red++;score.warnings.push(`High sugar (${sugar.toFixed(1)}g per 100g)`);}else if(sugar>5){score.yellow++;score.reasons.push(`Moderate sugar (${sugar.toFixed(1)}g per 100g)`);}else{score.green++;score.positives.push("Low sugar");} }
  const satFat=n["saturated-fat_100g"]; if(satFat!==undefined){ if(satFat>5){score.red++;score.warnings.push(`High saturated fat (${satFat.toFixed(1)}g per 100g)`);}else if(satFat>1.5){score.yellow++;score.reasons.push(`Moderate saturated fat (${satFat.toFixed(1)}g per 100g)`);}else{score.green++;score.positives.push("Low saturated fat");} }
  const salt=n["salt_100g"]; if(salt!==undefined){ if(salt>1.5){score.red++;score.warnings.push(`High salt (${salt.toFixed(1)}g per 100g)`);}else if(salt>0.3){score.yellow++;score.reasons.push(`Moderate salt (${salt.toFixed(1)}g per 100g)`);}else{score.green++;score.positives.push("Low salt");} }
  const fiber=n["fiber_100g"]; if(fiber!==undefined&&fiber>=3){score.green++;score.positives.push(`Good source of fiber (${fiber.toFixed(1)}g per 100g)`);}
  const protein=n["proteins_100g"]; if(protein!==undefined&&protein>=10){score.green++;score.positives.push(`Good source of protein (${protein.toFixed(1)}g per 100g)`);}
  const nutriScore=product.nutriscore_grade||product.nutrition_grade_fr; if(nutriScore)score.nutriScore=nutriScore.toUpperCase();
  let rating,color,emoji,label;
  if(score.red>=2||(score.red>=1&&score.yellow>=2)){rating="red";color="#D62828";emoji="🔴";label="Limit This";}
  else if(score.red>=1||score.yellow>=2){rating="yellow";color="#C9A84C";emoji="🟡";label="Eat in Moderation";}
  else{rating="green";color="#2D6A4F";emoji="🟢";label="Good Choice";}
  return {...score,rating,color,emoji,label};
}

const ALTERNATIVES = {
  chips:["Air-popped popcorn (plain)","Rice cakes","Carrot sticks","Roasted chickpeas"],
  soda:["Water with lemon","Sparkling water","Unsweetened iced tea","Low-fat milk"],
  candy:["Fresh fruit","Raisins or dried fruit (small portion)","Dark chocolate (1 square)","Apple slices with peanut butter"],
  cookies:["Whole grain crackers","Fresh fruit","Yogurt with berries","Oatmeal"],
  "white bread":["Whole wheat bread","Whole grain bread","Rye bread","Corn tortillas"],
  cereal:["Oatmeal","Whole grain cereal (low sugar)","Shredded Wheat","Bran flakes"],
  "hot dog":["Grilled chicken","Turkey breast","Bean burger","Grilled fish"],
  bacon:["Turkey bacon (limit)","Canadian bacon","Avocado","Eggs"],
  default:["Fresh fruits or vegetables","Whole grain alternatives","Low-sodium options","Water instead of sugary drinks"],
};
function getAlternatives(productName) {
  const name=(productName||"").toLowerCase();
  for(const [key,alts] of Object.entries(ALTERNATIVES)){ if(name.includes(key))return alts; }
  return ALTERNATIVES.default;
}

export function HealthScreen() {
  const [mode, setMode] = useState("search");
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [score, setScore] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState(()=>{ try{return JSON.parse(localStorage.getItem("dh_health_history")||"[]");}catch{return[];} });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function saveToHistory(prod, sc) {
    const entry={name:prod.product_name||prod.product_name_en||"Unknown",brand:prod.brands||"",rating:sc.rating,emoji:sc.emoji,label:sc.label,date:new Date().toISOString(),barcode:prod.code||""};
    const updated=[entry,...history].slice(0,10); setHistory(updated); try{localStorage.setItem("dh_health_history",JSON.stringify(updated));}catch{}
  }

  async function searchByName(name) {
    if(!name.trim())return; setMode("loading"); trackEvent("health_search",{query:name});
    try {
      const url=`${OFF_SEARCH}?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,product_name_en,brands,nutriscore_grade,nutrition_grade_fr,nutriments,image_front_small_url,categories_tags,ingredients_text`;
      const res=await fetch(url); const data=await res.json();
      if(data.products&&data.products.length>0){ const prod=data.products[0]; const sc=scoreNutrition(prod); setProduct(prod); setScore(sc); saveToHistory(prod,sc); setMode("result"); }
      else{ setErrorMsg(`No results found for "${name}". Try a different spelling or scan the barcode.`); setMode("error"); }
    } catch{ setErrorMsg("Couldn't connect to the food database. Check your internet and try again."); setMode("error"); }
  }

  async function searchByBarcode(code) {
    setMode("loading"); trackEvent("health_barcode",{barcode:code});
    try {
      const res=await fetch(`${OFF_API}/${code}?fields=product_name,product_name_en,brands,nutriscore_grade,nutrition_grade_fr,nutriments,image_front_small_url,categories_tags,code`);
      const data=await res.json();
      if(data.status===1&&data.product){ const sc=scoreNutrition(data.product); setProduct(data.product); setScore(sc); saveToHistory(data.product,sc); setMode("result"); }
      else{ setErrorMsg(`Barcode ${code} not found. Try searching by name instead.`); setMode("error"); }
    } catch{ setErrorMsg("Couldn't connect to the food database. Check your internet and try again."); setMode("error"); }
  }

  async function startCamera() {
    setMode("scan");
    try { const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}); streamRef.current=stream; if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();} }
    catch{ setErrorMsg("Camera access denied. Please enter the barcode number manually below."); setMode("error"); }
  }
  function stopCamera() { if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;} }
  function reset() { stopCamera(); setProduct(null); setScore(null); setQuery(""); setBarcode(""); setErrorMsg(""); setMode("search"); }

  function NutriBadge({label,value,unit,thresholdGood,thresholdBad}) {
    if(value===undefined||value===null)return null;
    const isGood=value<=thresholdGood; const isBad=value>=thresholdBad;
    const color=isBad?"#D62828":isGood?"#2D6A4F":"#C9A84C";
    return <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,0.05)" }}><div style={{ fontSize:12,color:"#3A3020" }}>{label}</div><div style={{ fontSize:12,fontWeight:700,color }}>{typeof value==="number"?value.toFixed(1):value}{unit}</div></div>;
  }

  const n = product?.nutriments || {};
  const productName = product?.product_name||product?.product_name_en||"Unknown Product";
  const alternatives = score?.rating!=="green" ? getAlternatives(productName) : [];

  return (
    <div>
      <div style={{ background:"linear-gradient(160deg,#1A1A2E 0%,#2D5E8F 100%)",padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
          <div style={{ fontSize:28 }}>🥗</div>
          <div>
            <div style={{ fontSize:22,color:"white",fontWeight:700,lineHeight:1.2 }}>Food Health Checker</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,0.75)" }}>Scan a barcode or search by name</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:12,marginTop:10 }}>
          {[["🟢","Good Choice"],["🟡","Moderate"],["🔴","Limit This"]].map(([e,l])=>(
            <div key={l} style={{ display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"3px 8px" }}>
              <span style={{ fontSize:10 }}>{e}</span><span style={{ fontSize:10,color:"white",fontWeight:600 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 24px" }}>
        {(mode==="search"||mode==="error")&&(
          <>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Search by food name</div>
              <div style={{ display:"flex",gap:8 }}>
                <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchByName(query)} placeholder="e.g. Cheerios, white rice, apple..." style={{ flex:1,padding:"12px 14px",borderRadius:12,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"sans-serif",outline:"none" }} />
                <button onClick={()=>searchByName(query)} style={{ background:"#2D5E8F",color:"white",border:"none",borderRadius:12,padding:"0 16px",fontSize:20,cursor:"pointer" }}>🔍</button>
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
              <div style={{ flex:1,height:1,background:"rgba(0,0,0,0.07)" }} /><div style={{ fontSize:11,color:"#9BA8A0",fontWeight:600 }}>OR</div><div style={{ flex:1,height:1,background:"rgba(0,0,0,0.07)" }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Scan barcode</div>
              <button onClick={startCamera} style={{ width:"100%",background:"linear-gradient(135deg,#1A1A2E,#2D5E8F)",color:"white",border:"none",borderRadius:14,padding:"16px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>📷 Open Camera to Scan Barcode</button>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Or enter barcode number manually</div>
              <div style={{ display:"flex",gap:8 }}>
                <input type="number" value={barcode} onChange={e=>setBarcode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&barcode.length>=8&&searchByBarcode(barcode)} placeholder="e.g. 012000001765" style={{ flex:1,padding:"12px 14px",borderRadius:12,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"sans-serif",outline:"none" }} />
                <button onClick={()=>barcode.length>=8&&searchByBarcode(barcode)} disabled={barcode.length<8} style={{ background:barcode.length>=8?"#2D5E8F":"#E2E8F0",color:barcode.length>=8?"white":"#9BA8A0",border:"none",borderRadius:12,padding:"0 16px",fontSize:14,fontWeight:700,cursor:barcode.length>=8?"pointer":"default" }}>Go</button>
              </div>
            </div>
            {mode==="error"&&<div style={{ background:"#FFF0F0",border:"1px solid rgba(214,40,40,0.2)",borderRadius:12,padding:14,marginBottom:16 }}><div style={{ fontSize:13,color:"#D62828",fontWeight:600,marginBottom:4 }}>⚠ Not Found</div><div style={{ fontSize:12,color:"#9B1C1C",lineHeight:1.5 }}>{errorMsg}</div></div>}
            {history.length>0&&(
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10 }}>Recently Checked</div>
                {history.slice(0,5).map((h,i)=>(
                  <div key={i} onClick={()=>h.barcode?searchByBarcode(h.barcode):searchByName(h.name)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(0,0,0,0.05)",cursor:"pointer" }}>
                    <span style={{ fontSize:16 }}>{h.emoji}</span>
                    <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:600,color:"#1A1A2E" }}>{h.name}</div><div style={{ fontSize:10,color:"#9BA8A0" }}>{h.brand} · {new Date(h.date).toLocaleDateString()}</div></div>
                    <div style={{ fontSize:10,fontWeight:700,color:h.rating==="green"?"#2D6A4F":h.rating==="yellow"?"#C9A84C":"#D62828" }}>{h.label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode==="scan"&&(
          <div style={{ marginBottom:20 }}>
            <div style={{ borderRadius:16,overflow:"hidden",marginBottom:12,position:"relative",background:"#000",aspectRatio:"4/3" }}>
              <video ref={videoRef} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} playsInline muted />
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ width:220,height:120,border:"2px solid rgba(255,255,255,0.8)",borderRadius:8,boxShadow:"0 0 0 9999px rgba(0,0,0,0.4)" }} />
              </div>
              <div style={{ position:"absolute",bottom:12,left:0,right:0,textAlign:"center",fontSize:11,color:"white",fontWeight:600 }}>Point camera at the barcode</div>
            </div>
            <div style={{ fontSize:12,color:"#6B7C6E",marginBottom:12,textAlign:"center" }}>Camera scanning coming soon — please enter the barcode number below</div>
            <div style={{ display:"flex",gap:8,marginBottom:10 }}>
              <input type="number" value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="Enter barcode number" style={{ flex:1,padding:"12px 14px",borderRadius:12,border:"1.5px solid rgba(0,0,0,0.1)",fontSize:14,fontFamily:"sans-serif" }} />
              <button onClick={()=>{stopCamera();barcode.length>=8&&searchByBarcode(barcode);}} disabled={barcode.length<8} style={{ background:"#2D5E8F",color:"white",border:"none",borderRadius:12,padding:"0 16px",fontSize:14,fontWeight:700,cursor:"pointer" }}>Go</button>
            </div>
            <button onClick={reset} style={{ width:"100%",background:"white",color:"#6B7C6E",border:"1px solid rgba(0,0,0,0.1)",borderRadius:12,padding:12,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
          </div>
        )}

        {mode==="loading"&&(
          <div style={{ textAlign:"center",padding:"40px 0" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:16,fontWeight:600,color:"#1A1A2E",marginBottom:4 }}>Checking nutrition data...</div>
            <div style={{ fontSize:12,color:"#9BA8A0" }}>Powered by Open Food Facts</div>
          </div>
        )}

        {mode==="result"&&product&&score&&(
          <div>
            <div style={{ display:"flex",gap:14,alignItems:"flex-start",marginBottom:16 }}>
              {product.image_front_small_url&&<img src={product.image_front_small_url} alt={productName} style={{ width:72,height:72,objectFit:"contain",borderRadius:12,background:"#F5F5F0",flexShrink:0 }} />}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16,fontWeight:700,color:"#1A1A2E",lineHeight:1.2,marginBottom:4 }}>{productName}</div>
                {product.brands&&<div style={{ fontSize:12,color:"#6B7C6E",marginBottom:8 }}>{product.brands}</div>}
                <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:score.rating==="green"?"#D8F3DC":score.rating==="yellow"?"#FFF3CD":"#FFE8E8",border:`1.5px solid ${score.color}33`,borderRadius:12,padding:"8px 14px" }}>
                  <span style={{ fontSize:22 }}>{score.emoji}</span>
                  <div><div style={{ fontSize:15,fontWeight:800,color:score.color }}>{score.label}</div>{score.nutriScore&&<div style={{ fontSize:10,color:"#6B7C6E" }}>Nutri-Score: {score.nutriScore}</div>}</div>
                </div>
              </div>
            </div>
            {(score.warnings.length>0||score.positives.length>0)&&(
              <div style={{ background:"#F8FAF9",borderRadius:14,padding:14,marginBottom:14,border:"1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Why this rating?</div>
                {score.warnings.map((w,i)=><div key={i} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:4 }}><span style={{ color:"#D62828",fontWeight:700,fontSize:12,marginTop:1 }}>✗</span><span style={{ fontSize:12,color:"#9B1C1C" }}>{w}</span></div>)}
                {score.reasons.map((r,i)=><div key={i} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:4 }}><span style={{ color:"#C9A84C",fontWeight:700,fontSize:12,marginTop:1 }}>~</span><span style={{ fontSize:12,color:"#7B5800" }}>{r}</span></div>)}
                {score.positives.map((p,i)=><div key={i} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:4 }}><span style={{ color:"#2D6A4F",fontWeight:700,fontSize:12,marginTop:1 }}>✓</span><span style={{ fontSize:12,color:"#1B4332" }}>{p}</span></div>)}
              </div>
            )}
            <div style={{ background:"white",borderRadius:14,padding:14,marginBottom:14,boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Per 100g</div>
              <NutriBadge label="Calories" value={n["energy-kcal_100g"]} unit=" kcal" thresholdGood={150} thresholdBad={400} />
              <NutriBadge label="Sugar" value={n["sugars_100g"]} unit="g" thresholdGood={5} thresholdBad={22.5} />
              <NutriBadge label="Saturated Fat" value={n["saturated-fat_100g"]} unit="g" thresholdGood={1.5} thresholdBad={5} />
              <NutriBadge label="Salt" value={n["salt_100g"]} unit="g" thresholdGood={0.3} thresholdBad={1.5} />
              <NutriBadge label="Fiber" value={n["fiber_100g"]} unit="g" thresholdGood={99} thresholdBad={-1} />
              <NutriBadge label="Protein" value={n["proteins_100g"]} unit="g" thresholdGood={99} thresholdBad={-1} />
            </div>
            {alternatives.length>0&&(
              <div style={{ background:"#F0FBF4",borderRadius:14,padding:14,marginBottom:14,border:"1px solid rgba(45,106,79,0.15)" }}>
                <div style={{ fontSize:12,fontWeight:700,color:"#2D6A4F",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>💚 Healthier Alternatives</div>
                {alternatives.map((alt,i)=>(
                  <div key={i} onClick={()=>{setQuery(alt);searchByName(alt);}} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<alternatives.length-1?"1px solid rgba(45,106,79,0.08)":"none",cursor:"pointer" }}>
                    <span style={{ color:"#2D6A4F",fontWeight:700 }}>→</span><span style={{ fontSize:13,color:"#1B4332",flex:1 }}>{alt}</span><span style={{ fontSize:10,color:"#2D6A4F",fontWeight:600 }}>Check this</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize:10,color:"#9BA8A0",lineHeight:1.5,marginBottom:12,fontStyle:"italic" }}>Data sourced from Open Food Facts. Ratings are general guidance only and do not constitute medical or dietary advice.</div>
            <button onClick={reset} style={{ width:"100%",background:"#2D5E8F",color:"white",border:"none",borderRadius:12,padding:14,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:20,fontFamily:"sans-serif" }}>🔍 Check Another Food</button>
          </div>
        )}
      </div>
    </div>
  );
}
