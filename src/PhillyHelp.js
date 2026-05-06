import { useState, useEffect, useRef } from "react";
import {
  InstallPrompt, StoriesSection, SMSAccessCard, EligibilityQuiz,
  PantryStatusWidget, TransitHelper, DietaryFilters, trackEvent, EXTRA_TRANSLATIONS,
  PantryInventoryWidget, IAmGoingButton, SaveResourceButton, FoundHelpButton,
  DocumentChecklist, SNAPAssistant, CrisisEscapePlan,
  FamilyProfileSetup, getFamilyProfile, getSavedResources, LegalScreen,
  TrustBadge, ReportIssueButton, HealthScreen
} from "./features";
import { translateResourceText } from "./resourceTranslations";
import { cachePublicResources, getInitialPublicResources } from "./resourceCache";

const PHILLY_RESOURCE_CACHE_KEY = "delcohelp_cached_philly_resources_v1";

// PhillyHelp — Philadelphia Community Resource App

/* ── TRANSLATIONS ── */
const T = {
  en: {
    appName:"PhillyHelp", tagline:"Find help near you, right now.", county:"Philadelphia, PA", zip:"Philadelphia · 19121",
    findResources:"Find Resources", foodHelpMore:"Food, help & more", benefits:"Benefits", snapWic:"SNAP, WIC & more",
    emergency:"Emergency", hotlinesCrisis:"Hotlines & crisis", volunteer:"Volunteer", askAI:"Ask AI",
    openNow:"Open Right Now", opensLater:"Opens Later Today", allResources:"All Resources",
    supportPantries:"Support Local Pantries", donateDesc:"Your donation keeps Philadelphia's food pantries stocked. Every $10 feeds a family for a week.",
    back:"← Back", about:"About", hours:"Hours", whatToKnow:"What to know", call:"Call", directions:"🗺️ Map",
    donatePantry:"💛 Donate to Support This Pantry", openRightNow:"● Open Right Now", opensLaterToday:"◐ Opens Later Today", closedToday:"○ Closed Today",
    home:"Home", find:"Find", hotline:"Hotline",
    searchPlaceholder:"Search food, diapers, legal help…", sortedByDistance:"resources · sorted by distance",
    benefitsNav:"Benefits Navigator", benefitsDesc:"Find programs you may qualify for in Pennsylvania",
    quickEligibility:"Quick Eligibility Check", applyCompass:"Apply on PA COMPASS →",
    giveBack:"Give Back to Your Community", volunteerDesc:"Volunteer opportunities near Philadelphia, PA",
    whyMatters:"💛 Why it matters", volunteerImpact:"All local pantries are entirely volunteer-run. One 2-hour shift helps serve 30–50 families per week.",
    signUp:"Sign up", emergencyHotlines:"Emergency & Crisis Hotlines", hotlinesDesc:"Free, confidential, available 24/7",
    immediateEmergency:"🚨 Immediate Emergency", additionalResources:"Additional Resources",
    confidentialNote:"All calls are confidential. You don't have to give your name. Help is always available — you are not alone.",
    makeDonation:"Make a Donation", donateAllGoes:"100% goes directly to local Philadelphia organizations",
    selectAmount:"Select Amount", donateTo:"Donate To", continue:"Continue →", confirmDonation:"Confirm Donation",
    amount:"Amount", to:"To", impact:"Impact", payment:"Payment", thankYou:"Thank you,", onItsWay:"is on its way to",
    yourImpact:"Your impact:", done:"Done", secure:"🔒 Secure · 100% goes to local organizations",
    needHelpNow:"🚨 I Need Help Right Now", emergencyMode:"Emergency Mode", emergencyModeDesc:"Showing the 3 closest open resources + crisis lines",
    noOpenResources:"No resources open right now — call Philly 311 for immediate help.",
    submitResource:"Submit a Resource", submitDesc:"Know a pantry or service we're missing? Add it here.",
    orgName:"Organization Name", orgAddress:"Address", orgPhone:"Phone Number", orgCategory:"Category",
    orgHours:"Hours / Days Open", orgNotes:"Additional Notes (optional)", submit:"Submit Resource",
    submitThanks:"Thank you! We'll review and add this resource within 24 hours.",
    notifications:"Notifications", dismiss:"Dismiss",
    impactDashboard:"Impact Dashboard", impactDesc:"Real community impact in Philadelphia",
    totalUsers:"Total Users", resourcesFound:"Resources Found", donationsGiven:"Donations Given", familiesHelped:"Families Helped",
    sponsoredBy:"Proudly supported by", monthlyImpact:"Monthly Impact Report",
    aiChat:"PhillyHelp AI", aiDesc:"Ask me anything about local resources", aiPlaceholder:"e.g. I need diapers and food near me…",
    aiSend:"Send", aiThinking:"Finding resources for you…",
  },
  es: {
    appName:"PhillyAyuda", tagline:"Encuentra ayuda cerca de ti, ahora mismo.", county:"Philadelphia, PA", zip:"Philadelphia · 19121",
    findResources:"Buscar Recursos", foodHelpMore:"Comida, ayuda y más", benefits:"Beneficios", snapWic:"SNAP, WIC y más",
    emergency:"Emergencia", hotlinesCrisis:"Líneas de crisis", volunteer:"Voluntario", askAI:"Preguntar IA",
    openNow:"Abierto Ahora", opensLater:"Abre Más Tarde Hoy", allResources:"Todos los Recursos",
    supportPantries:"Apoya las despensas de alimentos", donateDesc:"Tu donación mantiene abastecidas las despensas de alimentos. Cada $10 alimenta a una familia por una semana.",
    back:"← Atrás", about:"Acerca de", hours:"Horario", whatToKnow:"Lo que debes saber", call:"Llamar", directions:"🗺️ Mapa",
    donatePantry:"💛 Donar para apoyar esta despensa de alimentos", openRightNow:"● Abierto Ahora", opensLaterToday:"◐ Abre Más Tarde", closedToday:"○ Cerrado Hoy",
    home:"Inicio", find:"Buscar", hotline:"Línea de Crisis",
    searchPlaceholder:"Buscar comida, pañales, ayuda legal…", sortedByDistance:"recursos · ordenados por distancia",
    benefitsNav:"Navegador de Beneficios", benefitsDesc:"Encuentra programas para los que puedes calificar en Pennsylvania",
    quickEligibility:"Verificación Rápida de Elegibilidad", applyCompass:"Solicitar en PA COMPASS →",
    giveBack:"Devuelve a Tu Comunidad", volunteerDesc:"Oportunidades de voluntariado cerca de Philadelphia, PA",
    whyMatters:"💛 Por qué importa", volunteerImpact:"Todas las despensas de alimentos son administradas por voluntarios. Un turno de 2 horas ayuda a 30–50 familias por semana.",
    signUp:"Inscribirse", emergencyHotlines:"Líneas de Emergencia y Crisis", hotlinesDesc:"Gratis, confidencial, disponible 24/7",
    immediateEmergency:"🚨 Emergencia Inmediata", additionalResources:"Recursos Adicionales",
    confidentialNote:"Todas las llamadas son confidenciales. No tienes que dar tu nombre. La ayuda siempre está disponible — no estás solo.",
    makeDonation:"Hacer una Donación", donateAllGoes:"El 100% va directamente a organizaciones locales de Philadelphia",
    selectAmount:"Seleccionar Monto", donateTo:"Donar A", continue:"Continuar →", confirmDonation:"Confirmar Donación",
    amount:"Monto", to:"A", impact:"Impacto", payment:"Pago", thankYou:"Gracias,", onItsWay:"está en camino a",
    yourImpact:"Tu impacto:", done:"Listo", secure:"🔒 Seguro · 100% va a organizaciones locales",
    needHelpNow:"🚨 Necesito Ayuda Ahora", emergencyMode:"Modo de Emergencia", emergencyModeDesc:"Mostrando los 3 recursos abiertos más cercanos + líneas de crisis",
    noOpenResources:"No hay recursos abiertos ahora — llama a Philly 311 (marcar 211) para ayuda inmediata.",
    submitResource:"Enviar un Recurso", submitDesc:"¿Conoces una despensa de alimentos o servicio que nos falta? Agrégalo aquí.",
    orgName:"Nombre de la Organización", orgAddress:"Dirección", orgPhone:"Número de Teléfono", orgCategory:"Categoría",
    orgHours:"Horario / Días Abierto", orgNotes:"Notas Adicionales (opcional)", submit:"Enviar Recurso",
    submitThanks:"¡Gracias! Revisaremos y agregaremos este recurso en 24 horas.",
    notifications:"Notificaciones", dismiss:"Descartar",
    impactDashboard:"Panel de Impacto", impactDesc:"Impacto comunitario real en Philadelphia",
    totalUsers:"Usuarios Totales", resourcesFound:"Recursos Encontrados", donationsGiven:"Donaciones Dadas", familiesHelped:"Familias Ayudadas",
    sponsoredBy:"Orgullosamente apoyado por", monthlyImpact:"Informe de Impacto Mensual",
    aiChat:"IA de PhillyAyuda", aiDesc:"Pregúntame cualquier cosa sobre recursos locales", aiPlaceholder:"ej. Necesito pañales y comida cerca de mí…",
    aiSend:"Enviar", aiThinking:"Buscando recursos para ti…",
  }
};

// Merge Vietnamese and Chinese — inherit ALL English keys, override only what's translated
Object.assign(T, EXTRA_TRANSLATIONS);
// Deep fill: any key missing in vi/zh falls back to English value
["vi","zh"].forEach(lang => {
  if (T[lang]) {
    Object.keys(T.en).forEach(key => {
      if (T[lang][key] === undefined) T[lang][key] = T.en[key];
    });
  }
});

/* ── DATA ── */

// Zip code center coordinates for distance calculation
const ZIP_COORDS = {
  "19102":{ lat:39.9526, lng:-75.1652 },
  "19104":{ lat:39.9612, lng:-75.1996 },
  "19107":{ lat:39.9490, lng:-75.1585 },
  "19121":{ lat:39.9846, lng:-75.1748 },
  "19124":{ lat:40.0178, lng:-75.0906 },
  "19125":{ lat:39.9776, lng:-75.1252 },
  "19132":{ lat:40.0023, lng:-75.1727 },
  "19133":{ lat:39.9912, lng:-75.1419 },
  "19134":{ lat:39.9921, lng:-75.1119 },
  "19139":{ lat:39.9618, lng:-75.2282 },
  "19140":{ lat:40.0118, lng:-75.1459 },
  "19141":{ lat:40.0366, lng:-75.1458 },
  "19143":{ lat:39.9444, lng:-75.2257 },
  "19144":{ lat:40.0343, lng:-75.1747 },
  "19145":{ lat:39.9155, lng:-75.1847 },
  "19146":{ lat:39.9395, lng:-75.1866 },
  "19148":{ lat:39.9168, lng:-75.1596 },
};

