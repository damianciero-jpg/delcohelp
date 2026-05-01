import { useState, useEffect, useRef } from "react";
import { auth, db, googleProvider, FIREBASE_ENABLED } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import NutritionFoodCheck from "./NutritionFoodCheck";
import TrustCheck from "./TrustCheck";
import { DELCO_CRISIS, DELCO_HOUSING_ENTRY, PA_CRISIS_TEXT, correctionMailto } from "./delcoSafetyInfo";
import {
  InstallPrompt, SMSAccessCard, EligibilityQuiz,
  PantryStatusWidget, TransitHelper, DietaryFilters, trackEvent, EXTRA_TRANSLATIONS,
  PantryInventoryWidget, IAmGoingButton, SaveResourceButton, FoundHelpButton,
  // eslint-disable-next-line no-unused-vars
  DocumentChecklist, SNAPAssistant, CrisisEscapePlan, FamilyResourcePlan,
  FamilyProfileSetup, getFamilyProfile, getSavedResources, LegalScreen,
  TrustBadge, ReportIssueButton
} from "./features";

// Simple path router
if (window.location.pathname.toLowerCase().startsWith("/sjc")) {
  document.getElementById("root").innerHTML = "";
  import("./SJC").then(mod => {
    const React = require("react");
    const ReactDOM = require("react-dom/client");
    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(mod.default));
  });
  throw new Error("SJC_ROUTE");
}

if (["/philadelphia", "/philly"].includes(window.location.pathname.toLowerCase())) {
  document.getElementById("root").innerHTML = "";
  import("./Philadelphia").then(mod => {
    const React = require("react");
    const ReactDOM = require("react-dom/client");
    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(mod.default));
  });
  throw new Error("PHILADELPHIA_ROUTE");
}

/* ── TRANSLATIONS ── */
const T = {
  en: {
    appName:"DelcoHelp", tagline:"Find help near you, right now.", county:"Delaware County, PA", zip:"Wallingford · 19086",
    findResources:"Find Resources", foodHelpMore:"Food, help & more", benefits:"Benefits", snapWic:"SNAP, WIC & more",
    emergency:"Emergency", hotlinesCrisis:"Hotlines & crisis", volunteer:"Volunteer", askAI:"Ask AI",
    openNow:"Open Right Now", opensLater:"Opens Later Today", allResources:"All Resources",
    supportPantries:"Support Local Pantries", donateDesc:"Your donation keeps Wallingford's food pantries stocked. Every $10 feeds a family for a week.",
    back:"← Back", about:"About", hours:"Hours", whatToKnow:"What to know", call:"Call", directions:"🗺️ Map",
    donatePantry:"💛 Donate to Support This Pantry", openRightNow:"● Open Right Now", opensLaterToday:"◐ Opens Later Today", closedToday:"○ Closed Today",
    home:"Home", find:"Find", hotline:"Hotline",
    searchPlaceholder:"Search food, diapers, legal help…", sortedByDistance:"resources · sorted by distance",
    benefitsNav:"Benefits Navigator", benefitsDesc:"Find programs you may qualify for in Pennsylvania",
    quickEligibility:"Quick Eligibility Check", applyCompass:"Apply on PA COMPASS →",
    giveBack:"Give Back to Your Community", volunteerDesc:"Volunteer opportunities near Wallingford, PA",
    whyMatters:"💛 Why it matters", volunteerImpact:"All local pantries are entirely volunteer-run. One 2-hour shift helps serve 30–50 families per week.",
    signUp:"Sign up", emergencyHotlines:"Emergency & Crisis Hotlines", hotlinesDesc:"Free, confidential, available 24/7",
    immediateEmergency:"🚨 Immediate Emergency", additionalResources:"Additional Resources",
    confidentialNote:"All calls are confidential. You don't have to give your name. Help is always available — you are not alone.",
    makeDonation:"Make a Donation", donateAllGoes:"100% goes directly to local Delaware County organizations",
    selectAmount:"Select Amount", donateTo:"Donate To", continue:"Continue →", confirmDonation:"Confirm Donation",
    amount:"Amount", to:"To", impact:"Impact", payment:"Payment", thankYou:"Thank you,", onItsWay:"is on its way to",
    yourImpact:"Your impact:", done:"Done", secure:"🔒 Secure · 100% goes to local organizations",
    needHelpNow:"Need Help Now", emergencyMode:"Emergency Mode", emergencyModeDesc:"Showing the 3 closest open resources + crisis lines",
    noOpenResources:"No resources open right now — call PA 211 (dial 211) for immediate help.",
    submitResource:"Submit a Resource", submitDesc:"Know a pantry or service we're missing? Add it here.",
    orgName:"Organization Name", orgAddress:"Address", orgPhone:"Phone Number", orgCategory:"Category",
    orgHours:"Hours / Days Open", orgNotes:"Additional Notes (optional)", submit:"Submit Resource",
    submitThanks:"Thank you! We'll review and add this resource within 24 hours.",
    notifications:"Notifications", dismiss:"Dismiss",
    impactDashboard:"Impact Dashboard", impactDesc:"Real community impact in Delaware County",
    totalUsers:"Total Users", resourcesFound:"Resources Found", donationsGiven:"Donations Given", familiesHelped:"Families Helped",
    sponsoredBy:"Proudly supported by", monthlyImpact:"Monthly Impact Report",
    aiChat:"DelcoHelp AI", aiDesc:"Ask me anything about local resources", aiPlaceholder:"e.g. I need diapers and food near me…",
    aiSend:"Send", aiThinking:"Finding resources for you…",
  },
  es: {
    appName:"DelcoAyuda", tagline:"Encuentra ayuda cerca de ti, ahora mismo.", county:"Condado de Delaware, PA", zip:"Wallingford · 19086",
    findResources:"Buscar Recursos", foodHelpMore:"Comida, ayuda y más", benefits:"Beneficios", snapWic:"SNAP, WIC y más",
    emergency:"Emergencia", hotlinesCrisis:"Líneas de crisis", volunteer:"Voluntario", askAI:"Preguntar IA",
    openNow:"Abierto Ahora", opensLater:"Abre Más Tarde Hoy", allResources:"Todos los Recursos",
    supportPantries:"Apoya los Bancos de Alimentos", donateDesc:"Tu donación mantiene abastecidos los bancos de alimentos. Cada $10 alimenta a una familia por una semana.",
    back:"← Atrás", about:"Acerca de", hours:"Horario", whatToKnow:"Lo que debes saber", call:"Llamar", directions:"🗺️ Mapa",
    donatePantry:"💛 Donar para Apoyar este Banco", openRightNow:"● Abierto Ahora", opensLaterToday:"◐ Abre Más Tarde", closedToday:"○ Cerrado Hoy",
    home:"Inicio", find:"Buscar", hotline:"Línea de Crisis",
    searchPlaceholder:"Buscar comida, pañales, ayuda legal…", sortedByDistance:"recursos · ordenados por distancia",
    benefitsNav:"Navegador de Beneficios", benefitsDesc:"Encuentra programas para los que puedes calificar en Pennsylvania",
    quickEligibility:"Verificación Rápida de Elegibilidad", applyCompass:"Solicitar en PA COMPASS →",
    giveBack:"Devuelve a Tu Comunidad", volunteerDesc:"Oportunidades de voluntariado cerca de Wallingford, PA",
    whyMatters:"💛 Por qué importa", volunteerImpact:"Todos los bancos son administrados por voluntarios. Un turno de 2 horas ayuda a 30–50 familias por semana.",
    signUp:"Inscribirse", emergencyHotlines:"Líneas de Emergencia y Crisis", hotlinesDesc:"Gratis, confidencial, disponible 24/7",
    immediateEmergency:"🚨 Emergencia Inmediata", additionalResources:"Recursos Adicionales",
    confidentialNote:"Todas las llamadas son confidenciales. No tienes que dar tu nombre. La ayuda siempre está disponible — no estás solo.",
    makeDonation:"Hacer una Donación", donateAllGoes:"El 100% va directamente a organizaciones locales del Condado de Delaware",
    selectAmount:"Seleccionar Monto", donateTo:"Donar A", continue:"Continuar →", confirmDonation:"Confirmar Donación",
    amount:"Monto", to:"A", impact:"Impacto", payment:"Pago", thankYou:"Gracias,", onItsWay:"está en camino a",
    yourImpact:"Tu impacto:", done:"Listo", secure:"🔒 Seguro · 100% va a organizaciones locales",
    needHelpNow:"🚨 Necesito Ayuda Ahora", emergencyMode:"Modo de Emergencia", emergencyModeDesc:"Mostrando los 3 recursos abiertos más cercanos + líneas de crisis",
    noOpenResources:"No hay recursos abiertos ahora — llama a PA 211 (marcar 211) para ayuda inmediata.",
    submitResource:"Enviar un Recurso", submitDesc:"¿Conoces un banco o servicio que nos falta? Agrégalo aquí.",
    orgName:"Nombre de la Organización", orgAddress:"Dirección", orgPhone:"Número de Teléfono", orgCategory:"Categoría",
    orgHours:"Horario / Días Abierto", orgNotes:"Notas Adicionales (opcional)", submit:"Enviar Recurso",
    submitThanks:"¡Gracias! Revisaremos y agregaremos este recurso en 24 horas.",
    notifications:"Notificaciones", dismiss:"Descartar",
    impactDashboard:"Panel de Impacto", impactDesc:"Impacto comunitario real en el Condado de Delaware",
    totalUsers:"Usuarios Totales", resourcesFound:"Recursos Encontrados", donationsGiven:"Donaciones Dadas", familiesHelped:"Familias Ayudadas",
    sponsoredBy:"Orgullosamente apoyado por", monthlyImpact:"Informe de Impacto Mensual",
    aiChat:"IA de DelcoAyuda", aiDesc:"Pregúntame cualquier cosa sobre recursos locales", aiPlaceholder:"ej. Necesito pañales y comida cerca de mí…",
    aiSend:"Enviar", aiThinking:"Buscando recursos para ti…",
  }
};

