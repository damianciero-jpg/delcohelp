import { useState, useEffect, useRef } from "react";
import {
  InstallPrompt, StoriesSection, SMSAccessCard, EligibilityQuiz,
  PantryStatusWidget, TransitHelper, DietaryFilters, trackEvent, EXTRA_TRANSLATIONS,
  PantryInventoryWidget, IAmGoingButton, SaveResourceButton, FoundHelpButton,
  DocumentChecklist, SNAPAssistant, CrisisEscapePlan, FamilyResourcePlan,
  FamilyProfileSetup, getFamilyProfile, getSavedResources, LegalScreen,
  TrustBadge, ReportIssueButton
} from "./features";
import { DELCO_CRISIS, DELCO_HOUSING_ENTRY, PA_CRISIS_TEXT, correctionMailto } from "./delcoSafetyInfo";

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
    needHelpNow:"🚨 I Need Help Right Now", emergencyMode:"Emergency Mode", emergencyModeDesc:"Showing the 3 closest open resources + crisis lines",
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
  { id:1, zip:"19086", category:"food", name:"Lifewerks Food Pantry", address:"25 Cedar Road, Wallingford PA 19086", phone:"610-872-3344", miles:0.3, hours:[{day:"Tuesday",time:"6:00 PM – 8:00 PM"}], tags:["choice pantry","no appointment needed"], color:"#2D6A4F", description:"A choice pantry — you shop like a store, picking what your family actually needs. Dignified and welcoming.", openDays:[2], openStart:18, openEnd:20 },
  { id:2, zip:"19086", category:"food", name:"DIFAN Wallingford", address:"25 Cedar Road, Wallingford PA 19086", phone:"484-326-5362", miles:0.3, hours:[{day:"Tuesday",time:"6:30 PM – 8:00 PM"},{day:"Friday",time:"4:00 PM – 6:00 PM"}], tags:["interfaith network","3 meals/day × 5 days per member"], color:"#40916C", description:"Part of Delaware County's Interfaith Food Assistance Network. Each visit provides enough food for 3 meals a day, 5 days for every household member.", openDays:[2,5], openStart:16, openEnd:20 },

  // Brookhaven 19015
  { id:3, zip:"19015", category:"food", name:"Brookhaven Porch Pantry", address:"1780 Chichester Ave, Brookhaven PA 19015", phone:"267-322-0991", miles:2.2, hours:[{day:"4th Wednesday",time:"11:00 AM – 12:00 PM"}], tags:["no paperwork","no fee","self-pickup"], color:"#52B788", description:"Bags left on the church porch for self-pickup. No fee, no paperwork — boxes packed for a family of four.", openDays:[3], openStart:11, openEnd:12 },
  { id:20, zip:"19015", category:"assistance", name:"CADCOM Brookhaven", address:"Brookhaven, PA 19015", phone:"610-543-6300", miles:2.3, hours:[{day:"Monday–Friday",time:"9:00 AM – 4:00 PM"}], tags:["emergency assistance","utility help","rent support"], color:"#E76F51", description:"Community action agency providing emergency financial assistance, utility support, and referrals to Brookhaven-area families.", openDays:[1,2,3,4,5], openStart:9, openEnd:16 },

  // Media 19063
  { id:4, zip:"19063", category:"food", name:"Media Food Bank", address:"350 W. State St, Media PA 19063", phone:"610-566-3172", miles:2.4, hours:[{day:"Thursday",time:"6:00 PM – 8:00 PM"},{day:"Sunday",time:"1:00 PM – 2:00 PM"}], tags:["donations accepted daily 2–4 PM"], color:"#1B4332", description:"Provides food and essential items to Delaware County residents. Drop off donations daily between 2–4 PM.", openDays:[4,0], openStart:13, openEnd:20 },
  { id:21, zip:"19063", category:"assistance", name:"Media Fellowship House", address:"214 W. State St, Media PA 19063", phone:"610-566-5516", miles:2.5, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["mental health","counseling","support groups"], color:"#9D4EDD", description:"Community mental health services, counseling, and peer support groups for Delaware County residents.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },

  // Prospect Park 19076
  { id:5, zip:"19076", category:"food", name:"Loaves & Fishes Food Pantry", address:"703 Lincoln Ave, Prospect Park PA 19076", phone:"610-532-9000", miles:2.8, hours:[{day:"Tuesday",time:"11:00 AM – 2:00 PM & 5:00–7:00 PM"},{day:"Thursday",time:"1:00 PM – 4:00 PM"}], tags:["twice weekly","extended hours"], color:"#74C69D", description:"Baptist church pantry with generous hours twice a week including evening access for working families.", openDays:[2,4], openStart:11, openEnd:19 },

  // Upper Darby 19082
  { id:6, zip:"19082", category:"food", name:"Murphy's Giving Market", address:"7408 West Chester Pike, Upper Darby PA 19082", phone:"610-271-8105", miles:4.1, hours:[{day:"Monday (55+)",time:"9:00 AM – 11:00 AM"},{day:"Tuesday",time:"10:00 AM – 12:00 PM"},{day:"Saturday",time:"10:00 AM – 12:00 PM"}], tags:["seniors 55+","register by 10 AM"], color:"#95D5B2", description:"Dedicated senior hours Monday mornings. General hours Tuesdays. Must register by 10 AM.", openDays:[1,2,6], openStart:9, openEnd:12 },
  { id:22, zip:"19082", category:"food", name:"Upper Darby Food Cupboard", address:"7 S. Lansdowne Ave, Upper Darby PA 19082", phone:"610-352-1888", miles:4.2, hours:[{day:"Wednesday",time:"10:00 AM – 12:00 PM"},{day:"Saturday",time:"9:00 AM – 11:00 AM"}], tags:["emergency food","no residency requirement"], color:"#40916C", description:"Emergency food assistance for Upper Darby area families. No residency proof required for first visit.", openDays:[3,6], openStart:9, openEnd:12 },
  { id:23, zip:"19082", category:"assistance", name:"Upper Darby Township Social Services", address:"100 Garrett Rd, Upper Darby PA 19082", phone:"610-713-2000", miles:4.0, hours:[{day:"Monday–Friday",time:"8:30 AM – 4:30 PM"}], tags:["township services","emergency assistance","referrals"], color:"#023E8A", description:"Township social services office providing emergency assistance, utility help, and referrals for Upper Darby residents.", openDays:[1,2,3,4,5], openStart:8, openEnd:16 },

  // Chester 19013
  { id:24, zip:"19013", category:"food", name:"Chester Community Connections", address:"522 Welsh St, Chester PA 19013", phone:"610-874-8451", miles:5.1, hours:[{day:"Monday",time:"10:00 AM – 12:00 PM"},{day:"Wednesday",time:"10:00 AM – 12:00 PM"},{day:"Friday",time:"10:00 AM – 12:00 PM"}], tags:["walk-in","fresh produce","no ID required"], color:"#2D6A4F", description:"Three-days-a-week community pantry in Chester with fresh produce when available. No ID or documentation required.", openDays:[1,3,5], openStart:10, openEnd:12 },
  { id:25, zip:"19013", category:"food", name:"Chester YMCA Food Pantry", address:"526 Welsh St, Chester PA 19013", phone:"610-876-3706", miles:5.1, hours:[{day:"Tuesday",time:"5:00 PM – 7:00 PM"},{day:"Thursday",time:"12:00 PM – 2:00 PM"}], tags:["evening hours","Chester families"], color:"#1B4332", description:"YMCA food pantry serving Chester families with evening and daytime hours for working parents.", openDays:[2,4], openStart:12, openEnd:19 },
  { id:26, zip:"19013", category:"assistance", name:"CAADC Community Action", address:"33 W. 5th St, Chester PA 19013", phone:"610-874-8451", miles:5.0, hours:[{day:"Monday–Friday",time:"8:00 AM – 4:00 PM"}], tags:["SNAP enrollment","utility assistance","employment"], color:"#F4A261", description:"Community action agency helping Chester residents navigate SNAP, LIHEAP, and employment programs. Spanish speakers on staff.", openDays:[1,2,3,4,5], openStart:8, openEnd:16 },
  { id:27, zip:"19013", category:"food", name:"Salvation Army Chester", address:"901 Madison St, Chester PA 19013", phone:"610-876-3735", miles:5.3, hours:[{day:"Monday–Friday",time:"9:00 AM – 11:30 AM"}], tags:["daily service","hot meals","clothing"], color:"#D62828", description:"Salvation Army providing daily food service, hot meals, and clothing assistance to Chester-area families.", openDays:[1,2,3,4,5], openStart:9, openEnd:11 },
  { id:28, zip:"19013", category:"legal", name:"Widener University Free Legal Clinic", address:"3800 Vartan Way, Chester PA 19013", phone:"610-499-4312", miles:5.2, hours:[{day:"Wednesday",time:"5:00 PM – 8:00 PM"}], tags:["free legal help","housing","family law"], color:"#023E8A", description:"Law students supervised by attorneys provide free legal consultations for Chester-area low-income residents.", openDays:[3], openStart:17, openEnd:20 },

  // Darby 19023
  { id:29, zip:"19023", category:"food", name:"Darby Borough Food Pantry", address:"611 Main St, Darby PA 19023", phone:"610-583-4000", miles:3.8, hours:[{day:"Wednesday",time:"10:00 AM – 12:00 PM"}], tags:["borough residents","no appointment"], color:"#52B788", description:"Weekly community pantry for Darby borough residents. Photo ID and proof of Darby address required.", openDays:[3], openStart:10, openEnd:12 },
  { id:30, zip:"19023", category:"assistance", name:"Darby Township Social Services", address:"Darby, PA 19023", phone:"610-586-2233", miles:3.7, hours:[{day:"Monday–Friday",time:"9:00 AM – 4:00 PM"}], tags:["emergency assistance","senior services"], color:"#E76F51", description:"Local social services for Darby Township residents including emergency assistance and senior support programs.", openDays:[1,2,3,4,5], openStart:9, openEnd:16 },

  // Lansdowne 19050
  { id:31, zip:"19050", category:"food", name:"Lansdowne Food Cupboard", address:"100 W. Baltimore Ave, Lansdowne PA 19050", phone:"610-259-0800", miles:3.4, hours:[{day:"Saturday",time:"9:00 AM – 11:30 AM"}], tags:["Saturday pantry","Lansdowne residents"], color:"#40916C", description:"Saturday morning food distribution for Lansdowne and surrounding community. No appointment needed.", openDays:[6], openStart:9, openEnd:11 },
  { id:32, zip:"19050", category:"assistance", name:"Lansdowne Economic Development", address:"Lansdowne, PA 19050", phone:"610-623-9000", miles:3.3, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["job training","housing","financial counseling"], color:"#023E8A", description:"Economic development office offering workforce training, housing assistance, and financial literacy programs.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },

  // Ridley Park 19078
  { id:33, zip:"19078", category:"food", name:"Ridley Park Presbyterian Food Ministry", address:"300 N Swarthmore Ave, Ridley Park PA 19078", phone:"610-532-9400", miles:1.8, hours:[{day:"Second Saturday",time:"10:00 AM – 12:00 PM"}], tags:["monthly distribution","Ridley Park"], color:"#2D6A4F", description:"Monthly food distribution ministry at Ridley Park Presbyterian Church serving families across Ridley Township.", openDays:[6], openStart:10, openEnd:12 },
  { id:34, zip:"19078", category:"food", name:"Family Hope Center Food Bank", address:"300 N Swarthmore Ave, Ridley Park PA 19078", phone:"610-532-9400", miles:1.8, hours:[{day:"Thursday",time:"5:00 PM – 7:00 PM"}], tags:["Thursday evening","Ridley area"], color:"#1B4332", description:"Food bank run through RPPC's Family Hope Center partnership serving Ridley Park and surrounding neighborhoods.", openDays:[4], openStart:17, openEnd:19 },

  // Springfield 19064
  { id:35, zip:"19064", category:"food", name:"Springfield Food Pantry", address:"82 Powell Rd, Springfield PA 19064", phone:"610-544-1300", miles:2.6, hours:[{day:"Tuesday",time:"6:00 PM – 8:00 PM"},{day:"Thursday",time:"10:00 AM – 12:00 PM"}], tags:["Springfield Township","twice weekly"], color:"#74C69D", description:"Community food pantry serving Springfield Township residents twice a week with morning and evening hours.", openDays:[2,4], openStart:10, openEnd:20 },

  // Swarthmore 19081
  { id:36, zip:"19081", category:"food", name:"Swarthmore Presbyterian Food Ministry", address:"727 Harvard Ave, Swarthmore PA 19081", phone:"610-543-4712", miles:1.5, hours:[{day:"First and Third Saturday",time:"9:00 AM – 11:00 AM"}], tags:["twice monthly","Swarthmore area"], color:"#52B788", description:"Bi-monthly food distribution through Swarthmore Presbyterian Church's community outreach program.", openDays:[6], openStart:9, openEnd:11 },

  // Havertown 19083
  { id:37, zip:"19083", category:"food", name:"Haverford Township Food Cupboard", address:"1014 Darby Rd, Havertown PA 19083", phone:"610-853-1000", miles:5.5, hours:[{day:"Monday",time:"10:00 AM – 12:00 PM"},{day:"Thursday",time:"6:00 PM – 8:00 PM"}], tags:["township residents","no appointment"], color:"#40916C", description:"Haverford Township's community food cupboard with morning and evening hours to serve working families.", openDays:[1,4], openStart:10, openEnd:20 },

  // Drexel Hill 19026
  { id:38, zip:"19026", category:"food", name:"Drexel Hill United Methodist Pantry", address:"4001 State Rd, Drexel Hill PA 19026", phone:"610-623-8880", miles:3.9, hours:[{day:"Wednesday",time:"6:00 PM – 8:00 PM"}], tags:["Drexel Hill","evening hours"], color:"#1B4332", description:"Wednesday evening food pantry serving Drexel Hill and Upper Darby-area families through United Methodist outreach.", openDays:[3], openStart:18, openEnd:20 },

  // County-wide services
  { id:7, zip:"19086", category:"assistance", name:"Delco Helping Hands", address:"Delaware County, PA", phone:"484-474-0590", miles:3.0, hours:[{day:"Call for hours",time:""}], tags:["diapers","pet supplies","referral hub","essentials"], color:"#F4A261", description:"Grassroots nonprofit supplying families with food, diapers, pet supplies, and acting as a referral hub to connect you with other local resources.", openDays:[0,1,2,3,4,5,6], openStart:9, openEnd:17 },
  { id:8, zip:"19086", category:"assistance", name:"Catholic Social Services", address:"Delaware County, PA", phone:"267-331-2490", miles:5.0, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["housing help","rent support","counseling","legal aid"], color:"#E76F51", description:"Family service centers offering food pantries, housing and rent support, counseling, and legal aid to residents in need.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:9, zip:"19086", category:"legal", name:"Legal Aid of Southeastern PA", address:"Delaware County, PA", phone:"877-429-5994", miles:4.5, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["free legal help","eviction defense","benefits access"], color:"#023E8A", description:"Free legal representation for low-income residents — housing, evictions, employment, family law, and access to public benefits.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:10, zip:"19086", category:"assistance", name:"Women's Resource Center", address:"Delaware County, PA", phone:"610-687-6391", miles:6.0, hours:[{day:"Monday–Friday",time:"9:00 AM – 5:00 PM"}], tags:["women","housing instability","financial hardship","counseling"], color:"#9D4EDD", description:"Supports women facing housing instability or financial hardship with counseling, legal advocacy, and educational services.", openDays:[1,2,3,4,5], openStart:9, openEnd:17 },
  { id:39, zip:"19013", category:"assistance", name:"PA 211 Delaware County Office", address:"Delaware County, PA", phone:"211", miles:0.0, hours:[{day:"24/7",time:"Dial 2-1-1"}], tags:["all services","24/7","bilingual"], color:"#2D6A4F", description:"Dial 211 from any phone for immediate connection to food, housing, utility, health, and crisis resources anywhere in Delaware County.", openDays:[0,1,2,3,4,5,6], openStart:0, openEnd:24 },
  { id:40, zip:"19086", category:"food", name:"DIFAN Network — All Locations", address:"Multiple locations, Delaware County PA", phone:"484-326-5362", miles:1.0, hours:[{day:"Multiple days",time:"See specific location"}], tags:["14 locations","interfaith","countywide"], color:"#40916C", description:"DIFAN operates 14 food distribution sites across Delaware County. Call for the nearest location to you.", openDays:[0,1,2,3,4,5,6], openStart:9, openEnd:20 },
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
  { id:6, name:"PA 211 Helpline", sub:"All social services — dial 2-1-1", number:"211", color:"#2D6A4F", bg:"#F0FBF4", icon:"📞" },
  { id:7, name:"Hunger Hotline", sub:"Find food near you right now", number:"1-866-348-6479", color:"#40916C", bg:"#F0FBF4", icon:"🍽" },
  { id:8, name:"Poison Control", sub:"24/7 medical emergency", number:"1-800-222-1222", color:"#E76F51", bg:"#FFF6F0", icon:"⚠️" },
  { id:9, name:DELCO_HOUSING_ENTRY.name, sub:`${DELCO_HOUSING_ENTRY.description} ${DELCO_HOUSING_ENTRY.guidance}`, number:DELCO_HOUSING_ENTRY.status, actionLabel:"Visit Official County Resources", actionHref:DELCO_HOUSING_ENTRY.officialUrl, secondaryActionLabel:"Call Crisis Line", secondaryActionHref:DELCO_CRISIS.phoneHref, color:"#F4A261", bg:"#FFF8F0", icon:"🏠️", verified:DELCO_HOUSING_ENTRY.verified, verifiedBy:DELCO_HOUSING_ENTRY.verifiedBy, lastUpdated:DELCO_HOUSING_ENTRY.lastUpdated },
  { id:10, name:"Child Abuse Hotline", sub:"PA ChildLine — 24/7 reporting", number:"1-800-932-0313", color:"#D62828", bg:"#FFF0F0", icon:"👶" },
];

// eslint-disable-next-line no-unused-vars
const CATEGORY_LABELS = { food:"Food Pantry", assistance:"Family Assistance", legal:"Legal Aid" };
// eslint-disable-next-line no-unused-vars
const CATEGORY_COLORS = { food:"#2D6A4F", assistance:"#E76F51", legal:"#023E8A" };

const IMPACT_STATS = [
  { label:"totalUsers", value:"2,847", trend:"+12% this month", icon:"👥", color:"#2D6A4F" },
  { label:"resourcesFound", value:"14,392", trend:"+8% this month", icon:"🔍", color:"#40916C" },
  { label:"donationsGiven", value:"$8,240", trend:"+23% this month", icon:"💛", color:"#F4A261" },
  { label:"familiesHelped", value:"1,203", trend:"+15% this month", icon:"🏠", color:"#E76F51" },
];

const SPONSORS = ["Crozer Health","Main Line Health","TD Bank","Wawa Foundation","Delaware County Government"];

function isOpenNow(r) { const now=new Date(),day=now.getDay(),hour=now.getHours()+now.getMinutes()/60; return r.openDays.includes(day)&&hour>=r.openStart&&hour<r.openEnd; }
function isOpenToday(r) { return r.openDays.includes(new Date().getDay()); }

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
  .dh-ni:hover { background:rgba(45,106,79,0.07); }
  .dh-ni-ic { font-size:18px; opacity:0.35; transition:opacity 0.18s; }
  .dh-ni-lb { font-size:8px; font-weight:600; letter-spacing:0.05em; color:#6B7C6E; transition:color 0.18s; text-transform:uppercase; }
  .dh-ni.act .dh-ni-ic { opacity:1; }
  .dh-ni.act .dh-ni-lb { color:#2D6A4F; }
  .dfi { animation:dhFi 0.28s ease; }
  @keyframes dhFi { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .dh-chip { display:inline-flex; align-items:center; gap:4px; background:#F0F4F1; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:500; color:#4A6B52; }
  .dh-chip.open { background:#D8F3DC; color:#1B4332; }
  .dh-chip.closed { background:#FFE8E8; color:#9B1C1C; }
  .dh-chip.today { background:#FFF3CD; color:#7B5800; }
  .dh-btn-primary { background:#2D6A4F; color:white; border:none; border-radius:14px; padding:14px 20px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; width:100%; }
  .dh-btn-primary:hover { background:#1B4332; transform:translateY(-1px); }
  .dh-btn-outline { background:transparent; color:#2D6A4F; border:1.5px solid #2D6A4F; border-radius:14px; padding:12px 20px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.18s; width:100%; }
  .dh-btn-outline:hover { background:rgba(45,106,79,0.06); }
  .dh-card { background:white; border-radius:18px; padding:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04); cursor:pointer; transition:all 0.18s; }
  .dh-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.1); }
  .dh-tag { background:#F0F4F1; border-radius:8px; padding:3px 8px; font-size:11px; color:#4A6B52; font-weight:500; }
  .dh-divider { height:1px; background:rgba(0,0,0,0.07); margin:0 24px; }
  .dh-input { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px 12px 42px; font-family:'DM Sans',sans-serif; font-size:14px; color:#1C2B1E; outline:none; transition:border-color 0.18s; }
  .dh-input:focus { border-color:#2D6A4F; }
  .dh-input-plain { width:100%; background:white; border:1.5px solid rgba(0,0,0,0.1); border-radius:14px; padding:12px 16px; font-family:'DM Sans',sans-serif; font-size:14px; color:#1C2B1E; outline:none; transition:border-color 0.18s; margin-bottom:10px; }
  .dh-input-plain:focus { border-color:#2D6A4F; }
  .dh-filter-pill { white-space:nowrap; padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid transparent; }
  .dh-filter-pill.active { background:#2D6A4F; color:white; }
  .dh-filter-pill.inactive { background:white; color:#4A6B52; border-color:rgba(45,106,79,0.25); }
  .dh-back { display:flex; align-items:center; gap:6px; color:#2D6A4F; font-size:13px; font-weight:600; cursor:pointer; margin-bottom:16px; }
  .pulse { animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .notif-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex; flex-direction:column; justify-content:flex-start; padding:60px 20px 0; border-radius:44px; animation:dhFi 0.2s ease; }
  .notif-banner { background:rgba(255,255,255,0.97); backdrop-filter:blur(20px); border-radius:20px; padding:14px 16px; margin-bottom:10px; box-shadow:0 8px 32px rgba(0,0,0,0.2); display:flex; align-items:flex-start; gap:12px; }
  .modal-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.5); z-index:200; display:flex; align-items:flex-end; border-radius:44px; animation:dhFi 0.2s ease; }
  .modal-sheet { background:#FAFAF7; border-radius:28px 28px 44px 44px; width:100%; max-height:90%; overflow-y:auto; padding:24px; animation:sheetUp 0.3s ease; scrollbar-width:none; }
  .modal-sheet::-webkit-scrollbar { display:none; }
  @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .modal-handle { width:36px; height:4px; background:rgba(0,0,0,0.15); border-radius:2px; margin:0 auto 20px; }
  .amt-pill { padding:10px 16px; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1.5px solid rgba(45,106,79,0.25); background:white; color:#2D6A4F; }
  .amt-pill.sel { background:#2D6A4F; color:white; border-color:#2D6A4F; }
  .hotline-card { border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.18s; margin-bottom:8px; }
  .hotline-card:hover { transform:translateX(2px); }
  .hotline-call-btn { border:none; border-radius:10px; padding:8px 14px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
  .emerg-overlay { position:absolute; inset:0; background:rgba(214,40,40,0.97); z-index:300; display:flex; flex-direction:column; border-radius:44px; animation:dhFi 0.2s ease; overflow-y:auto; scrollbar-width:none; }
  .emerg-overlay::-webkit-scrollbar { display:none; }
  .chat-bubble-user { background:#2D6A4F; color:white; border-radius:18px 18px 4px 18px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:80%; align-self:flex-end; }
  .chat-bubble-ai { background:white; color:#1C2B1E; border-radius:18px 18px 18px 4px; padding:10px 14px; font-size:13px; line-height:1.5; max-width:85%; align-self:flex-start; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .chat-input-row { display:flex; gap:8px; padding:12px 16px; background:white; border-top:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
  .chat-input { flex:1; background:#F5F5F0; border:none; border-radius:20px; padding:10px 16px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; }
  .chat-send-btn { background:#2D6A4F; color:white; border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; flex-shrink:0; }
  .lang-toggle { display:flex; background:rgba(255,255,255,0.2); border-radius:20px; padding:2px; }
  .lang-btn { padding:4px 10px; border-radius:18px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.18s; border:none; font-family:'DM Sans',sans-serif; }
  .lang-btn.active { background:white; color:#2D6A4F; }
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
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1C2B1E",lineHeight:1.2,marginBottom:6}}>{r.name}</div>
        <div style={{fontSize:13,color:"#6B7C6E"}}>{r.address}</div>
      </div>
      <div style={{height:130,background:"linear-gradient(135deg,#D8F3DC,#B7E4C7)",margin:"0 24px 20px",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.15) 20px,rgba(255,255,255,0.15) 21px)"}}/>
        <span style={{zIndex:1}}>📍</span>
      </div>
      <div style={{padding:"0 24px"}}>
        <div style={{background:"#F7FBF8",borderRadius:14,padding:16,marginBottom:16,border:"1px solid rgba(45,106,79,0.12)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"#2D6A4F",textTransform:"uppercase",letterSpacing:"0.06em"}}>{t.about}</div>
            <TrustBadge resourceId={r.id}/>
          </div>
          <div style={{fontSize:14,color:"#3D4F40",lineHeight:1.6}}>{r.description}</div>
        </div>
        <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.hours}</div>
          {r.hours.map((h,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<r.hours.length-1?"1px solid rgba(0,0,0,0.05)":"none"}}>
              <div style={{fontSize:13,fontWeight:500}}>{h.day}</div>
              <div style={{fontSize:13,color:"#4A6B52"}}>{h.time||"Call for hours"}</div>
            </div>
          ))}
        </div>
        {/* Community status + inventory */}
        <PantryStatusWidget pantryId={r.id}/>
        <PantryInventoryWidget pantryId={r.id}/>
        {/* SEPTA transit info */}
        <TransitHelper resourceZip={zip} resourceName={r.name}/>
        {r.tags.length>0&&<div style={{marginBottom:16,marginTop:12}}><div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.whatToKnow}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{r.tags.map(tag=><span key={tag} className="dh-tag" style={{fontSize:12,padding:"5px 10px"}}>✓ {tag}</span>)}</div></div>}
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
            <button style={{background:"white",color:"#D62828",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>window.open(h.actionHref||`tel:${h.number}`)}>
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
            <button style={{background:"white",color:"#2D6A4F",border:"none",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>window.open(`tel:${r.phone}`)}>Call</button>
          </div>
        ))}
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

/* ── HOME SCREEN ── */
function HomeScreen({ onNav, onResource, onDonate, onEmergency, lang }) {
  const t=T[lang]||T.en;
  const openNow=RESOURCES.filter(r=>isOpenNow(r));
  const openToday=RESOURCES.filter(r=>!isOpenNow(r)&&isOpenToday(r));
  const savedIds = getSavedResources().map(s=>s.id);
  const savedResources = RESOURCES.filter(r=>savedIds.includes(r.id));
  return (
    <div className="dfi">
      <div style={{background:"linear-gradient(160deg,#2D6A4F 0%,#40916C 100%)",padding:"16px 24px 24px",borderRadius:"0 0 28px 28px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.65)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{t.county}</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"white",lineHeight:1.25,marginBottom:2}}>{t.tagline}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginBottom:16}}>{t.zip}</div>
        <button onClick={()=>{trackEvent("emergency_button_tapped");onEmergency();}} style={{width:"100%",background:"#D62828",border:"2px solid rgba(255,255,255,0.3)",borderRadius:14,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"white",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {t.needHelpNow}
        </button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{icon:"🔍",label:t.findResources,sub:t.foodHelpMore,nav:"find"},{icon:"📋",label:t.benefits,sub:t.snapWic,nav:"benefits"},{icon:"🤖",label:t.askAI,sub:"Powered by Claude",nav:"ai"}].map(a=>(
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
            <div style={{width:8,height:8,borderRadius:"50%",background:"#40916C"}} className="pulse"/>
            <div style={{fontSize:13,fontWeight:700,color:"#1B4332"}}>{t.openNow} ({openNow.length})</div>
          </div>
          {openNow.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          <div style={{height:6}}/>
        </>}
        {openToday.length>0&&<>
          <div style={{fontSize:13,fontWeight:700,color:"#7B5800",marginBottom:10}}>🕐 {t.opensLater} ({openToday.length})</div>
          {openToday.slice(0,2).map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
          <div style={{height:6}}/>
        </>}
        <div style={{fontSize:13,fontWeight:700,color:"#6B7C6E",marginBottom:10}}>{t.allResources} ({RESOURCES.length})</div>
        {RESOURCES.filter(r=>!isOpenNow(r)&&!isOpenToday(r)).slice(0,2).map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
        <button className="dh-btn-outline" style={{marginBottom:12}} onClick={()=>onNav("find")}>See all {RESOURCES.length} resources →</button>
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
function FindScreen({ onResource, lang }) {
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
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1C2B1E",marginBottom:12}}>{t.findResources}</div>

        {/* Zip code search */}
        <div style={{background:"#F0F9F4",borderRadius:14,padding:12,marginBottom:10,border:"1px solid rgba(45,106,79,0.15)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#2D6A4F",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>📍 Your Location</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input
              style={{flex:1,background:"white",border:"1.5px solid rgba(0,0,0,0.1)",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"}}
              placeholder="Enter zip code (e.g. 19013)"
              value={zipInput}
              onChange={e=>{setZipInput(e.target.value.replace(/\D/g,"").slice(0,5)); if(e.target.value.length===5) applyZip(e.target.value);}}
              onBlur={e=>applyZip(e.target.value)}
              maxLength={5}
            />
            <button onClick={useMyLocation} disabled={locating} style={{flexShrink:0,background:"#2D6A4F",color:"white",border:"none",borderRadius:10,padding:"10px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {locating?"...":"📍 Near me"}
            </button>
            {zip.length===5 && (
              <button onClick={()=>{setZip("");setZipInput("");}} style={{flexShrink:0,background:"rgba(0,0,0,0.06)",color:"#6B7C6E",border:"none",borderRadius:10,padding:"10px 10px",fontSize:12,cursor:"pointer"}}>✕</button>
            )}
          </div>
          {zip.length===5 && !ZIP_COORDS[zip] && (
            <div style={{fontSize:11,color:"#D62828",marginTop:6}}>Zip code not in Delaware County — showing all resources</div>
          )}
          {zip.length===5 && ZIP_COORDS[zip] && (
            <div style={{fontSize:11,color:"#2D6A4F",marginTop:6,fontWeight:600}}>Showing resources within 10 miles of {zip}</div>
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
        <div style={{fontSize:12,color:"#6B7C6E",marginBottom:10,fontWeight:500}}>{results.length} resources {userZipName} · sorted by distance</div>
        {results.map(r=><ResourceCard key={r.id} r={r} onClick={onResource} lang={lang}/>)}
        {results.length===0&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:36,marginBottom:10}}>📍</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>No resources found {zip.length===5?`near ${zip}`:""}</div>
            <div style={{fontSize:12,color:"#6B7C6E",lineHeight:1.6}}>Try a nearby zip code, or call PA 211 (dial 211) for help finding resources anywhere in Delaware County.</div>
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
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1C2B1E",marginBottom:4}}>{t.benefitsNav}</div>
        <div style={{fontSize:13,color:"#6B7C6E",marginBottom:12}}>{t.benefitsDesc}</div>
        {/* Action buttons */}
        <button onClick={()=>{trackEvent("eligibility_quiz_opened");setShowQuiz(true);}} style={{width:"100%",background:"#2D6A4F",color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
          Check My Eligibility in 60 Seconds →
        </button>
        <button onClick={()=>setShowSNAP(true)} style={{width:"100%",background:"white",color:"#2D6A4F",border:"1.5px solid rgba(45,106,79,0.3)",borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
          🥫 SNAP Application Step-by-Step Guide
        </button>
        <button onClick={()=>{setChecklistPrograms(["snap","wic","liheap","medicaid"]);setShowChecklist(true);}} style={{width:"100%",background:"white",color:"#2D6A4F",border:"1.5px solid rgba(45,106,79,0.3)",borderRadius:12,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
          📋 Build My Document Checklist
        </button>
        <div style={{background:"#F0F9F4",borderRadius:16,padding:16,marginBottom:16,border:"1px solid rgba(45,106,79,0.15)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#2D6A4F",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.quickEligibility}</div>
          {eligibility.map((e,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:i<eligibility.length-1?"1px solid rgba(45,106,79,0.1)":"none"}}>
              <div style={{fontSize:13,color:"#1C2B1E",marginBottom:6}}>{e.q}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{e.programs.map(p=><span key={p} style={{background:"#2D6A4F",color:"white",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:600}}>{p}</span>)}</div>
            </div>
          ))}
        </div>
        {BENEFITS.map(b=>(
          <div key={b.id} className="dh-card" style={{marginBottom:10}} onClick={()=>setExpanded(expanded===b.id?null:b.id)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28,flexShrink:0}}>{b.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{b.name}</div><div style={{fontSize:12,color:"#6B7C6E",marginTop:2}}>{b.desc}</div></div>
              <div style={{color:"#2D6A4F",fontSize:18,fontWeight:300}}>{expanded===b.id?"−":"+"}</div>
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
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1C2B1E"}}>{h.name}</div><div style={{fontSize:11,color:"#6B7C6E",marginTop:2}}>{h.sub}</div>{h.lastUpdated&&<div style={{fontSize:10,color:"#6B7C6E",marginTop:4}}>Last updated: {h.lastUpdated} · {h.verified?"Verified":"Needs verification"}</div>}<a href={correctionMailto(h.name)} style={{fontSize:10,color:h.color,fontWeight:700,textDecoration:"none"}}>Report Incorrect Info</a></div>
            <button className="hotline-call-btn" style={{background:h.color,color:"white"}} onClick={()=>window.open(h.actionHref||`tel:${h.number}`)}>{h.actionLabel||`${h.isText?"Text":"Call"} ${h.number}`}</button>
          </div>
        ))}
        <div style={{height:12}}/>
        <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{t.additionalResources}</div>
        {rest.map(h=>(
          <div key={h.id} className="hotline-card" style={{background:h.bg,border:`1px solid ${h.color}22`}}>
            <div style={{width:42,height:42,borderRadius:12,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{h.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#1C2B1E"}}>{h.name}</div><div style={{fontSize:11,color:"#6B7C6E",marginTop:2}}>{h.sub}</div>{h.lastUpdated&&<div style={{fontSize:10,color:"#6B7C6E",marginTop:4}}>Last updated: {h.lastUpdated} · {h.verified?"Verified":"Needs verification"}</div>}<a href={correctionMailto(h.name)} style={{fontSize:10,color:h.color,fontWeight:700,textDecoration:"none"}}>Report Incorrect Info</a></div>
            <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
              {h.secondaryActionLabel&&<button className="hotline-call-btn" style={{background:h.color,color:"white"}} onClick={()=>window.open(h.secondaryActionHref)}>{h.secondaryActionLabel}</button>}
              <button className="hotline-call-btn" style={{background:h.color+"15",color:h.color}} onClick={()=>window.open(h.actionHref||`tel:${h.number}`)}>{h.actionLabel||h.number}</button>
            </div>
          </div>
        ))}
        <div style={{background:"#F0F9F4",borderRadius:16,padding:14,marginTop:8,marginBottom:24,border:"1px solid rgba(45,106,79,0.15)"}}>
          <div style={{fontSize:12,color:"#2D6A4F",lineHeight:1.6,textAlign:"center"}}>{t.confidentialNote}</div>
        </div>
      </div>
    </div>
  );
}

/* ── VOLUNTEER SCREEN ── */
function VolunteerScreen({ lang }) {
  const t=T[lang]||T.en;
  const opps=[
    {org:"Lifewerks Food Pantry",role:"Pantry Volunteer",time:"Tuesdays 5:30–8:30 PM",icon:"🍽",color:"#2D6A4F"},
    {org:"DIFAN Network",role:"Food Distributor",time:"Tuesdays & Fridays",icon:"📦",color:"#40916C"},
    {org:"Media Food Bank",role:"Donation Sorter",time:"Thursdays 5–8 PM",icon:"🏪️",color:"#1B4332"},
    {org:"Delco Helping Hands",role:"Driver / Delivery",time:"Flexible scheduling",icon:"🚗",color:"#F4A261"},
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
              <div style={{fontSize:10,color:"#40916C",marginTop:2}}>{s.trend}</div>
            </div>
          ))}
        </div>
        <div style={{background:"white",borderRadius:16,padding:16,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>User Growth (6 months)</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
            {monthly.map(m=>(
              <div key={m.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:"100%",background:"linear-gradient(180deg,#40916C,#2D6A4F)",borderRadius:"4px 4px 0 0",height:`${(m.users/maxVal)*70}px`,transition:"height 0.5s ease"}}/>
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
                <span key={i} style={{display:"inline-block",background:"#F0F4F1",borderRadius:8,padding:"6px 12px",margin:"0 6px",fontSize:12,fontWeight:600,color:"#2D6A4F"}}>{s}</span>
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
        {[{key:"name",label:t.orgName,placeholder:"e.g. Wallingford Community Pantry"},{key:"address",label:t.orgAddress,placeholder:"123 Main St, Wallingford PA 19086"},{key:"phone",label:t.orgPhone,placeholder:"610-555-0000"},{key:"hours",label:t.orgHours,placeholder:"e.g. Tuesdays 5–7 PM, Saturdays 10 AM–12 PM"}].map(f=>(
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
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2D6A4F,#40916C)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
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
          <div style={{width:6,height:6,borderRadius:"50%",background:"#2D6A4F",animation:"pulse 1s infinite"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#2D6A4F",animation:"pulse 1s infinite 0.2s"}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#2D6A4F",animation:"pulse 1s infinite 0.4s"}}/>
        </div>}
        {messages.length===1&&!atLimit&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          {suggestions.map((s,i)=><button key={i} onClick={()=>setInput(s)} style={{background:"#F0F9F4",border:"1px solid rgba(45,106,79,0.2)",borderRadius:12,padding:"8px 12px",fontSize:12,color:"#2D6A4F",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>{s}</button>)}
        </div>}
        {atLimit&&<div style={{background:"#FFF8F0",borderRadius:16,padding:16,border:"1px solid rgba(244,162,97,0.3)",margin:"8px 0"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#7B4B00",marginBottom:6}}>You've used your {AI_LIMIT} free AI messages today.</div>
          <div style={{fontSize:13,color:"#A06000",lineHeight:1.6,marginBottom:12}}>Your limit resets at midnight. In the meantime these resources can help right now:</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>window.open("tel:211")} style={{background:"#2D6A4F",color:"white",border:"none",borderRadius:12,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>📞 Call PA 211 — Free Resource Helpline</button>
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
  const [amt,setAmt]=useState("$25"), [org,setOrg]=useState("Lifewerks Food Pantry");
  const [freq,setFreq]=useState("once"), [step,setStep]=useState(1);
  const t=T[lang]||T.en;
  const amts=["$10","$25","$50","$100","$250","Custom"];
  const orgs=[
    {name:"Lifewerks Food Pantry",icon:"🍽",desc:"Choice pantry · Wallingford"},
    {name:"DIFAN Wallingford",icon:"📦",desc:"Interfaith food network"},
    {name:"Media Food Bank",icon:"🏪",desc:"Media, PA · Thurs & Sun"},
    {name:"Delco Helping Hands",icon:"🤝",desc:"Diapers, supplies, referrals"},
    {name:"General Delco Fund",icon:"💛",desc:"Split across all partners"},
  ];
  const impact={"$10":"feeds a family for 1 week","$25":"stocks a pantry shelf for 3 days","$50":"provides diapers for 10 families","$100":"funds a full pantry shift","$250":"stocks a pantry for an entire month"};

  if (step===2) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div className="dh-back" onClick={()=>setStep(1)}>{t.back}</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#1C2B1E",marginBottom:16}}>{t.confirmDonation}</div>
        <div style={{background:"#F7FBF8",borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700}}>{org}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#2D6A4F"}}>{amt}{freq==="monthly"?"/mo":""}</div>
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
        <div style={{background:"#F0F9F4",borderRadius:14,padding:12,marginBottom:20}}><div style={{fontSize:13,color:"#2D6A4F",fontWeight:600}}>{t.yourImpact} {impact[amt]||"makes a real difference"}</div></div>
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
        {amt&&amt!=="$"&&<div style={{background:"#F0F9F4",borderRadius:10,padding:9,marginBottom:12}}><div style={{fontSize:12,color:"#2D6A4F"}}>💛 {amt} — {impact[amt]||"makes a real difference"}</div></div>}
        <div style={{fontSize:12,fontWeight:700,color:"#6B7C6E",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{t.donateTo}</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {orgs.map(o=>(
            <div key={o.name} onClick={()=>setOrg(o.name)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,border:`1.5px solid ${org===o.name?"#2D6A4F":"rgba(0,0,0,0.08)"}`,background:org===o.name?"#F0F9F4":"white",cursor:"pointer"}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${org===o.name?"#2D6A4F":"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{org===o.name&&<div style={{width:8,height:8,borderRadius:"50%",background:"#2D6A4F"}}/>}</div>
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
    {icon:"🍽",bg:"#2D6A4F",title:"Lifewerks is open now!",body:"Food pantry open until 8:00 PM tonight · 0.3 mi away",time:"now"},
    {icon:"📦",bg:"#F4A261",title:"New resource added",body:"Ridley Township Free Meal Program added near you",time:"2m ago"},
    {icon:"⚡",bg:"#023E8A",title:"LIHEAP deadline soon",body:"PA utility assistance deadline is April 30th — apply now",time:"1h ago"},
    {icon:"💛",bg:"#E76F51",title:"Thank you!",body:"Your $25 donation to Lifewerks was received",time:"Yesterday"},
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
    {id:"hotline",icon:"🚨",label:"hotline"},
    {id:"ai",icon:"🤖",label:"askAI"},
  ];

  function handleNav(t) { setTab(t); setDetail(null); }

  const screens={
    home:<HomeScreen onNav={handleNav} onResource={setDetail} onDonate={()=>setShowDonate(true)} onEmergency={()=>setShowEmergency(true)} lang={lang}/>,
    find:<FindScreen onResource={setDetail} lang={lang}/>,
    benefits:<BenefitsScreen lang={lang}/>,
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
      {showLegal && <LegalScreen appName="DelcoHelp" companyName="CieroLink LLC" appUrl="delcohelp.org" onClose={()=>setShowLegal(false)}/>}
      <div className="dh">
        <div className="dh-sb">
          <span>9:41</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:"0.04em",color:"#2D6A4F"}}>{(T[lang]||T.en).appName}</span>
            <div className="lang-toggle" style={{background:"rgba(45,106,79,0.12)"}}>
              {["en","es","vi","zh"].map(code=>(
                <button key={code} className={`lang-btn ${lang===code?"active":"inactive"}`} style={{color:lang===code?"#2D6A4F":"#6B7C6E",background:lang===code?"white":"transparent"}} onClick={()=>setLang(code)}>
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