const ZIP_NEIGHBORHOODS = {
  "19102":"Center City",
  "19104":"University City",
  "19107":"Center City",
  "19121":"Brewerytown / North Philadelphia",
  "19124":"Frankford",
  "19125":"Fishtown",
  "19132":"Strawberry Mansion",
  "19133":"Fairhill / Kensington",
  "19134":"Kensington / Port Richmond",
  "19139":"West Philadelphia",
  "19140":"Hunting Park",
  "19141":"Logan / Olney",
  "19143":"Kingsessing / Southwest Philadelphia",
  "19144":"Germantown",
  "19145":"South Philadelphia",
  "19146":"Point Breeze / Graduate Hospital",
  "19148":"Pennsport / South Philadelphia",
};

function calcDistance(zip1, zip2) {
  const c1 = ZIP_COORDS[zip1], c2 = ZIP_COORDS[zip2];
  if (!c1 || !c2) return 99;
  const R = 3958.8;
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLng = (c2.lng - c1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(c1.lat*Math.PI/180)*Math.cos(c2.lat*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

const RESOURCES = [
  { id:1, zip:"19121", category:"food", name:"Sunday Breakfast Rescue Mission", address:"302 N 13th St, Philadelphia PA 19107", phone:"215-922-6400", miles:0.8, hours:[{day:"Daily",time:"7:00 AM – 8:00 AM"}], tags:["hot meals","daily","walk-in"], color:"#003594", description:"Philadelphia's oldest rescue mission serving hot meals daily. No registration required.", openDays:[0,1,2,3,4,5,6], openStart:7, openEnd:8, appointmentRequired:false, walkInAvailable:true, notes:"No registration required." },
  { id:2, zip:"19121", category:"food", name:"Philabundance Community Kitchen", address:"3616 S Galloway St, Philadelphia PA 19148", phone:"215-339-0900", miles:1.2, hours:[{day:"Monday–Friday",time:"8:00 AM – 4:00 PM"}], tags:["Philadelphia's largest food bank","partner network","fresh produce"], color:"#003594", description:"Philadelphia's largest hunger relief organization distributing to 350+ agencies citywide.", openDays:[1,2,3,4,5], openStart:8, openEnd:16 },
  { id:3, zip:"19132", category:"food", name:"Strawberry Mansion Community Pantry", address:"2900 W Diamond St, Philadelphia PA 19121", phone:"215-978-1000", miles:0.5, hours:[{day:"Wednesday",time:"10:00 AM – 1:00 PM"},{day:"Saturday",time:"9:00 AM – 11:00 AM"}], tags:["North Philly","twice weekly","no ID required"], color:"#003594", description:"Neighborhood pantry serving Strawberry Mansion and surrounding blocks. No documentation required.", openDays:[3,6], openStart:9, openEnd:13, requiresID:false, requiresProofOfAddress:false, notes:"No documentation required." },
  { id:4, zip:"19139", category:"food", name:"West Philadelphia Food Pantry", address:"51 N 52nd St, Philadelphia PA 19139", phone:"215-747-0500", miles:0.4, hours:[{day:"Tuesday",time:"10:00 AM – 1:00 PM"},{day:"Thursday",time:"4:00 PM – 6:00 PM"}], tags:["West Philly","evening hours","fresh produce"], color:"#0046AD", description:"Community pantry serving West Philadelphia families with fresh produce and pantry staples twice weekly.", openDays:[2,4], openStart:10, openEnd:18 },
  { id:5, zip:"19143", category:"food", name:"Kingsessing Recreation Center Pantry", address:"1201 S 49th St, Philadelphia PA 19143", phone:"215-685-1565", miles:0.6, hours:[{day:"Friday",time:"11:00 AM – 2:00 PM"}], tags:["Kingsessing","city rec center","no appointment"], color:"#0046AD", description:"Weekly food distribution at Kingsessing Rec Center. Open to all Southwest Philadelphia families.", openDays:[5], openStart:11, openEnd:14, appointmentRequired:false, walkInAvailable:true, notes:"No appointment listed." },
  { id:6, zip:"19139", category:"assistance", name:"People's Emergency Center", address:"325 N 39th St, Philadelphia PA 19104", phone:"215-382-7523", miles:0.9, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["housing","homelessness prevention","West Philly"], color:"#E76F51", description:"Housing stability, emergency shelter, and support services for West Philadelphia families.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:7, zip:"19134", category:"food", name:"Esperanza Food Pantry", address:"4261 N 5th St, Philadelphia PA 19140", phone:"215-324-0746", miles:0.7, hours:[{day:"Wednesday",time:"9:00 AM – 12:00 PM"}], tags:["bilingual","North Philly","Hispanic ministry"], color:"#003594", description:"Faith-based pantry serving the Hispanic and Latino community of North Philadelphia. Spanish-speaking staff on site.", openDays:[3], openStart:9, openEnd:12 },
  { id:8, zip:"19134", category:"food", name:"Prevention Point Philadelphia", address:"2913 Kensington Ave, Philadelphia PA 19134", phone:"215-634-5955", miles:0.3, hours:[{day:"Monday–Friday",time:"9:00 AM – 3:00 PM"}], tags:["Kensington","harm reduction","food + services"], color:"#0046AD", description:"Food, clean supplies, and services for Kensington residents including those experiencing addiction.", openDays:[1,2,3,4,5], openStart:9, openEnd:15 },
  { id:9, zip:"19125", category:"food", name:"Fishtown Community Food Pantry", address:"1001 E Berks St, Philadelphia PA 19125", phone:"215-425-3892", miles:0.5, hours:[{day:"Saturday",time:"9:00 AM – 12:00 PM"}], tags:["Fishtown","Saturday only","choice pantry"], color:"#003594", description:"Choice-style Saturday pantry in Fishtown. Families select what they need from available stock.", openDays:[6], openStart:9, openEnd:12 },
  { id:10, zip:"19144", category:"food", name:"Germantown Salvation Army Pantry", address:"55 E Chelten Ave, Philadelphia PA 19144", phone:"215-438-3304", miles:0.4, hours:[{day:"Monday–Thursday",time:"9:00 AM – 12:00 PM"}], tags:["Germantown","4 days/week","daily staples"], color:"#D62828", description:"Food assistance four days a week in Germantown. No appointment needed for first visit.", openDays:[1,2,3,4], openStart:9, openEnd:12, appointmentRequired:false, walkInAvailable:true, notes:"No appointment needed for first visit." },
  { id:11, zip:"19145", category:"food", name:"South Philadelphia Food Pantry", address:"2200 S Broad St, Philadelphia PA 19145", phone:"215-467-1700", miles:0.5, hours:[{day:"Monday",time:"10:00 AM – 12:00 PM"},{day:"Thursday",time:"4:00 PM – 6:00 PM"}], tags:["South Philly","twice weekly","no ID required"], color:"#003594", description:"Serves South Philadelphia's diverse community with food and essential items twice per week.", openDays:[1,4], openStart:10, openEnd:18, requiresID:false },
  { id:12, zip:"19148", category:"food", name:"St. Thomas Aquinas Church Pantry", address:"1719 Morris St, Philadelphia PA 19145", phone:"215-755-5123", miles:0.6, hours:[{day:"Wednesday",time:"10:00 AM – 12:00 PM"},{day:"Saturday",time:"9:00 AM – 11:00 AM"}], tags:["South Philly","Catholic outreach","Pennsport area"], color:"#003594", description:"Catholic parish pantry open to all South Philadelphia neighbors regardless of affiliation.", openDays:[3,6], openStart:9, openEnd:12 },
  { id:13, zip:"19146", category:"food", name:"Point Breeze Community Pantry", address:"2100 Federal St, Philadelphia PA 19146", phone:"215-545-4822", miles:0.4, hours:[{day:"Tuesday",time:"11:00 AM – 1:00 PM"}], tags:["Point Breeze","Tuesday","walk-in"], color:"#0046AD", description:"Neighborhood pantry serving Point Breeze families with food and household essentials weekly.", openDays:[2], openStart:11, openEnd:13 },
  { id:14, zip:"19141", category:"food", name:"Logan Community Food Pantry", address:"4930 N Broad St, Philadelphia PA 19141", phone:"215-324-3100", miles:0.3, hours:[{day:"Monday",time:"10:00 AM – 12:00 PM"},{day:"Wednesday",time:"10:00 AM – 12:00 PM"},{day:"Friday",time:"10:00 AM – 12:00 PM"}], tags:["Logan","3x weekly","large distribution"], color:"#003594", description:"One of North Philadelphia's most active pantries — open three times weekly serving Logan and Olney families.", openDays:[1,3,5], openStart:10, openEnd:12 },
  { id:15, zip:"19140", category:"food", name:"Hunting Park Christian Church Pantry", address:"3801 N 9th St, Philadelphia PA 19140", phone:"215-329-2626", miles:0.5, hours:[{day:"Friday",time:"10:00 AM – 1:00 PM"}], tags:["Hunting Park","North Philly","faith-based"], color:"#0046AD", description:"Friday food distribution at Hunting Park Christian Church. Bring a bag.", openDays:[5], openStart:10, openEnd:13 },
  { id:16, zip:"19124", category:"food", name:"Frankford Community Pantry", address:"4530 Frankford Ave, Philadelphia PA 19124", phone:"215-744-5230", miles:0.4, hours:[{day:"Tuesday",time:"10:00 AM – 12:00 PM"},{day:"Saturday",time:"9:00 AM – 11:00 AM"}], tags:["Frankford","Northeast corridor","twice weekly"], color:"#003594", description:"Twice-weekly pantry serving Frankford and surrounding Northeast Philadelphia communities.", openDays:[2,6], openStart:9, openEnd:12 },
  { id:17, zip:"19121", category:"assistance", name:"City of Philadelphia Office of Community Empowerment", address:"1401 JFK Blvd, Philadelphia PA 19102", phone:"215-686-7190", miles:2.0, hours:[{day:"Monday–Friday",time:"8:30 AM – 5:00 PM"}], tags:["SNAP enrollment","utility assistance","city services"], color:"#F4A261", description:"Philadelphia's official community assistance office. Navigate SNAP, LIHEAP, housing, and city programs.", openDays:[1,2,3,4,5], openStart:8, openEnd:17 },
  { id:18, zip:"19139", category:"legal", name:"Community Legal Services", address:"1424 Chestnut St, Philadelphia PA 19102", phone:"215-981-3700", miles:2.5, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["free legal help","eviction defense","benefits"], color:"#023E8A", description:"Philadelphia's premier free legal aid — housing, evictions, family law, benefits, and employment since 1966.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:19, zip:"19134", category:"assistance", name:"Congreso de Latinos Unidos", address:"216 W Somerset St, Philadelphia PA 19133", phone:"215-763-8870", miles:0.6, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["bilingual","Latino community","Kensington","North Philly"], color:"#E76F51", description:"Comprehensive social services for Philadelphia's Latino community — housing, food, health, and workforce in English and Spanish.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:20, zip:"19139", category:"assistance", name:"Intercultural Family Services", address:"4225 Chestnut St, Philadelphia PA 19104", phone:"215-386-1298", miles:0.5, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["multilingual","immigrant services","West Philly"], color:"#9D4EDD", description:"Serving Philadelphia's immigrant and refugee communities with food access, English classes, and resettlement support.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:21, zip:"19121", category:"assistance", name:"Philadelphia 311 Helpline", address:"Philadelphia, PA", phone:"311", miles:0.0, hours:[{day:"24/7",time:"Dial 3-1-1"}], tags:["all city services","24/7","bilingual"], color:"#003594", description:"Dial 311 for immediate connection to food, housing, utility, health, and city services across all Philadelphia neighborhoods.", openDays:[0,1,2,3,4,5,6], openStart:0, openEnd:24 },
  { id:22, zip:"19145", category:"assistance", name:"Women Against Abuse", address:"Philadelphia, PA", phone:"1-866-723-3014", miles:2.0, hours:[{day:"24/7 Hotline",time:"1-866-723-3014"}], tags:["domestic violence","women","crisis shelter"], color:"#9D4EDD", description:"Philadelphia's primary DV organization — 24/7 hotline, emergency shelter, legal advocacy, and housing for survivors.", openDays:[0,1,2,3,4,5,6], openStart:0, openEnd:24 },
  { id:23, zip:"19121", category:"assistance", name:"Philadelphia CAP Community Action", address:"1207 Chestnut St, Philadelphia PA 19107", phone:"215-567-7803", miles:1.8, hours:[{day:"Monday–Friday",time:"9:00 AM – 4:00 PM"}], tags:["emergency assistance","utility help","rent support"], color:"#E76F51", description:"Emergency financial assistance, utility help, and referrals across all Philadelphia neighborhoods.", openDays:[1,2,3,4,5], openStart:9, openEnd:16 },
];

const BENEFITS = [
  { id:"snap", name:"SNAP Food Benefits", icon:"🥫", desc:"Monthly food assistance loaded on an EBT card", link:"https://www.compass.state.pa.us" },
  { id:"wic", name:"WIC Program", icon:"👶", desc:"Food + support for pregnant women & children under 5", link:"https://www.wicworks.fns.usda.gov" },
  { id:"liheap", name:"LIHEAP Utility Help", icon:"⚡", desc:"Help paying heating and utility bills", link:"https://www.compass.state.pa.us" },
  { id:"chip", name:"CHIP Health Insurance", icon:"🏥", desc:"Free/low-cost health insurance for kids", link:"https://www.coveringkidsfamilies.org" },
  { id:"medicaid", name:"Medicaid", icon:"💊", desc:"Free health coverage for qualifying adults & families", link:"https://www.compass.state.pa.us" },
];

const HOTLINES = [
  { id:1, name:"911 Emergency", sub:"Police, Fire, Medical", number:"911", color:"#D62828", bg:"#FFF0F0", icon:"🚨", urgent:true },
  { id:2, name:"Crisis Text Line", sub:"Text HOME to 741741 — 24/7", number:"741741", color:"#D62828", bg:"#FFF0F0", icon:"💬", urgent:true, isText:true },
  { id:3, name:"988 Suicide & Crisis", sub:"Call or text 988 — 24/7 free", number:"988", color:"#7B2D8B", bg:"#F8F0FF", icon:"🧠", urgent:true },
  { id:4, name:"Philadelphia Crisis Line", sub:"Behavioral health emergency — 24/7", number:"215-685-6440", color:"#023E8A", bg:"#F0F4FF", icon:"🧩" },
  { id:5, name:"Domestic Violence Hotline", sub:"Women Against Abuse — 24/7", number:"1-866-723-3014", color:"#9D4EDD", bg:"#F8F0FF", icon:"🏠" },
  { id:6, name:"Philadelphia 311", sub:"All city services — 24/7", number:"311", color:"#003594", bg:"#EEF3FF", icon:"📞" },
  { id:7, name:"Hunger Hotline", sub:"Find food near you right now", number:"1-866-348-6479", color:"#0046AD", bg:"#EEF3FF", icon:"🍽" },
  { id:8, name:"Poison Control", sub:"24/7 medical emergency", number:"1-800-222-1222", color:"#E76F51", bg:"#FFF6F0", icon:"⚠️" },
  { id:9, name:"Homeless Outreach Hotline", sub:"Philadelphia shelter line", number:"215-232-1984", color:"#F4A261", bg:"#FFF8F0", icon:"🏠" },
  { id:10, name:"Child Abuse Hotline", sub:"PA ChildLine — 24/7 reporting", number:"1-800-932-0313", color:"#D62828", bg:"#FFF0F0", icon:"👶" },
];

// eslint-disable-next-line no-unused-vars
const CATEGORY_LABELS = { food:"Food Pantry", assistance:"Family Assistance", legal:"Legal Aid" };
// eslint-disable-next-line no-unused-vars
const CATEGORY_COLORS = { food:"#003594", assistance:"#E76F51", legal:"#023E8A" };

const IMPACT_STATS = [
  { label:"totalUsers", value:"2,847", trend:"+12% this month", icon:"👥", color:"#003594" },
  { label:"resourcesFound", value:"14,392", trend:"+8% this month", icon:"🔍", color:"#0046AD" },
  { label:"donationsGiven", value:"$8,240", trend:"+23% this month", icon:"💛", color:"#F4A261" },
  { label:"familiesHelped", value:"1,203", trend:"+15% this month", icon:"🏠", color:"#E76F51" },
];

const SPONSORS = ["Crozer Health","Main Line Health","TD Bank","Wawa Foundation","Philadelphia Government"];

function isOpenNow(r) { const now=new Date(),day=now.getDay(),hour=now.getHours()+now.getMinutes()/60; return r.openDays.includes(day)&&hour>=r.openStart&&hour<r.openEnd; }
function isOpenToday(r) { return r.openDays.includes(new Date().getDay()); }

function usePublicResourceCache(cacheKey, sourceResources) {
  const [state, setState] = useState(() => getInitialPublicResources(cacheKey, sourceResources));

  useEffect(() => {
    if (Array.isArray(sourceResources) && sourceResources.length > 0) {
      cachePublicResources(cacheKey, sourceResources);
      setState({ resources: sourceResources, usingCache: false });
      return;
    }
    setState(getInitialPublicResources(cacheKey, sourceResources));
  }, [cacheKey, sourceResources]);

  return state;
}

function useOnlineStatus() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

function SavedResourceBanner({ lang }) {
  const message = lang === "es"
    ? "Es posible que esté viendo información guardada. Llame antes cuando sea posible."
    : "You may be viewing saved resource information. Please call ahead when possible.";
  return (
    <div style={{background:"#FFF8F0",border:"1px solid rgba(244,162,97,0.35)",borderRadius:14,padding:12,margin:"0 24px 12px",color:"#7B4B00",fontSize:12,lineHeight:1.45,fontWeight:650}}>
      {message}
    </div>
  );
}

function reqText(lang, key) {
  const es = {
    idRequired:"Identificación requerida",
    proofRequired:"Comprobante de dirección requerido",
    appointment:"Cita requerida",
    walkIns:"Se aceptan visitas sin cita",
    callAhead:"Se recomienda llamar antes",
    requirements:"Requisitos",
    transportation:"Accesibilidad y transporte",
    busRoute:"Ruta de autobús",
    transitStop:"Parada de transporte",
    comingSoon:"La información de transporte estará disponible pronto.",
  };
  const en = {
    idRequired:"ID Required",
    proofRequired:"Proof of Address Required",
    appointment:"Appointment Required",
    walkIns:"Walk-ins Welcome",
    callAhead:"Call Ahead Recommended",
    requirements:"Requirements",
    transportation:"Accessibility & Transportation",
    busRoute:"Bus route",
    transitStop:"Transit stop",
    comingSoon:"Transportation information coming soon.",
  };
  return (lang === "es" ? es : en)[key];
}

function getRequirementLabels(resource, lang) {
  const labels = [];
  if (resource.requiresID === true) labels.push(reqText(lang, "idRequired"));
  if (resource.requiresProofOfAddress === true) labels.push(reqText(lang, "proofRequired"));
  if (resource.appointmentRequired === true) labels.push(reqText(lang, "appointment"));
  if (resource.appointmentRequired === false || resource.walkInAvailable === true) labels.push(reqText(lang, "walkIns"));
  if (resource.residencyRestrictions) labels.push(resource.residencyRestrictions);
  if (resource.requiresID === undefined && resource.appointmentRequired === undefined && !resource.residencyRestrictions) labels.push(reqText(lang, "callAhead"));
  return labels;
}

function RequirementChips({ resource, lang }) {
  const labels = getRequirementLabels(resource, lang);
  return labels.length ? (
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
      {labels.slice(0,3).map(label => <span key={label} className="dh-tag">{label}</span>)}
    </div>
  ) : null;
}

function AccessibilityTransportation({ resource, lang }) {
  const hasTransit = resource.nearestBusRoute || resource.nearestTransitStop || resource.transitNotes;
  return (
    <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{reqText(lang, "transportation")}</div>
      {hasTransit ? (
        <div style={{fontSize:13,color:"#3D4F40",lineHeight:1.6}}>
          {resource.nearestBusRoute && <div><strong>{reqText(lang, "busRoute")}:</strong> {resource.nearestBusRoute}</div>}
          {resource.nearestTransitStop && <div><strong>{reqText(lang, "transitStop")}:</strong> {resource.nearestTransitStop}</div>}
          {resource.transitNotes && <div>{resource.transitNotes}</div>}
        </div>
      ) : (
        <div style={{fontSize:13,color:"#6B7C6E",lineHeight:1.6}}>{reqText(lang, "comingSoon")}</div>
      )}
    </div>
  );
}

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  .dh * { box-sizing:border-box; margin:0; padding:0; }
  .dh { width:390px; height:844px; margin:0 auto; background:#FAFAF7; overflow:hidden; display:flex; flex-direction:column; border-radius:44px; box-shadow:0 32px 64px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06); font-family:'DM Sans',sans-serif; color:#1C2B1E; position:relative; }
  .dh-sb { display:flex; justify-content:space-between; align-items:center; padding:14px 24px 0; font-size:12px; font-weight:600; color:#1C2B1E; flex-shrink:0; }
  .dh-sc { flex:1; overflow-y:auto; overflow-x:hidden; scrollbar-width:none; }
  .dh-sc::-webkit-scrollbar { display:none; }
  .dh-nav { display:flex; justify-content:space-around; align-items:center; padding:6px 0 16px; border-top:1px solid rgba(0,0,0,0.08); background:#FAFAF7; flex-shrink:0; }
  .dh-ni { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:4px 8px; border-radius:12px; transition:all 0.18s; position:relative; }
  .dh-ni:hover { background:rgba(0,53,148,0.07); }
  .dh-ni-ic { font-size:18px; opacity:0.35; transition:opacity 0.18s; }
  .dh-ni-lb { font-size:8px; font-weight:600; letter-spacing:0.05em; color:#6B7C6E; transition:color 0.18s; text-transform:uppercase; }
  .dh-ni.act .dh-ni-ic { opacity:1; }
  .dh-ni.act .dh-ni-lb { color:#003594; }
  .dfi { animation:dhFi 0.28s ease; }
  @keyframes dhFi { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .dh-chip { display:inline-flex; align-items:center; gap:4px; background:#F0F4F1; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:500; color:#4A6B52; }
  .dh-chip.open { background:#E0EAFF; color:#002060; }
  .dh-chip.closed { background:#FFE8E8; color:#9B1C1C; }
  .dh-chip.today { background:#FFF3CD; color:#7B5800; }
  .dh-btn-primary { background:#003594; color:white; border:none; border-radius:14px; padding:14px 20px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; width:100%; }
  .dh-btn-primary:hover { background:#002060; transform:translateY(-1px); }
  .dh-btn-outline { background:transparent; color:#003594; border:1.5px solid #003594; border-radius:14px; padding:12px 20px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.18s; width:100%; }
  .dh-btn-outline:hover { background:rgba(0,53,148,0.06); }
  .dh-card { background:white; border-radius:18px; padding:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04); cursor:pointer; transition:all 0.18s; }
  .dh-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.1); }
  .dh-tag { background:#F0F4F1; border-radius:8px; padding:3px 8px; font-size:11px; color:#4A6B52; font-weight:500; }
  .dh-divider { height:1px; background:rgba(0,0,0,0.07); margin:0 24px; }
  .dh-input { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px 12px 42px; font-family:'DM Sans',sans-serif; font-size:14px; color:#1C2B1E; outline:none; transition:border-color 0.18s; }
  .dh-input:focus { border-color:#003594; }
  .dh-input-plain { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px; font-family:'DM Sans',sans-serif; font-size:14px; color:#1C2B1E; outline:none; transition:border-color 0.18s; margin-bottom:10px; }
  .dh-input-plain:focus { border-color:#003594; }
  .dh-filter-pill { white-space:nowrap; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid transparent; }
  .dh-filter-pill.active { background:#003594; color:white; }
  .dh-filter-pill.inactive { background:white; color:#4A6B52; border-color:rgba(0,53,148,0.25); }
  .dh-back { display:flex; align-items:center; gap:6px; color:#003594; font-size:13px; font-weight:600; cursor:pointer; margin-bottom:16px; }
  .pulse { animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .notif-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex; flex-direction:column; justify-content:flex-start; padding:60px 20px 0; border-radius:44px; animation:dhFi 0.2s ease; }
  .notif-banner { background:rgba(255,255,255,0.97); backdrop-filter:blur(20px); border-radius:20px; padding:14px 16px; margin-bottom:10px; box-shadow:0 8px 32px rgba(0,0,0,0.2); display:flex; align-items:flex-start; gap:12px; }
  .modal-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.5); z-index:200; display:flex; align-items:flex-end; border-radius:44px; animation:dhFi 0.2s ease; }
  .modal-sheet { background:#FAFAF7; border-radius:28px 28px 44px 44px; width:100%; max-height:90%; overflow-y:auto; padding:24px; animation:sheetUp 0.3s ease; scrollbar-width:none; }
  .modal-sheet::-webkit-scrollbar { display:none; }
  @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .modal-handle { width:36px; height:4px; background:rgba(0,0,0,0.15); border-radius:2px; margin:0 auto 20px; }
  .amt-pill { padding:10px 16px; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid rgba(0,53,148,0.25); background:white; color:#003594; }
  .amt-pill.sel { background:#003594; color:white; border-color:#003594; }
  .hotline-card { border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.18s; margin-bottom:8px; }
  .hotline-card:hover { transform:translateX(2px); }
  .hotline-call-btn { border:none; border-radius:10px; padding:8px 14px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
  .emerg-overlay { position:absolute; inset:0; background:rgba(214,40,40,0.97); z-index:300; display:flex; flex-direction:column; border-radius:44px; animation:dhFi 0.2s ease; overflow-y:auto; scrollbar-width:none; }
  .emerg-overlay::-webkit-scrollbar { display:none; }
  .chat-bubble-user { background:#003594; color:white; border-radius:18px 18px 4px 18px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:80%; align-self:flex-end; }
  .chat-bubble-ai { background:white; color:#1C2B1E; border-radius:18px 18px 18px 4px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:85%; align-self:flex-start; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .chat-input-row { display:flex; gap:8px; padding:12px 16px; background:white; border-top:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
  .chat-input { flex:1; background:#F5F5F0; border:none; border-radius:20px; padding:10px 16px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; }
  .chat-send-btn { background:#003594; color:white; border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; flex-shrink:0; }
  .lang-toggle { display:flex; background:rgba(255,255,255,0.2); border-radius:20px; padding:2px; }
  .lang-btn { padding:4px 10px; border-radius:18px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.18s; border:none; font-family:'DM Sans',sans-serif; }
  .lang-btn.active { background:white; color:#003594; }
  .lang-btn.inactive { background:transparent; color:rgba(255,255,255,0.8); }
  .impact-stat { background:white; border-radius:16px; padding:14px; flex:1; box-shadow:0 2px 8px rgba(0,0,0,0.06); text-align:center; }
  .sponsor-ticker { overflow:hidden; white-space:nowrap; }
  .sponsor-inner { display:inline-block; animation:ticker 12s linear infinite; }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

function injectCSS() {
  if (document.getElementById("dh-css3")) return;
  const s=document.createElement("style"); s.id="dh-css3"; s.textContent=CSS; document.head.appendChild(s);
}

/* ── RESOURCE CARD ── */
function ResourceCard({ r, onClick, lang }) {
  const open=isOpenNow(r), today=isOpenToday(r), t=T[lang]||T.en;
  const rt = (value) => translateResourceText(value, lang);
  return (
    <div className="dh-card" onClick={()=>{trackEvent("resource_viewed",{id:r.id,name:r.name,category:r.category});onClick(r);}} style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:44,height:44,borderRadius:12,background:r.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          {r.category==="food"?"🍽":r.category==="legal"?"⚖️":"🤝"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:"#1C2B1E",lineHeight:1.3,marginBottom:3}}>{r.name}</div>
          <div style={{fontSize:12,color:"#6B7C6E",marginBottom:7}}>{r.address.split(",")[0]} · {r.miles} mi</div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span className={`dh-chip ${open?"open":today?"today":"closed"}`}>{open?t.openRightNow:today?t.opensLaterToday:t.closedToday}</span>
            <span className="dh-chip" style={{background:CATEGORY_COLORS[r.category]+"15",color:CATEGORY_COLORS[r.category]}}>{rt(CATEGORY_LABELS[r.category])}</span>
            <span className="dh-chip" style={{background:"#FFF3CD",color:"#7B5800"}}>{rt("Needs verification")}</span>
            <span className="dh-chip" style={{background:"#FFF3CD",color:"#7B5800"}}>{rt("Call ahead")}</span>
          </div>
        </div>
      </div>
      {r.tags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>{r.tags.slice(0,3).map(tag=><span key={tag} className="dh-tag">{rt(tag)}</span>)}</div>}
      <RequirementChips resource={r} lang={lang}/>
    </div>
  );
}

/* ── DETAIL VIEW ── */
function DetailView({ r, onBack, onDonate, lang, online=true }) {
  const open=isOpenNow(r), today=isOpenToday(r), t=T[lang]||T.en;
  const rt = (value) => translateResourceText(value, lang);
  const zip = (r.address.match(/\d{5}/) || ["19121"])[0];
  return (
    <div className="dfi">
      <div style={{padding:"20px 24px 16px"}}>
        <div className="dh-back" onClick={onBack}>{t.back}</div>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <span className={`dh-chip ${open?"open":today?"today":"closed"}`}>{open?t.openRightNow:today?t.opensLaterToday:t.closedToday}</span>
          <span className="dh-chip" style={{background:CATEGORY_COLORS[r.category]+"15",color:CATEGORY_COLORS[r.category]}}>{rt(CATEGORY_LABELS[r.category])}</span>
          <span className="dh-chip" style={{background:"#FFF3CD",color:"#7B5800"}}>{rt("Needs verification")}</span>
          <span className="dh-chip" style={{background:"#FFF3CD",color:"#7B5800"}}>{rt("Call ahead")}</span>
        </div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1C2B1E",lineHeight:1.2,marginBottom:6}}>{r.name}</div>
        <div style={{fontSize:13,color:"#6B7C6E"}}>{r.address}</div>
      </div>
      <div style={{height:130,background:"linear-gradient(135deg,#E0EAFF,#B7E4C7)",margin:"0 24px 20px",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.15) 20px,rgba(255,255,255,0.15) 21px)"}}/>
        <span style={{zIndex:1}}>📍</span>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{background:"#F0F4FF",borderRadius:14,padding:16,marginBottom:16,border:"1px solid rgba(0,53,148,0.12)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"#003594",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t.about}</div>
            <TrustBadge resourceId={r.id}/>
          </div>
          <div style={{fontSize:14,color:"#3D4F40",lineHeight:1.6}}>{rt(r.description)}</div>
        </div>
        <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{reqText(lang, "requirements")}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:r.notes?10:0}}>
            {getRequirementLabels(r, lang).map(label=><span key={label} className="dh-tag" style={{fontSize:12,padding:"5px 10px"}}>{label}</span>)}
          </div>
          {r.notes&&<div style={{fontSize:13,color:"#3D4F40",lineHeight:1.5}}>{r.notes}</div>}
        </div>
        <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.hours}</div>
          {r.hours.map((h,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<r.hours.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
              <div style={{fontSize:13,fontWeight:500}}>{rt(h.day)}</div>
              <div style={{fontSize:13,color:"#4A6B52"}}>{h.time||rt("Call for hours")}</div>
            </div>
          ))}
        </div>
        {/* Community status + inventory */}
        <PantryStatusWidget pantryId={r.id}/>
        <PantryInventoryWidget pantryId={r.id}/>
        <AccessibilityTransportation resource={r} lang={lang}/>
        {/* SEPTA transit info */}
        <TransitHelper resourceZip={zip} resourceName={r.name}/>
        {r.tags.length>0&&<div style={{marginBottom:16,marginTop:12}}><div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.whatToKnow}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{r.tags.map(tag=><span key={tag} className="dh-tag" style={{fontSize:12,padding:"5px 10px"}}>✓ {rt(tag)}</span>)}</div></div>}
        {/* I'm Going + Directions */}
        <IAmGoingButton resource={r}/>
        <div style={{display:"flex",gap:10,marginBottom:8,marginTop:10}}>
          <button className="dh-btn-primary" onClick={()=>window.open(`tel:${r.phone}`)}>📞 {t.call} {r.phone}</button>
          <button className="dh-btn-outline" disabled={!online} title={!online?(lang==="es"?"Las direcciones pueden requerir internet":"Directions may require internet"):undefined} onClick={()=>{if(!online)return;window.open(`https://maps.google.com/?q=${encodeURIComponent(r.address)}`);}}>{online?t.directions:(lang==="es"?"Las direcciones pueden requerir internet":"Directions may require internet")}</button>
        </div>
        {/* Save + I Found Help */}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <SaveResourceButton resource={r}/>
          <FoundHelpButton resource={r}/>
        </div>
        <button onClick={onDonate} style={{width:"100%",background:"linear-gradient(135deg,#F4A261,#E76F51)",border:"none",borderRadius:14,padding:14,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"white",cursor:"pointer",marginBottom:12}}>{t.donatePantry}</button>
        <div style={{textAlign:"center",paddingBottom:16}}>
          <ReportIssueButton resource={r}/>
        </div>
      </div>
    </div>
  );
}

/* ── EMERGENCY MODE ── */
function EmergencyMode({ onClose, lang, resources=RESOURCES }) {
  const t=T[lang]||T.en;
  const openNow=resources.filter(r=>isOpenNow(r)).slice(0,3);
  const urgentLines=HOTLINES.filter(h=>h.urgent);
  trackEvent("emergency_mode_activated");
  return (
    <div className="emerg-overlay">
      <div style={{padding:"24px 24px 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"white"}}>{t.emergencyMode}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:2}}>{t.emergencyModeDesc}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:50,width:36,height:36,color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🚨 Crisis Lines — Call Now</div>
        {urgentLines.map(h=>(
          <div key={h.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{h.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"white"}}>{h.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{h.sub}</div>
            </div>
            <button style={{background:"white",color:"#D62828",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>window.open(`tel:${h.number}`)}>
              {h.isText?"Text":"Call"} {h.number}
            </button>
          </div>
        ))}
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em",margin:"16px 0 10px"}}>📍 Open Near You Right Now</div>
        {openNow.length===0 ? (
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:16,color:"rgba(255,255,255,0.8)",fontSize:13,lineHeight:1.6}}>{t.noOpenResources}</div>
        ) : openNow.map(r=>(
          <div key={r.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>🍽</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"white"}}>{r.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{r.address.split(",")[0]} · {r.miles} mi</div>
            </div>
            <button style={{background:"white",color:"#003594",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>window.open(`tel:${r.phone}`)}>Call</button>
          </div>
        ))}
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

/* ── HOME SCREEN ── */
function HomeScreen({ onNav, onResource, onDonate, onEmergency, lang, resources=RESOURCES }) {
  const t=T[lang]||T.en;
  const openNow=resources.filter(r=>isOpenNow(r));
  const openToday=resources.filter(r=>!isOpenNow(r)&&isOpenToday(r));
  const savedIds = getSavedResources().map(s=>s.id);
  const savedResources = resources.filter(r=>savedIds.includes(r.id));
  return (
    <div className="dfi">
      <div style={{background:"linear-gradient(160deg,#003594 0%,#0046AD 100%)",padding:"16px 24px 24px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.65)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{t.county}</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"white",lineHeight:1.25,marginBottom:2}}>{t.tagline}</div>
        <div style={{display:"inline-flex",background:"rgba(250,204,21,0.18)",color:"#FDE68A",border:"1px solid rgba(250,204,21,0.32)",borderRadius:999,padding:"4px 9px",fontSize:10,fontWeight:800,marginBottom:8}}>Philadelphia beta page</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginBottom:16}}>{t.zip}</div>
        <button onClick={()=>{trackEvent("emergency_button_tapped");onEmergency();}} style={{width:"100%",background:"#D62828",border:"2px solid rgba(255,255,255,0.3)",borderRadius:14,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"white",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {t.needHelpNow}
        </button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{icon:"🔍",label:t.findResources,sub:t.foodHelpMore,nav:"find"},{icon:"📋",label:t.benefits,sub:t.snapWic,nav:"benefits"},{icon:"🥗",label:"Food Health",sub:"Scan to check",nav:"health"},{icon:"🤖",label:t.askAI,sub:"Powered by Claude",nav:"ai"},{icon:"🚨",label:t.emergency,sub:"Crisis hotlines",nav:"hotline"},{icon:"🏥",label:"Volunteer",sub:"Give back",nav:"volunteer"}].map(a=>(
            <div key={a.nav} onClick={()=>onNav(a.nav)} style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",borderRadius:14,padding:"10px 8px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.2)",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:3}}>{a.icon}</div>
              <div style={{fontSize:11,fontWeight:600,color:"white",lineHeight:1.2}}>{a.label}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",marginTop:1}}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"0 24px"}}>
        {openNow.length>0&&<>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#0046AD"}} className="pulse"/>
            <div style={{fontSize:13,fontWeight:700,color:"#002060"}}>{t.openNow} ({openNow.length})</div>
          </div>
          {openNow.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          <div style={{height:6}}/>
        </>}
        {openToday.length>0&&<>
          <div style={{fontSize:13,fontWeight:700,color:"#7B5800",marginBottom:10}}>🕐 {t.opensLater} ({openToday.length})</div>
          {openToday.slice(0,2).map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          <div style={{height:6}}/>
        </>}
        <div style={{fontSize:13,fontWeight:700,color:"#6B7C6E",marginBottom:10}}>{t.allResources} ({resources.length})</div>
        {resources.filter(r=>!isOpenNow(r)&&!isOpenToday(r)).slice(0,2).map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
        <button className="dh-btn-outline" style={{marginBottom:12}} onClick={()=>onNav("find")}>See all {resources.length} resources →</button>
        {/* Saved resources */}
        {savedResources.length > 0 && (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#7B5800",marginBottom:8}}>⭐ My Saved Resources ({savedResources.length})</div>
            {savedResources.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          </div>
        )}
        {/* Feature 5 — Stories feed */}
        <StoriesSection/>
        {/* Feature 8 — SMS access */}
        <SMSAccessCard phoneNumber=""/>
        <div style={{background:"linear-gradient(135deg,#FFF8F0,#FFF3E0)",borderRadius:16,padding:14,marginBottom:12,border:"1px solid rgba(244,162,97,0.3)",cursor:"pointer"}} onClick={onDonate}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>💛</div>
            <div><div style={{fontSize:13,fontWeight:700,color:"#7B4B00",marginBottom:2}}>{t.supportPantries}</div><div style={{fontSize:11,color:"#A06000",lineHeight:1.4}}>{t.donateDesc}</div></div>
          </div>
        </div>
        <div style={{background:"linear-gradient(135deg,#F0F4FF,#E8EEFF)",borderRadius:16,padding:14,marginBottom:20,border:"1px solid rgba(2,62,138,0.12)",cursor:"pointer"}} onClick={()=>onNav("impact")}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>📊</div>
            <div><div style={{fontSize:13,fontWeight:700,color:"#023E8A",marginBottom:2}}>{t.impactDashboard}</div><div style={{fontSize:11,color:"#1A4A8A",lineHeight:1.4}}>{t.impactDesc}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FIND SCREEN ── */
function FindScreen({ onResource, lang, resources=RESOURCES }) {
  const [search,setSearch]=useState(""), [filter,setFilter]=useState("all"), [dietary,setDietary]=useState([]);
  const [zip,setZip]=useState(""), [zipInput,setZipInput]=useState(""), [locating,setLocating]=useState(false);
  const t=T[lang]||T.en;
  const filters=[{id:"all",label:"All"},{id:"food",label:"🍽 Food"},{id:"assistance",label:"🤝 Help"},{id:"legal",label:"⚖️ Legal"}];

  function applyZip(z) {
    const clean = z.replace(/\D/g,"").slice(0,5);
    setZip(clean);
    setZipInput(clean);
    if (clean.length === 5) trackEvent("zip_search", { zip: clean });
  }

  function useMyLocation() {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Find closest zip from our lookup table
        const { latitude:lat, longitude:lng } = pos.coords;
        let closest = "19121", minDist = 999;
        Object.entries(ZIP_COORDS).forEach(([z, c]) => {
          const d = Math.sqrt(Math.pow(lat-c.lat,2)+Math.pow(lng-c.lng,2));
          if (d < minDist) { minDist = d; closest = z; }
        });
        setZip(closest);
        setZipInput(closest);
        setLocating(false);
        trackEvent("location_used", { detected_zip: closest });
      },
      () => setLocating(false)
    );
  }

  // Calculate distances from user zip and filter
  const results = resources.filter(r => {
    const matchCat = filter==="all" || r.category===filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.tags.some(tag=>tag.toLowerCase().includes(q));
    if (!matchCat || !matchSearch) return false;
    // If zip entered, only show resources within 10 miles
    if (zip.length === 5) {
      const dist = calcDistance(zip, r.zip || "19121");
      return dist <= 10;
    }
    return true;
  }).map(r => {
    // Recalculate distance from user's zip if provided
    if (zip.length === 5) {
      return { ...r, miles: calcDistance(zip, r.zip || "19121") };
    }
    return r;
  }).sort((a,b) => a.miles - b.miles);

  const userZipName = zip.length===5 && ZIP_COORDS[zip] ? `near ${zip}` : "near Philadelphia";

  return (
    <div className="dfi">
      <div style={{padding:"16px 24px 12px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1C2B1E",marginBottom:12}}>{t.findResources}</div>

        {/* Zip code search */}
        <div style={{background:"#F0F9F4",borderRadius:14,padding:12,marginBottom:10,border:"1px solid rgba(0,53,148,0.15)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#003594",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>📍 Your Location</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input
              style={{flex:1,background:"white",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"}}
              placeholder="Enter zip code (e.g. 19121)"
              value={zipInput}
              onChange={e=>{setZipInput(e.target.value.replace(/\D/g,"").slice(0,5)); if(e.target.value.length===5) applyZip(e.target.value);}}
              onBlur={e=>applyZip(e.target.value)}
              maxLength={5}
            />
            <button onClick={useMyLocation} disabled={locating} style={{flexShrink:0,background:"#003594",color:"white",border:"none",borderRadius:10,padding:"10px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {locating?"...":"📍 Near me"}
            </button>
            {zip.length===5 && (
              <button onClick={()=>{setZip("");setZipInput("");}} style={{flexShrink:0,background:"rgba(0,0,0,0.06)",color:"#6B7C6E",border:"none",borderRadius:10,padding:"10px 10px",fontSize:12,cursor:"pointer"}}>✕</button>
            )}
          </div>
          {zip.length===5 && !ZIP_COORDS[zip] && (
            <div style={{fontSize:11,color:"#D62828",marginTop:6}}>Zip code not in Philadelphia — showing all resources</div>
          )}
          {zip.length===5 && ZIP_COORDS[zip] && (
            <div style={{fontSize:11,color:"#003594",marginTop:6,fontWeight:600}}>Showing resources within 10 miles of {zip} · {ZIP_NEIGHBORHOODS[zip]}</div>
          )}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
            {Object.keys(ZIP_COORDS).map(z=>(
              <button key={z} onClick={()=>applyZip(z)} style={{background:zip===z?"#003594":"white",color:zip===z?"white":"#003594",border:"1px solid rgba(0,53,148,0.2)",borderRadius:999,padding:"5px 8px",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                {z}
              </button>
            ))}
          </div>
        </div>

        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:0.5}}>🔍</span>
          <input className="dh-input" placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
          {filters.map(f=><div key={f.id} className={`dh-filter-pill ${filter===f.id?"active":"inactive"}`} onClick={()=>setFilter(f.id)}>{f.label}</div>)}
        </div>
        {/* Feature 6 — Dietary filters */}
        <DietaryFilters active={dietary} onChange={setDietary}/>
      </div>
      <div className="dh-divider"/>
      <div style={{padding:"12px 24px"}}>
        <div style={{fontSize:12,color:"#6B7C6E",marginBottom:10,fontWeight:500}}>{results.length} resources {userZipName} · sorted by distance</div>
        {results.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
        {results.length===0&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:36,marginBottom:10}}>📍</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>No resources found {zip.length===5?`near ${zip}`:""}</div>
            <div style={{fontSize:12,color:"#6B7C6E",lineHeight:1.6}}>Try a nearby zip code, or call Philly 311 for help finding resources anywhere in Philadelphia.</div>
          </div>
        )}
        {/* 211 upgrade note */}
        <div style={{background:"#F0F4FF",borderRadius:14,padding:14,marginTop:8,marginBottom:8,border:"1px solid rgba(2,62,138,0.12)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#023E8A",marginBottom:4}}>🔄 More resources coming soon</div>
          <div style={{fontSize:11,color:"#1A4A8A",lineHeight:1.5}}>We're integrating the Philly 311 database — coming Q3 2026 with hundreds of verified resources across all 49 Philadelphia zip codes.</div>
        </div>
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

/* ── BENEFITS SCREEN ── */
function BenefitsScreen({ lang }) {
  const [expanded,setExpanded]=useState(null), [showQuiz,setShowQuiz]=useState(false);
  const [showSNAP,setShowSNAP]=useState(false), [showChecklist,setShowChecklist]=useState(false);
  const [checklistPrograms,setChecklistPrograms]=useState(["snap"]);
  const t=T[lang]||T.en;
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
      {showChecklist && <DocumentChecklist programs={checklistPrograms} onClose={()=>setShowChecklist(false)}/>}
      <div style={{padding:"16px 24px 0"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1C2B1E",marginBottom:4}}>{t.benefitsNav}</div>
        <div style={{fontSize:13,color:"#6B7C6E",marginBottom:12}}>{t.benefitsDesc}</div>
        {/* Action buttons */}
        <button onClick={()=>{trackEvent("eligibility_quiz_opened");setShowQuiz(true);}} style={{width:"100%",background:"#003594",color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
          Check My Eligibility in 60 Seconds →
        </button>
        <button onClick={()=>setShowSNAP(true)} style={{width:"100%",background:"white",color:"#003594",border:"1.5px solid rgba(0,53,148,0.3)",borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
          🥫 SNAP Application Step-by-Step Guide
        </button>
        <button onClick={()=>{setChecklistPrograms(["snap","wic","liheap","medicaid"]);setShowChecklist(true);}} style={{width:"100%",background:"white",color:"#003594",border:"1.5px solid rgba(0,53,148,0.3)",borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
          📋 Build My Document Checklist
        </button>
        <div style={{background:"#F0F9F4",borderRadius:16,padding:16,marginBottom:16,border:"1px solid rgba(0,53,148,0.15)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#003594",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.quickEligibility}</div>
          {eligibility.map((e,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:i<eligibility.length-1?"1px solid rgba(0,53,148,0.1)":"none"}}>
              <div style={{fontSize:13,color:"#1C2B1E",marginBottom:6}}>{e.q}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{e.programs.map(p=><span key={p} style={{background:"#003594",color:"white",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:600}}>{p}</span>)}</div>
            </div>
          ))}
        </div>
        {BENEFITS.map(b=>(
          <div key={b.id} className="dh-card" style={{marginBottom:10}} onClick={()=>setExpanded(expanded===b.id?null:b.id)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28,flexShrink:0}}>{b.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{b.name}</div><div style={{fontSize:12,color:"#6B7C6E",marginTop:2}}>{b.desc}</div></div>
              <div style={{color:"#003594",fontSize:18,fontWeight:300}}>{expanded===b.id?"−":"+"}</div>
            </div>
            {expanded===b.id&&<div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:13,color:"#3D4F40",marginBottom:12}}>Apply online through PA's COMPASS portal — takes about 15 minutes.</div>
              <button className="dh-btn-primary" style={{fontSize:13,padding:"12px 16px"}} onClick={()=>window.open(b.link,"_blank")}>{t.applyCompass}</button>
            </div>}
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── HOTLINE SCREEN ── */
function HotlineScreen({ lang, onEscape }) {
  const t=T[lang]||T.en, urgent=HOTLINES.filter(h=>h.urgent), rest=HOTLINES.filter(h=>!h.urgent);
  return (
    <div className="dfi">
      <div style={{background:"linear-gradient(160deg,#D62828 0%,#9B1C1C 100%)",padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>{t.emergencyHotlines}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{t.hotlinesDesc}</div>
        <button onClick={onEscape} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:10,padding:"6px 12px",color:"white",fontSize:11,fontWeight:600,cursor:"pointer",marginTop:10,fontFamily:"'DM Sans',sans-serif"}}>
          🔒 Set Up My Safety Plan
        </button>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#D62828",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.immediateEmergency}</div>
        {urgent.map(h=>(
          <div key={h.id} className="hotline-card" style={{background:h.bg,border:`1px solid ${h.color}22`}}>
            <div style={{width:42,height:42,borderRadius:12,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{h.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1C2B1E"}}>{h.name}</div><div style={{fontSize:11,color:"#6B7C6E",marginTop:2}}>{h.sub}</div></div>
            <button className="hotline-call-btn" style={{background:h.color,color:"white"}} onClick={()=>window.open(`tel:${h.number}`)}>{h.isText?"Text":"Call"} {h.number}</button>
          </div>
        ))}
        <div style={{height:12}}/>
        <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.additionalResources}</div>
        {rest.map(h=>(
          <div key={h.id} className="hotline-card" style={{background:h.bg,border:`1px solid ${h.color}22`}}>
            <div style={{width:42,height:42,borderRadius:12,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{h.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#1C2B1E"}}>{h.name}</div><div style={{fontSize:11,color:"#6B7C6E",marginTop:2}}>{h.sub}</div></div>
            <button className="hotline-call-btn" style={{background:h.color+"15",color:h.color}} onClick={()=>window.open(`tel:${h.number}`)}>{h.number}</button>
          </div>
        ))}
        <div style={{background:"#F0F9F4",borderRadius:16,padding:14,marginTop:8,marginBottom:24,border:"1px solid rgba(0,53,148,0.15)"}}>
          <div style={{fontSize:12,color:"#003594",lineHeight:1.6,textAlign:"center"}}>{t.confidentialNote}</div>
        </div>
      </div>
    </div>
  );
}

/* ── VOLUNTEER SCREEN ── */
function VolunteerScreen({ lang }) {
  const t=T[lang]||T.en;
  const opps=[
    {org:"Philabundance Community Kitchen",role:"Pantry Volunteer",time:"Weekdays flexible",icon:"🍽",color:"#003594"},
    {org:"Sunday Breakfast Rescue Mission",role:"Meal Service Volunteer",time:"Morning shifts",icon:"📦",color:"#0046AD"},
    {org:"Community Legal Services",role:"Intake Support Volunteer",time:"Weekdays flexible",icon:"🏪️",color:"#002060"},
    {org:"Philadelphia 311",role:"Resource Navigation Support",time:"Flexible scheduling",icon:"🚗",color:"#F4A261"},
    {org:"Catholic Social Services",role:"Case Aid Volunteer",time:"Weekdays flexible",icon:"🤝",color:"#E76F51"},
  ];
  return (
    <div className="dfi">
      <div style={{background:"linear-gradient(160deg,#E76F51 0%,#F4A261 100%)",padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>{t.giveBack}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>{t.volunteerDesc}</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{background:"#FFF8F5",borderRadius:16,padding:14,marginBottom:16,border:"1px solid rgba(231,111,81,0.2)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#C1440E",marginBottom:4}}>{t.whyMatters}</div>
          <div style={{fontSize:13,color:"#5A3020",lineHeight:1.6}}>{t.volunteerImpact}</div>
        </div>
        {opps.map((o,i)=>(
          <div key={i} className="dh-card" style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:o.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{o.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{o.role}</div><div style={{fontSize:12,color:"#6B7C6E",marginTop:1}}>{o.org}</div><div style={{fontSize:11,color:o.color,fontWeight:600,marginTop:4}}>⏰ {o.time}</div></div>
              <button style={{background:o.color+"15",color:o.color,border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.signUp}</button>
            </div>
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── IMPACT DASHBOARD ── */
function ImpactScreen({ lang }) {
  const t=T[lang]||T.en;
  const monthly=[{month:"Nov",users:1820},{month:"Dec",users:2100},{month:"Jan",users:2340},{month:"Feb",users:2580},{month:"Mar",users:2710},{month:"Apr",users:2847}];
  const maxVal=Math.max(...monthly.map(m=>m.users));
  return (
    <div className="dfi">
      <div style={{background:"linear-gradient(160deg,#023E8A 0%,#0077B6 100%)",padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>{t.impactDashboard}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{t.impactDesc}</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {IMPACT_STATS.map(s=>(
            <div key={s.label} className="impact-stat">
              <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:11,fontWeight:600,color:"#1C2B1E",marginTop:4}}>{t[s.label]||s.label}</div>
              <div style={{fontSize:10,color:"#0046AD",marginTop:2}}>{s.trend}</div>
            </div>
          ))}
        </div>
        <div style={{background:"white",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>User Growth (6 months)</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
            {monthly.map(m=>(
              <div key={m.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:"100%",background:"linear-gradient(180deg,#0046AD,#003594)",borderRadius:"4px 4px 0 0",height:`${(m.users/maxVal)*70}px`,transition:"height 0.5s ease"}}/>
                <div style={{fontSize:9,color:"#6B7C6E",fontWeight:600}}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>{t.sponsoredBy}</div>
          <div className="sponsor-ticker">
            <div className="sponsor-inner">
              {[...SPONSORS,...SPONSORS].map((s,i)=>(
                <span key={i} style={{display:"inline-block",background:"#F0F4F1",borderRadius:8,padding:"6px 12px",margin:"0 6px",fontSize:12,fontWeight:600,color:"#003594"}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <button className="dh-btn-primary" style={{marginBottom:24}}>📄 {t.monthlyImpact}</button>
      </div>
    </div>
  );
}

/* ── SUBMIT SCREEN ── */
function SubmitScreen({ lang }) {
  const [form,setForm]=useState({name:"",address:"",phone:"",category:"food",hours:"",notes:""});
  const [submitted,setSubmitted]=useState(false);
  const t=T[lang]||T.en;
  if (submitted) return (
    <div className="dfi" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 24px",textAlign:"center"}}>
      <div style={{fontSize:60,marginBottom:16}}>✅</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1C2B1E",marginBottom:8}}>Resource Submitted!</div>
      <div style={{fontSize:14,color:"#6B7C6E",lineHeight:1.6}}>{t.submitThanks}</div>
    </div>
  );
  return (
    <div className="dfi">
      <div style={{padding:"16px 24px 0"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1C2B1E",marginBottom:4}}>{t.submitResource}</div>
        <div style={{fontSize:13,color:"#6B7C6E",marginBottom:20}}>{t.submitDesc}</div>
        {[{key:"name",label:t.orgName,placeholder:"e.g. Philadelphia Community Pantry"},{key:"address",label:t.orgAddress,placeholder:"123 Main St, Philadelphia PA 19121"},{key:"phone",label:t.orgPhone,placeholder:"215-555-0000"},{key:"hours",label:t.orgHours,placeholder:"e.g. Tuesdays 5–7 PM, Saturdays 10 AM–12 PM"}].map(f=>(
          <div key={f.key} style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#6B7C6E",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{f.label}</div>
            <input className="dh-input-plain" placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={{paddingLeft:16}}/>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"#6B7C6E",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.orgCategory}</div>
          <div style={{display:"flex",gap:8}}>
            {[{id:"food",label:"🍽 Food"},{id:"assistance",label:"🤝 Assistance"},{id:"legal",label:"⚖️ Legal"}].map(c=>(
              <div key={c.id} className={`dh-filter-pill ${form.category===c.id?"active":"inactive"}`} onClick={()=>setForm({...form,category:c.id})}>{c.label}</div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:600,color:"#6B7C6E",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.orgNotes}</div>
          <textarea className="dh-input-plain" placeholder="Any other helpful details…" rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{paddingLeft:16,resize:"none"}}/>
        </div>
        <button className="dh-btn-primary" style={{marginBottom:24}} onClick={()=>form.name&&form.address&&setSubmitted(true)}>{t.submit}</button>
      </div>
    </div>
  );
}

/* ── AI USAGE LIMITER ── */
const AI_LIMIT = 5;
const AI_KEY = "dh_ai_usage";
function getAIUsage() {
  try {
    const today = new Date().toDateString();
    const raw = localStorage.getItem(AI_KEY);
    if (!raw) return 0;
    const d = JSON.parse(raw);
    return d.date === today ? (d.count || 0) : 0;
  } catch { return 0; }
}
function incrementAIUsage() {
  try {
    const today = new Date().toDateString();
    localStorage.setItem(AI_KEY, JSON.stringify({ date: today, count: getAIUsage() + 1 }));
  } catch {}
}

/* ── AI CHAT SCREEN ── */
function AIScreen({ lang }) {
  const t=T[lang]||T.en;
  const [messages,setMessages]=useState([{role:"ai",text:"👋 Hi! I'm the PhillyHelp AI. Ask me anything about local resources, benefits, or getting help in Philadelphia, PA."}]);
  const [input,setInput]=useState(""), [loading,setLoading]=useState(false);
  const [usageCount,setUsageCount]=useState(getAIUsage());
  const bottomRef=useRef(null);
  const remaining = Math.max(0, AI_LIMIT - usageCount);
  const atLimit = remaining === 0;

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  async function sendMessage() {
    if (!input.trim()||loading||atLimit) return;
    const userMsg=input.trim(); setInput(""); setLoading(true);
    incrementAIUsage();
    setUsageCount(getAIUsage());
    setMessages(m=>[...m,{role:"user",text:userMsg}]);
    trackEvent("ai_chat_sent");
    try {
      const systemPrompt=`You are PhillyHelp AI, a friendly assistant helping low-income families in Philadelphia, PA (near Philadelphia, zip 19121) find local resources.

Key local resources:
- Sunday Breakfast Rescue Mission: 302 N 13th St, Philadelphia, 215-922-6400
- Philabundance Community Kitchen: 3616 S Galloway St, Philadelphia, 215-339-0900
- Community Legal Services: free legal help, 215-981-3700
- Congreso de Latinos Unidos: bilingual social services, 215-763-8870
- Philly 311: dial 311 for city services
- SNAP, WIC, LIHEAP, Medicaid all available via compass.state.pa.us

Keep responses short, warm, and actionable. Always give a phone number when recommending a resource. If someone seems in crisis, lead with 988 or 911.`;
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:systemPrompt,messages:[...messages.filter((m,i)=>i>0).map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),{role:"user",content:userMsg}]})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||"I'm sorry, I couldn't find an answer. Please call Philly 311 for immediate help.";
      setMessages(m=>[...m,{role:"ai",text:reply}]);
    } catch(e) {
      setMessages(m=>[...m,{role:"ai",text:"I'm having trouble connecting. Please call Philly 311 for immediate help finding resources."}]);
    }
    setLoading(false);
  }

  const suggestions=["I need food near me tonight","How do I apply for SNAP?","I need diapers for my baby","I'm facing eviction, can you help?"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:"linear-gradient(160deg,#1A1A2E 0%,#16213E 100%)",padding:"16px 24px 16px",borderRadius:"0 0 24px 24px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#003594,#0046AD)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"white"}}>{t.aiChat}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>{t.aiDesc}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:10,color:remaining>2?"#68D391":remaining>0?"#F6E05E":"#FC8181",fontWeight:700,fontFamily:"monospace"}}>{remaining}/{AI_LIMIT}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>left today</div>
          </div>
        </div>
        <div style={{height:3,background:"rgba(255,255,255,0.1)",borderRadius:2,marginTop:10,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:2,width:`${((AI_LIMIT-remaining)/AI_LIMIT)*100}%`,background:remaining>2?"#68D391":remaining>0?"#F6E05E":"#FC8181",transition:"width 0.3s ease"}}/>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:10,scrollbarWidth:"none"}}>
        {messages.map((m,i)=>(
          <div key={i} className={m.role==="user"?"chat-bubble-user":"chat-bubble-ai"}>{m.text}</div>
        ))}
        {loading&&<div className="chat-bubble-ai" style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#003594",animation:"pulse 1s infinite"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#003594",animation:"pulse 1s infinite 0.2s"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#003594",animation:"pulse 1s infinite 0.4s"}}/>
        </div>}
        {messages.length===1&&!atLimit&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          {suggestions.map((s,i)=><button key={i} onClick={()=>setInput(s)} style={{background:"#F0F9F4",border:"1px solid rgba(0,53,148,0.2)",borderRadius:12,padding:"8px 12px",fontSize:12,color:"#003594",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>{s}</button>)}
        </div>}
        {atLimit&&<div style={{background:"#FFF8F0",borderRadius:16,padding:16,border:"1px solid rgba(244,162,97,0.3)",margin:"8px 0"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#7B4B00",marginBottom:6}}>You've used your {AI_LIMIT} free AI messages today.</div>
          <div style={{fontSize:13,color:"#A06000",lineHeight:1.6,marginBottom:12}}>Your limit resets at midnight. In the meantime these resources can help right now:</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>window.open("tel:211")} style={{background:"#003594",color:"white",border:"none",borderRadius:12,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>📞 Call Philly 311 — Free Resource Helpline</button>
            <button onClick={()=>window.open("tel:988")} style={{background:"#7B2D8B",color:"white",border:"none",borderRadius:12,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>🧠 Call 988 — Crisis & Mental Health Line</button>
          </div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div className="chat-input-row" style={{opacity:atLimit?0.4:1,pointerEvents:atLimit?"none":"auto"}}>
        <input className="chat-input" placeholder={atLimit?"Daily limit reached — resets at midnight":t.aiPlaceholder} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} disabled={atLimit}/>
        <button className="chat-send-btn" onClick={sendMessage} disabled={loading||atLimit}>→</button>
      </div>
    </div>
  );
}

/* ── DONATE MODAL ── */
function DonateModal({ onClose, lang }) {
  const [amt,setAmt]=useState("$25"), [org,setOrg]=useState("General Philly Fund");
  const [freq]=useState("once"), [step,setStep]=useState(1);
  const t=T[lang]||T.en;
  const amts=["$10","$25","$50","$100","$250","Custom"];
  const orgs=[
    {name:"Philabundance Community Kitchen",icon:"🍽",desc:"Food access · Philadelphia"},
    {name:"Sunday Breakfast Rescue Mission",icon:"📦",desc:"Meals and outreach"},
    {name:"Community Legal Services",icon:"🏪",desc:"Free legal help"},
    {name:"Congreso de Latinos Unidos",icon:"🤝",desc:"Bilingual family services"},
    {name:"General Philly Fund",icon:"💛",desc:"Split across all partners"},
  ];
  const impact={"$10":"feeds a family for 1 week","$25":"stocks a pantry shelf for 3 days","$50":"provides diapers for 10 families","$100":"funds a full pantry shift","$250":"stocks a pantry for an entire month"};

  if (step===2) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="dh-back" onClick={()=>setStep(1)}>{t.back}</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#1C2B1E",marginBottom:16}}>{t.confirmDonation}</div>
        <div style={{background:"#F0F4FF",borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700}}>{org}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#003594"}}>{amt}{freq==="monthly"?"/mo":""}</div>
          <div style={{fontSize:12,color:"#6B7C6E"}}>{impact[amt]||"Your gift makes a difference"}</div>
        </div>
        <button className="dh-btn-primary" onClick={()=>setStep(3)} style={{marginBottom:10}}>💛 Donate {amt}{freq==="monthly"?"/month":""} Securely</button>
      </div>
    </div>
  );

  if (step===3) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{textAlign:"center",paddingTop:32,paddingBottom:32}}>
        <div style={{fontSize:56,marginBottom:12}}>💛</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1C2B1E",marginBottom:8}}>{t.thankYou}</div>
        <div style={{fontSize:13,color:"#6B7C6E",lineHeight:1.6,marginBottom:16}}>{amt} {t.onItsWay} <strong>{org}</strong>.</div>
        <div style={{background:"#F0F9F4",borderRadius:14,padding:12,marginBottom:20}}><div style={{fontSize:13,color:"#003594",fontWeight:600}}>{t.yourImpact} {impact[amt]||"makes a real difference"}</div></div>
        <button className="dh-btn-primary" onClick={onClose}>{t.done}</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#1C2B1E",marginBottom:4}}>{t.makeDonation}</div>
        <div style={{fontSize:13,color:"#6B7C6E",marginBottom:16}}>{t.donateAllGoes}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {amts.map(a=><div key={a} className={`amt-pill${amt===a?" sel":""}`} onClick={()=>setAmt(a==="Custom"?"$":a)}>{a}</div>)}
        </div>
        {amt&&amt!=="$"&&<div style={{background:"#F0F9F4",borderRadius:10,padding:9,marginBottom:12}}><div style={{fontSize:12,color:"#003594"}}>💛 {amt} — {impact[amt]||"makes a real difference"}</div></div>}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.donateTo}</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {orgs.map(o=>(
            <div key={o.name} onClick={()=>setOrg(o.name)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,border:`1.5px solid ${org===o.name?"#003594":"rgba(0,0,0,0.08)"}`,background:org===o.name?"#F0F9F4":"white",cursor:"pointer"}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${org===o.name?"#003594":"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{org===o.name&&<div style={{width:8,height:8,borderRadius:"50%",background:"#003594"}}/>}</div>
              <div style={{fontSize:20,flexShrink:0}}>{o.icon}</div>
              <div><div style={{fontSize:13,fontWeight:600,color:"#1C2B1E"}}>{o.name}</div><div style={{fontSize:11,color:"#6B7C6E"}}>{o.desc}</div></div>
            </div>
          ))}
        </div>
        <button className="dh-btn-primary" onClick={()=>setStep(2)}>{t.continue} {amt}{freq==="monthly"?"/mo":""}</button>
      </div>
    </div>
  );
}

/* ── NOTIFICATION OVERLAY ── */
function NotifOverlay({ onClose, lang }) {
  const t=T[lang]||T.en;
  const notifs=[
    {icon:"🍽",bg:"#003594",title:"Call ahead before visiting",body:"Philadelphia listings are marked for verification before publication",time:"now"},
    {icon:"📦",bg:"#F4A261",title:"New resource added",body:"Philadelphia pantry and benefits listings restored",time:"2m ago"},
    {icon:"⚡",bg:"#023E8A",title:"LIHEAP deadline soon",body:"PA utility assistance deadline is April 30th — apply now",time:"1h ago"},
    {icon:"💛",bg:"#E76F51",title:"Thank you!",body:"Your $25 donation to the General Philly Fund was received",time:"Yesterday"},
  ];
  return (
    <div className="notif-overlay" onClick={onClose}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"white",textAlign:"center",marginBottom:12,letterSpacing:"0.05em",textTransform:"uppercase",opacity:0.7}}>{t.notifications}</div>
      {notifs.map((n,i)=>(
        <div key={i} className="notif-banner" onClick={e=>e.stopPropagation()}>
          <div style={{width:36,height:36,borderRadius:10,background:n.bg+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1C2B1E",marginBottom:2}}>{n.title}</div>
            <div style={{fontSize:11,color:"#6B7C6E",lineHeight:1.4}}>{n.body}</div>
          </div>
          <div style={{fontSize:10,color:"#9BA8A0",flexShrink:0}}>{n.time}</div>
        </div>
      ))}
      <div style={{textAlign:"center",marginTop:12}}>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"10px 24px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>{t.dismiss}</button>
      </div>
    </div>
  );
}

/* ── APP SHELL ── */
export default function App() {
  injectCSS();
  const { resources, usingCache } = usePublicResourceCache(PHILLY_RESOURCE_CACHE_KEY, RESOURCES);
  const online = useOnlineStatus();
  const [tab,setTab]=useState("home"), [detail,setDetail]=useState(null);
  const [showDonate,setShowDonate]=useState(false), [showNotif,setShowNotif]=useState(false);
  const [showEmergency,setShowEmergency]=useState(false), [notifCount,setNotifCount]=useState(4);
  const [lang,setLang]=useState("en");
  const [showProfile,setShowProfile]=useState(()=>!getFamilyProfile());
  const [showEscape,setShowEscape]=useState(false);
  const [showLegal,setShowLegal]=useState(false);

  const tabs=[
    {id:"home",icon:"🏠",label:"home"},
    {id:"find",icon:"🔍",label:"find"},
    {id:"benefits",icon:"📋",label:"benefits"},
    {id:"health",icon:"🥗",label:"Health"},
    {id:"hotline",icon:"🚨",label:"hotline"},
  ];

  function handleNav(t) { setTab(t); setDetail(null); }

  const screens={
    home:<HomeScreen onNav={handleNav} onResource={setDetail} onDonate={()=>setShowDonate(true)} onEmergency={()=>setShowEmergency(true)} lang={lang} resources={resources}/>,
    find:<FindScreen onResource={setDetail} lang={lang} resources={resources}/>,
    benefits:<BenefitsScreen lang={lang}/>,
    health:<HealthScreen/>,
    hotline:<HotlineScreen lang={lang} onEscape={()=>setShowEscape(true)}/>,
    volunteer:<VolunteerScreen lang={lang}/>,
    impact:<ImpactScreen lang={lang}/>,
    submit:<SubmitScreen lang={lang}/>,
    ai:<AIScreen lang={lang}/>,
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#E8F5E9 0%,#F1F8E9 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 0"}}>
      {/* Feature 1 — PWA install prompt */}
      <InstallPrompt/>
      {/* Family profile setup — shows once on first visit */}
      {showProfile && <FamilyProfileSetup onComplete={()=>setShowProfile(false)}/>}
      {/* Crisis escape plan */}
      {showEscape && <CrisisEscapePlan onClose={()=>setShowEscape(false)}/>}
      {/* Legal screen */}
      {showLegal && <LegalScreen appName="PhillyHelp" companyName="CieroLink LLC" appUrl="phillyhelp.org" onClose={()=>setShowLegal(false)}/>}
      <div className="dh">
        <div className="dh-sb">
          <span>9:41</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:"0.04em",color:"#003594"}}>{(T[lang]||T.en).appName}</span>
            <div className="lang-toggle" style={{background:"rgba(0,53,148,0.12)"}}>
              {["en","es","vi","zh"].map(code=>(
                <button key={code} className={`lang-btn ${lang===code?"active":"inactive"}`} style={{color:lang===code?"#003594":"#6B7C6E",background:lang===code?"white":"transparent"}} onClick={()=>setLang(code)}>
                  {code==="en"?"EN":code==="es"?"ES":code==="vi"?"VI":"中"}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div onClick={()=>setTab("submit")} style={{cursor:"pointer",fontSize:16,opacity:0.6}}>✏</div>
            <div onClick={()=>{setShowNotif(true);setNotifCount(0);}} style={{position:"relative",cursor:"pointer",fontSize:16,opacity:0.7}}>
              🔔
              {notifCount>0&&<div style={{position:"absolute",top:-4,right:-4,width:16,height:16,background:"#D62828",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white",border:"2px solid #FAFAF7"}}>{notifCount}</div>}
            </div>
          </div>
        </div>
        <div className="dh-sc">
          {usingCache&&<SavedResourceBanner lang={lang}/>}
          {detail?<DetailView r={detail} onBack={()=>setDetail(null)} onDonate={()=>setShowDonate(true)} lang={lang} online={online}/>:screens[tab]||screens.home}
        </div>
        <nav className="dh-nav">
          {tabs.map(t=>(
            <div key={t.id} className={`dh-ni${tab===t.id?" act":""}`} onClick={()=>handleNav(t.id)}>
              <div className="dh-ni-ic">{t.icon}</div>
              <div className="dh-ni-lb">{(T[lang]||T.en)[t.label]||t.label}</div>
            </div>
          ))}
        </nav>
        {/* Legal footer */}
        <div style={{textAlign:"center",padding:"4px 0 2px",borderTop:"1px solid rgba(0,0,0,0.04)"}}>
          <button onClick={()=>setShowLegal(true)} style={{background:"transparent",border:"none",color:"#9BA8A0",fontSize:9,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"2px 8px"}}>
            Terms · Privacy · Disclaimer · © 2026 CieroLink LLC
          </button>
        </div>
        {showEmergency&&<EmergencyMode onClose={()=>setShowEmergency(false)} lang={lang} resources={resources}/>}
        {showNotif&&<NotifOverlay onClose={()=>setShowNotif(false)} lang={lang}/>}
        {showDonate&&<DonateModal onClose={()=>setShowDonate(false)} lang={lang}/>}
      </div>
    </div>
  );
}