// Merge Vietnamese and Chinese translations
Object.assign(T, EXTRA_TRANSLATIONS);

/* ── DATA ── */

// Zip code center coordinates for distance calculation
const ZIP_COORDS = {
  "19086":{ lat:39.8926, lng:-75.3693 }, // Wallingford
  "19013":{ lat:39.8490, lng:-75.3566 }, // Chester
  "19082":{ lat:39.9601, lng:-75.2966 }, // Upper Darby
  "19063":{ lat:39.9173, lng:-75.3921 }, // Media
  "19023":{ lat:39.9162, lng:-75.2702 }, // Darby
  "19015":{ lat:39.8651, lng:-75.3774 }, // Brookhaven
  "19050":{ lat:39.9387, lng:-75.2724 }, // Lansdowne
  "19076":{ lat:39.8793, lng:-75.3049 }, // Prospect Park
  "19064":{ lat:39.9254, lng:-75.3490 }, // Springfield
  "19078":{ lat:39.8810, lng:-75.3274 }, // Ridley Park
  "19081":{ lat:39.9026, lng:-75.3499 }, // Swarthmore
  "19041":{ lat:39.9829, lng:-75.2972 }, // Haverford
  "19083":{ lat:39.9787, lng:-75.3080 }, // Havertown
  "19026":{ lat:39.9407, lng:-75.3058 }, // Drexel Hill
  "19043":{ lat:39.8990, lng:-75.3174 }, // Holmes
  "19070":{ lat:39.8954, lng:-75.3210 }, // Morton
  "19079":{ lat:39.9032, lng:-75.2877 }, // Sharon Hill
  "19074":{ lat:39.8876, lng:-75.3027 }, // Norwood
  "19061":{ lat:39.8198, lng:-75.4074 }, // Marcus Hook
  "19022":{ lat:39.8615, lng:-75.3302 }, // Crum Lynne
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
  // Wallingford 19086
  { id:1, zip:"19086", category:"food", name:"Lifewerks Food Pantry", address:"25 Cedar Road, Wallingford PA 19086", phone:"610-872-3344", miles:0.3, hours:[{day:"Tuesday",time:"6:00 PM – 8:00 PM"}], tags:["choice pantry","no appointment needed"], color:"#0ea5e9", description:"A choice pantry — you shop like a store, picking what your family actually needs. Dignified and welcoming.", openDays:[2], openStart:18, openEnd:20 },
  { id:2, zip:"19086", category:"food", name:"DIFAN Wallingford", address:"25 Cedar Road, Wallingford PA 19086", phone:"484-326-5362", miles:0.3, hours:[{day:"Tuesday",time:"6:30 PM – 8:00 PM"},{day:"Friday",time:"4:00 PM – 6:00 PM"}], tags:["interfaith network","3 meals/day × 5 days per member"], color:"#0ea5e9", description:"Part of Delaware County's Interfaith Food Assistance Network. Each visit provides enough food for 3 meals a day, 5 days for every household member.", openDays:[2,5], openStart:16, openEnd:20 },

  // Brookhaven 19015
  { id:3, zip:"19015", category:"food", name:"Brookhaven Porch Pantry", address:"1780 Chichester Ave, Brookhaven PA 19015", phone:"267-322-0991", miles:2.2, hours:[{day:"4th Wednesday",time:"11:00 AM – 12:00 PM"}], tags:["no paperwork","no fee","self-pickup"], color:"#38bdf8", description:"Bags left on the church porch for self-pickup. No fee, no paperwork — boxes packed for a family of four.", openDays:[3], openStart:11, openEnd:12 },
  { id:20, zip:"19015", category:"assistance", name:"CADCOM Brookhaven", address:"Brookhaven, PA 19015", phone:"610-543-6300", miles:2.3, hours:[{day:"Monday–Friday",time:"9:00 AM – 4:00 PM"}], tags:["emergency assistance","utility help","rent support"], color:"#E76F51", description:"Community action agency providing emergency financial assistance, utility support, and referrals to Brookhaven-area families.", openDays:[1,2,3,4,5], openStart:9, openEnd:16 },

  // Media 19063
  { id:4, zip:"19063", category:"food", name:"Media Food Bank", address:"350 W. State St, Media PA 19063", phone:"610-566-3172", miles:2.4, hours:[{day:"Thursday",time:"6:00 PM – 8:00 PM"},{day:"Sunday",time:"1:00 PM – 2:00 PM"}], tags:["donations accepted daily 2–4 PM"], color:"#002D72", description:"Provides food and essential items to Delaware County residents. Drop off donations daily between 2–4 PM.", openDays:[4,0], openStart:13, openEnd:20 },
  { id:21, zip:"19063", category:"assistance", name:"Media Fellowship House", address:"214 W. State St, Media PA 19063", phone:"610-566-5516", miles:2.5, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["mental health","counseling","support groups"], color:"#9D4EDD", description:"Community mental health services, counseling, and peer support groups for Delaware County residents.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },

  // Prospect Park 19076
  { id:5, zip:"19076", category:"food", name:"Loaves & Fishes Food Pantry", address:"703 Lincoln Ave, Prospect Park PA 19076", phone:"610-532-9000", miles:2.8, hours:[{day:"Tuesday",time:"11:00 AM – 2:00 PM & 5:00–7:00 PM"},{day:"Thursday",time:"1:00 PM – 4:00 PM"}], tags:["twice weekly","extended hours"], color:"#7dd3fc", description:"Baptist church pantry with generous hours twice a week including evening access for working families.", openDays:[2,4], openStart:11, openEnd:19 },

  // Upper Darby 19082
  { id:6, zip:"19082", category:"food", name:"Murphy's Giving Market", address:"7408 West Chester Pike, Upper Darby PA 19082", phone:"610-271-8105", miles:4.1, hours:[{day:"Monday (55+)",time:"9:00 AM – 11:00 AM"},{day:"Tuesday",time:"10:00 AM – 12:00 PM"},{day:"Saturday",time:"10:00 AM – 12:00 PM"}], tags:["seniors 55+","register by 10 AM"], color:"#e0f2fe", description:"Dedicated senior hours Monday mornings. General hours Tuesdays. Must register by 10 AM.", openDays:[1,2,6], openStart:9, openEnd:12 },
  { id:22, zip:"19082", category:"food", name:"Upper Darby Food Cupboard", address:"7 S. Lansdowne Ave, Upper Darby PA 19082", phone:"610-352-1888", miles:4.2, hours:[{day:"Wednesday",time:"10:00 AM – 12:00 PM"},{day:"Saturday",time:"9:00 AM – 11:00 AM"}], tags:["emergency food","no residency requirement"], color:"#0ea5e9", description:"Emergency food assistance for Upper Darby area families. No residency proof required for first visit.", openDays:[3,6], openStart:9, openEnd:12 },
  { id:23, zip:"19082", category:"assistance", name:"Upper Darby Township Social Services", address:"100 Garrett Rd, Upper Darby PA 19082", phone:"610-713-2000", miles:4.0, hours:[{day:"Monday–Friday",time:"8:30 AM – 4:30 PM"}], tags:["township services","emergency assistance","referrals"], color:"#023E8A", description:"Township social services office providing emergency assistance, utility help, and referrals for Upper Darby residents.", openDays:[1,2,3,4,5], openStart:8, openEnd:16 },

  // Chester 19013
  { id:24, zip:"19013", category:"food", name:"Chester Community Connections", address:"522 Welsh St, Chester PA 19013", phone:"610-874-8451", miles:5.1, hours:[{day:"Monday",time:"10:00 AM – 12:00 PM"},{day:"Wednesday",time:"10:00 AM – 12:00 PM"},{day:"Friday",time:"10:00 AM – 12:00 PM"}], tags:["walk-in","fresh produce","no ID required"], color:"#0ea5e9", description:"Three-days-a-week community pantry in Chester with fresh produce when available. No ID or documentation required.", openDays:[1,3,5], openStart:10, openEnd:12 },
  { id:25, zip:"19013", category:"food", name:"Chester YMCA Food Pantry", address:"526 Welsh St, Chester PA 19013", phone:"610-876-3706", miles:5.1, hours:[{day:"Tuesday",time:"5:00 PM – 7:00 PM"},{day:"Thursday",time:"12:00 PM – 2:00 PM"}], tags:["evening hours","Chester families"], color:"#002D72", description:"YMCA food pantry serving Chester families with evening and daytime hours for working parents.", openDays:[2,4], openStart:12, openEnd:19 },
  { id:26, zip:"19013", category:"assistance", name:"CAADC Community Action", address:"33 W. 5th St, Chester PA 19013", phone:"610-874-8451", miles:5.0, hours:[{day:"Monday–Friday",time:"8:00 AM – 4:00 PM"}], tags:["SNAP enrollment","utility assistance","employment"], color:"#F4A261", description:"Community action agency helping Chester residents navigate SNAP, LIHEAP, and employment programs. Spanish speakers on staff.", openDays:[1,2,3,4,5], openStart:8, openEnd:16 },
  { id:27, zip:"19013", category:"food", name:"Salvation Army Chester", address:"901 Madison St, Chester PA 19013", phone:"610-876-3735", miles:5.3, hours:[{day:"Monday–Friday",time:"9:00 AM – 11:30 AM"}], tags:["daily service","hot meals","clothing"], color:"#0ea5e9", description:"Salvation Army providing daily food service, hot meals, and clothing assistance to Chester-area families.", openDays:[1,2,3,4,5], openStart:9, openEnd:11 },
  { id:28, zip:"19013", category:"legal", name:"Widener University Free Legal Clinic", address:"3800 Vartan Way, Chester PA 19013", phone:"610-499-4312", miles:5.2, hours:[{day:"Wednesday",time:"5:00 PM – 8:00 PM"}], tags:["free legal help","housing","family law"], color:"#023E8A", description:"Law students supervised by attorneys provide free legal consultations for Chester-area low-income residents.", openDays:[3], openStart:17, openEnd:20 },

  // Darby 19023
  { id:29, zip:"19023", category:"food", name:"Darby Borough Food Pantry", address:"611 Main St, Darby PA 19023", phone:"610-583-4000", miles:3.8, hours:[{day:"Wednesday",time:"10:00 AM – 12:00 PM"}], tags:["borough residents","no appointment"], color:"#38bdf8", description:"Weekly community pantry for Darby borough residents. Photo ID and proof of Darby address required.", openDays:[3], openStart:10, openEnd:12 },
  { id:30, zip:"19023", category:"assistance", name:"Darby Township Social Services", address:"Darby, PA 19023", phone:"610-586-2233", miles:3.7, hours:[{day:"Monday–Friday",time:"9:00 AM – 4:00 PM"}], tags:["emergency assistance","senior services"], color:"#E76F51", description:"Local social services for Darby Township residents including emergency assistance and senior support programs.", openDays:[1,2,3,4,5], openStart:9, openEnd:16 },

  // Lansdowne 19050
  { id:31, zip:"19050", category:"food", name:"Lansdowne Food Cupboard", address:"100 W. Baltimore Ave, Lansdowne PA 19050", phone:"610-259-0800", miles:3.4, hours:[{day:"Saturday",time:"9:00 AM – 11:30 AM"}], tags:["Saturday pantry","Lansdowne residents"], color:"#0ea5e9", description:"Saturday morning food distribution for Lansdowne and surrounding community. No appointment needed.", openDays:[6], openStart:9, openEnd:11 },
  { id:32, zip:"19050", category:"assistance", name:"Lansdowne Economic Development", address:"Lansdowne, PA 19050", phone:"610-623-9000", miles:3.3, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["job training","housing","financial counseling"], color:"#023E8A", description:"Economic development office offering workforce training, housing assistance, and financial literacy programs.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },

  // Ridley Park 19078
  { id:33, zip:"19078", category:"food", name:"Ridley Park Presbyterian Food Ministry", address:"300 N Swarthmore Ave, Ridley Park PA 19078", phone:"610-532-9400", miles:1.8, hours:[{day:"Second Saturday",time:"10:00 AM – 12:00 PM"}], tags:["monthly distribution","Ridley Park"], color:"#0ea5e9", description:"Monthly food distribution ministry at Ridley Park Presbyterian Church serving families across Ridley Township.", openDays:[6], openStart:10, openEnd:12 },
  { id:34, zip:"19078", category:"food", name:"Family Hope Center Food Bank", address:"300 N Swarthmore Ave, Ridley Park PA 19078", phone:"610-532-9400", miles:1.8, hours:[{day:"Thursday",time:"5:00 PM – 7:00 PM"}], tags:["Thursday evening","Ridley area"], color:"#002D72", description:"Food bank run through RPPC's Family Hope Center partnership serving Ridley Park and surrounding neighborhoods.", openDays:[4], openStart:17, openEnd:19 },

  // Springfield 19064
  { id:35, zip:"19064", category:"food", name:"Springfield Food Pantry", address:"82 Powell Rd, Springfield PA 19064", phone:"610-544-1300", miles:2.6, hours:[{day:"Tuesday",time:"6:00 PM – 8:00 PM"},{day:"Thursday",time:"10:00 AM – 12:00 PM"}], tags:["Springfield Township","twice weekly"], color:"#7dd3fc", description:"Community food pantry serving Springfield Township residents twice a week with morning and evening hours.", openDays:[2,4], openStart:10, openEnd:20 },

  // Swarthmore 19081
  { id:36, zip:"19081", category:"food", name:"Swarthmore Presbyterian Food Ministry", address:"727 Harvard Ave, Swarthmore PA 19081", phone:"610-543-4712", miles:1.5, hours:[{day:"First and Third Saturday",time:"9:00 AM – 11:00 AM"}], tags:["twice monthly","Swarthmore area"], color:"#38bdf8", description:"Bi-monthly food distribution through Swarthmore Presbyterian Church's community outreach program.", openDays:[6], openStart:9, openEnd:11 },

  // Havertown 19083
  { id:37, zip:"19083", category:"food", name:"Haverford Township Food Cupboard", address:"1014 Darby Rd, Havertown PA 19083", phone:"610-853-1000", miles:5.5, hours:[{day:"Monday",time:"10:00 AM – 12:00 PM"},{day:"Thursday",time:"6:00 PM – 8:00 PM"}], tags:["township residents","no appointment"], color:"#0ea5e9", description:"Haverford Township's community food cupboard with morning and evening hours to serve working families.", openDays:[1,4], openStart:10, openEnd:20 },

  // Drexel Hill 19026
  { id:38, zip:"19026", category:"food", name:"Drexel Hill United Methodist Pantry", address:"4001 State Rd, Drexel Hill PA 19026", phone:"610-623-8880", miles:3.9, hours:[{day:"Wednesday",time:"6:00 PM – 8:00 PM"}], tags:["Drexel Hill","evening hours"], color:"#002D72", description:"Wednesday evening food pantry serving Drexel Hill and Upper Darby-area families through United Methodist outreach.", openDays:[3], openStart:18, openEnd:20 },

  // County-wide services
  { id:7, zip:"19086", category:"assistance", name:"Delco Helping Hands", address:"Delaware County, PA", phone:"484-474-0590", miles:3.0, hours:[{day:"Call for hours",time:""}], tags:["diapers","pet supplies","referral hub","essentials"], color:"#F4A261", description:"Grassroots nonprofit supplying families with food, diapers, pet supplies, and acting as a referral hub to connect you with other local resources.", openDays:[0,1,2,3,4,5,6], openStart:9, openEnd:17 },
  { id:8, zip:"19086", category:"assistance", name:"Catholic Social Services", address:"Delaware County, PA", phone:"267-331-2490", miles:5.0, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["housing help","rent support","counseling","legal aid"], color:"#E76F51", description:"Family service centers offering food pantries, housing and rent support, counseling, and legal aid to residents in need.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:9, zip:"19086", category:"legal", name:"Legal Aid of Southeastern PA", address:"Delaware County, PA", phone:"877-429-5994", miles:4.5, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["free legal help","eviction defense","benefits access"], color:"#023E8A", description:"Free legal representation for low-income residents — housing, evictions, employment, family law, and access to public benefits.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:10, zip:"19086", category:"assistance", name:"Women's Resource Center", address:"Delaware County, PA", phone:"610-687-6391", miles:6.0, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["women","housing instability","financial hardship","counseling"], color:"#9D4EDD", description:"Supports women facing housing instability or financial hardship with counseling, legal advocacy, and educational services.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:39, zip:"19013", category:"assistance", name:"PA 211 Delaware County Office", address:"Delaware County, PA", phone:"211", miles:0.0, hours:[{day:"24/7",time:"Dial 2-1-1"}], tags:["all services","24/7","bilingual"], color:"#0ea5e9", description:"Dial 211 from any phone for immediate connection to food, housing, utility, health, and crisis resources anywhere in Delaware County.", openDays:[0,1,2,3,4,5,6], openStart:0, openEnd:24 },
  { id:40, zip:"19086", category:"food", name:"DIFAN Network — All Locations", address:"Multiple locations, Delaware County PA", phone:"484-326-5362", miles:1.0, hours:[{day:"Multiple days",time:"See specific location"}], tags:["14 locations","interfaith","countywide"], color:"#0ea5e9", description:"DIFAN operates 14 food distribution sites across Delaware County. Call for the nearest location to you.", openDays:[0,1,2,3,4,5,6], openStart:9, openEnd:20 },
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
  { id:2, name:PA_CRISIS_TEXT.displayText, sub:PA_CRISIS_TEXT.description, number:PA_CRISIS_TEXT.phone, actionLabel:"Text PA", actionHref:PA_CRISIS_TEXT.phoneHref, color:"#D62828", bg:"#FFF0F0", icon:"💬", urgent:true, isText:true, verified:PA_CRISIS_TEXT.verified, verifiedBy:PA_CRISIS_TEXT.verifiedBy, lastUpdated:PA_CRISIS_TEXT.lastUpdated },
  { id:3, name:"988 Suicide & Crisis", sub:"Call or text 988 — 24/7 free", number:"988", color:"#7B2D8B", bg:"#F8F0FF", icon:"🧠", urgent:true },
  { id:4, name:"Domestic Violence Hotline", sub:"PA DV Hotline — 24/7 confidential", number:"1-800-799-7233", color:"#9D4EDD", bg:"#F8F0FF", icon:"🏠" },
  { id:5, name:DELCO_CRISIS.displayName, sub:DELCO_CRISIS.description, number:DELCO_CRISIS.phone, actionLabel:"Call Crisis Line", actionHref:DELCO_CRISIS.phoneHref, color:"#023E8A", bg:"#F0F4FF", icon:"🧩", urgent:true, verified:DELCO_CRISIS.verified, verifiedBy:DELCO_CRISIS.verifiedBy, lastUpdated:DELCO_CRISIS.lastUpdated },
  { id:6, name:"PA 211 Helpline", sub:"All social services — dial 2-1-1", number:"211", color:"#0ea5e9", bg:"#e0f2fe", icon:"📞" },
  { id:7, name:"Hunger Hotline", sub:"Find food near you right now", number:"1-866-348-6479", color:"#0ea5e9", bg:"#e0f2fe", icon:"🍽" },
  { id:8, name:"Poison Control", sub:"24/7 medical emergency", number:"1-800-222-1222", color:"#E76F51", bg:"#FFF6F0", icon:"⚠️" },
  { id:9, name:DELCO_HOUSING_ENTRY.name, sub:`${DELCO_HOUSING_ENTRY.description} ${DELCO_HOUSING_ENTRY.guidance}`, number:DELCO_HOUSING_ENTRY.status, actionLabel:"Visit Official County Resources", actionHref:DELCO_HOUSING_ENTRY.officialUrl, secondaryActionLabel:"Call Crisis Line", secondaryActionHref:DELCO_CRISIS.phoneHref, color:"#F4A261", bg:"#FFF8F0", icon:"🏠️", verified:DELCO_HOUSING_ENTRY.verified, verifiedBy:DELCO_HOUSING_ENTRY.verifiedBy, lastUpdated:DELCO_HOUSING_ENTRY.lastUpdated },
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

// eslint-disable-next-line no-unused-vars
const CATEGORY_LABELS = { food:"Food Pantry", assistance:"Family Assistance", legal:"Legal Aid" };
// eslint-disable-next-line no-unused-vars
const CATEGORY_COLORS = { food:"#0ea5e9", assistance:"#E76F51", legal:"#023E8A" };

function getImpactStats() {
  try {
    const events = JSON.parse(localStorage.getItem("dh_events") || "[]");
    const count = (name) => events.filter(e => e.name === name).length;
    return [
      { label:"Resources Viewed", value: count("resource_viewed"), icon:"🔍", color:"#0ea5e9" },
      { label:"Benefits Checked", value: count("eligibility_quiz_opened"), icon:"📋", color:"#0ea5e9" },
      { label:"Neighbors Helped", value: count("found_help"), icon:"🏠", color:"#E76F51" },
      { label:"Crisis Contacts", value: count("emergency_mode_activated"), icon:"🚨", color:"#D62828" },
    ];
  } catch { return []; }
}

function isOpenNow(r) { const now=new Date(),day=now.getDay(),hour=now.getHours()+now.getMinutes()/60; return r.openDays.includes(day)&&hour>=r.openStart&&hour<r.openEnd; }
function isOpenToday(r) { return r.openDays.includes(new Date().getDay()); }

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  .dh * { box-sizing:border-box; margin:0; padding:0; }
  .dh { width:390px; height:844px; margin:0 auto; background:#f8fafc; overflow:hidden; display:flex; flex-direction:column; border-radius:44px; box-shadow:0 32px 64px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06); font-family:'DM Sans',sans-serif; color:#0f172a; position:relative; }
  .dh-sb { display:flex; justify-content:space-between; align-items:center; padding:14px 24px 10px; font-size:12px; font-weight:600; color:white; background:#1e3a8a; flex-shrink:0; }
  .dh-sc { flex:1; overflow-y:auto; overflow-x:hidden; scrollbar-width:none; }
  .dh-sc::-webkit-scrollbar { display:none; }
  .dh-nav { display:flex; justify-content:space-around; align-items:center; padding:6px 0 16px; border-top:1px solid #e2e8f0; background:white; flex-shrink:0; }
  .dh-ni { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:4px 8px; border-radius:12px; transition:all 0.18s; position:relative; }
  .dh-ni:hover { background:rgba(14,165,233,0.08); }
  .dh-ni-ic { font-size:18px; opacity:0.35; transition:opacity 0.18s; }
  .dh-ni-lb { font-size:8px; font-weight:600; letter-spacing:0.05em; color:#475569; transition:color 0.18s; text-transform:uppercase; }
  .dh-ni.act { background:#0ea5e9; }
  .dh-ni.act .dh-ni-ic { opacity:1; color:white; }
  .dh-ni.act .dh-ni-lb { color:white; }
  .dfi { animation:dhFi 0.28s ease; }
  @keyframes dhFi { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .dh-chip { display:inline-flex; align-items:center; gap:4px; background:#f8fafc; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:500; color:#334155; }
  .dh-chip.open { background:#dcfce7; color:#16a34a; font-weight:700; }
  .dh-chip.closed { background:#fee2e2; color:#ef4444; font-weight:700; }
  .dh-chip.today { background:#FFF3CD; color:#7B5800; }
  .dh-btn-primary, .button-primary { background:#facc15; color:#0f172a; border:none; border-radius:16px; padding:16px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:800; cursor:pointer; transition:all 0.18s; width:100%; }
  .dh-btn-primary:hover, .button-primary:hover { background:#eab308; transform:translateY(-1px); }
  .dh-btn-secondary, .button-secondary { background:#0ea5e9; color:white; border:none; border-radius:12px; padding:12px 20px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.18s; width:100%; }
  .dh-btn-outline { background:transparent; color:#0ea5e9; border:1.5px solid #0ea5e9; border-radius:14px; padding:12px 20px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.18s; width:100%; }
  .dh-btn-outline:hover { background:rgba(14,165,233,0.08); }
  .dh-card, .card { background:white; border:1px solid #e2e8f0; border-radius:18px; padding:16px; box-shadow:0 4px 14px rgba(0,0,0,0.05); cursor:pointer; transition:all 0.18s; }
  .dh-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,0.08); }
  .open { color:#16a34a; font-weight:700; }
  .closed { color:#ef4444; font-weight:700; }
  .dh-tag { background:#f8fafc; border-radius:8px; padding:3px 8px; font-size:11px; color:#334155; font-weight:500; }
  .dh-divider { height:1px; background:rgba(0,0,0,0.07); margin:0 24px; }
  .dh-input { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px 12px 42px; font-family:'DM Sans',sans-serif; font-size:14px; color:#0f172a; outline:none; transition:border-color 0.18s; }
  .dh-input:focus { border-color:#0ea5e9; }
  .dh-input-plain { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px; font-family:'DM Sans',sans-serif; font-size:14px; color:#0f172a; outline:none; transition:border-color 0.18s; margin-bottom:10px; }
  .dh-input-plain:focus { border-color:#0ea5e9; }
  .dh-filter-pill { white-space:nowrap; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid transparent; }
  .dh-filter-pill.active { background:#0ea5e9; color:white; }
  .dh-filter-pill.inactive { background:white; color:#334155; border-color:rgba(14,165,233,0.25); }
  .dh-back { display:flex; align-items:center; gap:6px; color:#0ea5e9; font-size:13px; font-weight:600; cursor:pointer; margin-bottom:16px; }
  .pulse { animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .notif-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex; flex-direction:column; justify-content:flex-start; padding:60px 20px 0; border-radius:44px; animation:dhFi 0.2s ease; }
  .notif-banner { background:rgba(255,255,255,0.97); backdrop-filter:blur(20px); border-radius:20px; padding:14px 16px; margin-bottom:10px; box-shadow:0 8px 32px rgba(0,0,0,0.2); display:flex; align-items:flex-start; gap:12px; }
  .modal-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.5); z-index:200; display:flex; align-items:flex-end; border-radius:44px; animation:dhFi 0.2s ease; }
  .modal-sheet { background:#FAFAF7; border-radius:28px 28px 44px 44px; width:100%; max-height:90%; overflow-y:auto; padding:24px; animation:sheetUp 0.3s ease; scrollbar-width:none; }
  .modal-sheet::-webkit-scrollbar { display:none; }
  @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .modal-handle { width:36px; height:4px; background:rgba(0,0,0,0.15); border-radius:2px; margin:0 auto 20px; }
  .amt-pill { padding:10px 16px; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid rgba(14,165,233,0.25); background:white; color:#0ea5e9; }
  .amt-pill.sel { background:#0ea5e9; color:white; border-color:#0ea5e9; }
  .hotline-card { border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.18s; margin-bottom:8px; }
  .hotline-card:hover { transform:translateX(2px); }
  .hotline-call-btn { border:none; border-radius:10px; padding:8px 14px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
  .emerg-overlay { position:absolute; inset:0; background:rgba(214,40,40,0.97); z-index:300; display:flex; flex-direction:column; border-radius:44px; animation:dhFi 0.2s ease; overflow-y:auto; scrollbar-width:none; }
  .emerg-overlay::-webkit-scrollbar { display:none; }
  .chat-bubble-user { background:#0ea5e9; color:white; border-radius:18px 18px 4px 18px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:80%; align-self:flex-end; }
  .chat-bubble-ai { background:white; color:#0f172a; border-radius:18px 18px 18px 4px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:85%; align-self:flex-start; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .chat-input-row { display:flex; gap:8px; padding:12px 16px; background:white; border-top:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
  .chat-input { flex:1; background:#F5F5F0; border:none; border-radius:20px; padding:10px 16px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; }
  .chat-send-btn { background:#0ea5e9; color:white; border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; flex-shrink:0; }
  .lang-toggle { display:flex; background:rgba(255,255,255,0.2); border-radius:20px; padding:2px; }
  .lang-btn { padding:4px 10px; border-radius:18px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.18s; border:none; font-family:'DM Sans',sans-serif; }
  .lang-btn.active { background:white; color:#0ea5e9; }
  .lang-btn.inactive { background:transparent; color:rgba(255,255,255,0.8); }
  .impact-stat { background:white; border-radius:16px; padding:14px; flex:1; box-shadow:0 2px 8px rgba(0,0,0,0.06); text-align:center; }
  .sponsor-ticker { overflow:hidden; white-space:nowrap; }
  .sponsor-inner { display:inline-block; animation:ticker 12s linear infinite; }
  .support-trust-line { text-align:center; font-size:0.85rem; color:#c7d2fe; margin-top:8px; }
  .support-trust-card { margin:28px auto 12px; padding:18px; border-radius:20px; background:white; border:1px solid #e2e8f0; box-shadow:0 6px 18px rgba(0,0,0,0.06); }
  .support-pill { display:inline-block; background:#e0f2fe; color:#075985; padding:5px 10px; border-radius:999px; font-size:0.75rem; font-weight:bold; margin-bottom:8px; }
  .support-trust-card h2 { font-size:20px; color:#0f172a; margin:0 0 8px; }
  .support-trust-card p { font-size:13px; line-height:1.55; color:#334155; margin:0 0 8px; }
  .support-line { margin-top:8px; }
  .trust-points { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
  .trust-points span { background:#f8fafc; border:1px solid #e2e8f0; padding:6px 10px; border-radius:999px; font-size:0.8rem; color:#334155; }
  .why-free { margin-top:14px; border-top:1px solid #e2e8f0; padding-top:10px; }
  .why-free summary { cursor:pointer; font-weight:800; color:#075985; font-size:13px; }
  .why-free p { margin-top:8px; }
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
  return (
    <div className="dh-card" onClick={()=>{trackEvent("resource_viewed",{id:r.id,name:r.name,category:r.category});onClick(r);}} style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:44,height:44,borderRadius:12,background:r.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          {r.category==="food"?"🍽":r.category==="legal"?"⚖️":"🤝"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:"#0f172a",lineHeight:1.3,marginBottom:3}}>{r.name}</div>
          <div style={{fontSize:12,color:"#475569",marginBottom:7}}>{r.address.split(",")[0]} · {r.miles} mi</div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span className={`dh-chip ${open?"open":today?"today":"closed"}`}>{open?t.openRightNow:today?t.opensLaterToday:t.closedToday}</span>
            <span className="dh-chip" style={{background:CATEGORY_COLORS[r.category]+"15",color:CATEGORY_COLORS[r.category]}}>{CATEGORY_LABELS[r.category]}</span>
          </div>
        </div>
      </div>
      {r.tags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>{r.tags.slice(0,3).map(tag=><span key={tag} className="dh-tag">{tag}</span>)}</div>}
    </div>
  );
}

/* ── DETAIL VIEW ── */
function DetailView({ r, onBack, onDonate, lang }) {
  const open=isOpenNow(r), today=isOpenToday(r), t=T[lang]||T.en;
  const zip = (r.address.match(/\d{5}/) || ["19086"])[0];
  return (
    <div className="dfi">
      <div style={{padding:"20px 24px 16px"}}>
        <div className="dh-back" onClick={onBack}>{t.back}</div>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <span className={`dh-chip ${open?"open":today?"today":"closed"}`}>{open?t.openRightNow:today?t.opensLaterToday:t.closedToday}</span>
          <span className="dh-chip" style={{background:CATEGORY_COLORS[r.category]+"15",color:CATEGORY_COLORS[r.category]}}>{CATEGORY_LABELS[r.category]}</span>
        </div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#0f172a",lineHeight:1.2,marginBottom:6}}>{r.name}</div>
        <div style={{fontSize:13,color:"#475569"}}>{r.address}</div>
      </div>
      <div style={{height:130,background:"linear-gradient(135deg,#e0f2fe,#bae6fd)",margin:"0 24px 20px",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.15) 20px,rgba(255,255,255,0.15) 21px)"}}/>
        <span style={{zIndex:1}}>📍</span>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{background:"#f8fafc",borderRadius:14,padding:16,marginBottom:16,border:"1px solid rgba(14,165,233,0.12)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"#0ea5e9",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t.about}</div>
            <TrustBadge resourceId={r.id}/>
          </div>
          <div style={{fontSize:14,color:"#334155",lineHeight:1.6}}>{r.description}</div>
        </div>
        <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.hours}</div>
          {r.hours.map((h,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<r.hours.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
              <div style={{fontSize:13,fontWeight:500}}>{h.day}</div>
              <div style={{fontSize:13,color:"#334155"}}>{h.time||"Call for hours"}</div>
            </div>
          ))}
        </div>
        {/* Community status + inventory */}
        <PantryStatusWidget pantryId={r.id}/>
        <PantryInventoryWidget pantryId={r.id}/>
        {/* SEPTA transit info */}
        <TransitHelper resourceZip={zip} resourceName={r.name}/>
        {r.tags.length>0&&<div style={{marginBottom:16,marginTop:12}}><div style={{fontSize:12,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.whatToKnow}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{r.tags.map(tag=><span key={tag} className="dh-tag" style={{fontSize:12,padding:"5px 10px"}}>✓ {tag}</span>)}</div></div>}
        {/* I'm Going + Directions */}
        <IAmGoingButton resource={r}/>
        <div style={{display:"flex",gap:10,marginBottom:8,marginTop:10}}>
          <button className="dh-btn-primary" onClick={()=>window.open(`tel:${r.phone}`)}>📞 {t.call} {r.phone}</button>
          <button className="dh-btn-outline" onClick={()=>window.open(`https://maps.google.com/?q=${encodeURIComponent(r.address)}`)}>{t.directions}</button>
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
function EmergencyMode({ onClose, lang }) {
  const t=T[lang]||T.en;
  const openNow=RESOURCES.filter(r=>isOpenNow(r)).slice(0,3);
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
        <div style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:12,color:"white",fontSize:12,lineHeight:1.5,marginBottom:10}}>
          {DELCO_CRISIS.emergencyDisclaimer} {DELCO_CRISIS.callToConfirm}
        </div>
        {urgentLines.map(h=>(
          <div key={h.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{h.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"white"}}>{h.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{h.sub}</div>
            </div>
            <button style={{background:"white",color:"#D62828",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>openHotlineAction(h)}>
              {h.actionLabel||`${h.isText?"Text":"Call"} ${h.number}`}
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
            <button style={{background:"white",color:"#0ea5e9",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>window.open(`tel:${r.phone}`)}>Call</button>
          </div>
        ))}
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

/* ── HOME SCREEN ── */
function SupportTrustCard() {
  return (
    <section className="support-trust-card">
      <div className="support-pill">Free community resource</div>

      <h2>Built for the community</h2>

      <p>
        DelcoHelp helps residents quickly find local food, shelter, health,
        school, church, and support resources.
      </p>

      <p className="support-line">
        Built and supported by <strong>CieroLink LLC</strong>
      </p>

      <div className="trust-points">
        <span>Free to use</span>
        <span>Community-focused</span>
        <span>Built for Delaware County</span>
        <span>No login required</span>
      </div>

      <details className="why-free">
        <summary>Why this is free</summary>
        <p>
          DelcoHelp is free and will always keep core help resources free.
          CieroLink LLC supports this project so residents and families
          can find trusted help faster.
        </p>
      </details>
    </section>
  );
}

function HomeScreen({ onNav, onResource, onDonate, onEmergency, lang }) {
  const t=T[lang]||T.en;
  const openNow=RESOURCES.filter(r=>isOpenNow(r));
  const savedIds = getSavedResources().map(s=>s.id);
  const savedResources = RESOURCES.filter(r=>savedIds.includes(r.id));
  return (
    <div className="dfi">
      <div className="header" style={{background:"#1e3a8a",padding:"16px 24px 24px",borderRadius:"0 0 28px 28px",marginBottom:16,color:"white"}}>
        <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.65)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{t.county}</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"white",lineHeight:1.25,marginBottom:0,textAlign:"center"}}>{t.tagline}</div>
        <p className="support-trust-line">
          Free community resource • Built and supported by CieroLink LLC
        </p>
        <button
          className="dh-btn-secondary"
          onClick={() => { window.location.href = "/philadelphia"; }}
          style={{ marginTop:12, marginBottom:0, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.24)" }}
        >
          Philadelphia
        </button>
        <button className="button-primary" onClick={()=>{trackEvent("emergency_button_tapped");onEmergency();}} style={{marginTop:16,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {t.needHelpNow}
        </button>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>What do you need?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {icon:"🍽",label:"Food",sub:"Pantries open now",nav:"find",filter:"food"},
            {icon:"📋",label:"Benefits",sub:"SNAP, WIC & more",nav:"benefits"},
            {icon:"??",label:"Nutrition",sub:"Food check & nutrition",nav:"nutrition"},
            {icon:"?",label:"Check Info",sub:"Scam & bias signals",nav:"trust"},
            {icon:"📞",label:"Crisis Line",sub:"Free & confidential",nav:"hotline"},
            {icon:"🏠",label:"Housing",sub:"Shelter & legal aid",nav:"find",filter:"assistance"},
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
            <div style={{width:8,height:8,borderRadius:"50%",background:"#16a34a"}} className="pulse"/>
            <div className="open" style={{fontSize:13}}>{t.openNow} ({openNow.length})</div>
          </div>
          {openNow.slice(0,2).map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          {openNow.length>2&&<button className="dh-btn-outline" style={{marginBottom:8}} onClick={()=>onNav("find","food")}>See all {openNow.length} open now →</button>}
          <div style={{height:6}}/>
        </>}
        {savedResources.length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#7B5800",marginBottom:8}}>⭐ My Saved Resources ({savedResources.length})</div>
            {savedResources.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          </div>
        )}
        <div className="dh-card" style={{marginBottom:12,cursor:"pointer",border:"1px solid rgba(14,165,233,0.18)"}} onClick={()=>onNav("trust")}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(14,165,233,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#0ea5e9",flexShrink:0}}>
              ?
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:16,fontWeight:800,color:"#0f172a",lineHeight:1.25,marginBottom:4}}>Check This Info</div>
              <div style={{fontSize:12,color:"#334155",lineHeight:1.45,marginBottom:12}}>
                Paste a link, article, message, job post, or rental listing to check for scam signals, bias signals, and AI-writing signals.
              </div>
              <button className="dh-btn-primary" style={{minHeight:44,padding:"11px 16px"}} onClick={(event)=>{event.stopPropagation();onNav("trust");}}>
                Check Now
              </button>
            </div>
          </div>
        </div>
        <SMSAccessCard phoneNumber="(877) 473-4752"/>
        <div style={{background:"linear-gradient(135deg,#FFF8F0,#FFF3E0)",borderRadius:16,padding:14,marginBottom:20,border:"1px solid rgba(244,162,97,0.3)",cursor:"pointer"}} onClick={onDonate}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>💛</div>
            <div><div style={{fontSize:13,fontWeight:700,color:"#7B4B00",marginBottom:2}}>{t.supportPantries}</div><div style={{fontSize:11,color:"#A06000",lineHeight:1.4}}>{t.donateDesc}</div></div>
          </div>
        </div>
        <SupportTrustCard/>
      </div>
    </div>
  );
}

/* ── FIND SCREEN ── */
function FindScreen({ onResource, lang, initialFilter="all" }) {
  const [search,setSearch]=useState(""), [filter,setFilter]=useState(initialFilter), [dietary,setDietary]=useState([]);
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
        let closest = "19086", minDist = 999;
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
  const results = RESOURCES.filter(r => {
    const matchCat = filter==="all" || r.category===filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.tags.some(tag=>tag.toLowerCase().includes(q));
    if (!matchCat || !matchSearch) return false;
    // If zip entered, only show resources within 10 miles
    if (zip.length === 5) {
      const dist = calcDistance(zip, r.zip || "19086");
      return dist <= 10;
    }
    return true;
  }).map(r => {
    // Recalculate distance from user's zip if provided
    if (zip.length === 5) {
      return { ...r, miles: calcDistance(zip, r.zip || "19086") };
    }
    return r;
  }).sort((a,b) => a.miles - b.miles);

  const userZipName = zip.length===5 && ZIP_COORDS[zip] ? `near ${zip}` : "near Wallingford";

  return (
    <div className="dfi">
      <div style={{padding:"16px 24px 12px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#0f172a",marginBottom:12}}>{t.findResources}</div>

        {/* Zip code search */}
        <div style={{background:"#e0f2fe",borderRadius:14,padding:12,marginBottom:10,border:"1px solid rgba(14,165,233,0.18)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#0ea5e9",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>📍 Your Location</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input
              style={{flex:1,background:"white",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"}}
              placeholder="Enter zip code (e.g. 19013)"
              value={zipInput}
              onChange={e=>{setZipInput(e.target.value.replace(/\D/g,"").slice(0,5)); if(e.target.value.length===5) applyZip(e.target.value);}}
              onBlur={e=>applyZip(e.target.value)}
              maxLength={5}
            />
            <button onClick={useMyLocation} disabled={locating} style={{flexShrink:0,background:"#0ea5e9",color:"white",border:"none",borderRadius:10,padding:"10px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {locating?"...":"📍 Near me"}
            </button>
            {zip.length===5 && (
              <button onClick={()=>{setZip("");setZipInput("");}} style={{flexShrink:0,background:"rgba(0,0,0,0.06)",color:"#475569",border:"none",borderRadius:10,padding:"10px 10px",fontSize:12,cursor:"pointer"}}>✕</button>
            )}
          </div>
          {zip.length===5 && !ZIP_COORDS[zip] && (
            <div style={{fontSize:11,color:"#D62828",marginTop:6}}>Zip code not in Delaware County — showing all resources</div>
          )}
          {zip.length===5 && ZIP_COORDS[zip] && (
            <div style={{fontSize:11,color:"#0ea5e9",marginTop:6,fontWeight:600}}>Showing resources within 10 miles of {zip}</div>
          )}
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
        <div style={{fontSize:12,color:"#475569",marginBottom:10,fontWeight:500}}>{results.length} resources {userZipName} · sorted by distance</div>
        {results.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
        {results.length===0&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:36,marginBottom:10}}>📍</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>No resources found {zip.length===5?`near ${zip}`:""}</div>
            <div style={{fontSize:12,color:"#475569",lineHeight:1.6}}>Try a nearby zip code, or call PA 211 (dial 211) for help finding resources anywhere in Delaware County.</div>
          </div>
        )}
        {/* 211 upgrade note */}
        <div style={{background:"#F0F4FF",borderRadius:14,padding:14,marginTop:8,marginBottom:8,border:"1px solid rgba(2,62,138,0.12)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#023E8A",marginBottom:4}}>🔄 More resources coming soon</div>
          <div style={{fontSize:11,color:"#1A4A8A",lineHeight:1.5}}>We're integrating the PA 211 database — coming Q3 2026 with hundreds of verified resources across all 49 Delaware County zip codes.</div>
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
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#0f172a",marginBottom:4}}>{t.benefitsNav}</div>
        <div style={{fontSize:13,color:"#475569",marginBottom:12}}>{t.benefitsDesc}</div>
        {/* Action buttons */}
        <button onClick={()=>{trackEvent("eligibility_quiz_opened");setShowQuiz(true);}} style={{width:"100%",background:"#0ea5e9",color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
          Check My Eligibility in 60 Seconds →
        </button>
        <button onClick={()=>setShowSNAP(true)} style={{width:"100%",background:"white",color:"#0ea5e9",border:"1.5px solid rgba(14,165,233,0.3)",borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
          🥫 SNAP Application Step-by-Step Guide
        </button>
        <button onClick={()=>{setChecklistPrograms(["snap","wic","liheap","medicaid"]);setShowChecklist(true);}} style={{width:"100%",background:"white",color:"#0ea5e9",border:"1.5px solid rgba(14,165,233,0.3)",borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
          📋 Build My Document Checklist
        </button>
        <div style={{background:"#e0f2fe",borderRadius:16,padding:16,marginBottom:16,border:"1px solid rgba(14,165,233,0.18)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#0ea5e9",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.quickEligibility}</div>
          {eligibility.map((e,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:i<eligibility.length-1?"1px solid rgba(14,165,233,0.1)":"none"}}>
              <div style={{fontSize:13,color:"#0f172a",marginBottom:6}}>{e.q}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{e.programs.map(p=><span key={p} style={{background:"#0ea5e9",color:"white",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:600}}>{p}</span>)}</div>
            </div>
          ))}
        </div>
        {BENEFITS.map(b=>(
          <div key={b.id} className="dh-card" style={{marginBottom:10}} onClick={()=>setExpanded(expanded===b.id?null:b.id)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28,flexShrink:0}}>{b.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{b.name}</div><div style={{fontSize:12,color:"#475569",marginTop:2}}>{b.desc}</div></div>
              <div style={{color:"#0ea5e9",fontSize:18,fontWeight:300}}>{expanded===b.id?"−":"+"}</div>
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
        <div style={{background:"#FFF0F0",borderRadius:14,padding:12,border:"1px solid rgba(214,40,40,0.2)",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"#D62828",marginBottom:4}}>{DELCO_CRISIS.emergencyDisclaimer}</div>
          <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.5}}>{DELCO_CRISIS.callToConfirm}</div>
        </div>
        <div style={{fontSize:12,fontWeight:700,color:"#D62828",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.immediateEmergency}</div>
        {urgent.map(h=>(
          <div key={h.id} className="hotline-card" style={{background:h.bg,border:`1px solid ${h.color}22`}}>
            <div style={{width:42,height:42,borderRadius:12,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{h.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{h.name}</div><div style={{fontSize:11,color:"#475569",marginTop:2}}>{h.sub}</div>{h.lastUpdated&&<div style={{fontSize:10,color:"#64748b",marginTop:4}}>Last updated: {h.lastUpdated} · {h.verified?"Verified":"Needs verification"}</div>}<a href={correctionMailto(h.name)} style={{fontSize:10,color:h.color,fontWeight:700,textDecoration:"none"}}>Report Incorrect Info</a></div>
            <button className="hotline-call-btn" style={{background:h.color,color:"white"}} onClick={()=>openHotlineAction(h)}>{h.actionLabel||`${h.isText?"Text":"Call"} ${h.number}`}</button>
          </div>
        ))}
        <div style={{height:12}}/>
        <div style={{fontSize:12,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.additionalResources}</div>
        {rest.map(h=>(
          <div key={h.id} className="hotline-card" style={{background:h.bg,border:`1px solid ${h.color}22`}}>
            <div style={{width:42,height:42,borderRadius:12,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{h.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{h.name}</div><div style={{fontSize:11,color:"#475569",marginTop:2}}>{h.sub}</div>{h.lastUpdated&&<div style={{fontSize:10,color:"#64748b",marginTop:4}}>Last updated: {h.lastUpdated} · {h.verified?"Verified":"Needs verification"}</div>}<a href={correctionMailto(h.name)} style={{fontSize:10,color:h.color,fontWeight:700,textDecoration:"none"}}>Report Incorrect Info</a></div>
            <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
              {h.secondaryActionLabel&&<button className="hotline-call-btn" style={{background:h.color,color:"white"}} onClick={()=>window.open(h.secondaryActionHref)}>{h.secondaryActionLabel}</button>}
              <button className="hotline-call-btn" style={{background:h.color+"15",color:h.color}} onClick={()=>openHotlineAction(h)}>{h.actionLabel||h.number}</button>
            </div>
          </div>
        ))}
        <div style={{background:"#e0f2fe",borderRadius:16,padding:14,marginTop:8,marginBottom:24,border:"1px solid rgba(14,165,233,0.18)"}}>
          <div style={{fontSize:12,color:"#0ea5e9",lineHeight:1.6,textAlign:"center"}}>{t.confidentialNote}</div>
        </div>
      </div>
    </div>
  );
}

/* ── VOLUNTEER SCREEN ── */
function VolunteerScreen({ lang }) {
  const t=T[lang]||T.en;
  const opps=[
    {org:"Lifewerks Food Pantry",role:"Pantry Volunteer",time:"Tuesdays 5:30–8:30 PM",icon:"🍽",color:"#0ea5e9",phone:"6108723344"},
    {org:"DIFAN Network",role:"Food Distributor",time:"Tuesdays & Fridays",icon:"📦",color:"#0ea5e9",phone:"4843265362"},
    {org:"Media Food Bank",role:"Donation Sorter",time:"Thursdays 5–8 PM",icon:"🏪️",color:"#002D72",phone:"6105663172"},
    {org:"Delco Helping Hands",role:"Driver / Delivery",time:"Flexible scheduling",icon:"🚗",color:"#F4A261",phone:"4844740590"},
    {org:"Catholic Social Services",role:"Case Aid Volunteer",time:"Weekdays flexible",icon:"🤝",color:"#E76F51",phone:"2673312490"},
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
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{o.role}</div><div style={{fontSize:12,color:"#475569",marginTop:1}}>{o.org}</div><div style={{fontSize:11,color:o.color,fontWeight:600,marginTop:4}}>⏰ {o.time}</div></div>
              <button onClick={()=>window.open(`tel:${o.phone}`)} style={{background:o.color+"15",color:o.color,border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>📞 Call</button>
            </div>
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ── IMPACT DASHBOARD ── */
// eslint-disable-next-line no-unused-vars
function ImpactScreen({ lang }) {
  const stats=getImpactStats();
  return (
    <div className="dfi">
      <div style={{background:"linear-gradient(160deg,#023E8A 0%,#0077B6 100%)",padding:"16px 24px 20px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"white",lineHeight:1.3,marginBottom:4}}>Your Impact</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>Your personal activity in this app</div>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {stats.map((s,i)=>(
            <div key={i} className="impact-stat">
              <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:11,fontWeight:600,color:"#0f172a",marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#e0f2fe",borderRadius:16,padding:16,marginBottom:16,border:"1px solid rgba(14,165,233,0.18)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#002D72",marginBottom:6}}>About DelcoHelp</div>
          <div style={{fontSize:13,color:"#3D4F40",lineHeight:1.6}}>Free community service connecting Delaware County residents to food pantries, benefits programs, and emergency resources. Built by CieroLink LLC.</div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:16,marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Questions or feedback?</div>
          <button className="dh-btn-outline" onClick={()=>window.open("mailto:damianciero@gmail.com")}>📧 Contact Us</button>
        </div>
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
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#0f172a",marginBottom:8}}>Resource Submitted!</div>
      <div style={{fontSize:14,color:"#475569",lineHeight:1.6}}>{t.submitThanks}</div>
    </div>
  );
  return (
    <div className="dfi">
      <div style={{padding:"16px 24px 0"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#0f172a",marginBottom:4}}>{t.submitResource}</div>
        <div style={{fontSize:13,color:"#475569",marginBottom:20}}>{t.submitDesc}</div>
        {[{key:"name",label:t.orgName,placeholder:"e.g. Wallingford Community Pantry"},{key:"address",label:t.orgAddress,placeholder:"123 Main St, Wallingford PA 19086"},{key:"phone",label:t.orgPhone,placeholder:"610-555-0000"},{key:"hours",label:t.orgHours,placeholder:"e.g. Tuesdays 5–7 PM, Saturdays 10 AM–12 PM"}].map(f=>(
          <div key={f.key} style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{f.label}</div>
            <input className="dh-input-plain" placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={{paddingLeft:16}}/>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.orgCategory}</div>
          <div style={{display:"flex",gap:8}}>
            {[{id:"food",label:"🍽 Food"},{id:"assistance",label:"🤝 Assistance"},{id:"legal",label:"⚖️ Legal"}].map(c=>(
              <div key={c.id} className={`dh-filter-pill ${form.category===c.id?"active":"inactive"}`} onClick={()=>setForm({...form,category:c.id})}>{c.label}</div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.orgNotes}</div>
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
function getLocalDelcoHelpResponse(message) {
  const text = message.toLowerCase();

  if (text.includes("food") || text.includes("pantry") || text.includes("meal")) {
    return "I can help you find food resources. Tap Food or Need Help Now to see nearby pantries, meals, and support options.";
  }

  if (text.includes("shelter") || text.includes("housing") || text.includes("homeless")) {
    return "I can help you find shelter and housing support. For homelessness or immediate housing needs in Delaware County, residents may need a Coordinated Entry assessment. Tap Housing or Need Help Now, and please call ahead when possible.";
  }

  if (text.includes("benefits") || text.includes("snap") || text.includes("ebt") || text.includes("utility")) {
    return "I can help with benefits information. Try the Benefits section for SNAP, utility help, and emergency assistance resources.";
  }

  if (text.includes("church") || text.includes("parish")) {
    return "You can check the Churches or Parish Hub sections for local church support, events, and resources.";
  }

  if (text.includes("nutrition") || text.includes("barcode") || text.includes("healthy")) {
    return "Use the Nutrition tab to scan or enter a food barcode and get simple nutrition guidance.";
  }

  return "I can help you find food, shelter, benefits, churches, school resources, nutrition help, or local support. What do you need help with?";
}

function AIScreen({ lang }) {
  const t=T[lang]||T.en;
  const [messages,setMessages]=useState([{role:"ai",text:"👋 Hi! I'm the DelcoHelp AI. Ask me anything about local resources, benefits, or getting help in Delaware County, PA."}]);
  const [input,setInput]=useState(""), [loading,setLoading]=useState(false);
  const [usageCount,setUsageCount]=useState(getAIUsage());
  const bottomRef=useRef(null);
  const remaining = Math.max(0, AI_LIMIT - usageCount);
  const atLimit = remaining === 0;

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  async function sendMessage() {
    if (!input.trim()||loading||atLimit) return;
    const userMsg=input.trim();
    const conversation=[...messages.filter((m,i)=>i>0).map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),{role:"user",content:userMsg}];
    setInput("");
    setLoading(true);
    incrementAIUsage();
    setUsageCount(getAIUsage());
    setMessages(m=>[...m,{role:"user",text:userMsg}]);
    trackEvent("ai_chat_sent");
    try {
      const systemPrompt=`You are DelcoHelp AI, a friendly assistant helping low-income families in Delaware County, PA (near Wallingford, zip 19086) find local resources.

Key local resources:
- Lifewerks Food Pantry: 25 Cedar Rd, Wallingford — Tuesdays 6–8 PM, choice pantry, 610-872-3344
- DIFAN Wallingford: 25 Cedar Rd — Tues 6:30–8 PM, Fri 4–6 PM, 484-326-5362
- Media Food Bank: 350 W State St Media — Thurs 6–8 PM, Sun 1–2 PM, 610-566-3172
- Delco Helping Hands: diapers, pet supplies, referrals, 484-474-0590
- Legal Aid of SE PA: free legal help, 877-429-5994
- PA 211: dial 211 for any social service
- SNAP, WIC, LIHEAP, Medicaid all available via compass.state.pa.us

Keep responses short, warm, and actionable. Always give a phone number when recommending a resource. If someone seems in immediate danger, lead with 911. For Delaware County crisis support, use ${DELCO_CRISIS.phone}. For text support, say text PA to 741741.`;
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:systemPrompt,messages:conversation})});
      const data=await res.json();
      if (!res.ok) throw new Error(data.error || "Chat API request failed");
      const reply=data.content?.[0]?.text||getLocalDelcoHelpResponse(userMsg);
      setMessages(m=>[...m,{role:"ai",text:reply}]);
    } catch(e) {
      setMessages(m=>[...m,{role:"ai",text:"I’m sorry, I couldn’t get a response right now. Please try the Help Now button or call the resource directly."}]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions=["I need food near me tonight","How do I apply for SNAP?","I need diapers for my baby","I'm facing eviction, can you help?"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:"linear-gradient(160deg,#1A1A2E 0%,#16213E 100%)",padding:"16px 24px 16px",borderRadius:"0 0 24px 24px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0ea5e9,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
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
          <span style={{fontSize:12,color:"#475569",fontWeight:600}}>DelcoHelp is thinking...</span>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#0ea5e9",animation:"pulse 1s infinite"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#0ea5e9",animation:"pulse 1s infinite 0.2s"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#0ea5e9",animation:"pulse 1s infinite 0.4s"}}/>
        </div>}
        {messages.length===1&&!atLimit&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          {suggestions.map((s,i)=><button key={i} onClick={()=>setInput(s)} style={{background:"#e0f2fe",border:"1px solid rgba(14,165,233,0.2)",borderRadius:12,padding:"8px 12px",fontSize:12,color:"#0ea5e9",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>{s}</button>)}
        </div>}
        {atLimit&&<div style={{background:"#FFF8F0",borderRadius:16,padding:16,border:"1px solid rgba(244,162,97,0.3)",margin:"8px 0"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#7B4B00",marginBottom:6}}>You've used your {AI_LIMIT} free AI messages today.</div>
          <div style={{fontSize:13,color:"#A06000",lineHeight:1.6,marginBottom:12}}>Your limit resets at midnight. In the meantime these resources can help right now:</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>window.open("tel:211")} style={{background:"#0ea5e9",color:"white",border:"none",borderRadius:12,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>📞 Call PA 211 — Free Resource Helpline</button>
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
  const [org,setOrg]=useState("Lifewerks Food Pantry");
  const t=T[lang]||T.en;
  const orgs=[
    {name:"Lifewerks Food Pantry",icon:"🍽",desc:"Choice pantry · Wallingford",phone:"6108723344",display:"610-872-3344"},
    {name:"DIFAN Wallingford",icon:"📦",desc:"Interfaith food network",phone:"4843265362",display:"484-326-5362"},
    {name:"Media Food Bank",icon:"🏪",desc:"Media, PA · Thurs & Sun",phone:"6105663172",display:"610-566-3172"},
    {name:"Delco Helping Hands",icon:"🤝",desc:"Diapers, supplies, referrals",phone:"4844740590",display:"484-474-0590"},
  ];
  const selected=orgs.find(o=>o.name===org)||orgs[0];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#0f172a",marginBottom:4}}>Support Local Pantries</div>
        <div style={{fontSize:13,color:"#475569",marginBottom:16}}>Call the pantry directly — 100% of your donation reaches them</div>
        <div style={{fontSize:12,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.donateTo}</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {orgs.map(o=>(
            <div key={o.name} onClick={()=>setOrg(o.name)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,border:`1.5px solid ${org===o.name?"#0ea5e9":"rgba(0,0,0,0.08)"}`,background:org===o.name?"#e0f2fe":"white",cursor:"pointer"}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${org===o.name?"#0ea5e9":"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{org===o.name&&<div style={{width:8,height:8,borderRadius:"50%",background:"#0ea5e9"}}/>}</div>
              <div style={{fontSize:20,flexShrink:0}}>{o.icon}</div>
              <div><div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{o.name}</div><div style={{fontSize:11,color:"#475569"}}>{o.desc}</div></div>
            </div>
          ))}
        </div>
        <button className="dh-btn-primary" onClick={()=>window.open(`tel:${selected.phone}`)} style={{marginBottom:8}}>📞 Call {selected.name} to Donate — {selected.display}</button>
        <div style={{fontSize:11,color:"#475569",textAlign:"center",lineHeight:1.5}}>Online donation processing coming soon. Call during open hours to give by card or check.</div>
      </div>
    </div>
  );
}

/* ── NOTIFICATION OVERLAY ── */
function NotifOverlay({ onClose, lang }) {
  const t=T[lang]||T.en;
  const notifs=[
    {icon:"🍽",bg:"#0ea5e9",title:"Lifewerks Food Pantry — Tuesdays 6–8 PM",body:"Choice pantry at 25 Cedar Rd, Wallingford · No appointment needed",time:"weekly"},
    {icon:"📋",bg:"#0ea5e9",title:"Check your benefits eligibility",body:"SNAP, WIC, LIHEAP and Medicaid — takes 60 seconds in the Benefits tab",time:"tip"},
    {icon:"📱",bg:"#023E8A",title:"No smartphone? Text FOOD to (877) 473-4752",body:"Works on any phone — get pantry hours instantly by text",time:"tip"},
  ];
  return (
    <div className="notif-overlay" onClick={onClose}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"white",textAlign:"center",marginBottom:12,letterSpacing:"0.05em",textTransform:"uppercase",opacity:0.7}}>{t.notifications}</div>
      {notifs.map((n,i)=>(
        <div key={i} className="notif-banner" onClick={e=>e.stopPropagation()}>
          <div style={{width:36,height:36,borderRadius:10,background:n.bg+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:2}}>{n.title}</div>
            <div style={{fontSize:11,color:"#475569",lineHeight:1.4}}>{n.body}</div>
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

/* ── FIREBASE SYNC ── */
const SYNC_KEYS = [
  { ls:"dh_saved_resources", fs:"saved" },
  { ls:"dh_family_profile",  fs:"profile" },
  { ls:"dh_found_help",      fs:"found_help" },
  { ls:"dh_going_tonight",   fs:"going_tonight" },
];

async function pullSync(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    SYNC_KEYS.forEach(({ ls, fs }) => {
      const v = snap.data()[fs];
      if (v !== undefined) localStorage.setItem(ls, JSON.stringify(v));
    });
  } else {
    await pushSync(uid);
  }
}

async function pushSync(uid) {
  const data = {};
  SYNC_KEYS.forEach(({ ls, fs }) => {
    try { const v = localStorage.getItem(ls); if (v) data[fs] = JSON.parse(v); } catch {}
  });
  if (Object.keys(data).length > 0) await setDoc(doc(db, "users", uid), data, { merge:true });
}

/* ── AUTH MODAL ── */
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
          <div style={{width:60,height:60,borderRadius:"50%",background:"#0ea5e918",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
            {user.photoURL
              ? <img src={user.photoURL} style={{width:60,height:60,borderRadius:"50%"}} alt="" referrerPolicy="no-referrer"/>
              : <span style={{fontSize:28}}>👤</span>}
          </div>
          <div style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>{user.displayName||"Signed in"}</div>
          <div style={{fontSize:12,color:"#475569",marginTop:3}}>{user.email}</div>
        </div>
        <div style={{background:"#e0f2fe",borderRadius:14,padding:14,marginBottom:16,border:"1px solid rgba(14,165,233,0.18)"}}>
          <div style={{fontSize:13,color:"#0ea5e9",lineHeight:1.8}}>
            ✓ Saved resources synced across devices<br/>
            ✓ Family profile synced<br/>
            ✗ Crisis plan stays on this device only
          </div>
        </div>
        <button className="dh-btn-outline" onClick={onSignOut} style={{marginBottom:8}}>Sign Out</button>
        <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",color:"#475569",fontSize:13,cursor:"pointer",padding:8}}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#0f172a",marginBottom:4}}>Sign In — Optional</div>
        <div style={{fontSize:13,color:"#475569",marginBottom:16,lineHeight:1.6}}>Sync your saved resources and family profile across devices. The full app works without an account.</div>
        <div style={{background:"#e0f2fe",borderRadius:14,padding:14,marginBottom:16,border:"1px solid rgba(14,165,233,0.18)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#0ea5e9",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>What syncs to your account</div>
          <div style={{fontSize:13,color:"#3D4F40",lineHeight:1.8}}>
            ✓ Saved resources<br/>
            ✓ Family profile<br/>
            ✓ "I Found Help" history<br/>
            ✗ Crisis Escape Plan (stays on this device — never uploaded)
          </div>
        </div>
        <button className="dh-btn-primary" onClick={onSignIn} style={{marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <GoogleIcon/> Continue with Google
        </button>
        <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",color:"#475569",fontSize:13,cursor:"pointer",padding:8}}>Continue without account</button>
      </div>
    </div>
  );
}

/* ── APP SHELL ── */
export default function App() {
  injectCSS();
  const [tab,setTab]=useState(()=>window.location.pathname==="/trust-check"?"trust":"home"), [detail,setDetail]=useState(null);
  const [findFilter,setFindFilter]=useState("all");
  const [showDonate,setShowDonate]=useState(false), [showNotif,setShowNotif]=useState(false);
  const [showEmergency,setShowEmergency]=useState(false), [notifCount,setNotifCount]=useState(3);
  const [clock,setClock]=useState(()=>{const n=new Date();return `${n.getHours()}:${String(n.getMinutes()).padStart(2,"0")}`;});
  useEffect(()=>{const id=setInterval(()=>{const n=new Date();setClock(`${n.getHours()}:${String(n.getMinutes()).padStart(2,"0")}`);},30000);return()=>clearInterval(id);},[]);
  const [lang,setLang]=useState("en");
  const [showProfile,setShowProfile]=useState(()=>!getFamilyProfile());
  const [showEscape,setShowEscape]=useState(false);
  const [showLegal,setShowLegal]=useState(false);
  const [user,setUser]=useState(null);
  const [showAuth,setShowAuth]=useState(false);

  useEffect(()=>{
    const syncPath = () => {
      setTab(window.location.pathname==="/trust-check"?"trust":"home");
      setDetail(null);
    };
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  },[]);

  useEffect(()=>{
    if (!FIREBASE_ENABLED) return;
    return onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) { try { await pullSync(u.uid); } catch {} }
    });
  },[]);

  async function handleSignIn() {
    try { await signInWithPopup(auth, googleProvider); setShowAuth(false); } catch {}
  }

  async function handleSignOut() {
    try { if (auth.currentUser) await pushSync(auth.currentUser.uid); } catch {}
    await signOut(auth);
    setShowAuth(false);
  }

  function handleNav(t,filter) {
    setTab(t); setDetail(null); if(filter) setFindFilter(filter);
    const nextPath = t === "trust" ? "/trust-check" : "/";
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    if (FIREBASE_ENABLED && auth.currentUser) pushSync(auth.currentUser.uid).catch(()=>{});
  }

  const tabs=[
    {id:"home",icon:"🏠",label:"home"},
    {id:"find",icon:"🔍",label:"find"},
    {id:"benefits",icon:"📋",label:"benefits"},
    {id:"nutrition",icon:"🍎",label:"Nutrition"},
    {id:"hotline",icon:"🚨",label:"hotline"},
    {id:"ai",icon:"🤖",label:"askAI"},
  ];

  const screens={
    home:<HomeScreen onNav={handleNav} onResource={setDetail} onDonate={()=>setShowDonate(true)} onEmergency={()=>setShowEmergency(true)} lang={lang}/>,
    find:<FindScreen key={findFilter} initialFilter={findFilter} onResource={setDetail} lang={lang}/>,
    benefits:<BenefitsScreen lang={lang}/>,
    nutrition:<NutritionFoodCheck variant="delco"/>,
    trust:<TrustCheck/>,
    hotline:<HotlineScreen lang={lang} onEscape={()=>setShowEscape(true)}/>,
    volunteer:<VolunteerScreen lang={lang}/>,
    impact:<ImpactScreen lang={lang}/>,
    submit:<SubmitScreen lang={lang}/>,
    ai:<AIScreen lang={lang}/>,
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f8fafc 0%,#e0f2fe 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 0"}}>
      {/* Feature 1 — PWA install prompt */}
      <InstallPrompt/>
      {/* Family profile setup — shows once on first visit */}
      {showProfile && <FamilyProfileSetup onComplete={()=>setShowProfile(false)}/>}
      {/* Crisis escape plan */}
      {showEscape && <CrisisEscapePlan onClose={()=>setShowEscape(false)}/>}
      {/* Legal screen */}
      {showLegal && <LegalScreen appName="DelcoHelp" companyName="CieroLink LLC" appUrl="delcohelp.org" onClose={()=>setShowLegal(false)}/>}
      {/* Auth modal */}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} user={user} onSignIn={handleSignIn} onSignOut={handleSignOut}/>}
      <div className="dh">
        <div className="dh-sb">
          <span>{clock}</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:"0.04em",color:"white"}}>{(T[lang]||T.en).appName}</span>
            <div className="lang-toggle" style={{background:"rgba(14,165,233,0.12)"}}>
              {["en","es","vi","zh"].map(code=>(
                <button key={code} className={`lang-btn ${lang===code?"active":"inactive"}`} style={{color:lang===code?"#1e3a8a":"#c7d2fe",background:lang===code?"white":"transparent"}} onClick={()=>setLang(code)}>
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
            {FIREBASE_ENABLED&&(
              <div onClick={()=>setShowAuth(true)} title={user?"Account":"Sign in"} style={{cursor:"pointer",width:22,height:22,borderRadius:"50%",overflow:"hidden",background:user?"#0ea5e9":"rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {user?.photoURL
                  ? <img src={user.photoURL} style={{width:22,height:22}} alt="" referrerPolicy="no-referrer"/>
                  : <span style={{fontSize:user?11:13,color:user?"white":"#475569",fontWeight:700,lineHeight:1}}>{user?user.displayName?.[0]||"U":"👤"}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="dh-sc">
          {detail?<DetailView r={detail} onBack={()=>setDetail(null)} onDonate={()=>setShowDonate(true)} lang={lang}/>:screens[tab]||screens.home}
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
        {showEmergency&&<EmergencyMode onClose={()=>setShowEmergency(false)} lang={lang}/>}
        {showNotif&&<NotifOverlay onClose={()=>setShowNotif(false)} lang={lang}/>}
        {showDonate&&<DonateModal onClose={()=>setShowDonate(false)} lang={lang}/>}
      </div>
    </div>
  );
}


