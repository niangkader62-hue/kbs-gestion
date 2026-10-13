import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  generateDevisPDF as buildDevisPDF, generateFacturePDF as buildFacturePDF, generateRecuPDF as buildRecuPDF,
  nextNumero, fallbackNumero, docTotals, itemsTotal, money, amountInWords, frDate, waLink, hexToRgb, DEFAULT_BRAND_COLOR,
} from "./documents.js";
import { BRAND_LOGO } from "./brandLogo.js";
import {
  Target, Users, LayoutGrid, Sparkles, CalendarDays, MessageSquare,
  Wallet, Link2, Plus, Trash2, ChevronDown, ChevronRight, ChevronLeft, ExternalLink,
  CheckCircle2, Circle, RotateCcw, TrendingUp, Banknote, Flame, GraduationCap,
  Award, TrendingDown, Lock, LogOut, CalendarClock, Send, History, FileText,
  Shield, UserPlus, AlertTriangle, Search, Copy, Radar, CalendarCheck,
  Pencil, Save, KeyRound, RefreshCw, X, MapPin, BookOpen, Bell, Eye, EyeOff,
  Archive, Percent, Receipt, Upload, Palette, Home, Box, Menu as MenuIcon, BarChart3, Settings,
  ShoppingBag, ScanLine, Minus, Clock, ArrowDownToLine, ArrowUpFromLine, ClipboardList, Camera, Truck, Package, Printer, CheckCircle, Tag
} from "lucide-react";

/* ---------------------------------- SUPABASE ---------------------------------- */
const supabase = createClient(
  "https://vspepqwipgjkmnemwlfa.supabase.co",
  "sb_publishable_olyJ2hEstrKN7KR4v4mNaQ_sYXVjw04"
);

/* ---------------------------------- PALETTE ---------------------------------- */
const C = {
  bg: "var(--c-bg)", card: "var(--c-card)", cardAlt: "var(--c-cardAlt)", border: "var(--c-border)",
  gold: "var(--c-gold)", goldLight: "var(--c-goldLight)", green: "var(--c-green)", greenLight: "var(--c-greenLight)",
  rust: "var(--c-rust)", rustLight: "var(--c-rustLight)", text: "var(--c-text)", muted: "var(--c-muted)",
  white: "#FFFFFF", black: "#0D0D0D",
  surf: "var(--c-surf)", card2: "var(--c-card2)", navy: "var(--c-navy)",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Figtree:wght@400;500;600;700;800&display=swap');
.kbs-navbar::-webkit-scrollbar { height: 0; display: none; }
.kbs-navbar { scrollbar-width: none; -ms-overflow-style: none; }
/* Charte KBS Gestion : bleu marine + orange du logo (maquette validee) */
:root{
  --c-bg:#061430;--c-card:#10285A;--c-cardAlt:#0A1F45;--c-border:rgba(255,255,255,0.10);
  --c-gold:#F39200;--c-goldLight:#FDB402;--c-green:#3CBE7C;--c-greenLight:#6FD39E;
  --c-rust:#FF7A6B;--c-rustLight:#FF8F82;--c-text:#F4F6FB;--c-muted:#A9B4D0;
  --c-navy:#011B45;--c-surf:#0A1F45;--c-card2:#173571;
}
html,body{ background:var(--c-bg); color-scheme: dark; }
html{ -webkit-text-size-adjust:100%; text-size-adjust:100%; }
body{ margin:0; -webkit-font-smoothing:antialiased; -webkit-tap-highlight-color:transparent; overscroll-behavior-y:none; }
/* iPhone : pas de zoom automatique quand on touche un champ (il faut 16 px minimum) */
@supports (-webkit-touch-callout: none){ input,select,textarea{ font-size:16px !important; } }
/* iPhone : encoche en haut et barre d'accueil en bas */
.kbs-header{ padding-top:env(safe-area-inset-top); }
.kbs-side{ padding-top:calc(22px + env(safe-area-inset-top)) !important; }
.kbs-bottom{ height:calc(78px + env(safe-area-inset-bottom)) !important; }
.kbs-safe-top{ padding-top:env(safe-area-inset-top); }
input,select,textarea,button{ font-family:Figtree,sans-serif; }
input::placeholder,textarea::placeholder{ color:#7F8BA8; }
select option{ background:#0A1F45; color:#F4F6FB; }
/* Mise en page : barre du bas sur telephone, menu lateral sur ordinateur */
.kbs-side{ display:none; }
.kbs-bottom{ display:grid; }
.kbs-main{ padding-bottom:calc(110px + env(safe-area-inset-bottom)); }
@media (min-width: 900px){
  .kbs-side{ display:flex; }
  .kbs-bottom{ display:none; }
  .kbs-main{ padding-bottom:40px; }
  .kbs-mobile-only{ display:none !important; }
}
.kbs-grid2{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.kbs-grid4{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
@media (min-width: 700px){ .kbs-grid4{ grid-template-columns:repeat(4,minmax(0,1fr)); } .kbs-prod{ grid-template-columns:repeat(3,minmax(0,1fr)) !important; } }
@media (min-width: 1100px){ .kbs-prod{ grid-template-columns:repeat(4,minmax(0,1fr)) !important; } }
/* Tablette et ordinateur : plus d'air, colonnes cote a cote */
@media (min-width: 700px){ .kbs-content{ padding:22px 24px !important; } }
.kbs-home,.kbs-cal{ display:flex; flex-direction:column; }
@media (min-width: 1000px){
  .kbs-home{ display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:22px; align-items:start; }
  .kbs-cal{ display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1fr); gap:20px; align-items:start; }
}
/* Connexion : deux colonnes sur ordinateur */
.kbs-login{ display:flex; justify-content:center; }
.kbs-login-brand{ display:none; }
@media (min-width: 900px){
  .kbs-login{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-items:center; gap:56px; max-width:1100px; margin:0 auto; padding:40px 48px !important; }
  .kbs-login-brand{ display:flex; flex-direction:column; gap:22px; }
  .kbs-login-form{ background:var(--c-card); border-radius:26px; padding:34px 32px; box-shadow:0 30px 60px rgba(0,0,0,.35); justify-self:center; }
  .kbs-login-form .kbs-login-head{ display:none !important; }
}
.kbs-tap{ transition: transform .12s ease, background .15s ease; }
.kbs-tap:active{ transform: scale(.97); }
/* Impression : seul le ticket de caisse sort (imprimante thermique 80 mm) */
@media print{
  body *{ visibility:hidden !important; }
  .kbs-print, .kbs-print *{ visibility:visible !important; }
  .kbs-print{ position:absolute; left:0; top:0; width:80mm; border-radius:0 !important; }
}`;

/* Codes d'accès par défaut — modifiables ensuite directement dans l'onglet Administration */
const DEFAULT_CODES = {
  app: "KBS2026",       // mot de passe général de l'outil
  ceo: "CEO2026",       // Objectif (CEO)
  catherine: "CATH2026", // CRM & Trésorerie (Catherine)
  ressources: "KBSAUTO2026", // Section Ressources (Boîte à outils, Académie, Plan 30j, Liens, Formation)
  admin: "ADMIN2026",   // Administration — accès total
  reset: "RESET2026",   // Confirmation supplémentaire pour tout réinitialiser
};
// Code maître unique : ouvre TOUTES les sections verrouillées de l'app
// (connexion, Objectif, CRM, Trésorerie, Ressources, Administration, Kanban,
// checklists, Formation, Réinitialisation), quoi qu'il arrive aux codes stockés
// dans la base. Filet de sécurité pour ne plus jamais être bloqué dehors.
const MASTER_CODE = "KBSAUTO2026";
const normCode = (s) => (s || "").toString().trim().toUpperCase();
function codeMatches(input, expected) {
  return normCode(input) === normCode(expected) || normCode(input) === MASTER_CODE;
}
// Code "strict" : un code vide ne doit jamais ouvrir quoi que ce soit.
// Le code maître reste accepté partout (demande du CEO).
function codeMatchesStrict(input, expected) {
  if (normCode(input) === "") return false;
  return normCode(input) === normCode(expected) || normCode(input) === MASTER_CODE;
}

/* ---------------------------------- NOTIFICATIONS PUSH ---------------------------------- */
const VAPID_PUBLIC_KEY = "BKrHlym_YWrE-ByaFkXDz8-xAukgCRyrPxsx-klRahzs_uBH68UjVE0EJ2eDyghQnBegMV7-1Kkan69rXfArxb8";
const NOTIFY_FUNCTION_URL = "https://vspepqwipgjkmnemwlfa.supabase.co/functions/v1/send-notification";
const DIAGNOSTIC_FUNCTION_URL = "https://vspepqwipgjkmnemwlfa.supabase.co/functions/v1/generate-client-diagnostic";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_olyJ2hEstrKN7KR4v4mNaQ_sYXVjw04";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Envoie une notification push à toute l'équipe (appelée après une action importante : nouveau client, devis, etc.)
async function notifyTeam(title, body, tabId) {
  try {
    await fetch(NOTIFY_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "apikey": SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ title, body, url: tabId ? `/#${tabId}` : "/" }),
    });
  } catch (e) { /* best-effort — on ne bloque jamais l'action principale pour une notif ratée */ }
}

// Petit carillon interne (2 notes) joue quand une notification arrive alors que
// l'appli est ouverte. Genere par WebAudio : aucun fichier son a charger.
function playChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === "suspended" && ctx.resume) ctx.resume();
    const t0 = ctx.currentTime;
    [[880, 0], [1318.5, 0.13]].forEach(([freq, dt]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, t0 + dt);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + dt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.33);
      o.start(t0 + dt); o.stop(t0 + dt + 0.38);
    });
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 900);
  } catch (e) { /* silencieux */ }
}

// Pastille du systeme (comme WhatsApp) sur l'icone de l'appli installee.
function setAppBadge(n) {
  try {
    if (n > 0 && navigator.setAppBadge) navigator.setAppBadge(n);
    else if (navigator.clearAppBadge) navigator.clearAppBadge();
  } catch (e) { /* non supporte sur cet appareil */ }
}

// Pastille rouge de non-lus (compteur facon WhatsApp) affichee en haut a droite d'un onglet.
function NotifDot({ count }) {
  return (
    <span style={{
      position: "absolute", top: -5, right: -5, minWidth: 17, height: 17, padding: "0 4px",
      borderRadius: 999, background: "#E5484D", color: "#FFFFFF",
      fontSize: 10, fontWeight: 800, lineHeight: "17px", textAlign: "center",
      boxShadow: "0 0 0 2px var(--c-bg)", fontFamily: "Figtree, sans-serif",
    }}>{count > 9 ? "9+" : count}</span>
  );
}

const LOGO_B64 = BRAND_LOGO.split(",")[1]; // base64 seul (balises <img>)

// Icône de l'application KBS Gestion (monogramme KG). Le logo complet
// KBS Digital Agency (BRAND_LOGO) reste sur les reçus, devis et factures.
function AppIcon({ size = 40, style }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="KBS Gestion" style={{ flexShrink: 0, display: "block", ...style }}>
      <defs>
        <linearGradient id="kbsAppIconBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B2E6B" /><stop offset="1" stopColor="#011B45" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="23" fill="url(#kbsAppIconBg)" />
      <rect x="1.5" y="1.5" width="97" height="97" rx="21.5" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="3" />
      <text x="49" y="73" textAnchor="middle" fontFamily="Archivo, 'Arial Black', sans-serif" fontWeight="900" fontSize="54" letterSpacing="-4">
        <tspan fill="#FFFFFF">K</tspan><tspan fill="#F39200">G</tspan>
      </text>
      <line x1="66" y1="30" x2="80" y2="16" stroke="#FDB402" strokeWidth="5.5" strokeLinecap="round" />
      <polyline points="70,15 81,15 81,26" fill="none" stroke="#FDB402" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppWordmark({ size = 18 }) {
  return (
    <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: size, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
      KBS <span style={{ color: "#F39200", fontWeight: 700 }}>Gestion</span>
    </span>
  );
}

function autoCode(name) {
  const base = (name || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "").slice(0, 6) || "MEMBRE";
  return `${base}2026`;
}

/* Coordonnées de l'agence — affichées sur les reçus et devis PDF, modifiables dans Administration */
const DEFAULT_AGENCY = {
  name: "KBS DIGITAL AGENCY",
  email: "Niangkader62@gmail.com",
  phone1: "+223 76 90 80 31",
  phone2: "+223 90 64 71 06",
  address: "",
  // Identite visuelle (modifiable dans Administration -> Agence)
  logo: "",                 // vide = logo officiel integre (src/brandLogo.js)
  brandColor: "#011B45",    // bleu marine du logo : bandeaux, tableaux, totaux
  brandColor2: "#F39200",   // orange du logo : titres, accents
  slogan: "Stratégie, Ventes & Production digitale",
  website: "",
  rccm: "",
  nif: "",
  paymentInfo: "Orange Money / Wave : +223 76 90 80 31 — Espèces au bureau.",
  conditionsDevis: "",
  conditionsFacture: "",
};

/* ---------------------------------- STATIC DATA ---------------------------------- */

const TEAM_COLORS = ["#C9A227", "#3CBE7C", "#DD6A54", "#7FB3E8", "#C58FE8", "#E8A26B"];

const DEFAULT_TEAM = [
  { id: "ceo", name: "CEO", role: "Stratégie, Technique, Enseignement", color: C.gold, code: "CEO2026",
    checklist: ["Vérifier les tâches à valider", "Monter la vidéo finale du jour", "Avancer sur un projet client", "Point d'équipe 15 min"] },
  { id: "catherine", name: "Catherine", role: "Commercial, Closing, Trésorerie", color: C.greenLight, code: "CATH2026",
    checklist: ["Traiter les messages WhatsApp", "Accueillir les nouveaux élèves", "Relancer les prospects en attente", "Mettre à jour la trésorerie"] },
  { id: "sacko", name: "Sacko", role: "Coordination, Graphisme", color: C.rustLight, code: "SACKO2026",
    checklist: ["Coordonner les tâches de l'équipe", "Créer les visuels du jour", "Vérifier la cohérence graphique", "Point d'équipe 15 min"] },
  { id: "oumou", name: "Oumou", role: "Créatrice de contenu", color: "#7FB3E8", code: "OUMOU2026",
    checklist: ["Écrire un script vidéo", "Tourner une vidéo", "Analyser une tendance TikTok", "Répondre aux commentaires"] },
];

const DEFAULT_PACKS = [
  { name: "Pack 1 : Formation + Vente", online: 45000, presentiel: 80000 },
  { name: "Pack 2 : Lancement Produit", online: 50000, presentiel: 85000 },
  { name: "Pack 3 : Visibilité (Mensuel)", online: 140000, presentiel: 160000 },
  { name: "Pack 4 : Présence Pro", online: 170000, presentiel: 190000 },
  { name: "Pack 5 : Conversion & Ventes", online: 65000, presentiel: 80000 },
  { name: "Pack 6 : IA & Automatisation", online: 70000, presentiel: 95000 },
  { name: "Pack 7 : Tech / Projet Avancé", online: 350000, presentiel: null, note: "Sur devis" },
];

const DEFAULT_FORMATIONS = [
  { name: "Formation Alibaba", online: 10000, presentiel: 20000 },
  { name: "Formation E-commerce", online: 20000, presentiel: 35000 },
  { name: "Intelligence Artificielle (IA)", online: 20000, presentiel: 35000 },
  { name: "Montage vidéo CapCut", online: 15000, presentiel: 25000 },
  { name: "Campagne publicitaire (Meta/TikTok)", online: 25000, presentiel: 35000 },
  { name: "Formation au Closing", online: 15000, presentiel: 25000 },
];

const DEFAULT_PRESTATIONS = [
  { name: "Création de page de vente", price: "25 000 FCFA" },
  { name: "Création de site web dynamique", price: "100 000 FCFA" },
  { name: "Community Management", price: "100 000 FCFA / mois" },
  { name: "Création de SaaS / Application", price: "À partir de 300 000 FCFA" },
];

const DEFAULT_PRICING = { packs: DEFAULT_PACKS, formations: DEFAULT_FORMATIONS, prestations: DEFAULT_PRESTATIONS };


const AI_TOOLS = [
  { cat: "Rédaction, Stratégie & Recherche IA", items: [
    { name: "Claude", url: "https://claude.ai", role: "Le \"cerveau\" de l'agence : stratégie, rédaction longue, création de documents (Word/Excel/PDF), code des apps KOLO et MY HABY.", adv: "Très fiable sur les gros documents et le raisonnement, peut livrer un fichier prêt à l'emploi directement." },
    { name: "ChatGPT", url: "https://chatgpt.com", role: "Brainstorming rapide, GPTs personnalisés, génération d'images.", adv: "Polyvalent, bon pour itérer vite sur des idées et scripts courts." },
    { name: "Gemini", url: "https://gemini.google.com", role: "Analyse de documents longs, intégration Gmail / Docs / Sheets.", adv: "Pratique quand Catherine ou toi travaillez déjà dans Google Workspace." },
    { name: "Perplexity", url: "https://www.perplexity.ai", role: "Veille concurrentielle et études de marché avec sources vérifiables.", adv: "Idéal avant de lancer une offre : voir ce qui marche chez les concurrents." },
  ]},
  { cat: "Voix, Vidéo & Avatars IA", items: [
    { name: "HeyGen", url: "https://www.heygen.com", role: "Avatars IA parlants et doublage automatique multilingue.", adv: "Permet à Sacko de produire des vidéos sans être toujours filmé, ou de dupliquer une vidéo en plusieurs langues." },
    { name: "Eleven Labs", url: "https://elevenlabs.io", role: "Voix off IA ultra réalistes en plusieurs langues, clonage vocal.", adv: "Parfait pour les voix off de présentations ou tutoriels sans micro pro." },
    { name: "CapCut", url: "https://www.capcut.com", role: "Montage vidéo mobile, sous-titres automatiques, effets tendances TikTok.", adv: "Outil principal du CEO pour le montage final signature de l'agence." },
    { name: "Video Compressor", url: "https://play.google.com/store/apps", role: "Compression vidéo avant envoi WhatsApp ou upload.", adv: "Évite les échecs d'envoi liés aux fichiers trop lourds depuis mobile." },
  ]},
  { cat: "Design & Présentation", items: [
    { name: "Canva", url: "https://www.canva.com", role: "Design de posts, affiches, visuels de vente. Magic Studio pour générer/retoucher des images par IA.", adv: "Templates rapides, cohérence visuelle de marque pour toute l'équipe." },
    { name: "Gamma", url: "https://gamma.app", role: "Génère des présentations professionnelles complètes à partir d'un simple texte.", adv: "Parfait pour les présentations de partenariat ou de closing B2B." },
  ]},
  { cat: "Développement & Hébergement", items: [
    { name: "Supabase", url: "https://supabase.com", role: "Base de données et authentification pour les apps KOLO et MY HABY.", adv: "Backend prêt en quelques minutes, temps réel, sécurisé." },
    { name: "Netlify", url: "https://www.netlify.com", role: "Hébergement et déploiement instantané par glisser-déposer.", adv: "Compatible avec ton flux de travail 100% mobile." },
    { name: "Cursor", url: "https://cursor.com", role: "Éditeur de code assisté par IA pour accélérer le développement.", adv: "Utile quand tu passes sur ordinateur pour du code plus complexe." },
  ]},
  { cat: "Organisation & Automatisation", items: [
    { name: "Notion", url: "https://www.notion.so", role: "QG central de l'agence : bases de données, documentation, suivi.", adv: "Un seul endroit pour toute l'équipe, accessible mobile et ordinateur." },
    { name: "Loom", url: "https://www.loom.com", role: "Enregistrement vidéo d'écran pour les tutoriels internes.", adv: "Le CEO forme l'équipe sans réunion en direct." },
    { name: "Make.com", url: "https://www.make.com", role: "Automatisation entre applications (ex: nouvelle vente → notification WhatsApp).", adv: "Fait gagner du temps sur les tâches répétitives de suivi." },
    { name: "Systeme.io", url: "https://systeme.io", role: "Tunnels de vente, pages de capture, emailing automatique.", adv: "Tout-en-un pour vendre les formations et packs sans site complexe." },
  ]},
  { cat: "Marketing & Publicité", items: [
    { name: "Meta Business Suite", url: "https://business.facebook.com", role: "Gestion centralisée Facebook / Instagram, publications programmées.", adv: "Rôles séparés pour Sacko (contenu) et Catherine (messages)." },
    { name: "Publicité Meta (Ads Manager)", url: "https://www.facebook.com/adsmanager", role: "Campagnes publicitaires ciblées Facebook/Instagram.", adv: "Ciblage précis par ville, âge et centres d'intérêt en Afrique de l'Ouest." },
  ]},
  { cat: "Banques média gratuites", items: [
    { name: "Pexels (photos)", url: "https://www.pexels.com", role: "Photos libres de droits pour visuels et publicités.", adv: "Qualité pro, gratuit, sans attribution obligatoire." },
    { name: "Pexels Vidéos", url: "https://www.pexels.com/videos/", role: "Vidéos libres de droits pour montages et publicités.", adv: "Bonnes B-roll pour habiller les vidéos de Sacko." },
    { name: "Pixabay", url: "https://pixabay.com", role: "Photos, vidéos et illustrations gratuites.", adv: "Complète Pexels avec plus d'illustrations et d'icônes." },
  ]},
];

const WEEKS = [
  { title: "Semaine 1 — Intégration & Configuration", tasks: [
    "CEO : configurer Meta Business Suite pour Sacko et Catherine, enregistrer 3 tutoriels Loom.",
    "Catherine : connecter WhatsApp Companion, étudier l'historique des anciennes conversations clients.",
    "Sacko : analyser 5 comptes concurrents sur TikTok.",
  ]},
  { title: "Semaine 2 — Machine à contenu & prospection", tasks: [
    "Sacko : rédiger et tourner les 3 premières vidéos face caméra.",
    "CEO : montage final CapCut, configuration de la page de vente du Pack 1.",
    "Catherine : lister 20 profils d'entrepreneurs locaux à contacter.",
  ]},
  { title: "Semaine 3 — Intensification des ventes", tasks: [
    "Sacko : répondre aux commentaires générés par les vidéos.",
    "Catherine : récupérer les leads WhatsApp, utiliser les scripts, relancer à J+1.",
    "CEO : avancer sur le projet de site web dynamique pour un client.",
  ]},
  { title: "Semaine 4 — Optimisation & encaissement", tasks: [
    "Sacko : analyser les statistiques des vidéos avec le CEO.",
    "Catherine : faire le point trésorerie, vérifier si l'objectif 250 000 FCFA est atteint.",
    "CEO : distribuer les premières commissions individuelles (chaque membre touche son % sur ses propres ventes).",
  ]},
];

const PERSONAS = [
  { title: "Le Vendeur Débutant", age: "20–35 ans", desc: "Veut se lancer dans l'e-commerce / import Alibaba, budget limité, cherche une formation accessible.",
    tone: "Langage simple et familier, preuve sociale (témoignages), promesse concrète \"gagner de l'argent rapidement\", ton motivant." },
  { title: "Le Commerçant / Boutique locale", age: "30–50 ans", desc: "Activité physique déjà lancée, veut plus de visibilité digitale mais ne maîtrise pas les réseaux sociaux.",
    tone: "Ton rassurant, vocabulaire sans jargon, résultats concrets (\"plus de clients dans votre boutique\")." },
  { title: "L'Entrepreneur / PME Ambitieux", age: "25–45 ans", desc: "Veut un site web, une application ou de l'automatisation IA, budget plus élevé.",
    tone: "Ton professionnel, orienté retour sur investissement, mise en avant de l'expertise technique." },
];

const GROUPES_CIBLES = [
  "Groupes Facebook : \"Entrepreneurs au Mali\", \"Business Bamako\", \"Achat/Vente gros et détail\"",
  "Canaux Telegram professionnels d'entrepreneurs",
  "Groupes WhatsApp de commerçants",
  "Réseau élargi : Sénégal, Côte d'Ivoire, Burkina Faso, Guinée (via le partenaire au Bénin et les collaborateurs)",
];

const METHODE_PROSPECTION = [
  "Ne jamais spammer ni publier de lien direct dans les groupes.",
  "Repérer une publication d'un commerçant qui se plaint de ne pas vendre.",
  "Répondre avec 2 conseils gratuits tirés de nos formations (apport de valeur réel).",
  "Inviter en message privé WhatsApp pour un audit gratuit de sa page.",
  "Convertir l'audit gratuit en proposition d'un Pack adapté à son besoin.",
];

/* ---------------------------------- PROSPECTION TERRAIN (entreprises physiques) ---------------------------------- */
const METHODE_TERRAIN = [
  { titre: "Avant la visite — Préparer son terrain", points: [
    "Repérer des commerces à fort potentiel : bonne fréquentation, activité active, mais visibilité en ligne faible ou nulle.",
    "Avoir sur soi : le portefeuille de preuves (captures, exemples), la grille tarifaire, des devis vierges, une carte de visite.",
    "Fixer un objectif clair pour la visite : obtenir un rendez-vous, présenter, ou closer directement.",
  ]},
  { titre: "Les 30 premières secondes — L'accroche", points: [
    "Se présenter brièvement : prénom + KBS Digital Agency + une phrase d'impact, pas un discours.",
    "Complimenter un détail réel et précis du commerce — jamais une phrase générique.",
    "Poser une seule question ouverte qui montre un intérêt sincère pour leur activité, pas une intention de vendre.",
  ]},
  { titre: "Découverte — Comprendre avant de proposer", points: [
    "Comment trouvez-vous vos clients aujourd'hui ?",
    "Avez-vous déjà essayé le digital (réseaux sociaux, site, publicité) ? Qu'est-ce qui a marché ou pas ?",
    "Quel est votre plus gros frein : le temps, le budget, ou le manque de compétence technique ?",
    "Toujours reformuler leur besoin avec leurs propres mots avant de proposer quoi que ce soit.",
  ]},
  { titre: "Présentation — Relier le service à LEUR problème", points: [
    "Ne jamais réciter tout le catalogue : choisir un seul service qui répond exactement à ce qu'ils viennent de dire.",
    "Montrer le portefeuille concret de ce service précis (voir la fiche de chaque service ci-dessous).",
    "Donner un chiffre ou un résultat concret quand c'est possible plutôt qu'une promesse vague.",
  ]},
  { titre: "Gestion des objections", points: [
    "Ne jamais argumenter contre le client — valider son point, puis répondre.",
    "Structure simple : \"Je comprends... beaucoup de nos clients pensaient pareil... voici ce qu'on a fait pour eux...\"",
    "Voir l'objection fréquente et la réponse préparée pour chaque service ci-dessous.",
  ]},
  { titre: "Closing — Conclure", points: [
    "Poser une question de closing simple et directe : \"On démarre cette semaine ou la semaine prochaine ?\"",
    "Toujours repartir avec quelque chose de concret : un acompte, une signature, ou au minimum un rendez-vous daté.",
    "Utiliser le devis PDF professionnel pour formaliser l'offre immédiatement sur place.",
  ]},
  { titre: "Après la vente — Fidéliser et faire grandir", points: [
    "Envoyer le reçu PDF professionnel immédiatement après paiement — ça renforce le sérieux de l'agence.",
    "Demander un avis Google ou un témoignage dès le premier résultat visible.",
    "Programmer une relance pour proposer une évolution vers un pack supérieur (upsell).",
  ]},
];

/* Chaque entrée : cible = type de commerce idéal, portfolio = preuves concrètes à montrer,
   accroche = phrase d'ouverture spécifique, objection = frein fréquent, reponse = réponse préparée.
   Les Packs 3 et 4 ont un "script" complet étape par étape en plus (offres phares). */
const PROSPECTION_GUIDE = {
  "Formations & Coaching": [
    { name: "Formation Alibaba", cible: "Commerçants vendant des produits importés (vêtements, électronique, cosmétiques, accessoires)",
      portfolio: "Captures de commandes Alibaba réussies, calcul de marge achat/revente, témoignage d'un élève qui importe déjà",
      accroche: "Vous vendez déjà ce type de produit ici — savez-vous que vous pourriez l'acheter 3 à 5 fois moins cher en direct ?",
      objection: "Je n'ai pas le temps d'apprendre ça.",
      reponse: "La formation présentielle dure 2h, on la programme à votre convenance, et votre premier import rembourse largement l'investissement." },
    { name: "Formation E-commerce", cible: "Commerçants avec des produits physiques mais aucune présence en ligne",
      portfolio: "Exemple de boutique en ligne montée pour un client + captures des commandes reçues",
      accroche: "Vos produits sont visibles uniquement ici en boutique, ou aussi en ligne ?",
      objection: "Le e-commerce c'est compliqué pour moi.",
      reponse: "On démarre avec 3 produits seulement : en 48h vous avez votre première page en ligne, pas besoin d'être informaticien." },
    { name: "Intelligence Artificielle (IA)", cible: "Tout commerçant ou PME qui perd du temps sur des tâches répétitives",
      portfolio: "Démonstration en direct sur le téléphone : générer un post ou une réponse client en 30 secondes",
      accroche: "Combien de temps passez-vous chaque jour à écrire vos publications ou répondre aux mêmes questions ?",
      objection: "L'IA c'est réservé aux grandes entreprises.",
      reponse: "Je vous montre maintenant, sur votre propre produit, en 1 minute — vous jugez par vous-même." },
    { name: "Montage vidéo CapCut", cible: "Restaurants, salons de beauté, boutiques avec des produits visuels",
      portfolio: "Vidéo brute vs vidéo montée (avant/après), captures des vues obtenues",
      accroche: "Vos vidéos ont l'air professionnelles, ou filmées à la va-vite ?",
      objection: "Je n'ai pas de contenu à filmer.",
      reponse: "On filme ensemble 15 minutes sur place pendant la formation, avec ce que vous avez déjà." },
    { name: "Campagne publicitaire (Meta/TikTok)", cible: "Commerces à forte demande locale : restaurants, boutiques, événements",
      portfolio: "Capture d'une campagne gérée avec ses résultats (impressions, clics, coût par résultat)",
      accroche: "Avez-vous déjà boosté une publication, ou vous ne savez pas par où commencer ?",
      objection: "La publicité en ligne coûte cher.",
      reponse: "On teste avec un petit budget, 5 000 à 10 000 FCFA par jour, pour voir les résultats avant d'investir plus." },
    { name: "Formation au Closing", cible: "Boutiques ou PME avec une équipe de vente (vendeurs, accueil)",
      portfolio: "Script de vente utilisé + témoignage d'une équipe déjà formée",
      accroche: "Vos vendeurs concluent facilement, ou perdez-vous des clients au dernier moment ?",
      objection: "Mes vendeurs savent déjà vendre.",
      reponse: "Proposez un audit gratuit de 10 minutes sur une vraie situation de vente — ça révèle souvent des points invisibles de l'intérieur." },
  ],
  "Prestations techniques & créatives": [
    { name: "Création de page de vente", cible: "Tout commerce qui fait de la publicité ou reçoit du trafic sans page dédiée",
      portfolio: "2 à 3 pages de vente déjà réalisées (à montrer sur tablette/téléphone), taux de conversion si connu",
      accroche: "Quand quelqu'un clique sur votre publicité ou cherche votre offre, où atterrit-il ?",
      objection: "J'ai déjà une page Facebook.",
      reponse: "Une page Facebook informe ; une page de vente est conçue pour transformer un visiteur en client — ce n'est pas le même outil." },
    { name: "Création de site web dynamique", cible: "PME et entreprises de services établies (cabinets, agences, sociétés structurées)",
      portfolio: "2 à 3 sites réalisés, et KBSAuto.io lui-même comme preuve vivante du savoir-faire technique",
      accroche: "Si un client tape le nom de votre entreprise sur Google aujourd'hui, que trouve-t-il ?",
      objection: "C'est un investissement important.",
      reponse: "Détaillez ce qui est inclus (design, hébergement, mises à jour) et comparez au coût d'un client perdu faute de visibilité en ligne." },
    { name: "Community Management", cible: "Restaurants, boutiques, salons — tout commerce dont la clientèle utilise les réseaux sociaux",
      portfolio: "Avant/après d'une page gérée (fréquence de publication, engagement) + calendrier de contenu type",
      accroche: "Qui s'occupe de vos réseaux sociaux en ce moment ?",
      objection: "Je peux le faire moi-même.",
      reponse: "Montrez le temps réel que ça demande (recherche, création, publication, réponses) et la différence de régularité avec un professionnel dédié." },
    { name: "Création de SaaS / Application", cible: "PME structurées avec un besoin de gestion interne (stocks, rendez-vous, clients)",
      portfolio: "KBSAuto.io comme démonstration concrète et vivante du savoir-faire technique de l'agence",
      accroche: "Comment gérez-vous vos rendez-vous, vos stocks ou vos clients aujourd'hui — sur papier, Excel, ou un outil dédié ?",
      objection: "C'est un très gros investissement.",
      reponse: "Proposez un cahier des charges gratuit et un devis détaillé avant tout engagement — aucune surprise sur le prix final." },
  ],
  "Packs stratégiques": [
    { name: "Pack 1 : Formation + Vente", cible: "Débutants qui veulent se lancer dans la vente en ligne",
      portfolio: "Parcours d'un élève passé de 0 à ses premières ventes",
      accroche: "Vous voulez vendre en ligne mais vous ne savez pas par où commencer ?",
      objection: "Je préfère apprendre gratuitement sur YouTube.",
      reponse: "YouTube donne des bouts d'information épars ; ici vous avez un parcours structuré et un accompagnement jusqu'à votre première vente." },
    { name: "Pack 2 : Lancement Produit", cible: "Commerces qui préparent un nouveau produit ou une nouvelle offre",
      portfolio: "Exemple d'un lancement réussi : teaser, jour J, résultats obtenus",
      accroche: "Vous avez un nouveau produit ou service à annoncer bientôt ?",
      objection: "On peut gérer le lancement nous-mêmes.",
      reponse: "Proposez de gérer ce lancement comme un test — le résultat parlera de lui-même pour la suite de la collaboration." },
    { name: "Pack 3 : Visibilité (Mensuel)", cible: "Tout commerce physique actif, bien fréquenté sur place, mais invisible en ligne",
      portfolio: "Avant/après d'une page gérée par KBS (posts, engagement, avis clients)",
      accroche: "Votre boutique est bien fréquentée ici — avez-vous autant de visibilité en ligne ?",
      objection: "C'est cher pour un abonnement mensuel.",
      reponse: "Comparez au coût d'un employé à temps plein pour faire pareil, ou au coût des clients perdus chaque mois faute de visibilité.",
      script: [
        "Repérage : commerce avec bonne fréquentation physique mais page Facebook abandonnée, pas d'avis Google, pas de site.",
        "Ouverture : se présenter, complimenter un détail réel, puis \"Je vois que votre boutique est bien fréquentée ici — avez-vous autant de visibilité en ligne ?\"",
        "Découverte : \"Qui gère vos réseaux sociaux aujourd'hui ?\" / \"Combien de clients pensez-vous perdre parce qu'ils ne vous trouvent pas en ligne ?\"",
        "Présentation : montrer le portefeuille avant/après, présenter le Pack comme une solution mensuelle tout-en-un à prix fixe.",
        "Preuve chiffrée : \"Nos clients en Pack Visibilité voient en moyenne plus de messages et d'appels en 4 à 6 semaines.\"",
        "Objection prix : comparer au coût d'un salarié dédié ou aux clients perdus chaque mois.",
        "Closing : \"On peut démarrer cette semaine avec votre premier mois — je prends vos informations et on programme le premier contenu maintenant ?\"",
        "Après-vente : envoyer le reçu PDF immédiatement, planifier un bilan à 30 jours, proposer une évolution vers le Pack 4.",
      ] },
    { name: "Pack 4 : Présence Pro", cible: "PME ou commerce structuré voulant une image professionnelle complète (souvent après le Pack 3)",
      portfolio: "Exemples de PME dont l'image a été transformée, captures avant/après",
      accroche: "Vous avez une belle activité ici — votre image en ligne reflète-t-elle vraiment ce niveau de professionnalisme ?",
      objection: "On a déjà quelqu'un en interne qui s'en occupe un peu.",
      reponse: "Ce pack ne remplace pas forcément cette personne : il structure et professionnalise ce qui est fait aujourd'hui de façon informelle.",
      script: [
        "Repérage : entreprises à l'activité stable qui veulent professionnaliser leur image globale, souvent après un premier contact via le Pack 3.",
        "Ouverture : \"Vous avez une belle activité ici — est-ce que votre image en ligne reflète vraiment ce niveau de professionnalisme ?\"",
        "Découverte : \"Avez-vous un site web ? Une charte visuelle cohérente ? Des avis clients visibles ?\"",
        "Présentation : positionner le Pack 4 comme la solution complète — présence gérée + visuels professionnels + suivi stratégique mensuel.",
        "Preuve : montrer des exemples de PME transformées, avec captures avant/après à l'appui.",
        "Objection : rassurer sur la complémentarité avec l'existant plutôt que le remplacement.",
        "Closing : proposer un premier mois d'essai avec des livrables clairs, faire valider avec un devis PDF professionnel.",
        "Après-vente : suivi mensuel avec bilan chiffré, proposition d'évolution vers les packs techniques (site web, SaaS).",
      ] },
    { name: "Pack 5 : Conversion & Ventes", cible: "Commerces qui ont du trafic ou des contacts mais peu de ventes concrètes",
      portfolio: "Exemple d'entonnoir de vente (page + relance + closing) avec résultats obtenus",
      accroche: "Vous avez des visiteurs ou des contacts, mais peu de ventes concrètes ?",
      objection: "On a déjà des clients, ça suffit.",
      reponse: "Ce pack sert à vendre plus aux mêmes contacts, pas seulement à en trouver de nouveaux — on augmente le volume et la fréquence d'achat." },
    { name: "Pack 6 : IA & Automatisation", cible: "Commerces qui reçoivent beaucoup de messages clients répétitifs (WhatsApp, réseaux sociaux)",
      portfolio: "Exemple de réponse automatique WhatsApp + temps gagné chiffré",
      accroche: "Combien de messages clients recevez-vous par jour, et qui y répond ?",
      objection: "Je préfère répondre moi-même, c'est plus humain.",
      reponse: "L'automatisation gère les questions répétitives (horaires, prix, disponibilité) — vous gardez le temps pour les échanges qui comptent vraiment." },
    { name: "Pack 7 : Tech / Projet Avancé", cible: "PME structurées avec un besoin sur mesure (plateforme, outil interne)",
      portfolio: "KBSAuto.io présenté comme la vitrine ultime du savoir-faire technique de l'agence",
      accroche: "Avez-vous un projet technique en tête que vous n'avez jamais pu concrétiser ?",
      objection: "C'est un trop gros projet, on doit réfléchir.",
      reponse: "Proposez un atelier de cadrage gratuit de 30 minutes pour clarifier le besoin avant tout devis engageant." },
  ],
};

const SCRIPTS = [
  { title: "Script 1 — Débutants e-commerce (Pack 1)",
    hook: "\"Tu veux commencer à vendre en ligne mais tu ne sais pas par où commencer ?\"",
    probleme: "Beaucoup de débutants perdent de l'argent en achetant au mauvais endroit ou en n'ayant aucune page de vente.",
    solution: "Avec le Pack 1, tu apprends à importer depuis Alibaba, à monter ta boutique et à avoir une vraie page de vente qui convertit.",
    cta: "Écris \"PACK1\" en commentaire ou en message pour recevoir le programme complet." },
  { title: "Script 2 — Boutiques/PME locales (Pack 3)",
    hook: "\"Ta boutique est belle mais personne ne la connaît sur les réseaux ?\"",
    probleme: "Sans présence régulière sur Facebook et TikTok, tu perds des clients chaque jour au profit de la concurrence.",
    solution: "Le Pack 3 Visibilité Mensuelle gère tes publications et tes publicités pour que de nouveaux clients arrivent chaque semaine.",
    cta: "Envoie \"VISIBILITÉ\" en message privé pour un audit gratuit de ta page." },
  { title: "Script 3 — IA & Automatisation (Pack 6)",
    hook: "\"Et si une IA pouvait faire le travail de 3 employés pour ton business ?\"",
    probleme: "Beaucoup d'entrepreneurs perdent des heures sur des tâches répétitives : réponses clients, visuels, rapports.",
    solution: "Le Pack IA & Automatisation t'apprend à utiliser Claude, ChatGPT et Make.com pour automatiser tout ça.",
    cta: "Écris \"IA\" en message pour découvrir le programme complet." },
  { title: "Script 4 — Formation Alibaba (Import)",
    hook: "\"Tu veux importer depuis la Chine mais tu as peur de te faire arnaquer ?\"",
    probleme: "Beaucoup perdent de l'argent en commandant chez le mauvais fournisseur ou en payant trop de frais de douane.",
    solution: "La Formation Alibaba t'apprend à choisir un fournisseur fiable, négocier les prix et calculer ta marge avant de commander.",
    cta: "Envoie \"ALIBABA\" pour recevoir le guide complet." },
  { title: "Script 5 — Site web dynamique (PME)",
    hook: "\"Ton entreprise mérite mieux qu'une simple page Facebook.\"",
    probleme: "Sans site web professionnel, tes clients doutent de ton sérieux face à la concurrence.",
    solution: "On te crée un site web dynamique, rapide et pensé pour convertir tes visiteurs en clients.",
    cta: "Réserve un appel gratuit pour discuter de ton projet." },
  { title: "Script 6 — Formation Montage CapCut",
    hook: "\"Tes vidéos ont l'air amateur alors que tu passes des heures dessus ?\"",
    probleme: "Un mauvais montage fait fuir les spectateurs avant même la fin de la vidéo.",
    solution: "La Formation CapCut t'apprend les techniques qui gardent l'attention et donnent un rendu professionnel.",
    cta: "Écris \"MONTAGE\" pour t'inscrire." },
  { title: "Script 7 — Campagne publicitaire Meta/TikTok",
    hook: "\"Tu as déjà dépensé de l'argent en pub sans aucun résultat ?\"",
    probleme: "La majorité des pubs échouent à cause d'un mauvais ciblage ou d'un message qui ne parle pas au bon client.",
    solution: "On configure et on optimise tes campagnes Meta et TikTok pour toucher les bonnes personnes au bon moment.",
    cta: "Envoie \"PUB\" pour un audit gratuit de ton compte publicitaire." },
  { title: "Script 8 — Formation au Closing",
    hook: "\"Tu as des prospects intéressés mais qui n'achètent jamais ?\"",
    probleme: "Beaucoup de ventes se perdent à cause d'un mauvais suivi ou d'objections mal gérées.",
    solution: "La Formation au Closing te donne les scripts et techniques pour transformer une conversation WhatsApp en vente conclue.",
    cta: "Écris \"CLOSING\" pour recevoir le programme." },
  { title: "Script 9 — Community Management mensuel",
    hook: "\"Qui gère tes réseaux sociaux pendant que tu gères ton entreprise ?\"",
    probleme: "Publier sans stratégie fait perdre du temps et ne ramène pas de nouveaux clients.",
    solution: "Notre équipe crée et publie ton contenu chaque semaine, en cohérence avec ta marque et tes objectifs de vente.",
    cta: "Envoie \"VISIBILITÉ PRO\" pour découvrir nos formules mensuelles." },
  { title: "Script 10 — Coaching Entrepreneuriat global",
    hook: "\"Tu veux lancer ton business mais tu te sens seul face à toutes les décisions ?\"",
    probleme: "Sans accompagnement, on perd du temps à essayer-échouer sur des choses déjà maîtrisées par d'autres.",
    solution: "Notre coaching t'accompagne pas à pas, de l'idée jusqu'à ta première vente, avec un plan adapté à ton budget.",
    cta: "Réserve ton appel de découverte gratuit dès aujourd'hui." },
];

const HOOKS = [
  { cat: "Curiosité", items: [
    "Voici comment j'ai vendu ma première formation sans dépenser 1 FCFA en publicité.",
    "Ce que 90% des vendeurs sur Facebook ignorent sur l'algorithme en 2026.",
    "Le secret que les grosses boutiques ne veulent pas que tu connaisses.",
    "J'ai testé l'IA pour créer une pub en 5 minutes… voici le résultat.",
    "Pourquoi certains vendeurs explosent leurs ventes pendant que d'autres stagnent ?",
    "La méthode que j'utilise pour trouver des clients sans jamais publier de pub.",
  ]},
  { cat: "Douleur / Problème", items: [
    "Tu postes tous les jours et personne n'achète ? Voici pourquoi.",
    "Ta boutique est belle mais vide de clients ? Le problème n'est pas ton produit.",
    "Tu perds de l'argent chaque mois sur des pubs qui ne convertissent pas ?",
    "Arrête de payer pour des formations qui ne t'apprennent rien de concret.",
    "Tu ne sais pas comment importer depuis Alibaba sans te faire arnaquer ?",
    "Ton compte TikTok stagne à 100 vues depuis des mois ?",
  ]},
  { cat: "Preuve sociale", items: [
    "Comment ce client est passé de 0 à 15 ventes en 2 semaines.",
    "Plus de 50 entrepreneurs ouest-africains ont déjà suivi cette formation.",
    "Ce client vendait 0 produit avant de travailler avec nous. Regarde maintenant.",
    "Nos élèves parlent mieux que nous — voici leurs résultats.",
    "Ils ont commencé comme toi, sans expérience. Voici où ils en sont.",
    "Le témoignage qui m'a convaincu de créer cette formation.",
  ]},
  { cat: "Urgence / Rareté", items: [
    "Plus que 3 places disponibles pour l'accompagnement de ce mois.",
    "L'offre Pack 1 à prix réduit se termine dans 48h.",
    "Ce tarif ne sera plus disponible le mois prochain.",
    "Les 10 premiers inscrits reçoivent un bonus gratuit.",
    "Dernière session de formation avant la prochaine augmentation de prix.",
    "Cette astuce IA va bientôt être payante partout — profites-en maintenant.",
  ]},
  { cat: "Question directe", items: [
    "Tu veux vendre en ligne mais tu ne sais pas par où commencer ?",
    "Et si tu pouvais créer 10 publicités en 1 heure grâce à l'IA ?",
    "Combien de temps perds-tu chaque semaine à créer du contenu qui ne marche pas ?",
    "Prêt à transformer ta page Facebook en machine à vendre ?",
    "Tu sais que tu peux automatiser tes ventes pendant que tu dors ?",
    "Qu'est-ce qui t'empêche vraiment de lancer ta boutique en ligne aujourd'hui ?",
  ]},
];

const DEPENSES_CATEGORIES = ["Publicité (Meta/TikTok)", "Abonnements outils IA", "Formation", "Transport / Communication", "Autre"];

const SUIVI_STATUTS = ["Nouveau client", "Formation en cours", "Formation terminée", "Support après-vente"];

function buildServicesCatalogue(pricing) {
  return [
    { groupe: "Packs stratégiques", options: pricing.packs.map(p => p.name) },
    { groupe: "Formations & Coaching", options: pricing.formations.map(f => f.name) },
    { groupe: "Prestations techniques & créatives", options: pricing.prestations.map(p => p.name) },
  ];
}

const DETTE_STATUTS = ["En attente", "Payée"];

const PROSPECTION_STATUTS = ["À répondu", "Intéressé", "Contacté", "Objection prix", "Pas intéressé", "Archivé"];
const INTERET_NIVEAUX = ["Chaud", "Tiède", "Froid"];
function buildAllServicesFlat(pricing) {
  return [...pricing.packs.map(p => p.name), ...pricing.formations.map(p => p.name), ...pricing.prestations.map(p => p.name)];
}

function findServiceInfo(name, pricing) {
  const pack = pricing.packs.find(p => p.name === name);
  if (pack) return { price: fcfa(pack.online) };
  const f = pricing.formations.find(p => p.name === name);
  if (f) return { price: fcfa(f.online) };
  const pr = pricing.prestations.find(p => p.name === name);
  if (pr) return { price: pr.price };
  return { price: "[Prix]" };
}

const DM_SCRIPTS = [
  { stage: "Premier Contact", text: "Bonjour [Prénom] 👋\nJ'ai vu ton commentaire, ça a l'air de vraiment t'intéresser !\nMoi c'est [Ton prénom], de KBS Digital Agency — on aide les entrepreneurs avec [Service].\nEst-ce que c'est quelque chose qui pourrait t'intéresser qu'on t'explique en 2 minutes ?" },
  { stage: "Relance (48h)", text: "Bonjour [Prénom] 😊\nJe voulais juste m'assurer que mon dernier message ne s'est pas perdu dans tes notifications.\nTu as 2 minutes pour qu'on en parle rapidement ?" },
  { stage: "Objection Prix", text: "Je comprends totalement [Prénom], le budget c'est important.\nAvec [Service] (à partir de [Prix]), tu peux rapidement rentabiliser ton investissement avec un seul client ou une seule vente.\nOn peut aussi voir ensemble une formule plus légère si tu préfères commencer petit." },
  { stage: "Objection Confiance", text: "Ta méfiance est totalement normale [Prénom], beaucoup de nos clients avaient les mêmes doutes au début.\nJe peux t'envoyer gratuitement un aperçu ou un témoignage pour que tu voies la qualité de notre travail, sans aucun engagement.\nTu veux que je te l'envoie maintenant ?" },
  { stage: "Closing", text: "Super [Prénom] ! Voici ce que tu obtiens avec [Service] :\n✅ Un accompagnement complet, étape par étape\n✅ Un support direct sur WhatsApp\n✅ Nos ressources et guides inclus\nPour [Prix] → paiement via Wave, Orange Money ou Chariow.\nDès que c'est fait, on démarre immédiatement 🚀" },
];

function defaultDispoDays() {
  const d = {};
  for (let i = 1; i <= 30; i++) d[i] = { disponible: false, heure: "", note: "" };
  return d;
}

const WEEKDAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
function weekdayAbbrev(dayNum) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), dayNum);
  return WEEKDAYS_FR[d.getDay()];
}

/* --- Reçus : un reçu par versement (numéro REC-AAAA-0001), ou un récapitulatif --- */
function clientFullName(p) { return `${p.prenom || ""} ${p.nom || ""}`.trim(); }
// Construit les donnees d'un recu. pay absent = recapitulatif de tout ce qui a ete paye.
function recuData(p, pay) {
  const pays = paymentsOf(p).slice().sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || (Number(a.id) || 0) - (Number(b.id) || 0));
  const upTo = pay ? pays.slice(0, pays.findIndex(x => x.id === pay.id) + 1) : pays;
  const totalPaye = sumPayments(upTo);
  const prix = prixTotalOf(p);
  return {
    numero: pay ? (pay.recNumero || fallbackNumero("REC", pay.date, pay.id)) : fallbackNumero("REC", p.dateInscription, p.id),
    date: pay ? pay.date : new Date().toISOString().slice(0, 10),
    clientNom: clientFullName(p), whatsapp: p.whatsapp, email: p.email,
    adresse: [p.adresse, p.quartier].filter(Boolean).join(", "),
    service: p.pack, montant: pay ? Number(pay.montant) || 0 : Number(p.montant) || 0,
    mode: pay ? pay.mode : [...new Set(pays.map(x => x.mode).filter(Boolean))].join(", "),
    note: pay ? pay.note : (pays.length > 1 ? `${pays.length} versements` : ""),
    prixTotal: prix, totalPaye, reste: Math.max(0, prix - totalPaye),
  };
}
function receiptText(r, agency) {
  const lines = [
    `🧾 REÇU N° ${r.numero} — ${agency?.name || "KBS Digital Agency"}`, "",
    `Client : ${r.clientNom}`,
    `Service : ${r.service || "—"}`,
    `Montant reçu : ${money(r.montant)}${r.mode ? ` (${r.mode})` : ""}`,
    `Date : ${frDate(r.date)}`,
  ];
  if (r.prixTotal > 0) {
    lines.push(`Prix total : ${money(r.prixTotal)}`);
    lines.push(r.reste > 0 ? `Reste à payer : ${money(r.reste)}` : "Statut : soldé ✅");
  }
  lines.push("", "Merci pour votre confiance ! 🙏", agency?.name || "KBS Digital Agency");
  return lines.join("\n");
}
function buildRappelText(d) {
  return `👋 Bonjour ${d.clientNom},%0A%0ACeci est un rappel amical concernant votre paiement de ${fcfa(d.montantDu)} pour "${d.service}", prévu le ${d.dateEcheance}.%0A%0AMerci de nous contacter pour régulariser dès que possible.%0A— KBS Digital Agency`;
}
function whatsappRappelLink(d) {
  const phone = (d.whatsapp || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${buildRappelText(d)}`;
}

/* ---------------------------------- PDF : REÇU & DEVIS PROFESSIONNELS ---------------------------------- */
const LOGO_BASE64 = BRAND_LOGO;
const PDF_GOLD = [243, 146, 0];   // orange du logo
const PDF_NAVY = [1, 27, 69];     // bleu marine du logo
const PDF_MUTED = [110, 122, 112];

function docNumber(prefix, dateStr, id) {
  const d = (dateStr || new Date().toISOString().slice(0, 10)).replace(/-/g, "");
  return `${prefix}-${d}-${String(id).slice(-4)}`;
}

function pdfHeader(doc, title, numero, dateStr, agency) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...PDF_NAVY);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setFillColor(...PDF_GOLD);
  doc.rect(0, 38, pageW, 1.5, "F");

  try { const src = agency.logo || LOGO_BASE64; doc.addImage(src, doc.getImageProperties(src).fileType, 15, 8, 22, 22); } catch (e) { /* ignore if image fails to load */ }
  const textX = 42;

  doc.setTextColor(...PDF_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(agency.name || "KBS DIGITAL AGENCY", textX, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Stratégie, Ventes & Production digitale", textX, 22.5);
  const contactLine = [agency.phone1, agency.phone2].filter(Boolean).join("  /  ") + (agency.email ? `   •   ${agency.email}` : "");
  doc.text(contactLine, textX, 28);
  if (agency.address) doc.text(agency.address, textX, 33);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, pageW - 15, 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`N° ${numero}`, pageW - 15, 24, { align: "right" });
  doc.text(`Date : ${dateStr}`, pageW - 15, 30, { align: "right" });

  return 52; // y position to continue below header
}

function pdfFooter(doc, agency, message) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_MUTED);
  const lines = doc.splitTextToSize(message, pageW - 30);
  doc.text(lines, 15, 255);

  doc.setDrawColor(...PDF_GOLD);
  doc.setLineWidth(0.5);
  doc.line(15, 278, pageW - 15, 278);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_MUTED);
  const contactLine = [agency.name, agency.phone1, agency.phone2, agency.email].filter(Boolean).join("  —  ");
  doc.text(contactLine, pageW / 2, 285, { align: "center" });
}

function generateProspectionPDF(agency, methode, guide) {
  methode = methode || METHODE_TERRAIN;
  guide = guide || DEFAULT_TERRAIN_GUIDE;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const contentW = pageW - marginX * 2;
  const dateStr = new Date().toISOString().slice(0, 10);
  let y = 0;
  let pageNum = 0;

  function startPage(title) {
    if (pageNum > 0) doc.addPage();
    pageNum++;
    y = pdfHeader(doc, title, `TERRAIN-${dateStr.replace(/-/g, "")}`, dateStr, agency);
  }
  function ensure(space) {
    if (y + space > pageH - 20) startPage("GUIDE DE PROSPECTION TERRAIN (suite)");
  }
  function sectionTitle(text) {
    ensure(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...PDF_NAVY);
    doc.text(text, marginX, y);
    y += 7;
  }
  function label(text, color) {
    ensure(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...(color || PDF_GOLD));
    doc.text(text.toUpperCase(), marginX, y);
    y += 4.5;
  }
  function body(text, opts) {
    opts = opts || {};
    doc.setFont("helvetica", opts.italic ? "italic" : "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...(opts.color || [40, 40, 40]));
    const lines = doc.splitTextToSize(text, contentW);
    ensure(lines.length * 4.3 + 2);
    doc.text(lines, marginX, y);
    y += lines.length * 4.3 + 3;
  }

  startPage("GUIDE DE PROSPECTION TERRAIN");
  sectionTitle("Méthode universelle en 7 étapes");
  methode.forEach((m, i) => {
    ensure(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...PDF_NAVY);
    const titleLines = doc.splitTextToSize(`${i + 1}. ${m.titre}`, contentW);
    doc.text(titleLines, marginX, y);
    y += titleLines.length * 5 + 1;
    (m.points || []).forEach(p => body(`•  ${p}`));
    y += 2;
  });

  guide.forEach(({ categorie, services }) => {
    startPage(categorie.toUpperCase());
    services.forEach(s => {
      ensure(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...PDF_NAVY);
      doc.text(s.name, marginX, y);
      y += 6;
      label("Cible idéale"); body(s.cible);
      label("Portefeuille à montrer"); body(s.portfolio);
      label("Accroche"); body(`"${s.accroche}"`, { italic: true, color: [140, 105, 10] });
      label("Objection fréquente", PDF_MUTED); body(s.objection, { color: [150, 60, 50] });
      label("Réponse"); body(s.reponse);
      if ((s.script || []).length) {
        label("Script complet — du début à la fin");
        s.script.forEach((step, i) => body(`${i + 1}. ${step}`));
      }
      ensure(6);
      doc.setDrawColor(220, 215, 200);
      doc.line(marginX, y, pageW - marginX, y);
      y += 6;
    });
  });

  doc.save("Guide_Prospection_Terrain_KBS.pdf");
}

const ACADEMIE = [
  { name: "Meta Blueprint", url: "https://www.facebook.com/business/learn", desc: "Cours officiels Meta sur la publicité Facebook et Instagram.", certif: "Certification Meta disponible (cours gratuits, certains examens payants)." },
  { name: "TikTok Academy", url: "https://www.tiktok.com/business/en/tiktok-academy", desc: "Formations officielles TikTok for Business sur le contenu et la publicité.", certif: "Badges de complétion gratuits." },
  { name: "Google Ateliers Numériques (Digital Garage)", url: "https://learndigital.withgoogle.com/digitalgarage", desc: "Fondamentaux du marketing digital par Google.", certif: "Certificat gratuit reconnu à la fin du cours." },
  { name: "HubSpot Academy", url: "https://academy.hubspot.com", desc: "Cours sur la vente, l'inbound marketing et le service client.", certif: "Certifications gratuites téléchargeables." },
  { name: "Semrush Academy", url: "https://www.semrush.com/academy", desc: "Formations sur le SEO, la publicité et le content marketing.", certif: "Certificats gratuits après examen." },
  { name: "Canva Design School", url: "https://www.canva.com/designschool", desc: "Bases du design graphique pour les réseaux sociaux.", certif: "Cours gratuits, sans certificat formel." },
  { name: "Shopify Learn", url: "https://www.shopify.com/learn", desc: "Formations e-commerce : lancer et gérer une boutique en ligne.", certif: "Cours gratuits, sans certificat officiel." },
  { name: "Alison", url: "https://alison.com", desc: "Large catalogue de cours gratuits en marketing digital et entrepreneuriat.", certif: "Certificat digital gratuit (version imprimée payante)." },
];

/* ---------------------------------- STORAGE HELPERS (SUPABASE) ---------------------------------- */
// `failures` (optionnel) : tableau dans lequel on note les cles dont la lecture a
// ECHOUE (reseau, serveur...). Une cle simplement absente n'est pas un echec.
// Indispensable : sans cela, un echec de lecture renvoyait la valeur par defaut
// (liste vide) que l'app re-ecrivait aussitot dans la base -> donnees effacees.
async function loadShared(key, fallback, failures) {
  try {
    const { data, error } = await supabase.from("kbs_storage").select("value").eq("key", key).maybeSingle();
    if (error) { if (failures) failures.push(key); return fallback; }
    if (!data) return fallback;
    return data.value;
  } catch { if (failures) failures.push(key); return fallback; }
}
async function deleteShared(key) {
  try {
    const { error } = await supabase.from("kbs_storage").delete().eq("key", key);
    return error ? (error.message || "Erreur de suppression") : null;
  } catch (e) { return (e && e.message) ? e.message : "Connexion impossible"; }
}
// Lit toutes les lignes dont la cle commence par `prefix` (ex. "archive:").
// Renvoie null en cas d'echec (a distinguer d'une liste vide).
async function loadByPrefix(prefix) {
  try {
    const { data, error } = await supabase.from("kbs_storage").select("key,value,updated_at").like("key", `${prefix}%`);
    if (error || !data) return null;
    return data;
  } catch { return null; }
}
// Renvoie null si tout va bien, sinon un message d'erreur lisible.
// Avant, les echecs etaient avales en silence : l'app affichait "Enregistre"
// alors que rien n'etait ecrit dans la base.
async function saveShared(key, value) {
  try {
    const { error } = await supabase.from("kbs_storage").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return error.message || "Erreur d'enregistrement";
    return null;
  } catch (e) {
    return (e && e.message) ? e.message : "Connexion impossible";
  }
}

/* ------------------------------ MISE A JOUR DE L'APPLICATION ------------------------------ */
// Chaque publication produit un nouveau fichier /assets/index-XXXX.js. On relit index.html
// sur le serveur (sans cache) : si le fichier annonce n'est plus celui charge, une nouvelle
// version est en ligne et on propose de l'installer tout de suite.
const BUILD_TIME = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "";
function loadedBundle() {
  const s = [...document.scripts].find(x => /\/assets\/index-[^/]+\.js/.test(x.src || ""));
  return s ? new URL(s.src).pathname : null;
}
async function latestBundle() {
  const r = await fetch(`/?maj=${Date.now()}`, { cache: "no-store" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const m = (await r.text()).match(/\/assets\/index-[^"']+\.js/);
  return m ? m[0] : null;
}
function useAppUpdate() {
  const [ready, setReady] = useState(false);
  async function check() {
    const mine = loadedBundle();
    if (!mine) return "dev"; // mode developpement : rien a comparer
    try {
      const latest = await latestBundle();
      const isNew = !!latest && latest !== mine;
      setReady(isNew);
      return isNew ? "new" : "same";
    } catch { return "error"; }
  }
  async function apply() {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.update().catch(() => {})));
      }
      if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); }
    } catch (e) {}
    window.location.reload();
  }
  useEffect(() => {
    check();
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    const t = setInterval(check, 5 * 60 * 1000);
    return () => { document.removeEventListener("visibilitychange", onVis); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ready, check, apply };
}

function UpdateBanner({ onApply }) {
  const [busy, setBusy] = useState(false);
  return (
    <div role="status" className="kbs-safe-top" style={{ position: "sticky", top: 0, zIndex: 60, background: "linear-gradient(160deg,#FDB402,#F39200 60%,#FD5C01)", color: "#011B45", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13.5, flexWrap: "wrap" }}>
      <RefreshCw size={17} />
      <span style={{ flex: 1, minWidth: 180 }}>Une nouvelle version de KBS Gestion est disponible.</span>
      <button onClick={() => { setBusy(true); onApply(); }} disabled={busy} style={{ background: "#011B45", color: "#fff", border: "none", borderRadius: 11, padding: "9px 14px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
        {busy ? "Mise à jour…" : "Mettre à jour maintenant"}
      </button>
    </div>
  );
}

// Carte « Mise à jour » (Menu) : bouton direct pour verifier et installer la derniere version.
function UpdateCard({ upd }) {
  const [state, setState] = useState("");
  async function run() {
    if (upd.ready) { setState("apply"); upd.apply(); return; }
    setState("checking");
    const r = await upd.check();
    if (r === "new") { setState("apply"); upd.apply(); }
    else setState(r);
  }
  const built = BUILD_TIME ? new Date(BUILD_TIME).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <IconTile kind={upd.ready ? "or" : "bl"}><RefreshCw size={19} /></IconTile>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontWeight: 700 }}>Mise à jour de l'application</div>
        <div style={{ color: C.muted, fontSize: 12 }}>
          {upd.ready ? "Nouvelle version disponible" : state === "same" ? "Tu as la dernière version ✓" : state === "error" ? "Pas de connexion : réessaie dans un instant" : built ? `Version du ${built}` : "Vérifie si une nouvelle version est en ligne"}
        </div>
      </div>
      <button onClick={run} disabled={state === "checking" || state === "apply"} style={{ ...btnGold, width: "auto", padding: "10px 14px" }}>
        <RefreshCw size={14} /> {state === "checking" ? "Vérification…" : state === "apply" ? "Mise à jour…" : upd.ready ? "Mettre à jour" : "Vérifier et mettre à jour"}
      </button>
    </div>
  );
}

/* ------------------------------ SAUVEGARDES & HISTORIQUE ------------------------------ */
// Cles restaurables d'une sauvegarde (le mois en cours "period" n'est jamais restaure :
// il declencherait une nouvelle bascule de mois).
const BACKUP_KEYS = ["team", "goal", "prospects", "kanban", "checks", "links", "caisse", "expenses", "dettes", "prospection", "dispos", "codes", "agency", "devis", "factures", "content", "products", "stockMoves", "guides", "formationLiens", "pricing", "archives", "commissionRate"];
function backupKind(key) {
  if (/^backup:\d{4}-\d{2}-\d{2}$/.test(key)) return { label: "Automatique du jour", kind: "ok" };
  if (key.startsWith("backup:avant-bascule:")) return { label: "Avant changement de mois", kind: "bl" };
  if (key.startsWith("backup:avant-cloture:")) return { label: "Avant clôture du mois", kind: "bl" };
  if (key.startsWith("backup:avant-restauration:")) return { label: "Avant restauration", kind: "or" };
  if (key.startsWith("backup:manuelle:")) return { label: "Manuelle", kind: "or" };
  if (key.startsWith("backup:avant-suppression:")) return { label: "Avant suppression d'archive", kind: "ko" };
  return { label: "Sauvegarde", kind: "gr" };
}

function AdminSauvegardes({ onBackupNow, onRestoreBackup }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [msg, setMsg] = useState("");
  const [shown, setShown] = useState(15);

  async function refresh() {
    setError("");
    const r = await loadByPrefix("backup:");
    if (r === null) { setError("Impossible de lire les sauvegardes. Vérifie ta connexion puis réessaie."); return; }
    const when = (x) => (x.value && x.value.savedAt) || x.updated_at || "";
    setRows(r.sort((a, b) => String(when(b)).localeCompare(String(when(a)))));
  }
  useEffect(() => { refresh(); }, []);

  async function backupNow() {
    setBusy("save"); setMsg("");
    const err = await onBackupNow("manuelle");
    setBusy("");
    if (err) setError("Sauvegarde impossible : " + err);
    else { setMsg("Sauvegarde faite ✓"); refresh(); }
  }
  async function restore(row) {
    setBusy(row.key); setError("");
    const err = await onRestoreBackup(row.value || {});
    setBusy("");
    if (err) setError("Restauration impossible : " + err + ". Rien n'a été remplacé.");
  }
  function download(row) {
    try {
      const blob = new Blob([JSON.stringify(row.value, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `kbs-gestion-${row.key.replace(/^backup:/, "").replace(/[:]/g, "_")}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) { setError("Téléchargement impossible sur cet appareil."); }
  }

  const last = rows && rows[0];
  const lastWhen = last ? new Date((last.value && last.value.savedAt) || last.updated_at) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <H2>Sauvegardes &amp; historique</H2>
      <Card style={{ borderColor: C.green }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <IconTile kind="ok"><History size={19} /></IconTile>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700 }}>Sauvegarde automatique chaque jour</div>
            <div style={{ fontSize: 12.5, color: C.muted }}>
              Une copie complète (clients, ventes, stock, factures, finances, équipe…) est faite chaque jour, et aussi avant chaque clôture ou changement de mois. Elle n'est jamais écrasée.
              {lastWhen && <> Dernière : <b style={{ color: C.text }}>{lastWhen.toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</b>.</>}
            </div>
          </div>
          <button onClick={backupNow} disabled={busy === "save"} style={{ ...btnGold, width: "auto", padding: "10px 14px" }}><Save size={14} /> {busy === "save" ? "Sauvegarde…" : "Sauvegarder maintenant"}</button>
        </div>
        {msg && <div style={{ color: C.greenLight, fontSize: 12.5, marginTop: 8 }}>{msg}</div>}
      </Card>
      {error && <div style={{ color: C.rustLight, fontSize: 12.5 }}>{error} <button onClick={refresh} style={{ ...iconBtn, marginLeft: 6 }}>Réessayer</button></div>}

      <Eyebrow>Historique des sauvegardes {rows ? `(${rows.length})` : ""}</Eyebrow>
      {!rows && !error && <div style={{ color: C.muted, fontSize: 12.5 }}>Chargement…</div>}
      {rows && rows.length === 0 && <div style={{ color: C.muted, fontSize: 12.5 }}>Aucune sauvegarde pour l'instant. Appuie sur « Sauvegarder maintenant ».</div>}
      {rows && rows.slice(0, shown).map(row => {
        const v = row.value || {};
        const k = backupKind(row.key);
        const when = new Date(v.savedAt || row.updated_at);
        const clients = (v.prospects || []).length;
        const ca = (v.prospects || []).reduce((s, p) => s + (Number(p.montant) || 0), 0);
        return (
          <Card key={row.key} style={{ padding: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700 }}>{when.toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 3 }}>
                  <Pill kind={k.kind}>{k.label}</Pill>
                  <span>{clients} client{clients > 1 ? "s" : ""} · {fcfa(ca)}</span>
                  {v.products && <span>· {v.products.length} produit{v.products.length > 1 ? "s" : ""}</span>}
                  {v.factures && <span>· {v.factures.length} facture{v.factures.length > 1 ? "s" : ""}</span>}
                  {v.by && <span>· par {v.by}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => download(row)} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5, padding: "8px 11px" }}><ArrowDownToLine size={14} /> Télécharger</button>
                <button onClick={() => setConfirmKey(confirmKey === row.key ? "" : row.key)} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5, padding: "8px 11px", color: C.goldLight, borderColor: C.gold }}><RotateCcw size={14} /> Restaurer</button>
              </div>
            </div>
            {confirmKey === row.key && (
              <div style={{ marginTop: 10, background: C.cardAlt, borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 12.5, color: C.goldLight, fontWeight: 700 }}>Remettre toutes les données comme le {when.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} ?</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Les données actuelles sont d'abord sauvegardées (« Avant restauration »), tu pourras donc revenir en arrière. L'application se recharge ensuite.</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <button onClick={() => restore(row)} disabled={!!busy} style={{ ...btnGold, width: "auto", padding: "8px 14px" }}>{busy === row.key ? "Restauration…" : "Oui, restaurer"}</button>
                  <button onClick={() => setConfirmKey("")} style={iconBtn}>Annuler</button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      {rows && rows.length > shown && <button onClick={() => setShown(shown + 30)} style={iconBtn}>Voir plus ({rows.length - shown})</button>}
    </div>
  );
}

/* ---------------------------------- DIAGNOSTICS IA (stockage kbs_storage) ---------------------------------- */
// Chaque diagnostic vit sous sa propre cle "diagnostic:{clientId}" pour isoler
// les ecritures (l'app ET la fonction Edge ecrivent la meme ligne, mais jamais
// en meme temps grace au verrou de statut). Cela evite d'ecraser le resultat
// genere en arriere-plan par la fonction.
function diagKey(clientId) { return `diagnostic:${clientId}`; }

async function loadDiagnostic(clientId) {
  return loadShared(diagKey(clientId), null);
}
async function saveDiagnostic(clientId, value) {
  return saveShared(diagKey(clientId), value);
}
// Charge tous les diagnostics (pour l'onglet Administration).
async function loadAllDiagnostics() {
  try {
    const { data, error } = await supabase.from("kbs_storage").select("key,value").like("key", "diagnostic:%");
    if (error || !data) return [];
    return data.map(r => r.value).filter(Boolean);
  } catch { return []; }
}

function emptyDiagnosticForm(prospect) {
  return {
    // Identite (pre-remplie depuis la fiche client existante)
    nom: prospect?.nom || "",
    prenom: prospect?.prenom || "",
    whatsapp: prospect?.whatsapp || "",
    quartierVille: prospect?.quartier || "",
    marque: "",
    // Business
    niche: "",
    descriptionBusiness: "",
    catalogue: "",
    panierMoyen: "",
    budgetPubActuel: "",
    // Presence digitale
    tiktok: "",
    facebook: "",
    instagram: "",
    abonnes: "",
    dejaVenduEnLigne: "non",
    detailsVentes: "",
    derniereActivite: "",
    // Diagnostic
    cibleActuelle: "",
    problemePercu: "",
    objectifs30j: "",
    objectifsLongTerme: "",
    concurrentsConnus: "",
    // Photos (dataURL base64)
    photoClient: "",
    photoPage: "",
    // Notes internes KBS (jamais exportees au client)
    noteCommercial: "",
    budgetReelEstime: "",
    niveauUrgence: "Moyen",
  };
}

// Le formulaire est considere "complet" quand l'essentiel pour lancer une
// recherche Ide qualite est renseigne (niche + description + objectifs).
function diagnosticFormComplete(f) {
  if (!f) return false;
  return Boolean((f.niche || "").trim() && (f.descriptionBusiness || "").trim() && (f.problemePercu || "").trim() && (f.objectifs30j || "").trim());
}

/* ---------------------------------- UI PRIMITIVES ---------------------------------- */
function Card({ children, style }) {
  return (
    <div style={{ background: C.card, border: "1px solid rgba(255,255,255,0.04)", borderRadius: 20, padding: 16, ...style }}>
      {children}
    </div>
  );
}
function Eyebrow({ children }) {
  return <div style={{ color: C.gold, fontSize: 11, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{children}</div>;
}
function H2({ children, style }) {
  return <h2 style={{ fontFamily: "Archivo, sans-serif", fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 12px", ...style }}>{children}</h2>;
}
function fcfa(n) { return `${Number(n || 0).toLocaleString("fr-FR")} FCFA`; }

/* --- Commissions : taux officiel global + taux individuel par membre --- */
const DEFAULT_COMMISSION_RATE = 10; // Taux officiel (%), modifiable par le CEO
// Taux applique a un client selon la personne qui le suit (owner).
// Si le membre a un taux perso, on l'utilise ; sinon on retombe sur le taux officiel.
function memberRate(team, ownerId, fallback) {
  const m = (team || []).find(x => x.id === ownerId);
  const v = m && m.commissionPct != null && m.commissionPct !== "" ? Number(m.commissionPct) : fallback;
  return Number.isFinite(v) ? v : fallback;
}
// Commission d'un client = montant paye * taux de la personne qui le suit.
function commissionOf(prospect, team, fallback) {
  return (Number(prospect.montant) || 0) * (memberRate(team, prospect.owner, fallback) / 100);
}
// Somme des commissions de tous les clients.
function totalCommissionOf(prospects, team, fallback) {
  return (prospects || []).reduce((s, p) => s + commissionOf(p, team, fallback), 0);
}

/* --- Paiements en plusieurs fois (avance + solde) ---
   Un client peut avoir un prix total (prixTotal) et une liste de versements
   (paiements). Le champ historique "montant" reste = total deja encaisse, pour que
   le CA, les commissions, les recus et les archives continuent de fonctionner. */
function paymentsOf(p) {
  if (Array.isArray(p.paiements)) return p.paiements;
  const m = Number(p.montant) || 0; // Ancien client : un seul paiement
  return m > 0 ? [{ id: "init", date: p.dateInscription || "", montant: m, note: "Paiement" }] : [];
}
function sumPayments(list) { return (list || []).reduce((s, x) => s + (Number(x.montant) || 0), 0); }
function prixTotalOf(p) { return Number(p.prixTotal) || 0; }
function resteAPayer(p) { return Math.max(0, prixTotalOf(p) - (Number(p.montant) || 0)); }
// "Soldé" / "Avance" / "Non payé" — null si aucun prix total n'est renseigne.
function paymentStatus(p) {
  if (!prixTotalOf(p)) return null;
  const paye = Number(p.montant) || 0;
  if (paye >= prixTotalOf(p)) return "Soldé";
  return paye > 0 ? "Avance" : "Non payé";
}
// Applique une nouvelle liste de versements : recalcule "montant" et passe le
// statut a "Payé" quand le solde est regle.
function withPayments(p, paiements) {
  const montant = sumPayments(paiements);
  const solde = prixTotalOf(p) > 0 && montant >= prixTotalOf(p);
  return { ...p, paiements, montant: montant || "", statut: solde ? "Payé" : p.statut };
}

/* Demande de confirmation avant toute suppression. */
// Reduit un logo importe (max 500 px) en PNG, pour rester leger dans la base.
function resizeLogo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 500 / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
// Documents d'exemple pour l'apercu dans Administration -> Agence.
function SAMPLE_DOC(prefix) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: 1, numero: `${prefix}-${today.slice(0, 4)}-0001`, date: today, validite: today, echeance: today,
    clientNom: "Awa Diallo — Boutique Awa Style", whatsapp: "+223 70 00 00 00", email: "client@exemple.com", adresse: "ACI 2000, Bamako",
    objet: "Pack 1 : Formation + Vente", acompte: 50,
    items: [{ label: "Formation e-commerce (2 séances)", qte: 1, prix: 25000 }, { label: "Création de visuels publicitaires", qte: 3, prix: 5000 }],
    remise: 5000, remiseType: "FCFA",
    paiements: prefix === "FAC" ? [{ id: 1, date: today, montant: 15000, mode: "Orange Money", note: "Avance" }] : [],
  };
}
const SAMPLE_RECU = {
  numero: `REC-${new Date().getFullYear()}-0001`, date: new Date().toISOString().slice(0, 10),
  clientNom: "Awa Diallo", whatsapp: "+223 70 00 00 00", adresse: "ACI 2000, Bamako", service: "Pack 1 : Formation + Vente",
  montant: 15000, mode: "Orange Money", note: "Avance", prixTotal: 25000, totalPaye: 15000, reste: 10000,
};

const PAY_MODES = ["Orange Money", "Wave", "Espèces", "Moov Money", "Virement bancaire", "Chèque", "Autre"];

function confirmDelete(what) {
  return window.confirm(`Supprimer ${what} ? Cette action est définitive.`);
}

/* Formulaire de modification generique : fields = [{ key, label, type, options }]
   type : "text" (defaut) | "number" | "date" | "time" | "textarea" | "select". */
function EditFields({ fields, value, onSave, onCancel }) {
  const [f, setF] = useState(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
      {fields.map(fd => (
        <label key={fd.key} style={{ fontSize: 11.5, color: C.muted, display: "flex", flexDirection: "column", gap: 3 }}>
          {fd.label}
          {fd.type === "select" ? (
            <select value={f[fd.key] ?? ""} onChange={e => setF({ ...f, [fd.key]: e.target.value })} style={inputStyle}>
              {fd.options.map(o => typeof o === "string"
                ? <option key={o} value={o}>{o}</option>
                : <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : fd.type === "textarea" ? (
            <textarea value={f[fd.key] ?? ""} onChange={e => setF({ ...f, [fd.key]: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
          ) : (
            <input type={fd.type || "text"} value={f[fd.key] ?? ""} onChange={e => setF({ ...f, [fd.key]: e.target.value })} style={inputStyle} />
          )}
        </label>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(f)} style={{ ...btnGold, flex: 1 }}><Save size={14} /> Enregistrer</button>
        <button onClick={onCancel} style={{ ...iconBtn, padding: "0 14px" }}>Annuler</button>
      </div>
    </div>
  );
}

/* Liste editable generique : chaque element recoit Modifier / Supprimer, et un
   bouton « Ajouter » en bas. Pour une liste de textes simples, passer primitive.
   fields : champs de EditFields ; type "lines" = tableau de textes (une ligne = un element). */
function linesToArr(v) { return Array.isArray(v) ? v : String(v || "").split("\n").map(x => x.trim()).filter(Boolean); }
function EditableList({ items, onChange, fields, render, newItem, addLabel, primitive, itemLabel, style }) {
  const [editing, setEditing] = useState(null); // index en cours, ou "new"
  const list = items || [];
  const toForm = (it) => {
    const base = primitive ? { text: it } : { ...it };
    fields.forEach(f => { if (f.type === "lines") base[f.key] = linesToArr(base[f.key]).join("\n"); });
    return base;
  };
  const fromForm = (f) => {
    const out = { ...f };
    fields.forEach(fd => {
      if (fd.type === "lines") out[fd.key] = linesToArr(out[fd.key]);
      if (fd.type === "number") out[fd.key] = out[fd.key] === "" ? "" : Number(out[fd.key]);
    });
    return primitive ? out.text : out;
  };
  const formFields = fields.map(f => f.type === "lines" ? { ...f, type: "textarea", label: `${f.label} (une ligne par élément)` } : f);
  function save(idx, f) {
    const v = fromForm(f);
    if (primitive ? !String(v).trim() : false) return;
    onChange(idx === "new" ? [...list, v] : list.map((x, i) => i === idx ? v : x));
    setEditing(null);
  }
  function remove(idx) {
    const it = list[idx];
    const name = primitive ? `« ${String(it).slice(0, 40)}… »` : (itemLabel ? `« ${itemLabel(it)} »` : "cet élément");
    if (!confirmDelete(name)) return;
    onChange(list.filter((_, i) => i !== idx));
    if (editing === idx) setEditing(null);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      {list.map((it, idx) => (
        <div key={idx}>
          {render(it, idx, (
            <EditDeleteButtons editing={editing === idx} onEdit={() => setEditing(editing === idx ? null : idx)} onDelete={() => remove(idx)} />
          ))}
          {editing === idx && <EditFields value={toForm(it)} fields={formFields} onSave={(f) => save(idx, f)} onCancel={() => setEditing(null)} />}
        </div>
      ))}
      {editing === "new" ? (
        <EditFields value={toForm(newItem)} fields={formFields} onSave={(f) => save("new", f)} onCancel={() => setEditing(null)} />
      ) : (
        <button onClick={() => setEditing("new")} style={{ ...iconBtn, alignSelf: "flex-start", padding: "7px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 5, color: C.goldLight, borderColor: C.gold }}>
          <Plus size={13} /> {addLabel || "Ajouter"}
        </button>
      )}
    </div>
  );
}
// Rangee "contenu + boutons" pour les rendus d'EditableList.
function Row({ children, actions, style }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, ...style }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {actions}
    </div>
  );
}

/* Petits boutons Modifier / Supprimer reutilises dans toutes les listes. */
function EditDeleteButtons({ onEdit, onDelete, editing }) {
  return (
    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
      {onEdit && (
        <button onClick={onEdit} aria-label={editing ? "Fermer" : "Modifier"} title={editing ? "Fermer" : "Modifier"}
          style={{ background: "none", border: "none", color: C.goldLight, cursor: "pointer", padding: 4 }}>
          {editing ? <X size={16} /> : <Pencil size={15} />}
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} aria-label="Supprimer" title="Supprimer"
          style={{ background: "none", border: "none", color: C.rustLight, cursor: "pointer", padding: 4 }}>
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

/* Champ de code masque par defaut (points), revelable via l'icone oeil. */
function CodeInput({ value, onChange, placeholder, style }) {
  const [shown, setShown] = useState(false);
  return (
    <div style={{ position: "relative", ...style }}>
      <input
        type={shown ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 40, fontWeight: 700, letterSpacing: shown ? 0.5 : 2 }} />
      <button
        type="button"
        aria-label={shown ? "Masquer le code" : "Afficher le code"}
        onClick={(e) => { e.preventDefault(); setShown(s => !s); }}
        style={{
          position: "absolute", right: 5, top: "50%", marginTop: -13, width: 28, height: 26,
          background: "none", border: "none", color: shown ? C.goldLight : C.muted, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        }}>
        {shown ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function MiniUnlock({ code, label, onUnlock, strict }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  function tryUnlock() {
    const ok = strict ? codeMatchesStrict(input, code) : codeMatches(input, code);
    if (ok) onUnlock(); else setError(true);
  }
  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}><Lock size={11} /> {label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="password" placeholder="Code" value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          onKeyDown={e => { if (e.key === "Enter") tryUnlock(); }}
          style={{ ...inputStyle, width: 100, padding: "6px 8px", fontSize: 12 }} />
        <button onClick={tryUnlock} style={{ ...iconBtn, padding: "6px 10px" }}>OK</button>
      </div>
      {error && <div style={{ color: C.rustLight, fontSize: 10 }}>Code incorrect.</div>}
    </div>
  );
}

/* Rangee horizontale defilante avec fleches cliquables.
   Les fleches garantissent le defilement meme si le glissement tactile
   ne fonctionne pas sur l'appareil. */
function ScrollRow({ children, gap = 8, padding = "12px 12px 8px", bg }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function update() {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const t = setTimeout(update, 120);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearTimeout(t);
    };
  }, [children]);

  function nudge(dir) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(140, el.clientWidth * 0.6), behavior: "smooth" });
  }

  const arrow = (side) => ({
    position: "absolute", top: "50%", marginTop: -16, [side]: 4,
    width: 32, height: 32, borderRadius: 999, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: C.card, border: `1px solid ${C.gold}`, color: C.goldLight,
    boxShadow: "0 2px 10px rgba(0,0,0,0.45)", zIndex: 3, padding: 0,
  });

  return (
    <div style={{ position: "relative", background: bg || C.cardAlt }}>
      <div ref={ref} className="kbs-navbar" style={{ display: "flex", gap, padding, overflowX: "auto", scrollSnapType: "x proximity" }}>
        {children}
      </div>
      {canLeft && (
        <button aria-label="Précédent" onClick={() => nudge(-1)} style={arrow("left")}><ChevronLeft size={18} /></button>
      )}
      {canRight && (
        <button aria-label="Suivant" onClick={() => nudge(1)} style={arrow("right")}><ChevronRight size={18} /></button>
      )}
    </div>
  );
}

function NotificationBanner() {
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
  const [status, setStatus] = useState(supported ? Notification.permission : "unsupported");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function enable() {
    setBusy(true);
    setError("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      setStatus(permission);
      if (permission !== "granted") { setBusy(false); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const subJson = sub.toJSON();
      const existing = await loadShared("kbs:pushSubscriptions", []);
      if (!existing.find(s => s.endpoint === subJson.endpoint)) {
        await saveShared("kbs:pushSubscriptions", [...existing, { ...subJson, addedAt: new Date().toISOString() }]);
      }
    } catch (e) {
      setError("Impossible d'activer les notifications sur cet appareil.");
    }
    setBusy(false);
  }

  if (!supported || status === "granted") return null;

  return (
    <div style={{ background: "rgba(243,146,0,0.14)", borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12.5, color: C.text, display: "flex", alignItems: "center", gap: 6 }}><Bell size={14} color={C.goldLight} /> Active les notifications pour être averti en temps réel de ce qui se passe dans l'équipe.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={enable} disabled={busy} style={{ ...btnGold, width: "auto", padding: "7px 14px", fontSize: 12 }}>{busy ? "..." : "Activer"}</button>
        {error && <span style={{ fontSize: 11, color: C.rustLight }}>{error}</span>}
      </div>
    </div>
  );
}

/* ---------------------------------- MAIN APP ---------------------------------- */
function App() {
  const [tab, setTab] = useState("accueil");
  const [currentUser, setCurrentUser] = useState(null); // membre connecte (id) ou null
  const [loaded, setLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [goal, setGoal] = useState(250000);
  const [prospects, setProspects] = useState([]);
  const [kanban, setKanban] = useState({ todo: [], doing: [], review: [], done: [] });
  const [checks, setChecks] = useState({ ceo: [], catherine: [], sacko: [] });
  const [links, setLinks] = useState([]);
  const [caisse, setCaisse] = useState({ ops: [], debts: [] });
  const [expenses, setExpenses] = useState([]);
  const [dettes, setDettes] = useState([]);
  const [prospection, setProspection] = useState([]);
  const [dispos, setDispos] = useState({});
  const [codes, setCodes] = useState(DEFAULT_CODES);
  const [agency, setAgency] = useState(DEFAULT_AGENCY);
  const [devis, setDevis] = useState([]);
  const [factures, setFactures] = useState([]);
  const [content, setContent] = useState({}); // textes modifies (Marketing / Ressources)
  const [products, setProducts] = useState([]);     // catalogue produits + stock
  const [stockMoves, setStockMoves] = useState([]); // historique des entrees / sorties
  const [factureDraft, setFactureDraft] = useState(null); // facture pre-remplie (depuis CRM ou devis)
  const [guides, setGuides] = useState(DEFAULT_GUIDES);
  const [formationLiens, setFormationLiens] = useState({});
  const [ressourcesUnlocked, setRessourcesUnlocked] = useState(false);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [commissionRate, setCommissionRate] = useState(DEFAULT_COMMISSION_RATE); // Taux officiel (%)
  const [archives, setArchives] = useState([]);   // Historique fige, un element par mois cloture
  const [period, setPeriod] = useState("");        // Mois en cours "AAAA-MM"
  // Notifications non-lues par onglet (comme WhatsApp). Propre a l'appareil -> localStorage.
  const [unread, setUnread] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kbs:unread") || "{}"); } catch (e) { return {}; }
  });
  const tabRef = useRef(tab);
  const snapshotRef = useRef(null);
  const lastDailyBackupRef = useRef("");
  const upd = useAppUpdate();
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // Erreur de chargement : on n'autorise AUCUNE ecriture tant que tout n'est pas
  // relu correctement (sinon on ecraserait les vraies donnees par des listes vides).
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    (async () => {
      setLoadError("");
      const fails = [];
      const L = (key, fallback) => loadShared(key, fallback, fails);
      // Tout est lu d'abord, puis applique d'un coup seulement si AUCUNE lecture n'a echoue.
      const loadedRate = await L("kbs:commissionRate", DEFAULT_COMMISSION_RATE);
      const rate = Number.isFinite(Number(loadedRate)) ? Number(loadedRate) : DEFAULT_COMMISSION_RATE;
      const d = {
        team: await L("kbs:team", DEFAULT_TEAM),
        goal: await L("kbs:goal", 250000),
        prospects: await L("kbs:prospects", []),
        kanban: await L("kbs:kanban", { todo: [], doing: [], review: [], done: [] }),
        checks: await L("kbs:checks", { ceo: [], catherine: [], sacko: [] }),
        links: await L("kbs:links", []),
        caisse: await L("kbs:caisse", { ops: [], debts: [] }),
        expenses: await L("kbs:expenses", []),
        dettes: await L("kbs:dettes", []),
        prospection: await L("kbs:prospection", []),
        dispos: await L("kbs:dispos", {}),
        codes: await L("kbs:codes", DEFAULT_CODES),
        agency: await L("kbs:agency", DEFAULT_AGENCY),
        devis: await L("kbs:devis", []),
        factures: await L("kbs:factures", []),
        content: await L("kbs:content", {}),
        products: await L("kbs:products", []),
        stockMoves: await L("kbs:stockMoves", []),
        guides: await L("kbs:guides", DEFAULT_GUIDES),
        formationLiens: await L("kbs:formationLiens", {}),
        pricing: await L("kbs:pricing", DEFAULT_PRICING),
        archives: await L("kbs:archives", []),
        period: await L("kbs:period", ""),
      };
      // Archives aussi stockees une par une ("archive:<id>") : on fusionne les deux
      // sources pour qu'une archive ne puisse plus disparaitre.
      const archiveRows = await loadByPrefix("archive:");
      if (archiveRows === null) fails.push("archive:*");

      if (fails.length) {
        setLoadError(`Impossible de lire les données (${fails.length} élément${fails.length > 1 ? "s" : ""}). Vérifie ta connexion puis réessaie. Rien n'a été modifié.`);
        return;
      }

      const archivesById = new Map();
      [...(d.archives || []), ...(archiveRows || []).map(r => r.value)].forEach(a => {
        if (a && a.period) archivesById.set(a.id || a.period, a);
      });

      // Filet de securite code perso + taux de commission perso par defaut (taux officiel).
      setCommissionRate(rate);
      setTeam((d.team || []).map(m => ({
        ...m,
        code: m.code || autoCode(m.name),
        commissionPct: m.commissionPct != null && m.commissionPct !== "" ? m.commissionPct : rate,
      })));
      setGoal(d.goal);
      setProspects(d.prospects || []);
      setKanban(d.kanban);
      setChecks(d.checks);
      setLinks(d.links || []);
      setCaisse(d.caisse);
      setExpenses(d.expenses || []);
      setDettes(d.dettes || []);
      setProspection(d.prospection || []);
      setDispos(d.dispos);
      setCodes({ ...DEFAULT_CODES, ...d.codes });
      setAgency({ ...DEFAULT_AGENCY, ...d.agency });
      setDevis(d.devis || []);
      setFactures(d.factures || []);
      setContent(d.content || {});
      setProducts(d.products || []);
      setStockMoves(d.stockMoves || []);
      setGuides(d.guides);
      setFormationLiens(d.formationLiens);
      setPricing({ ...DEFAULT_PRICING, ...d.pricing });
      setArchives([...archivesById.values()].sort((a, b) => a.period.localeCompare(b.period)));
      setPeriod(d.period);
      setLoaded(true);

      // Sauvegarde automatique quotidienne (une par jour, jamais ecrasee) :
      // permet de restaurer n'importe quel jour en cas de probleme.
      const today = new Date().toISOString().slice(0, 10);
      const backupKey = `backup:${today}`;
      const existing = await loadShared(backupKey, null);
      if (!existing) await saveShared(backupKey, { savedAt: new Date().toISOString(), kind: "jour", commissionRate: rate, ...d });
      lastDailyBackupRef.current = today;
    })();
  }, [loadAttempt]);

  // Appli restee ouverte pendant le changement de mois (ex. ouverte le 30, reprise
  // le 1er) : on recharge pour repartir des donnees a jour de la base, au lieu de
  // continuer avec une copie perimee qui pourrait ecraser le travail des autres.
  useEffect(() => {
    if (!loaded || !period) return;
    function checkMonth() {
      if (document.visibilityState === "visible" && new Date().toISOString().slice(0, 7) !== period) {
        window.location.reload();
      }
    }
    document.addEventListener("visibilitychange", checkMonth);
    const t = setInterval(checkMonth, 60000);
    return () => { document.removeEventListener("visibilitychange", checkMonth); clearInterval(t); };
  }, [loaded, period]);

  // Enregistrement centralise : toute panne d'ecriture devient visible a l'ecran
  // au lieu d'etre ignoree en silence.
  const [saveError, setSaveError] = useState("");
  async function persist(key, value) {
    const err = await saveShared(key, value);
    setSaveError(err ? err : "");
    return err;
  }

  useEffect(() => { if (loaded) persist("kbs:team", team); }, [team, loaded]);
  useEffect(() => { if (loaded) persist("kbs:goal", goal); }, [goal, loaded]);
  useEffect(() => { if (loaded) persist("kbs:prospects", prospects); }, [prospects, loaded]);
  useEffect(() => { if (loaded) persist("kbs:kanban", kanban); }, [kanban, loaded]);
  useEffect(() => { if (loaded) persist("kbs:checks", checks); }, [checks, loaded]);
  useEffect(() => { if (loaded) persist("kbs:links", links); }, [links, loaded]);
  useEffect(() => { if (loaded) persist("kbs:caisse", caisse); }, [caisse, loaded]);
  useEffect(() => { if (loaded) persist("kbs:expenses", expenses); }, [expenses, loaded]);
  useEffect(() => { if (loaded) persist("kbs:dettes", dettes); }, [dettes, loaded]);
  useEffect(() => { if (loaded) persist("kbs:prospection", prospection); }, [prospection, loaded]);
  useEffect(() => { if (loaded) persist("kbs:dispos", dispos); }, [dispos, loaded]);
  useEffect(() => { if (loaded) persist("kbs:codes", codes); }, [codes, loaded]);
  useEffect(() => { if (loaded) persist("kbs:agency", agency); }, [agency, loaded]);
  useEffect(() => { if (loaded) persist("kbs:devis", devis); }, [devis, loaded]);
  useEffect(() => { if (loaded) persist("kbs:factures", factures); }, [factures, loaded]);
  useEffect(() => { if (loaded) persist("kbs:content", content); }, [content, loaded]);
  useEffect(() => { if (loaded) persist("kbs:products", products); }, [products, loaded]);
  useEffect(() => { if (loaded) persist("kbs:stockMoves", stockMoves); }, [stockMoves, loaded]);
  useEffect(() => { if (loaded) persist("kbs:guides", guides); }, [guides, loaded]);
  useEffect(() => { if (loaded) persist("kbs:formationLiens", formationLiens); }, [formationLiens, loaded]);
  useEffect(() => { if (loaded) persist("kbs:pricing", pricing); }, [pricing, loaded]);
  useEffect(() => { if (loaded) persist("kbs:commissionRate", commissionRate); }, [commissionRate, loaded]);
  useEffect(() => { if (loaded) persist("kbs:archives", archives); }, [archives, loaded]);
  useEffect(() => { if (loaded) persist("kbs:period", period); }, [period, loaded]);

  const totalCA = useMemo(() => prospects.reduce((s, p) => s + (Number(p.montant) || 0), 0), [prospects]);
  const servicesCatalogue = useMemo(() => buildServicesCatalogue(pricing), [pricing]);
  const allServicesFlat = useMemo(() => buildAllServicesFlat(pricing), [pricing]);
  const totalCommission = useMemo(() => totalCommissionOf(prospects, team, commissionRate), [prospects, team, commissionRate]);
  const totalDepenses = useMemo(() => expenses.reduce((s, e) => s + (Number(e.montant) || 0), 0), [expenses]);
  const beneficeNet = totalCA - totalCommission - totalDepenses;
  const pct = Math.min(100, Math.round((totalCA / (goal || 1)) * 100));

  // ------- Archives mensuelles -------
  const currentMonth = () => new Date().toISOString().slice(0, 7); // "AAAA-MM"

  // Photographie figee du mois : clients & CA, tresorerie & depenses, dettes, objectif atteint.
  function buildSnapshot(periodLabel) {
    const byMember = team.map(m => {
      const mine = prospects.filter(p => p.owner === m.id);
      const ca = mine.reduce((s, p) => s + (Number(p.montant) || 0), 0);
      const rate = memberRate(team, m.id, commissionRate);
      return { id: m.id, name: m.name, color: m.color, rate, ca, commission: ca * rate / 100, clients: mine.length };
    });
    return {
      // Identifiant stable : deux appareils qui archivent le meme contenu produisent
      // la meme archive (pas de doublon), et chaque archive a sa propre ligne en base.
      id: `${periodLabel}-${prospects.length}-${expenses.length}-${dettes.length}-${totalCA}`,
      period: periodLabel,
      closedAt: new Date().toISOString(),
      goal, commissionRate,
      totalCA, totalCommission, totalDepenses, beneficeNet,
      pctObjectif: Math.min(100, Math.round((totalCA / (goal || 1)) * 100)),
      clients: prospects, expenses, dettes, byMember,
    };
  }

  // Archive le mois indique (sans rien effacer). Ne fait rien s'il n'y a aucune donnee.
  // On empile les archives (jamais d'ecrasement) mais on ignore un instantane identique
  // deja present (protege contre un double-appel, ex. React StrictMode en developpement).
  function archiveMonth(periodLabel) {
    const label = periodLabel || period || currentMonth();
    if (!(prospects.length || expenses.length || dettes.length)) return;
    const snap = buildSnapshot(label);
    // Ligne dediee en base : meme si la liste "kbs:archives" etait un jour ecrasee,
    // l'archive reste recuperable (elle est refusionnee au chargement).
    saveShared(`archive:${snap.id}`, snap).then(err => { if (err) setSaveError(err); });
    setArchives(prev => {
      const exists = (prev || []).some(a =>
        a.id === snap.id || (a.period === label && a.totalCA === snap.totalCA &&
        (a.clients || []).length === snap.clients.length &&
        (a.expenses || []).length === snap.expenses.length &&
        (a.dettes || []).length === snap.dettes.length));
      if (exists) return prev;
      return [...(prev || []), snap].sort((a, b) => a.period.localeCompare(b.period));
    });
  }
  // Recree l'archive d'un mois a partir de clients retrouves (outil de recuperation).
  function restoreArchive(periodLabel, clients) {
    const ca = clients.reduce((s, p) => s + (Number(p.montant) || 0), 0);
    const com = totalCommissionOf(clients, team, commissionRate);
    const byMember = team.map(m => {
      const mine = clients.filter(p => p.owner === m.id);
      const mca = mine.reduce((s, p) => s + (Number(p.montant) || 0), 0);
      const rate = memberRate(team, m.id, commissionRate);
      return { id: m.id, name: m.name, color: m.color, rate, ca: mca, commission: mca * rate / 100, clients: mine.length };
    });
    const snap = {
      id: `${periodLabel}-recupere-${clients.length}-${ca}`,
      period: periodLabel, closedAt: new Date().toISOString(), recovered: true,
      goal, commissionRate, totalCA: ca, totalCommission: com, totalDepenses: 0, beneficeNet: ca - com,
      pctObjectif: Math.min(100, Math.round((ca / (goal || 1)) * 100)),
      clients, expenses: [], dettes: [], byMember,
    };
    saveShared(`archive:${snap.id}`, snap).then(err => { if (err) setSaveError(err); });
    setArchives(prev => [...(prev || []).filter(a => a.id !== snap.id), snap].sort((a, b) => a.period.localeCompare(b.period)));
  }
  // Correction d'une archive : recalcule tous les totaux a partir de son contenu.
  function updateArchive(a) {
    const clients = a.clients || [], exps = a.expenses || [];
    const ca = clients.reduce((s, p) => s + (Number(p.montant) || 0), 0);
    const com = totalCommissionOf(clients, team, a.commissionRate ?? commissionRate);
    const dep = exps.reduce((s, e) => s + (Number(e.montant) || 0), 0);
    const byMember = team.map(m => {
      const mine = clients.filter(p => p.owner === m.id);
      const mca = mine.reduce((s, p) => s + (Number(p.montant) || 0), 0);
      const rate = memberRate(team, m.id, commissionRate);
      return { id: m.id, name: m.name, color: m.color, rate, ca: mca, commission: mca * rate / 100, clients: mine.length };
    });
    const next = { ...a, totalCA: ca, totalCommission: com, totalDepenses: dep, beneficeNet: ca - com - dep,
      pctObjectif: Math.min(100, Math.round((ca / (a.goal || goal || 1)) * 100)), byMember, editedAt: new Date().toISOString() };
    if (next.id) saveShared(`archive:${next.id}`, next).then(err => { if (err) setSaveError(err); });
    setArchives(prev => (prev || []).map(x => (x.id || x.period) === (a.id || a.period) ? next : x));
  }
  async function deleteArchive(a) {
    // Copie complete d'abord (Sauvegardes & historique -> « Avant suppression d'archive ») :
    // une archive supprimee par erreur se restaure en un clic.
    const err = await backupNow("avant-suppression");
    if (err) { setSaveError("Suppression annulée : sauvegarde impossible (" + err + ")"); return; }
    setArchives(prev => (prev || []).filter(x => (x.id || x.period) !== (a.id || a.period)));
    if (a.id) deleteShared(`archive:${a.id}`);
  }

  // Ce qui continue sur le nouveau mois apres archivage :
  //  - un client qui a verse une avance et doit encore le solde -> reporte avec
  //    seulement le reste a payer (le deja-paye reste compte dans le mois archive) ;
  //  - un prospect pas encore paye et pas perdu -> reste dans le CRM ;
  //  - une dette pas encore payee -> reste a suivre.
  function carryOverProspects(list, fromLabel) {
    return (list || []).flatMap(p => {
      const paye = Number(p.montant) || 0;
      const reste = resteAPayer(p);
      if (reste > 0 && paye > 0) {
        return [{ ...p, prixTotal: reste, paiements: [], montant: "", dejaPaye: (Number(p.dejaPaye) || 0) + paye, reportDe: fromLabel, statut: "En discussion" }];
      }
      if (paye === 0 && p.statut !== "Perdu" && p.statut !== "Payé") return [p];
      return [];
    });
  }
  function startNewMonth(fromLabel) {
    setProspects(prev => carryOverProspects(prev, fromLabel));
    setExpenses([]);
    setDettes(prev => (prev || []).filter(d => d.statut !== "Payée"));
  }

  // Bascule automatique de mois : on archive le mois ecoule puis on remet les compteurs a zero.
  useEffect(() => {
    if (!loaded) return;
    const now = currentMonth();
    if (!period) { setPeriod(now); return; }   // Tout premier lancement : on marque le mois courant.
    if (period === now) return;                  // Toujours le meme mois : rien a faire.
    // Copie de securite complete juste avant la bascule (jamais ecrasee).
    saveShared(`backup:avant-bascule:${period}:${Date.now()}`, { savedAt: new Date().toISOString(), period, prospects, expenses, dettes, archives });
    archiveMonth(period);                        // Nouveau mois -> on fige le mois precedent...
    startNewMonth(period);                       // ...puis on repart a zero (sauf soldes/dettes en cours).
    setPeriod(now);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, period]);

  // --- Notifications non-lues (pastilles + pastille systeme facon WhatsApp) ---
  useEffect(() => {
    try { localStorage.setItem("kbs:unread", JSON.stringify(unread)); } catch (e) {}
    const total = Object.values(unread).reduce((s, n) => s + (Number(n) || 0), 0);
    setAppBadge(total);
  }, [unread]);

  // Notification recue alors que l'appli est ouverte -> son interne + pastille d'onglet.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    function onMsg(e) {
      const d = e.data || {};
      if (d.type !== "kbs-push") return;
      const url = d.url || "";
      const tid = d.tabId || (url.includes("#") ? url.split("#")[1] : "") || "general";
      playChime();
      const onThisTab = document.visibilityState === "visible" && tabRef.current === tid;
      if (!onThisTab) setUnread(u => ({ ...u, [tid]: (u[tid] || 0) + 1 }));
    }
    navigator.serviceWorker.addEventListener("message", onMsg);
    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
  }, []);

  // Ouvrir un onglet efface ses non-lus.
  useEffect(() => {
    if (!unlocked) return;
    setUnread(u => (u[tab] ? { ...u, [tab]: 0 } : u));
  }, [tab, unlocked]);

  function resetAllData() {
    archiveMonth(period || currentMonth()); // On garde une trace avant d'effacer.
    setProspects([]);
    setKanban({ todo: [], doing: [], review: [], done: [] });
    setChecks({});
    setLinks([]);
    setCaisse({ ops: [], debts: [] });
    setExpenses([]);
    setDettes([]);
    setProspection([]);
    setDispos({});
    setDevis([]);
    setGoal(250000);
    setPeriod(currentMonth());
  }

  // --- Sauvegardes ---
  // Copie a jour de toutes les donnees (lue par les sauvegardes, sans dependre des closures).
  snapshotRef.current = { team, goal, prospects, kanban, checks, links, caisse, expenses, dettes, prospection, dispos, codes, agency, devis, factures, content, products, stockMoves, guides, formationLiens, pricing, archives, period, commissionRate };
  async function backupNow(kind = "manuelle") {
    if (!loaded) return "Données pas encore chargées";
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const key = kind === "jour" ? `backup:${day}` : `backup:${kind}:${day}:${now.getTime()}`;
    const by = (team.find(m => m.id === currentUser) || {}).name || "";
    return await saveShared(key, { savedAt: now.toISOString(), kind, by, ...snapshotRef.current });
  }
  // Restaure une sauvegarde : copie de securite des donnees actuelles d'abord, puis
  // reecriture de chaque module et rechargement. Le mois en cours n'est pas touche.
  async function restoreBackup(data) {
    const first = await backupNow("avant-restauration");
    if (first) return first;
    for (const k of BACKUP_KEYS) {
      if (data[k] === undefined) continue;
      const err = await saveShared(`kbs:${k}`, data[k]);
      if (err) return err;
    }
    window.location.reload();
    return null;
  }
  // Sauvegarde du jour aussi quand l'appli reste ouverte d'un jour a l'autre.
  useEffect(() => {
    if (!loaded) return;
    async function daily() {
      const today = new Date().toISOString().slice(0, 10);
      if (lastDailyBackupRef.current === today) return;
      const fails = [];
      const existing = await loadShared(`backup:${today}`, null, fails);
      if (fails.length) return; // lecture impossible : on reessaiera plus tard
      if (existing || !(await backupNow("jour"))) lastDailyBackupRef.current = today;
    }
    const onVis = () => { if (document.visibilityState === "visible") daily(); };
    document.addEventListener("visibilitychange", onVis);
    const t = setInterval(daily, 15 * 60 * 1000);
    return () => { document.removeEventListener("visibilitychange", onVis); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Cloture manuelle d'un mois (CEO) : archive les chiffres actuels sous le mois choisi
  // (ex. "2026-08" pour Aout) puis remet a zero les compteurs du mois. Ne touche ni a
  // l'equipe, ni aux tarifs, ni au Kanban : seulement CA/clients, tresorerie, dettes.
  function closeMonthManually(monthLabel) {
    const label = monthLabel || period || currentMonth();
    backupNow("avant-cloture"); // copie complete juste avant de remettre les compteurs a zero
    archiveMonth(label);
    startNewMonth(label);
    setPeriod(currentMonth());
  }

  const TAB_META = {
    vendre: { label: "Vendre", icon: ShoppingBag },
    stock: { label: "Produits & stock", icon: Box },
    objectif: { label: "Objectif", icon: Target },
    dispos: { label: "Planning", icon: CalendarCheck },
    kanban: { label: "Tâches", icon: LayoutGrid },
    crm: { label: "Clients & CRM", icon: Users },
    devis: { label: "Devis", icon: FileText },
    factures: { label: "Factures", icon: Receipt },
    tresorerie: { label: "Finances", icon: Banknote },
    dettes: { label: "Dettes & Rappels", icon: AlertTriangle },
    tarifs: { label: "Tarifs & services", icon: Wallet },
    cible: { label: "Cible", icon: MessageSquare },
    copywriting: { label: "Laboratoire Copywriting", icon: Flame },
    prospection: { label: "Prospection Réseaux", icon: Radar },
    terrain: { label: "Prospection Terrain", icon: MapPin },
    outils: { label: "Boîte à outils IA", icon: Sparkles },
    academie: { label: "Académie Gratuite", icon: GraduationCap },
    plan: { label: "Plan 30 jours", icon: CalendarDays },
    liens: { label: "Liens partagés", icon: Link2 },
    adminEquipe: { label: "Équipe", icon: Users },
    adminDiagnostics: { label: "Diagnostics IA", icon: Sparkles },
    adminCodes: { label: "Codes d'accès", icon: KeyRound },
    adminAgence: { label: "Agence", icon: MapPin },
    adminTarifs: { label: "Tarifs", icon: Banknote },
    adminFormation: { label: "Formation", icon: BookOpen },
    adminCaisse: { label: "Caisse Perso", icon: Wallet },
    adminRecup: { label: "Récupération", icon: History },
    adminSauvegardes: { label: "Sauvegardes & historique", icon: Save },
    adminReset: { label: "Clôture & remise à zéro", icon: Archive },
    formation: { label: "Formation", icon: BookOpen },
    archives: { label: "Archives", icon: Archive },
    calendrier: { label: "Calendrier", icon: CalendarDays },
  };

  // Familles de modules (menu, menu lateral, sous-navigation).
  const CATEGORIES = [
    { id: "ventes", label: "Ventes & finances", icon: Wallet, tabs: ["vendre", "crm", "calendrier", "devis", "factures", "tresorerie", "dettes", "archives"] },
    { id: "produits", label: "Produits", icon: Box, tabs: ["stock", "tarifs"] },
    { id: "pilotage", label: "Équipe & pilotage", icon: Target, tabs: ["objectif", "kanban", "dispos"] },
    { id: "marketing", label: "Marketing", icon: Flame, tabs: ["cible", "copywriting", "prospection", "terrain"] },
    { id: "ressources", label: "Ressources", icon: Sparkles, tabs: ["outils", "academie", "plan", "liens", "formation"] },
    { id: "admin", label: "Administration", icon: Shield, tabs: ["adminEquipe", "adminAgence", "adminCodes", "adminTarifs", "adminFormation", "adminDiagnostics", "adminCaisse", "adminSauvegardes", "adminRecup", "adminReset"] },
  ];
  const catOf = (t) => (CATEGORIES.find(c => c.tabs.includes(t)) || {}).id || "";
  const category = catOf(tab);
  // Ecran actif dans la barre du bas / le menu lateral.
  const navActive = tab === "accueil" ? "accueil" : tab === "crm" ? "crm" : tab === "vendre" ? "vendre" : tab === "stock" ? "stock" : tab === "menu" ? "menu" : "";

  function go(t) { setTab(t); try { window.scrollTo({ top: 0 }); } catch (e) {} }

  // Ouvre l'onglet Factures avec une facture pre-remplie.
  function openFactureDraft(draftData) {
    setFactureDraft(draftData);
    go("factures");
  }
  function clientToFacture(p) {
    const prix = prixTotalOf(p) || Number(p.montant) || 0;
    const items = (p.achats || []).length
      ? p.achats.flatMap(a => a.items || []).map(it => ({ label: it.label, qte: it.qte, prix: it.prix }))
      : [{ label: p.pack || "Prestation", qte: 1, prix }];
    openFactureDraft({
      linkedId: String(p.id), clientNom: clientFullName(p), whatsapp: p.whatsapp || "", email: p.email || "",
      adresse: [p.adresse, p.quartier].filter(Boolean).join(", "), objet: p.pack || "",
      items,
      // Les versements deja recus dans le CRM apparaissent comme reglements de la facture.
      paiements: paymentsOf(p).map(x => ({ ...x, mode: x.mode || "", recNumero: x.recNumero })),
    });
  }
  function devisToFacture(d) {
    const { id, numero, statut, validite, acompte, ...rest } = d;
    openFactureDraft({ ...rest, devisNumero: numero, date: new Date().toISOString().slice(0, 10) });
    setDevis(prev => prev.map(x => x.id === d.id ? { ...x, statut: "Accepté" } : x));
  }

  // Ouvre directement le bon onglet quand l'appli est lancée depuis une notification (#tabId)
  useEffect(() => {
    if (!loaded || !unlocked) return;
    const hash = window.location.hash.replace("#", "");
    if (hash && (TAB_META[hash] || ["accueil", "menu"].includes(hash))) setTab(hash);
  }, [loaded, unlocked]);

  const me = team.find(m => m.id === currentUser) || null;
  const lowStock = products.filter(p => p.suiviStock !== false && Number(p.seuil) > 0 && (Number(p.stock) || 0) <= Number(p.seuil));
  const facturesRetard = factures.filter(f => /retard/.test(factureStatut(f)));
  const totalReste = prospects.reduce((s, p) => s + resteAPayer(p), 0);
  const unreadOf = (tabs) => tabs.reduce((s, t) => s + (unread[t] || 0), 0);
  const pageTitle = tab === "accueil" ? "Accueil" : tab === "menu" ? "Menu" : (TAB_META[tab] || {}).label || "";

  const BOTTOM = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "crm", label: "Clients", icon: Users },
    { id: "vendre", label: "Vendre", icon: Plus, fab: true },
    { id: "stock", label: "Stock", icon: Box },
    { id: "menu", label: "Menu", icon: MenuIcon },
  ];
  const SIDE = [
    { id: "accueil", label: "Tableau de bord", icon: Home },
    { id: "crm", label: "Clients & CRM", icon: Users },
    { id: "stock", label: "Produits & stock", icon: Box },
    { id: "factures", label: "Devis & factures", icon: FileText, also: ["devis"] },
    { id: "calendrier", label: "Calendrier", icon: CalendarDays },
    { id: "tresorerie", label: "Finances", icon: BarChart3, also: ["dettes", "archives"] },
    { id: "kanban", label: "Équipe & tâches", icon: LayoutGrid, also: ["objectif", "dispos"] },
    { id: "cible", label: "Marketing", icon: Flame, also: ["copywriting", "prospection", "terrain"] },
    { id: "outils", label: "Ressources", icon: Sparkles, also: ["academie", "plan", "liens", "formation"] },
    { id: "menu", label: "Tous les modules", icon: MenuIcon },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Figtree, sans-serif", fontSize: 14 }}>
      <style>{FONT_IMPORT}</style>
      {upd.ready && <UpdateBanner onApply={upd.apply} />}

      {!loaded ? (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13, padding: 24, textAlign: "center" }}>
          <AppIcon size={64} />
          {loadError ? (<>
            <AlertTriangle size={26} color={C.rustLight} />
            <div style={{ color: C.text, maxWidth: 360 }}>{loadError}</div>
            <button onClick={() => setLoadAttempt(n => n + 1)} style={{ ...btnGold, width: "auto", padding: "12px 20px" }}><RefreshCw size={14} /> Réessayer</button>
          </>) : "Chargement de KBS Gestion…"}
        </div>
      ) : !unlocked ? (
        <LoginScreen codes={codes} team={team} agency={agency} onUnlock={(uid) => { setCurrentUser(uid); setUnlocked(true); setTab("accueil"); }} />
      ) : (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* MENU LATERAL (ordinateur) */}
        <aside className="kbs-side" style={{ width: 250, flexShrink: 0, background: C.surf, borderRight: `1px solid ${C.border}`, padding: "22px 14px", flexDirection: "column", gap: 3, position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 6px 14px" }}>
            <AppIcon size={42} />
            <div>
              <div><AppWordmark size={18} /></div>
              <div style={{ color: C.muted, fontSize: 11.5 }}>KBS Digital Agency</div>
            </div>
          </div>
          <button onClick={() => go("vendre")} className="kbs-tap" style={{ ...btnGold, background: "linear-gradient(160deg,#FDB402,#F39200 55%,#FD5C01)", margin: "6px 0 12px", fontSize: 15 }}><Plus size={17} /> Nouvelle vente</button>
          {SIDE.map(it => {
            const Icon = it.icon;
            const on = tab === it.id || (it.also || []).includes(tab);
            const n = unreadOf([it.id, ...(it.also || [])]);
            return (
              <button key={it.id} onClick={() => go(it.id)} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 12px", borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", fontWeight: 600, fontSize: 14, background: on ? "rgba(243,146,0,.14)" : "transparent", color: on ? C.goldLight : C.muted, position: "relative" }}>
                <Icon size={19} /> {it.label}
                {n > 0 && <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 9, background: C.gold, color: "#011B45", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 5px" }}>{n}</span>}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 3 }}>
            <button onClick={() => go("adminAgence")} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 12px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: category === "admin" ? "rgba(243,146,0,.14)" : "transparent", color: category === "admin" ? C.goldLight : C.muted }}><Settings size={19} /> Réglages</button>
            <button onClick={() => (upd.ready ? upd.apply() : go("menu"))} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 12px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: upd.ready ? "rgba(243,146,0,.14)" : "transparent", color: upd.ready ? C.goldLight : C.muted }}><RefreshCw size={19} /> {upd.ready ? "Mettre à jour l'app" : "Mise à jour"}</button>
            <button onClick={() => setUnlocked(false)} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 12px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: "transparent", color: C.muted }}><LogOut size={19} /> Déconnexion{me ? ` (${me.name})` : ""}</button>
          </div>
        </aside>

        <div className="kbs-main" style={{ flex: 1, minWidth: 0 }}>
          {/* EN-TETE */}
          <header className="kbs-header" style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(6,20,48,.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {tab !== "accueil" ? (
                  <button onClick={() => go(tab === "menu" ? "accueil" : (BOTTOM.some(b => b.id === tab) ? "accueil" : "menu"))} aria-label="Retour" className="kbs-mobile-only" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><ChevronLeft size={20} /></button>
                ) : (
                  <span className="kbs-mobile-only"><AppIcon size={40} /></span>
                )}
                <div style={{ minWidth: 0 }}>
                  {tab === "accueil" && <div style={{ color: C.muted, fontSize: 12 }}>Bonjour{me ? ` ${me.name}` : ""}</div>}
                  <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: tab === "accueil" ? 19 : 21, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tab === "accueil" ? "KBS Gestion" : pageTitle}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => go("menu")} aria-label="Tous les modules" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
                  <Bell size={19} />
                  {Object.values(unread).some(n => n > 0) && <span style={{ position: "absolute", top: 8, right: 9, width: 9, height: 9, borderRadius: "50%", background: C.gold, boxShadow: `0 0 0 2px ${C.card}` }} />}
                </button>
                <button onClick={() => setUnlocked(false)} aria-label="Déconnexion" className="kbs-mobile-only" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><LogOut size={18} /></button>
              </div>
            </div>
          </header>

          <NotificationBanner />

          {saveError && (
            <div style={{ background: "rgba(255,122,107,0.16)", borderBottom: `1px solid ${C.rust}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={15} color={C.rustLight} />
              <div style={{ fontSize: 12.5, color: C.rustLight, flex: 1 }}>Enregistrement échoué — tes modifications ne sont pas sauvegardées. ({saveError})</div>
              <button onClick={() => setSaveError("")} aria-label="Fermer" style={{ background: "none", border: "none", color: C.rustLight, cursor: "pointer" }}><X size={14} /></button>
            </div>
          )}

          <div className="kbs-content" style={{ padding: 16, maxWidth: ["accueil", "vendre", "stock", "menu", "calendrier", "crm"].includes(tab) ? 1240 : 1000, margin: "0 auto", boxSizing: "border-box" }}>
            {/* Sous-navigation : les autres ecrans de la meme famille */}
            {category && tab !== "vendre" && CATEGORIES.find(c => c.id === category).tabs.length > 1 && (
              <div className="kbs-navbar" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14, paddingBottom: 2 }}>
                {CATEGORIES.find(c => c.id === category).tabs.map(tid => {
                  const on = tab === tid;
                  const n = unread[tid] || 0;
                  return (
                    <button key={tid} onClick={() => go(tid)} style={{ flex: "none", padding: "8px 13px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: on ? C.text : C.card, color: on ? C.bg : C.muted, position: "relative" }}>
                      {TAB_META[tid].label}{n > 0 && <span style={{ marginLeft: 5, color: C.gold }}>•{n}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "accueil" && <TabAccueil go={go} totalCA={totalCA} totalReste={totalReste} goal={goal} pct={pct} beneficeNet={beneficeNet} lowStock={lowStock} facturesRetard={facturesRetard} kanban={kanban} prospects={prospects} />}
            {tab === "menu" && <TabMenu go={go} categories={CATEGORIES} meta={TAB_META} unread={unread} me={me} onLogout={() => setUnlocked(false)} upd={upd} />}
            {tab === "vendre" && <TabVendre pricing={pricing} products={products} setProducts={setProducts} stockMoves={stockMoves} setStockMoves={setStockMoves} prospects={prospects} setProspects={setProspects} team={team} currentUser={currentUser} codes={codes} agency={agency} go={go} />}
            {tab === "stock" && <TabStock pricing={pricing} products={products} setProducts={setProducts} stockMoves={stockMoves} setStockMoves={setStockMoves} team={team} currentUser={currentUser} />}
            {tab === "objectif" && <TabObjectif goal={goal} setGoal={setGoal} totalCA={totalCA} totalCommission={totalCommission} pct={pct} prospects={prospects} team={team} codes={codes} commissionRate={commissionRate} />}
            {tab === "dispos" && <TabDispos dispos={dispos} setDispos={setDispos} team={team} />}
            {tab === "kanban" && <TabKanban kanban={kanban} setKanban={setKanban} checks={checks} setChecks={setChecks} team={team} setTeam={setTeam} codes={codes} />}
            {tab === "crm" && <TabCRM prospects={prospects} setProspects={setProspects} totalCA={totalCA} totalCommission={totalCommission} team={team} codes={codes} agency={agency} pricing={pricing} servicesCatalogue={servicesCatalogue} commissionRate={commissionRate} onCreateFacture={clientToFacture} />}
            {tab === "devis" && <TabDocuments kind="devis" docs={devis} setDocs={setDevis} prospects={prospects} agency={agency} onConvert={devisToFacture} />}
            {tab === "factures" && <TabDocuments kind="facture" docs={factures} setDocs={setFactures} prospects={prospects} agency={agency} draft={factureDraft} onDraftUsed={() => setFactureDraft(null)} />}
            {tab === "tresorerie" && <TabTresorerie prospects={prospects} setProspects={setProspects} expenses={expenses} setExpenses={setExpenses} totalCA={totalCA} totalCommission={totalCommission} totalDepenses={totalDepenses} beneficeNet={beneficeNet} team={team} codes={codes} commissionRate={commissionRate} />}
            {tab === "dettes" && <TabDettes dettes={dettes} setDettes={setDettes} prospects={prospects} />}
            {tab === "tarifs" && <TabTarifs pricing={pricing} setPricing={setPricing} />}
            {tab === "calendrier" && <TabCalendrier prospects={prospects} expenses={expenses} archives={archives} factures={factures} team={team} />}
            {tab === "archives" && <TabArchives archives={archives} period={period} team={team} codes={codes} onDelete={deleteArchive} onUpdate={updateArchive} onCreate={(m) => restoreArchive(m, [])} />}
            {tab === "cible" && <TabCible content={content} setContent={setContent} />}
            {tab === "copywriting" && <TabCopywriting content={content} setContent={setContent} />}
            {tab === "prospection" && <TabProspection prospection={prospection} setProspection={setProspection} prospects={prospects} setProspects={setProspects} team={team} pricing={pricing} allServicesFlat={allServicesFlat} content={content} setContent={setContent} />}
            {tab === "terrain" && <TabProspectionTerrain agency={agency} content={content} setContent={setContent} />}
            {category === "ressources" && !ressourcesUnlocked ? (
              <Card style={{ textAlign: "center" }}>
                <MiniUnlock code={codes.ressources} label="Section Ressources — entre le code d'accès" onUnlock={() => setRessourcesUnlocked(true)} />
              </Card>
            ) : (
              <>
                {tab === "outils" && <TabOutils content={content} setContent={setContent} />}
                {tab === "academie" && <TabAcademie content={content} setContent={setContent} />}
                {tab === "plan" && <TabPlan content={content} setContent={setContent} />}
                {tab === "liens" && <TabLiens links={links} setLinks={setLinks} team={team} />}
                {tab === "formation" && <TabFormation team={team} codes={codes} guides={guides} formationLiens={formationLiens} />}
              </>
            )}
            {category === "admin" && <TabAdministration section={tab} caisse={caisse} setCaisse={setCaisse} team={team} setTeam={setTeam} codes={codes} setCodes={setCodes} onResetAll={resetAllData} onCloseMonth={closeMonthManually} onRestoreArchive={restoreArchive} onBackupNow={backupNow} onRestoreBackup={restoreBackup} currentMonth={currentMonth()} agency={agency} setAgency={setAgency} guides={guides} setGuides={setGuides} formationLiens={formationLiens} setFormationLiens={setFormationLiens} pricing={pricing} setPricing={setPricing} commissionRate={commissionRate} setCommissionRate={setCommissionRate} />}
          </div>
        </div>

        {/* BARRE DU BAS (telephone) */}
        <nav className="kbs-bottom" aria-label="Navigation principale" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, height: 78, background: C.surf, borderTop: `1px solid ${C.border}`, gridTemplateColumns: "repeat(5, minmax(0, 1fr))", alignItems: "end", padding: "0 6px calc(12px + env(safe-area-inset-bottom))" }}>
          {BOTTOM.map(b => {
            const Icon = b.icon;
            const on = navActive === b.id;
            const n = b.id === "crm" ? unreadOf(["crm"]) : b.id === "menu" ? Object.entries(unread).filter(([k]) => !["crm"].includes(k)).reduce((s, [, v]) => s + (v || 0), 0) : 0;
            return (
              <button key={b.id} onClick={() => go(b.id)} aria-label={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: on ? C.gold : C.muted, background: "none", border: "none", cursor: "pointer", position: "relative", padding: 0 }}>
                {b.fab ? (
                  <span style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(160deg,#FDB402,#F39200 55%,#FD5C01)", color: "#011B45", display: "grid", placeItems: "center", marginTop: -28, boxShadow: `0 0 0 6px ${C.bg}, 0 10px 24px rgba(243,146,0,.45)` }}><Icon size={26} strokeWidth={2.4} /></span>
                ) : <Icon size={21} />}
                {b.label}
                {n > 0 && <span style={{ position: "absolute", top: -2, left: "58%", minWidth: 16, height: 16, borderRadius: 8, background: C.gold, color: "#011B45", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>{n}</span>}
              </button>
            );
          })}
        </nav>
      </div>
      )}
    </div>
  );
}

/* ---------------------------------- LOGIN SCREEN ---------------------------------- */
function LoginScreen({ onUnlock, codes, team, agency }) {
  const [who, setWho] = useState(team[0]?.id || "");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [mode, setMode] = useState("connexion"); // "connexion" | "inscription"
  const [mail, setMail] = useState("");
  const [authMsg, setAuthMsg] = useState(null);   // { ok, text }
  const [authBusy, setAuthBusy] = useState(false);
  const [pending, setPending] = useState(null);   // e-mail confirme mais pas encore autorise
  const member = team.find(m => m.id === who);

  // Au retour de Google ou du lien recu par e-mail, Supabase ouvre une session :
  // on rattache l'adresse a un membre de l'equipe (ou a l'agence = CEO). Sinon : en attente de validation.
  useEffect(() => {
    let alive = true;
    const check = (session) => {
      const em = (session?.user?.email || "").trim().toLowerCase();
      if (!alive || !em) return;
      const m = team.find(t => (t.email || "").trim().toLowerCase() === em);
      if (m) { onUnlock(m.id); return; }
      if ((agency?.email || "").trim().toLowerCase() === em) { onUnlock(team[0]?.id || null); return; }
      setPending(em); setMode("inscription");
    };
    supabase.auth.getSession().then(({ data }) => check(data?.session)).catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => check(session));
    return () => { alive = false; sub?.subscription?.unsubscribe(); };
  }, []);

  async function signUpGoogle() {
    setAuthBusy(true); setAuthMsg(null);
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin, queryParams: { prompt: "select_account" } } });
    if (e) { setAuthBusy(false); setAuthMsg({ ok: false, text: "Connexion Google impossible : " + e.message }); }
  }
  async function signUpLink() {
    const em = mail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setAuthMsg({ ok: false, text: "Entre une adresse e-mail valide." }); return; }
    setAuthBusy(true); setAuthMsg(null);
    const { error: e } = await supabase.auth.signInWithOtp({ email: em, options: { emailRedirectTo: window.location.origin, shouldCreateUser: true } });
    setAuthBusy(false);
    setAuthMsg(e ? { ok: false, text: "Envoi impossible : " + e.message } : { ok: true, text: `Lien envoyé à ${em}. Ouvre ta boîte Gmail (pense au dossier Spam) et clique sur le lien pour créer ton compte.` });
  }
  async function leavePending() { await supabase.auth.signOut().catch(() => {}); setPending(null); setMode("connexion"); setAuthMsg(null); }

  // Entree avec : le code personnel du membre choisi, le code general de l'outil, ou le code maitre.
  function tryUnlock() {
    const ok = (member && codeMatchesStrict(pwd, member.code)) || codeMatches(pwd, codes.app);
    if (ok) { setError(false); onUnlock(member ? member.id : null); }
    else setError(true);
  }
  const initials = (n) => { const w = (n || "?").trim().split(/\s+/); return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); };

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div aria-hidden="true" style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", border: "1px solid rgba(243,146,0,.22)", right: -240, top: -210 }} />
    <div className="kbs-login kbs-safe-top" style={{ width: "100%", padding: "48px 22px 30px", boxSizing: "border-box", position: "relative" }}>
      <div className="kbs-login-brand">
        <AppIcon size={96} style={{ borderRadius: 24, boxShadow: "0 18px 50px rgba(243,146,0,.25)" }} />
        <div>
          <AppWordmark size={52} />
          <div style={{ color: C.muted, fontSize: 18, marginTop: 10, maxWidth: 460, lineHeight: 1.5 }}>Ventes, stock, clients, factures et équipe de KBS Digital Agency, au même endroit.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
          {[[ShoppingBag, "Vendre produits, packs et services, avec reçu"], [Box, "Suivre le stock et savoir quoi racheter"], [CalendarDays, "Voir chaque journée : ventes et dépenses"], [Shield, "Sauvegarde automatique chaque jour"]].map(([Icon, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15 }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(243,146,0,.14)", color: C.goldLight, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={18} /></span>{t}
            </div>
          ))}
        </div>
      </div>
      <div className="kbs-login-form" style={{ width: "100%", maxWidth: 420, position: "relative", boxSizing: "border-box", margin: "0 auto" }}>
        <div className="kbs-login-head" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 38 }}>
          <AppIcon size={64} style={{ borderRadius: 15, boxShadow: "0 10px 30px rgba(243,146,0,.25)" }} />
          <div>
            <div><AppWordmark size={26} /></div>
            <div style={{ color: C.muted, fontSize: 12.5, marginTop: 3 }}>Ventes, stock, clients et équipe de l'agence</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, background: C.card, borderRadius: 14, padding: 4, marginBottom: 22 }}>
          {[["connexion", "Connexion"], ["inscription", "Inscription"]].map(([k, l]) => (
            <button key={k} onClick={() => { setMode(k); setAuthMsg(null); }} style={{ flex: 1, height: 40, border: "none", borderRadius: 11, cursor: "pointer", fontWeight: 700, fontSize: 14, background: mode === k ? C.gold : "transparent", color: mode === k ? "#011B45" : C.muted }}>{l}</button>
          ))}
        </div>

        {mode === "inscription" ? (<>
          {pending ? (<>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 22 }}>Compte créé ✓</div>
            <div style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.55, marginTop: 10 }}>
              Ton adresse <b style={{ color: C.text }}>{pending}</b> est confirmée. Pour entrer dans l'outil, le CEO doit d'abord associer cette adresse à ton profil (Administration → Équipe). Préviens-le, puis reviens ici.
            </div>
            <button onClick={leavePending} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 50, marginTop: 20 }}>Retour à la connexion</button>
          </>) : (<>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 22 }}>Créer mon compte</div>
            <button onClick={signUpGoogle} disabled={authBusy} className="kbs-tap" style={{ width: "100%", height: 54, marginTop: 18, borderRadius: 16, border: "none", background: "#fff", color: "#1f1f1f", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
              Continuer avec Google
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 12, margin: "18px 0" }}>
              <span style={{ flex: 1, height: 1, background: C.border }} />ou<span style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <label htmlFor="kbs-mail" style={{ display: "block", fontSize: 12.5, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Ton adresse Gmail</label>
            <input id="kbs-mail" type="email" inputMode="email" autoComplete="email" placeholder="nom@gmail.com" value={mail}
              onChange={e => { setMail(e.target.value); setAuthMsg(null); }}
              onKeyDown={e => { if (e.key === "Enter") signUpLink(); }}
              style={{ ...inputStyle, height: 52, fontSize: 16 }} />
            <button onClick={signUpLink} disabled={authBusy} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 54, marginTop: 14, fontSize: 15, opacity: authBusy ? .6 : 1 }}>Recevoir le lien d'inscription</button>
            {authMsg && <div role="status" style={{ marginTop: 14, fontSize: 13, lineHeight: 1.5, borderRadius: 14, padding: "12px 14px", background: authMsg.ok ? "rgba(92,192,140,.12)" : "rgba(221,106,84,.12)", color: authMsg.ok ? C.greenLight : C.rustLight }}>{authMsg.text}</div>}
          </>)}
        </>) : (<>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 22 }}>Qui se connecte ?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginTop: 14 }}>
          {team.map(m => (
            <button key={m.id} onClick={() => { setWho(m.id); setError(false); }} style={{ background: who === m.id ? "rgba(243,146,0,.10)" : C.card, border: `1.5px solid ${who === m.id ? C.gold : "transparent"}`, borderRadius: 16, padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: C.text, fontWeight: 600, fontSize: 12, cursor: "pointer", minWidth: 0 }}>
              <span style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 14, color: "#011B45", background: m.color || C.gold }}>{initials(m.name)}</span>
              <span style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
            </button>
          ))}
        </div>

        <label htmlFor="kbs-code" style={{ display: "block", fontSize: 12.5, color: C.muted, fontWeight: 600, margin: "22px 0 6px" }}>Ton code personnel{member ? ` (${member.name})` : ""}</label>
        <input id="kbs-code" type="password" autoFocus placeholder="Code" value={pwd}
          onChange={e => { setPwd(e.target.value); setError(false); }}
          onKeyDown={e => { if (e.key === "Enter") tryUnlock(); }}
          style={{ ...inputStyle, height: 52, fontSize: 18, letterSpacing: 4, textAlign: "center", fontWeight: 700 }} />
        {error && <div style={{ color: C.rustLight, fontSize: 12.5, marginTop: 6 }}>Code incorrect. Demande-le au CEO.</div>}
        <div style={{ color: C.muted, textAlign: "center", fontSize: 12, marginTop: 8 }}>Chaque membre a son code. Le code général de l'outil et le code maître fonctionnent aussi.</div>

        <button onClick={tryUnlock} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 54, marginTop: 20, fontSize: 15 }}>Entrer</button>
        </>)}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24, background: "rgba(92,192,140,.12)", borderRadius: 16, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.45 }}>
          <Shield size={20} color={C.greenLight} style={{ flexShrink: 0 }} />
          <span>Données sauvegardées chaque jour. Si la connexion coupe, rien n'est effacé.</span>
        </div>
        <div style={{ color: C.muted, textAlign: "center", fontSize: 11.5, marginTop: 28 }}>KBS Digital Agency · Bamako</div>
      </div>
    </div>
    </div>
  );
}

/* ---------------------------------- TAB: OBJECTIF ---------------------------------- */
function TabObjectif({ goal, setGoal, totalCA, totalCommission, pct, prospects, team, codes, commissionRate }) {
  const [ceoUnlocked, setCeoUnlocked] = useState(false);
  const r = 70, circ = 2 * Math.PI * r;
  const perPerson = team.map(m => {
    const ca = prospects.filter(p => p.owner === m.id).reduce((s, p) => s + (Number(p.montant) || 0), 0);
    const rate = memberRate(team, m.id, commissionRate);
    return { ...m, ca, rate, commission: ca * rate / 100 };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ textAlign: "center" }}>
        <Eyebrow>Objectif mensuel</Eyebrow>
        <div style={{ position: "relative", width: 180, height: 180, margin: "8px auto" }}>
          <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="90" cy="90" r={r} stroke={C.border} strokeWidth="14" fill="none" />
            <circle cx="90" cy="90" r={r} stroke={C.gold} strokeWidth="14" fill="none"
              strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 30, fontWeight: 800, color: C.goldLight }}>{pct}%</div>
            <div style={{ fontSize: 11, color: C.muted }}>de l'objectif</div>
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{fcfa(totalCA)} <span style={{ color: C.muted, fontWeight: 500 }}>/ {fcfa(goal)}</span></div>
        {ceoUnlocked ? (
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 12, color: C.muted }}>Modifier l'objectif :</label>
            <input type="number" value={goal} onChange={e => setGoal(Number(e.target.value))}
              style={{ width: 110, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "4px 8px", fontSize: 13 }} />
          </div>
        ) : (
          <MiniUnlock code={codes.ceo} label="Réservé au CEO" onUnlock={() => setCeoUnlocked(true)} />
        )}
      </Card>

      <Card>
        <Eyebrow>Performance par personne — taux officiel {commissionRate}%</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {perPerson.map(m => (
            <div key={m.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{m.name} <span style={{ color: C.muted, fontWeight: 500, fontSize: 11 }}>· {m.rate}%</span></span>
                <span style={{ color: C.muted }}>{fcfa(m.ca)}</span>
              </div>
              <div style={{ height: 6, background: C.cardAlt, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (m.ca / (goal || 1)) * 100)}%`, background: m.color }} />
              </div>
              {m.ca > 0 && <div style={{ fontSize: 11, color: C.greenLight, marginTop: 3 }}>Commission : {fcfa(m.commission)}</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------- TAB: CRM ---------------------------------- */
function TabCRM({ prospects, setProspects, totalCA, totalCommission, team, codes, agency, pricing, servicesCatalogue, commissionRate, onCreateFacture }) {
  const [form, setForm] = useState({
    nom: "", prenom: "", whatsapp: "", email: "", adresse: "", quartier: "",
    dateInscription: new Date().toISOString().slice(0, 10),
    pack: pricing.packs[0]?.name || "", statut: "À contacter", prixTotal: "", montant: "", owner: team[0]?.id || ""
  });
  const [catherineUnlocked, setCatherineUnlocked] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [payForm, setPayForm] = useState({ montant: "", date: new Date().toISOString().slice(0, 10), note: "", mode: PAY_MODES[0] });
  const [editingPay, setEditingPay] = useState(null);
  const [editingHist, setEditingHist] = useState(null);
  // Numero de recu sequentiel (REC-2026-0001...) calcule sur tous les versements existants.
  function nextRec(date, extra) {
    const all = [...prospects.flatMap(paymentsOf), ...(extra || [])].map(x => ({ numero: x.recNumero }));
    return nextNumero("REC", all, date);
  }

  function addProspect() {
    if (!form.nom.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const avance = Number(form.montant) || 0;
    const d0 = form.dateInscription || today;
    const paiements = avance > 0 ? [{ id: Date.now(), date: d0, montant: avance, mode: form.mode || PAY_MODES[0], recNumero: nextRec(d0), note: Number(form.prixTotal) > avance ? "Avance" : "Paiement" }] : [];
    setProspects([...prospects, withPayments({ ...form, id: Date.now(), historique: [] }, paiements)]);
    notifyTeam("Nouveau client 🎉", `${form.prenom || ""} ${form.nom}`.trim() + " vient d'être ajouté au CRM.", "crm");
    setForm({ nom: "", prenom: "", whatsapp: "", email: "", adresse: "", quartier: "", dateInscription: today, pack: pricing.packs[0]?.name || "", statut: "À contacter", prixTotal: "", montant: "", owner: team[0]?.id || "" });
  }
  function updateStatut(id, statut) {
    setProspects(prospects.map(p => p.id === id ? { ...p, statut } : p));
  }
  function removeProspect(p) {
    if (!confirmDelete(`le client « ${`${p.prenom || ""} ${p.nom}`.trim()} »`)) return;
    setProspects(prospects.filter(x => x.id !== p.id));
  }
  function saveProspectEdit(id, f) {
    // Le prix total peut changer : on recalcule le statut "Payé" a partir des versements.
    setProspects(prospects.map(p => p.id === id ? withPayments({ ...p, ...f }, paymentsOf(p)) : p));
    setEditingId(null);
  }
  function addPayment(p) {
    const m = Number(payForm.montant) || 0;
    if (m <= 0) return;
    const d0 = payForm.date || new Date().toISOString().slice(0, 10);
    const next = [...paymentsOf(p), { id: Date.now(), date: d0, montant: m, mode: payForm.mode, recNumero: nextRec(d0), note: payForm.note.trim() }];
    const updated = withPayments(p, next);
    setProspects(prospects.map(x => x.id === p.id ? updated : x));
    const reste = resteAPayer(updated);
    notifyTeam("Paiement reçu 💰", `${`${p.prenom || ""} ${p.nom}`.trim()} a versé ${fcfa(m)}${prixTotalOf(p) ? (reste > 0 ? ` — reste ${fcfa(reste)}` : " — soldé ✅") : ""}.`, "crm");
    setPayForm({ montant: "", date: new Date().toISOString().slice(0, 10), note: "", mode: PAY_MODES[0] });
  }
  function removePayment(p, payId) {
    if (!confirmDelete("ce versement")) return;
    const updated = withPayments(p, paymentsOf(p).filter(x => x.id !== payId));
    setProspects(prospects.map(x => x.id === p.id ? updated : x));
  }
  function savePayment(p, payId, f) {
    const updated = withPayments(p, paymentsOf(p).map(x => x.id === payId ? { ...x, ...f, montant: Number(f.montant) || 0 } : x));
    setProspects(prospects.map(x => x.id === p.id ? updated : x));
    setEditingPay(null);
  }
  function saveHistorique(pid, hid, note) {
    setProspects(prospects.map(p => p.id === pid ? { ...p, historique: (p.historique || []).map(h => h.id === hid ? { ...h, note } : h) } : p));
    setEditingHist(null);
  }
  const totalReste = prospects.reduce((s, p) => s + resteAPayer(p), 0);
  const [q, setQ] = useState("");
  const [filtre, setFiltre] = useState("Tous");
  const FILTRES = {
    "Tous": () => true,
    "Doivent": p => resteAPayer(p) > 0,
    "Prospects": p => !(Number(p.montant) > 0) && p.statut !== "Perdu",
    "Payés": p => Number(p.montant) > 0 && resteAPayer(p) === 0,
    "Ventes caisse": p => p.source === "vente",
  };
  const shown = prospects.filter(FILTRES[filtre]).filter(p => !q.trim() ||
    `${p.prenom || ""} ${p.nom || ""} ${p.whatsapp || ""} ${p.pack || ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  function addHistorique(id) {
    if (!noteText.trim()) return;
    setProspects(prospects.map(p => p.id === id
      ? { ...p, historique: [...(p.historique || []), { id: Date.now(), date: new Date().toISOString().slice(0, 10), note: noteText }] }
      : p));
    setNoteText("");
  }
  function removeHistorique(pid, hid) {
    if (!confirmDelete("cette note")) return;
    setProspects(prospects.map(p => p.id === pid ? { ...p, historique: (p.historique || []).filter(h => h.id !== hid) } : p));
  }

  const statuts = ["À contacter", "En discussion", "Audit envoyé", "Devis envoyé", "Payé", "Perdu"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        <Eyebrow>Ajouter un client / prospect</Eyebrow>
        {catherineUnlocked ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input placeholder="Numéro WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={inputStyle} />
            <input placeholder="Email (optionnel)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Quartier" value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>Date d'inscription :</label>
              <input type="date" value={form.dateInscription} onChange={e => setForm({ ...form, dateInscription: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <select value={form.pack} onChange={e => setForm({ ...form, pack: e.target.value })} style={inputStyle}>
              {servicesCatalogue.map(g => (
                <optgroup key={g.groupe} label={g.groupe}>
                  {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                </optgroup>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ flex: 1, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 3 }}>
                Prix total du service (FCFA)
                <input type="number" placeholder="Ex : 25000" value={form.prixTotal} onChange={e => setForm({ ...form, prixTotal: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ flex: 1, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 3 }}>
                Payé maintenant / avance (FCFA)
                <input type="number" placeholder="Ex : 15000" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} style={inputStyle} />
              </label>
            </div>
            {Number(form.montant) > 0 && (
              <select value={form.mode || PAY_MODES[0]} onChange={e => setForm({ ...form, mode: e.target.value })} style={inputStyle}>
                {PAY_MODES.map(m => <option key={m} value={m}>Payé par : {m}</option>)}
              </select>
            )}
            {Number(form.prixTotal) > 0 && (
              <div style={{ fontSize: 11.5, color: Number(form.montant) >= Number(form.prixTotal) ? C.greenLight : C.goldLight }}>
                {Number(form.montant) >= Number(form.prixTotal)
                  ? "✓ Paiement complet."
                  : `Reste à payer : ${fcfa(Number(form.prixTotal) - (Number(form.montant) || 0))} — tu pourras ajouter le solde plus tard dans la fiche du client.`}
              </div>
            )}
            <button onClick={addProspect} style={btnGold}><Plus size={14} /> Ajouter le client</button>
          </div>
        ) : (
          <MiniUnlock code={codes.catherine} label="Réservé à Catherine" onUnlock={() => setCatherineUnlocked(true)} />
        )}
      </Card>

      <div style={{ display: "flex", gap: 10 }}>
        <Card style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>CA encaissé</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.goldLight }}>{fcfa(totalCA)}</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>Total commissions (par membre)</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.greenLight }}>{fcfa(totalCommission)}</div>
        </Card>
      </div>
      {totalReste > 0 && (
        <Card style={{ textAlign: "center", borderColor: C.gold }}>
          <div style={{ fontSize: 11, color: C.muted }}>Reste à encaisser (avances en cours)</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.goldLight }}>{fcfa(totalReste)}</div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 48, borderRadius: 15, border: `1px solid ${C.border}`, background: C.surf, padding: "0 14px", color: C.muted }}>
          <Search size={18} />
          <input placeholder="Nom, WhatsApp ou service" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontSize: 14, outline: "none", minWidth: 0 }} />
        </div>
        <div className="kbs-navbar" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 4 }}>
          {Object.keys(FILTRES).map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={{ flex: "none", padding: "8px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: filtre === f ? C.text : C.card, color: filtre === f ? C.bg : C.muted }}>
              {f}<b style={{ marginLeft: 5, color: C.gold }}>{prospects.filter(FILTRES[f]).length}</b>
            </button>
          ))}
        </div>
        {prospects.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucun client pour l'instant. Ajoute le premier ci-dessus.</div>}
        {prospects.length > 0 && shown.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucun client ne correspond.</div>}
        {shown.slice().reverse().map(p => {
          const expanded = expandedId === p.id;
          const editing = editingId === p.id;
          const payStatus = paymentStatus(p);
          const reste = resteAPayer(p);
          return (
          <Card key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div onClick={() => setExpandedId(expanded ? null : p.id)} style={{ cursor: "pointer", flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.prenom} {p.nom}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{p.whatsapp} · {p.pack}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Suivi par : {team.find(m => m.id === p.owner)?.name}</div>
                {p.reportDe && <div style={{ fontSize: 11, color: C.goldLight }}>↪ Reporté de {p.reportDe}{p.dejaPaye ? ` (déjà payé ${fcfa(p.dejaPaye)} avant)` : ""}</div>}
                {!expanded && <div style={{ fontSize: 11, color: C.gold, marginTop: 4 }}>📄 Fiche, paiements, reçu WhatsApp & historique →</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {catherineUnlocked && (
                  <EditDeleteButtons editing={editing}
                    onEdit={() => setEditingId(editing ? null : p.id)}
                    onDelete={() => removeProspect(p)} />
                )}
                <button onClick={() => setExpandedId(expanded ? null : p.id)} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer" }}>
                  {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>
            {editing && (
              <EditFields
                value={{ nom: p.nom || "", prenom: p.prenom || "", whatsapp: p.whatsapp || "", email: p.email || "", adresse: p.adresse || "", quartier: p.quartier || "", dateInscription: p.dateInscription || "", pack: p.pack || "", owner: p.owner || "", prixTotal: p.prixTotal ?? "" }}
                fields={[
                  { key: "nom", label: "Nom" },
                  { key: "prenom", label: "Prénom" },
                  { key: "whatsapp", label: "WhatsApp" },
                  { key: "email", label: "Email" },
                  { key: "adresse", label: "Adresse" },
                  { key: "quartier", label: "Quartier" },
                  { key: "dateInscription", label: "Date d'inscription", type: "date" },
                  { key: "pack", label: "Service / pack" },
                  { key: "owner", label: "Suivi par", type: "select", options: team.map(m => ({ value: m.id, label: m.name })) },
                  { key: "prixTotal", label: "Prix total du service (FCFA) — laisser vide si payé en une fois", type: "number" },
                ]}
                onSave={(f) => saveProspectEdit(p.id, f)}
                onCancel={() => setEditingId(null)} />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              {catherineUnlocked ? (
                <select value={p.statut} onChange={e => updateStatut(p.id, e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, width: "auto" }}>
                  {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span style={{ fontSize: 12, color: C.muted, background: C.cardAlt, padding: "4px 8px", borderRadius: 6 }}>{p.statut}</span>
              )}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.goldLight }}>{fcfa(p.montant)}{prixTotalOf(p) ? <span style={{ color: C.muted, fontWeight: 600 }}> / {fcfa(prixTotalOf(p))}</span> : null}</div>
                {payStatus && (
                  <div style={{ fontSize: 11, fontWeight: 800, color: payStatus === "Soldé" ? C.greenLight : payStatus === "Avance" ? C.goldLight : C.rustLight }}>
                    {payStatus === "Soldé" ? "✓ Soldé" : `${payStatus} · reste ${fcfa(reste)}`}
                  </div>
                )}
              </div>
            </div>
            {Number(p.montant) > 0 && <div style={{ fontSize: 11, color: C.greenLight, marginTop: 4 }}>Commission ({memberRate(team, p.owner, commissionRate)}%) : {fcfa(commissionOf(p, team, commissionRate))}</div>}

            {expanded && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, marginBottom: 10 }}>
                  <div><span style={{ color: C.muted }}>Email : </span>{p.email || "—"}</div>
                  <div><span style={{ color: C.muted }}>Adresse : </span>{p.adresse || "—"}</div>
                  <div><span style={{ color: C.muted }}>Quartier : </span>{p.quartier || "—"}</div>
                  <div><span style={{ color: C.muted }}>Date d'inscription : </span>{p.dateInscription || "—"}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <Banknote size={13} color={C.gold} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>Paiements</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {paymentsOf(p).length === 0 && <div style={{ fontSize: 11.5, color: C.muted }}>Aucun paiement reçu pour l'instant.</div>}
                  {paymentsOf(p).map(pay => {
                    const r = recuData(p, pay);
                    return (
                    <div key={pay.id} style={{ background: C.cardAlt, borderRadius: 8, padding: 8, fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: C.muted }}>{frDate(pay.date)}{pay.mode ? ` · ${pay.mode}` : ""}{pay.note ? ` · ${pay.note}` : ""}</div>
                          <div style={{ fontSize: 10.5, color: C.muted }}>Reçu {r.numero}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <b style={{ color: C.greenLight, whiteSpace: "nowrap" }}>+{fcfa(pay.montant)}</b>
                          {catherineUnlocked && <EditDeleteButtons editing={editingPay === pay.id} onEdit={() => setEditingPay(editingPay === pay.id ? null : pay.id)} onDelete={() => removePayment(p, pay.id)} />}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <button onClick={() => buildRecuPDF(r, agency, BRAND_LOGO)} style={{ ...iconBtn, flex: 1, padding: "6px", color: C.goldLight, borderColor: C.gold, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><FileText size={12} /> Reçu PDF</button>
                        {p.whatsapp && <a href={waLink(p.whatsapp, receiptText(r, agency))} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, flex: 1, padding: "6px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Send size={12} /> WhatsApp</a>}
                      </div>
                      {editingPay === pay.id && (
                        <EditFields value={{ montant: pay.montant ?? "", date: pay.date || "", mode: pay.mode || PAY_MODES[0], note: pay.note || "" }}
                          fields={[
                            { key: "montant", label: "Montant (FCFA)", type: "number" },
                            { key: "date", label: "Date", type: "date" },
                            { key: "mode", label: "Mode de paiement", type: "select", options: PAY_MODES },
                            { key: "note", label: "Note" },
                          ]}
                          onSave={(f) => savePayment(p, pay.id, f)} onCancel={() => setEditingPay(null)} />
                      )}
                    </div>
                  );})}
                  {prixTotalOf(p) > 0 && (
                    <div style={{ fontSize: 12, color: reste > 0 ? C.goldLight : C.greenLight, fontWeight: 700 }}>
                      Payé {fcfa(p.montant)} sur {fcfa(prixTotalOf(p))}{reste > 0 ? ` — reste ${fcfa(reste)}` : " — soldé ✓"}
                    </div>
                  )}
                </div>
                {catherineUnlocked ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input type="number" placeholder={reste > 0 ? `Montant (reste ${reste})` : "Montant reçu"} value={payForm.montant} onChange={e => setPayForm({ ...payForm, montant: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                      <input type="date" value={payForm.date} onChange={e => setPayForm({ ...payForm, date: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                      <select value={payForm.mode} onChange={e => setPayForm({ ...payForm, mode: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12 }}>
                        {PAY_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input placeholder="Note (ex : solde, 2e tranche…)" value={payForm.note} onChange={e => setPayForm({ ...payForm, note: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                      <button onClick={() => addPayment(p)} style={{ ...btnGold, width: "auto", padding: "0 12px", fontSize: 12 }}><Plus size={13} /> Ajouter un paiement</button>
                    </div>
                    {!prixTotalOf(p) && <div style={{ fontSize: 10.5, color: C.muted }}>Astuce : renseigne le « prix total » (crayon ✏️) pour voir automatiquement le reste à payer.</div>}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>🔒 Déverrouille avec le code Catherine (en haut) pour ajouter un paiement.</div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <FileText size={13} color={C.gold} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>Reçu</span>
                </div>
                {Number(p.montant) > 0 ? (
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    <button onClick={() => buildRecuPDF(recuData(p), agency, BRAND_LOGO)}
                      style={{ ...btnGold, flex: "1 1 160px" }}><FileText size={14} /> Reçu récapitulatif (PDF)</button>
                    {p.whatsapp && <a href={waLink(p.whatsapp, receiptText(recuData(p), agency))} target="_blank" rel="noopener noreferrer"
                      style={{ ...iconBtn, flex: "1 1 120px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 9 }}><Send size={13} /> WhatsApp</a>}
                    {onCreateFacture && <button onClick={() => onCreateFacture(p)} style={{ ...iconBtn, flex: "1 1 120px", padding: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: C.goldLight, borderColor: C.gold }}><Receipt size={13} /> Créer la facture</button>}
                  </div>
                ) : (
                  <div style={{ fontSize: 11.5, color: C.muted, background: C.cardAlt, borderRadius: 8, padding: 10, marginBottom: 12 }}>
                    Ajoute un paiement pour générer le reçu.
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <History size={13} color={C.gold} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>Historique</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {(p.historique || []).length === 0 && <div style={{ fontSize: 11.5, color: C.muted }}>Aucune note enregistrée.</div>}
                  {(p.historique || []).slice().reverse().map(h => (
                    <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", background: C.cardAlt, borderRadius: 8, padding: 8, fontSize: 12 }}>
                      {editingHist === h.id ? (
                        <div style={{ flex: 1 }}>
                          <EditFields value={{ note: h.note || "" }} fields={[{ key: "note", label: `Note du ${h.date}`, type: "textarea" }]}
                            onSave={(f) => saveHistorique(p.id, h.id, f.note)} onCancel={() => setEditingHist(null)} />
                        </div>
                      ) : (<div><span style={{ color: C.muted }}>{h.date} — </span>{h.note}</div>)}
                      <EditDeleteButtons editing={editingHist === h.id} onEdit={() => setEditingHist(editingHist === h.id ? null : h.id)} onDelete={() => removeHistorique(p.id, h.id)} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input placeholder="Ajouter une note (ex: relance faite, RDV pris…)" value={noteText} onChange={e => setNoteText(e.target.value)} style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                  <button onClick={() => addHistorique(p.id)} style={{ ...iconBtn, padding: "0 12px" }}><Plus size={13} /></button>
                </div>

                <DiagnosticSection prospect={p} agency={agency} />
              </div>
            )}
          </Card>
        );})}
      </div>
    </div>
  );
}

/* ---------------------------------- DIAGNOSTIC & GUIDE IA ---------------------------------- */

// Compte les taches totales et cochees pour la barre de progression.
function guideProgress(diag) {
  const days = diag?.programJson?.days || [];
  let total = 0, done = 0;
  const cp = diag?.checklistProgress || {};
  days.forEach(d => (d.tasks || []).forEach(t => { total++; if (cp[t.id]) done++; }));
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

// Message WhatsApp pre-rempli. ATTENTION : wa.me ne peut PAS joindre un PDF
// automatiquement ; il ne pre-remplit qu'un texte. L'ajout du PDF reste manuel.
function whatsappGuideLink(prospect, diag) {
  const phone = (prospect?.whatsapp || "").replace(/[^0-9]/g, "");
  const prenom = prospect?.prenom || prospect?.nom || "";
  const pos = diag?.guideContent?.positioning || "";
  const dur = diag?.programJson?.durationDays || 30;
  const txt =
    `Bonjour ${prenom} 👋\n\n` +
    `Voici ton diagnostic personnalise realise par KBS Digital Agency, avec ton programme de ${dur} jours et ta strategie sur mesure.\n\n` +
    (pos ? `Positionnement recommande : ${pos}\n\n` : "") +
    `Le guide complet (PDF) est pret : je te l'envoie juste apres ce message.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(txt)}`;
}

// Export PDF du guide (jsPDF + autoTable, deja utilises ailleurs dans l'app).
function generateGuidePDF(diag, prospect, agency) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const marginX = 15;
  let y = 18;
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const usableW = pageW - marginX * 2;

  function ensure(space) { if (y + space > pageH - 15) { doc.addPage(); y = 18; } }
  function title(t) {
    ensure(12);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(1, 27, 69);
    doc.text(t, marginX, y); y += 7;
    doc.setTextColor(30, 30, 30);
  }
  function para(label, text) {
    if (!text) return;
    ensure(10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
    if (label) { doc.text(label, marginX, y); y += 5; }
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(text), usableW);
    lines.forEach(ln => { ensure(6); doc.text(ln, marginX, y); y += 5; });
    y += 2;
  }

  // En-tete
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(1, 27, 69);
  doc.text(agency?.name || "KBS Digital Agency", marginX, y); y += 7;
  doc.setFontSize(12); doc.setTextColor(30, 30, 30);
  doc.text("Diagnostic & Guide strategique", marginX, y); y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(90, 90, 90);
  doc.text(`Client : ${(prospect?.prenom || "")} ${(prospect?.nom || "")}`.trim(), marginX, y); y += 5;
  doc.text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, marginX, y); y += 9;
  doc.setTextColor(30, 30, 30);

  const g = diag?.guideContent || {};
  const p = diag?.programJson || {};

  title("Positionnement");
  para("", g.positioning);
  title("Le vrai probleme");
  para("Ce que le client percoit :", g.perceivedProblem);
  para("Le vrai probleme identifie :", g.realProblem);

  if ((g.personas || []).length) {
    title("Personas cibles");
    g.personas.forEach(per => {
      para(per.name || "Persona", per.description);
      if ((per.pains || []).length) para("Frustrations :", per.pains.join(" · "));
      if ((per.desires || []).length) para("Desirs :", per.desires.join(" · "));
    });
  }

  if ((g.angles || []).length) {
    title("Angles marketing");
    g.angles.forEach((a, i) => {
      para(`${i + 1}. ${a.title || ""}`, a.example);
      if (a.hook) para("Accroche :", a.hook);
    });
  }

  if ((p.kpis || []).length) {
    title("KPI a suivre");
    para("", p.kpis.map(k => `• ${k}`).join("\n"));
  }

  if ((p.days || []).length) {
    ensure(20);
    title(`Programme ${p.durationDays || 30} jours`);
    const rows = p.days.map(d => [
      String(d.day),
      d.theme || "",
      (d.tasks || []).map(t => `• ${t.label}`).join("\n"),
    ]);
    autoTable(doc, {
      startY: y,
      head: [["Jour", "Theme", "Taches"]],
      body: rows,
      styles: { fontSize: 8.5, cellPadding: 2, valign: "top" },
      headStyles: { fillColor: [1, 27, 69], textColor: 255 },
      columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 40 }, 2: { cellWidth: usableW - 52 } },
      margin: { left: marginX, right: marginX },
    });
  }

  const safe = ((prospect?.nom || "client")).replace(/\s+/g, "_");
  doc.save(`Diagnostic_${safe}.pdf`);
}

// Petit uploader photo -> dataURL base64 (reutilise le pattern FileReader).
function PhotoField({ label, value, onChange }) {
  const inputRef = useRef(null);
  function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: C.muted }}>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {value
          ? <img src={value} alt="" style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", border: `1px solid ${C.border}` }} />
          : <div style={{ width: 46, height: 46, borderRadius: 8, background: C.cardAlt, border: `1px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 18 }}>📷</div>}
        <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
        <button onClick={() => inputRef.current?.click()} style={{ ...iconBtn, padding: "6px 10px" }}>{value ? "Changer" : "Ajouter"}</button>
        {value && <button onClick={() => onChange("")} style={{ ...iconBtn, padding: "6px 10px", color: C.rustLight }}>Retirer</button>}
      </div>
    </div>
  );
}

// Champ texte / textarea labellise, compact.
function DField({ label, value, onChange, area, placeholder, type }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 11, color: C.muted }}>{label}</label>
      {area
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={area === true ? 3 : area} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        : <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />}
    </div>
  );
}

function DiagnosticSection({ prospect, agency }) {
  const clientId = String(prospect.id);
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState(undefined); // undefined = pas encore charge
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [launching, setLaunching] = useState(false);
  const pollRef = useRef(null);

  function stopPolling() { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } }
  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const d = await loadDiagnostic(clientId);
      if (d) setDiag(d);
      if (d && d.status !== "generating") stopPolling();
    }, 8000);
  }
  useEffect(() => () => stopPolling(), []);

  useEffect(() => {
    if (!open || diag !== undefined) return;
    (async () => {
      const d = await loadDiagnostic(clientId);
      setDiag(d);
      setForm(d?.formData ? { ...emptyDiagnosticForm(prospect), ...d.formData } : emptyDiagnosticForm(prospect));
      if (d?.status === "generating") startPolling();
    })();
  }, [open]);

  function baseRecord(status, extra) {
    return {
      clientId,
      clientNom: `${prospect.prenom || ""} ${prospect.nom || ""}`.trim(),
      whatsapp: prospect.whatsapp || "",
      formData: form,
      status,
      checklistProgress: diag?.checklistProgress || {},
      researchData: diag?.researchData || null,
      guideContent: diag?.guideContent || null,
      programJson: diag?.programJson || null,
      generationCostEstimate: diag?.generationCostEstimate || 0,
      errorMessage: "",
      createdAt: diag?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...extra,
    };
  }

  async function saveForm() {
    setSaving(true);
    const next = baseRecord(diag?.status === "completed" ? "completed" : "draft");
    const err = await saveDiagnostic(clientId, next);
    setSaving(false);
    if (!err) { setDiag(next); setSavedMsg("Fiche enregistrée ✓"); setTimeout(() => setSavedMsg(""), 2500); }
    else { setSavedMsg("Erreur : " + err); }
  }

  async function launch() {
    if (!diagnosticFormComplete(form)) { setSavedMsg("Complète la niche, la description, le problème perçu et les objectifs 30j."); return; }
    const ok = window.confirm("Cette génération est payante, environ 1 $, et prend 1 à 3 minutes.\n\nElle lance une recherche IA sur ~50 concurrents de la niche puis génère le programme et le guide. Continuer ?");
    if (!ok) return;
    setLaunching(true);
    // On enregistre d'abord la fiche pour que la fonction lise le form_data a jour.
    const base = baseRecord("draft");
    await saveDiagnostic(clientId, base);
    // Affiche tout de suite l'ecran "Recherche en cours" pendant l'attente.
    setDiag({ ...base, status: "generating", startedAt: new Date().toISOString() });
    // Filet de securite : si la connexion tombe pendant l'attente (1 a 2 min),
    // le polling recuperera le resultat que la fonction a ecrit en base.
    startPolling();
    try {
      // La fonction genere de maniere synchrone : la reponse arrive apres 1 a 2
      // minutes et contient directement le diagnostic termine (ou l'echec).
      const res = await fetch(DIAGNOSTIC_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json().catch(() => ({}));
      if (data && (data.status === "completed" || data.status === "failed")) {
        stopPolling();
        setDiag(data);
      } else if (res.status === 202 || data.status === "generating") {
        // Compat : ancien comportement -> on laisse le polling faire le travail.
      } else if (data && data.error) {
        stopPolling();
        setDiag({ ...base, status: "failed", errorMessage: data.error });
      }
    } catch (e) {
      // Connexion coupee pendant l'attente : on garde le polling actif, la
      // fonction a pu terminer et ecrire le resultat en base malgre tout.
    }
    setLaunching(false);
  }

  async function toggleTask(taskId) {
    const cp = { ...(diag.checklistProgress || {}) };
    cp[taskId] = !cp[taskId];
    const next = { ...diag, checklistProgress: cp, updatedAt: new Date().toISOString() };
    setDiag(next);
    await saveDiagnostic(clientId, next);
  }

  const status = diag?.status;

  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={14} color={C.gold} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>Diagnostic & Guide IA</span>
          {status && <StatusPill status={status} />}
        </div>
        {open ? <ChevronDown size={15} color={C.gold} /> : <ChevronRight size={15} color={C.gold} />}
      </div>

      {open && diag === undefined && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Chargement…</div>}

      {open && diag !== undefined && (
        <div style={{ marginTop: 10 }}>
          {status === "generating" && <DiagGenerating diag={diag} />}
          {status === "completed" && (
            <InteractiveGuide diag={diag} prospect={prospect} agency={agency} onToggle={toggleTask} onEditForm={() => setDiag({ ...diag, status: "draft" })} onRelaunch={launch} launching={launching} />
          )}
          {(status === "failed") && (
            <div style={{ background: "rgba(192,57,43,0.10)", border: `1px solid ${C.rust}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 12.5, color: C.rustLight, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} /> La génération a échoué</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{diag.errorMessage || "Erreur inconnue."}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>Aucun nouveau débit tant que tu ne relances pas manuellement.</div>
            </div>
          )}

          {(status === undefined || status === "draft" || status === "failed") && (
            <DiagnosticForm form={form} setForm={setForm} onSave={saveForm} onLaunch={launch} saving={saving} launching={launching} savedMsg={savedMsg} complete={diagnosticFormComplete(form)} />
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    draft: { t: "Brouillon", c: C.muted, bg: C.cardAlt },
    generating: { t: "Génération…", c: C.goldLight, bg: "rgba(243,146,0,0.14)" },
    completed: { t: "Guide prêt", c: C.greenLight, bg: "rgba(46,139,111,0.14)" },
    failed: { t: "Échec", c: C.rustLight, bg: "rgba(192,57,43,0.12)" },
  };
  const m = map[status] || map.draft;
  return <span style={{ fontSize: 10.5, fontWeight: 700, color: m.c, background: m.bg, padding: "2px 8px", borderRadius: 20 }}>{m.t}</span>;
}

function DiagGenerating({ diag }) {
  return (
    <div style={{ background: C.cardAlt, borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 10 }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>🔎</div>
      <div style={{ fontWeight: 700, fontSize: 13, color: C.goldLight }}>Recherche en cours…</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>L'IA analyse ~50 concurrents puis rédige le programme et le guide.<br />Compte 1 à 3 minutes — l'écran se met à jour automatiquement.</div>
      <div style={{ height: 4, background: C.border, borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
        <div className="kbs-hint" style={{ height: "100%", width: "40%", background: C.gold, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function DiagnosticForm({ form, setForm, onSave, onLaunch, saving, launching, savedMsg, complete }) {
  if (!form) return null;
  const set = (k) => (v) => setForm({ ...form, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 11.5, color: C.muted }}>Remplis la fiche puis lance le diagnostic IA. Le déclenchement est <b>manuel</b> et payant : rien ne se lance à l'enregistrement.</div>

      <FormGroup title="Identité">
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}><DField label="Nom" value={form.nom} onChange={set("nom")} /></div>
          <div style={{ flex: 1 }}><DField label="Prénom" value={form.prenom} onChange={set("prenom")} /></div>
        </div>
        <DField label="Numéro WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}><DField label="Quartier / Ville" value={form.quartierVille} onChange={set("quartierVille")} /></div>
          <div style={{ flex: 1 }}><DField label="Marque / entreprise" value={form.marque} onChange={set("marque")} placeholder="si différent du nom" /></div>
        </div>
      </FormGroup>

      <FormGroup title="Business">
        <DField label="Niche / secteur *" value={form.niche} onChange={set("niche")} placeholder="ex : cosmétique visage, vêtements enfants" />
        <DField label="Description courte du business *" value={form.descriptionBusiness} onChange={set("descriptionBusiness")} area placeholder="2-3 phrases" />
        <DField label="Catalogue produits / services" value={form.catalogue} onChange={set("catalogue")} area placeholder="une ligne par produit" />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}><DField label="Panier moyen (FCFA)" value={form.panierMoyen} onChange={set("panierMoyen")} type="number" /></div>
          <div style={{ flex: 1 }}><DField label="Budget pub mensuel" value={form.budgetPubActuel} onChange={set("budgetPubActuel")} placeholder="FCFA ou « aucun »" /></div>
        </div>
      </FormGroup>

      <FormGroup title="Présence digitale">
        <DField label="Lien TikTok" value={form.tiktok} onChange={set("tiktok")} placeholder="optionnel" />
        <DField label="Lien page Facebook" value={form.facebook} onChange={set("facebook")} placeholder="optionnel" />
        <DField label="Lien Instagram" value={form.instagram} onChange={set("instagram")} placeholder="optionnel" />
        <DField label="Abonnés approx. par plateforme" value={form.abonnes} onChange={set("abonnes")} placeholder="ex : TikTok 2k, FB 800" />
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontSize: 11, color: C.muted }}>A-t-il déjà vendu en ligne ?</label>
          <select value={form.dejaVenduEnLigne} onChange={e => set("dejaVenduEnLigne")(e.target.value)} style={inputStyle}>
            <option value="non">Non</option>
            <option value="oui">Oui</option>
          </select>
        </div>
        {form.dejaVenduEnLigne === "oui" && <DField label="Détails / volume / résultat" value={form.detailsVentes} onChange={set("detailsVentes")} area />}
        <DField label="Dernière activité sur la page" value={form.derniereActivite} onChange={set("derniereActivite")} placeholder="date approximative (page inactive ?)" />
      </FormGroup>

      <FormGroup title="Diagnostic">
        <DField label="Cible / clientèle actuelle (selon le client)" value={form.cibleActuelle} onChange={set("cibleActuelle")} area />
        <DField label="Problème perçu par le client *" value={form.problemePercu} onChange={set("problemePercu")} area placeholder="ce qu'il PENSE être son problème" />
        <DField label="Objectifs à 30 jours *" value={form.objectifs30j} onChange={set("objectifs30j")} area />
        <DField label="Objectifs long terme (3-6 mois)" value={form.objectifsLongTerme} onChange={set("objectifsLongTerme")} area />
        <DField label="Concurrents déjà connus du client" value={form.concurrentsConnus} onChange={set("concurrentsConnus")} area />
      </FormGroup>

      <FormGroup title="Photos">
        <PhotoField label="Photo du client / de la boutique" value={form.photoClient} onChange={set("photoClient")} />
        <PhotoField label="Capture de sa page actuelle (optionnel)" value={form.photoPage} onChange={set("photoPage")} />
      </FormGroup>

      <FormGroup title="Notes internes KBS (jamais exportées au client)">
        <DField label="Impression du commercial après le RDV" value={form.noteCommercial} onChange={set("noteCommercial")} area />
        <DField label="Budget réel estimé (FCFA)" value={form.budgetReelEstime} onChange={set("budgetReelEstime")} />
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontSize: 11, color: C.muted }}>Niveau d'urgence</label>
          <select value={form.niveauUrgence} onChange={e => set("niveauUrgence")(e.target.value)} style={inputStyle}>
            <option>Faible</option><option>Moyen</option><option>Élevé</option>
          </select>
        </div>
      </FormGroup>

      {savedMsg && <div style={{ fontSize: 12, color: savedMsg.startsWith("Erreur") ? C.rustLight : C.greenLight }}>{savedMsg}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={saving} style={{ ...iconBtn, flex: 1, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: saving ? 0.6 : 1 }}>
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer la fiche"}
        </button>
        <button onClick={onLaunch} disabled={launching || !complete} title={complete ? "" : "Complète les champs obligatoires (*)"}
          style={{ ...btnGold, flex: 1, opacity: (launching || !complete) ? 0.5 : 1, cursor: (launching || !complete) ? "not-allowed" : "pointer" }}>
          <Sparkles size={14} /> {launching ? "Lancement…" : "Lancer le diagnostic IA"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>Génération ≈ 0,50 à 1,50 $ · facturation Anthropic à l'usage · un seul lancement à la fois.</div>
    </div>
  );
}

function FormGroup({ title, children }) {
  return (
    <div style={{ background: C.cardAlt, borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.goldLight, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function InteractiveGuide({ diag, prospect, agency, onToggle, onEditForm, onRelaunch, launching }) {
  const g = diag.guideContent || {};
  const p = diag.programJson || {};
  const r = diag.researchData || {};
  const prog = guideProgress(diag);
  const [openResearch, setOpenResearch] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Barre de progression globale */}
      <div style={{ background: C.cardAlt, borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Progression du programme ({p.durationDays || 30} jours)</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.goldLight }}>{prog.done}/{prog.total} · {prog.pct}%</span>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${prog.pct}%`, background: C.gold, borderRadius: 6, transition: "width .3s" }} />
        </div>
      </div>

      {/* Diagnostic */}
      {g.positioning && <GuideBlock label="Positionnement" text={g.positioning} />}
      {(g.perceivedProblem || g.realProblem) && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.goldLight, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Le vrai problème</div>
          {g.perceivedProblem && <div style={{ fontSize: 12.5, marginBottom: 6 }}><span style={{ color: C.muted }}>Perçu : </span>{g.perceivedProblem}</div>}
          {g.realProblem && <div style={{ fontSize: 12.5, background: C.cardAlt, borderRadius: 8, padding: 10 }}><span style={{ color: C.gold, fontWeight: 700 }}>Réel : </span>{g.realProblem}</div>}
        </div>
      )}

      {(g.personas || []).length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.goldLight, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Personas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {g.personas.map((per, i) => (
              <div key={i} style={{ background: C.cardAlt, borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{per.name}</div>
                {per.description && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{per.description}</div>}
                {(per.pains || []).length > 0 && <div style={{ fontSize: 11.5, marginTop: 4 }}>😣 {per.pains.join(" · ")}</div>}
                {(per.desires || []).length > 0 && <div style={{ fontSize: 11.5, marginTop: 2 }}>✨ {per.desires.join(" · ")}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {(g.angles || []).length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.goldLight, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Angles marketing</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {g.angles.map((a, i) => (
              <div key={i} style={{ background: C.cardAlt, borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{a.title}</div>
                {a.example && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{a.example}</div>}
                {a.hook && <div style={{ fontSize: 12, marginTop: 4, fontStyle: "italic", color: C.goldLight }}>« {a.hook} »</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {(p.kpis || []).length > 0 && (
        <GuideBlock label="KPI à suivre" text={p.kpis.map(k => `• ${k}`).join("\n")} />
      )}

      {/* Rail des jours */}
      {(p.days || []).length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.goldLight, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Programme jour par jour</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.days.map((d, i) => (
              <div key={i} style={{ background: C.cardAlt, borderRadius: 8, padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ background: C.gold, color: "#fff", fontSize: 11, fontWeight: 800, borderRadius: 6, padding: "2px 8px" }}>J{d.day}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{d.theme}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {(d.tasks || []).map(t => {
                    const done = !!(diag.checklistProgress || {})[t.id];
                    return (
                      <div key={t.id} onClick={() => onToggle(t.id)} style={{ display: "flex", alignItems: "flex-start", gap: 7, cursor: "pointer", fontSize: 12.5 }}>
                        {done ? <CheckCircle2 size={16} color={C.greenLight} style={{ flexShrink: 0, marginTop: 1 }} /> : <Circle size={16} color={C.muted} style={{ flexShrink: 0, marginTop: 1 }} />}
                        <span style={{ textDecoration: done ? "line-through" : "none", color: done ? C.muted : C.text }}>{t.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concurrents analyses (repliable) */}
      {(r.competitors || []).length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div onClick={() => setOpenResearch(o => !o)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.goldLight, textTransform: "uppercase", letterSpacing: 0.4 }}>Concurrents analysés ({r.competitors.length})</span>
            {openResearch ? <ChevronDown size={14} color={C.gold} /> : <ChevronRight size={14} color={C.gold} />}
          </div>
          {openResearch && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {r.summary && <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{r.summary}</div>}
              {r.competitors.map((c, i) => (
                <div key={i} style={{ background: C.cardAlt, borderRadius: 8, padding: 8, fontSize: 11.5 }}>
                  <div style={{ fontWeight: 700 }}>{c.name} <span style={{ color: C.muted, fontWeight: 400 }}>· {c.platform} · {c.followers}</span></div>
                  {c.angle && <div style={{ color: C.muted, marginTop: 2 }}>Angle : {c.angle}</div>}
                  {c.whyItWorks && <div style={{ marginTop: 2 }}>👍 {c.whyItWorks}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <button onClick={() => generateGuidePDF(diag, prospect, agency)} style={{ ...btnGold }}>
        <FileText size={14} /> Exporter le guide en PDF
      </button>
      {prospect.whatsapp ? (
        <a href={whatsappGuideLink(prospect, diag)} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: "none", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: C.greenLight, borderColor: C.green }}>
          <Send size={14} /> Envoyer sur WhatsApp
        </a>
      ) : (
        <div style={{ fontSize: 11.5, color: C.muted, background: C.cardAlt, borderRadius: 8, padding: 10 }}>Ajoute un numéro WhatsApp au client pour activer l'envoi.</div>
      )}
      <div style={{ fontSize: 11, color: C.muted, background: C.cardAlt, borderRadius: 8, padding: 10 }}>
        ⚠️ WhatsApp ne peut pas joindre le PDF automatiquement : le lien pré-remplit seulement un texte. Télécharge d'abord le PDF, puis joins-le manuellement dans WhatsApp.
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
        <button onClick={onEditForm} style={{ ...iconBtn, flex: 1, padding: "8px" }}>Modifier la fiche</button>
        <button onClick={onRelaunch} disabled={launching} style={{ ...iconBtn, flex: 1, padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: launching ? 0.6 : 1 }}>
          <RefreshCw size={13} /> Relancer (payant)
        </button>
      </div>
      {diag.generationCostEstimate ? <div style={{ fontSize: 10.5, color: C.muted, textAlign: "center" }}>Coût estimé de cette génération : ≈ {Number(diag.generationCostEstimate).toFixed(2)} $</div> : null}
    </div>
  );
}

function GuideBlock({ label, text }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.goldLight, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12.5, whiteSpace: "pre-wrap" }}>{text}</div>
    </div>
  );
}

/* ---------------------------------- ADMIN : SUIVI DES DIAGNOSTICS IA ---------------------------------- */
function AdminDiagnostics() {
  const [list, setList] = useState(null);
  const [rawId, setRawId] = useState(null);

  async function refresh() {
    setList(null);
    const all = await loadAllDiagnostics();
    all.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    setList(all);
  }
  useEffect(() => { refresh(); }, []);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthCost = (list || []).reduce((s, d) => {
    const ref = d.completedAt || d.updatedAt || "";
    return ref.startsWith(ym) ? s + (Number(d.generationCostEstimate) || 0) : s;
  }, 0);
  const totalCost = (list || []).reduce((s, d) => s + (Number(d.generationCostEstimate) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <H2>Diagnostics IA</H2>
        <button onClick={refresh} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5, padding: "6px 10px" }}><RefreshCw size={13} /> Rafraîchir</button>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Card style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>Coût ce mois-ci</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.goldLight }}>≈ {monthCost.toFixed(2)} $</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>Coût cumulé</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.greenLight }}>≈ {totalCost.toFixed(2)} $</div>
        </Card>
      </div>

      {list === null && <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 16 }}>Chargement…</div>}
      {list !== null && list.length === 0 && <div style={{ fontSize: 12.5, color: C.muted, textAlign: "center", padding: 16 }}>Aucun diagnostic pour l'instant. Ouvre la fiche d'un client dans le CRM pour en créer un.</div>}

      {(list || []).map(d => (
        <Card key={d.clientId}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.clientNom || `Client ${d.clientId}`}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                {d.formData?.niche ? `Niche : ${d.formData.niche} · ` : ""}Maj : {(d.updatedAt || "").slice(0, 16).replace("T", " ")}
              </div>
            </div>
            <StatusPill status={d.status} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ fontSize: 11.5, color: C.muted }}>
              {d.generationCostEstimate ? `Coût : ≈ ${Number(d.generationCostEstimate).toFixed(2)} $` : "—"}
              {d.programJson?.durationDays ? ` · ${d.programJson.durationDays} j` : ""}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <EditDeleteButtons onDelete={async () => {
                if (!confirmDelete(`le diagnostic IA de « ${d.clientNom || d.clientId} »`)) return;
                const err = await deleteShared(diagKey(d.clientId));
                if (err) window.alert(err); else setList(l => (l || []).filter(x => x.clientId !== d.clientId));
              }} />
              {d.researchData && <button onClick={() => setRawId(rawId === d.clientId ? null : d.clientId)} style={{ ...iconBtn, padding: "5px 9px", fontSize: 11 }}>{rawId === d.clientId ? "Masquer" : "Données brutes"}</button>}
            </div>
          </div>
          {d.status === "failed" && d.errorMessage && <div style={{ fontSize: 11.5, color: C.rustLight, marginTop: 6 }}>Erreur : {d.errorMessage}</div>}
          {rawId === d.clientId && (
            <pre style={{ marginTop: 8, background: C.cardAlt, borderRadius: 8, padding: 10, fontSize: 10.5, overflowX: "auto", maxHeight: 260, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(d.researchData, null, 2)}
            </pre>
          )}
        </Card>
      ))}
      <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>Les guides et leur progression se consultent dans la fiche de chaque client (CRM & Clients).</div>
    </div>
  );
}

/* ---------------------------------- DEVIS & FACTURES (composant commun) ---------------------------------- */
const DEVIS_STATUTS = ["Brouillon", "Envoyé", "Accepté", "Refusé"];
function emptyDocForm(kind) {
  const today = new Date().toISOString().slice(0, 10);
  const plus = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
  return {
    linkedId: "", clientNom: "", whatsapp: "", email: "", adresse: "", objet: "",
    date: today, validite: kind === "devis" ? plus(15) : "", echeance: kind === "facture" ? plus(7) : "",
    items: [{ label: "", qte: 1, prix: "" }], remise: "", remiseType: "FCFA", acompte: kind === "devis" ? "50" : "", notes: "",
  };
}
// Statut d'une facture calcule a partir des reglements.
function factureStatut(f) {
  const t = docTotals(f);
  if (t.total > 0 && t.reste === 0) return "Payée";
  const today = new Date().toISOString().slice(0, 10);
  if (f.echeance && f.echeance < today) return t.paye > 0 ? "Partielle — en retard" : "En retard";
  return t.paye > 0 ? "Partiellement payée" : "À payer";
}
function statutColor(s) {
  if (/Payée|Accepté/.test(s) && !/Partiel/.test(s)) return C.greenLight;
  if (/retard|Refusé/.test(s)) return C.rustLight;
  return C.goldLight;
}

function TabDocuments({ kind, docs, setDocs, prospects, agency, onConvert, draft, onDraftUsed }) {
  const isDevis = kind === "devis";
  const prefix = isDevis ? "DEV" : "FAC";
  const label = isDevis ? "devis" : "facture";
  const [form, setForm] = useState(emptyDocForm(kind));
  const [editingId, setEditingId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [payForm, setPayForm] = useState({ montant: "", date: new Date().toISOString().slice(0, 10), mode: PAY_MODES[0], note: "" });
  const [editingPay, setEditingPay] = useState(null);
  const [search, setSearch] = useState("");

  // Brouillon envoye depuis le CRM ou depuis un devis (« Créer la facture »).
  useEffect(() => {
    if (!draft) return;
    setEditingId(null);
    setForm({ ...emptyDocForm(kind), ...draft });
    window.scrollTo({ top: 0, behavior: "smooth" });
    onDraftUsed && onDraftUsed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  function pickClient(id) {
    const p = prospects.find(pp => String(pp.id) === String(id));
    if (!p) { setForm({ ...form, linkedId: "" }); return; }
    const prix = prixTotalOf(p) || Number(p.montant) || "";
    setForm({
      ...form, linkedId: id, clientNom: clientFullName(p), whatsapp: p.whatsapp || "", email: p.email || "",
      adresse: [p.adresse, p.quartier].filter(Boolean).join(", "), objet: form.objet || p.pack || "",
      items: form.items.some(it => it.label) ? form.items : [{ label: p.pack || "", qte: 1, prix }],
    });
  }
  function updateItem(idx, patch) { setForm({ ...form, items: form.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }); }
  function addItem() { setForm({ ...form, items: [...form.items, { label: "", qte: 1, prix: "" }] }); }
  function removeItem(idx) { setForm({ ...form, items: form.items.filter((_, i) => i !== idx) }); }

  function save() {
    if (!form.clientNom.trim()) { window.alert("Indique le nom du client."); return; }
    const items = form.items.filter(it => (it.label || "").trim()).map(it => ({ ...it, qte: Number(it.qte) || 1, prix: Number(it.prix) || 0 }));
    if (!items.length) { window.alert("Ajoute au moins une prestation."); return; }
    if (editingId) {
      setDocs(docs.map(d => d.id === editingId ? { ...d, ...form, items } : d));
      setEditingId(null);
    } else {
      const numero = nextNumero(prefix, docs, form.date);
      const base = { ...form, items, id: Date.now(), numero };
      setDocs([...docs, isDevis ? { ...base, statut: "Envoyé" } : { ...base, paiements: form.paiements || [] }]);
      notifyTeam(isDevis ? "Nouveau devis 📄" : "Nouvelle facture 🧾", `${numero} — ${form.clientNom} (${money(docTotals({ ...form, items }).total)})`, isDevis ? "devis" : "factures");
    }
    setForm(emptyDocForm(kind));
  }
  function startEdit(d) {
    setEditingId(d.id);
    setForm({ ...emptyDocForm(kind), ...d, items: (d.items && d.items.length) ? d.items : emptyDocForm(kind).items });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function cancelEdit() { setEditingId(null); setForm(emptyDocForm(kind)); }
  function remove(d) {
    if (!confirmDelete(`${isDevis ? "le devis" : "la facture"} ${d.numero || ""} de « ${d.clientNom} »`)) return;
    setDocs(docs.filter(x => x.id !== d.id));
    if (editingId === d.id) cancelEdit();
  }
  function duplicate(d) {
    const numero = nextNumero(prefix, docs, new Date().toISOString());
    setDocs([...docs, { ...d, id: Date.now(), numero, date: new Date().toISOString().slice(0, 10), paiements: [], statut: isDevis ? "Brouillon" : undefined }]);
  }
  function setStatut(d, statut) { setDocs(docs.map(x => x.id === d.id ? { ...x, statut } : x)); }

  // --- Reglements (factures) ---
  function allRecus() { return docs.flatMap(d => d.paiements || []).map(p => ({ numero: p.recNumero })); }
  function addPay(d) {
    const m = Number(payForm.montant) || 0;
    if (m <= 0) return;
    const pay = { id: Date.now(), date: payForm.date, montant: m, mode: payForm.mode, note: payForm.note.trim(), recNumero: nextNumero("REC", allRecus(), payForm.date) };
    setDocs(docs.map(x => x.id === d.id ? { ...x, paiements: [...(x.paiements || []), pay] } : x));
    notifyTeam("Règlement de facture 💰", `${d.numero} — ${d.clientNom} a réglé ${money(m)}`, "factures");
    setPayForm({ montant: "", date: new Date().toISOString().slice(0, 10), mode: PAY_MODES[0], note: "" });
  }
  function delPay(d, pid) {
    if (!confirmDelete("ce règlement")) return;
    setDocs(docs.map(x => x.id === d.id ? { ...x, paiements: (x.paiements || []).filter(p => p.id !== pid) } : x));
  }
  function savePay(d, pid, f) {
    setDocs(docs.map(x => x.id === d.id ? { ...x, paiements: (x.paiements || []).map(p => p.id === pid ? { ...p, ...f, montant: Number(f.montant) || 0 } : p) } : x));
    setEditingPay(null);
  }
  function recuFromFacture(d, pay) {
    const t = docTotals(d);
    const pays = (d.paiements || []);
    const upTo = pays.slice(0, pays.findIndex(p => p.id === pay.id) + 1);
    const paid = upTo.reduce((s, p) => s + (Number(p.montant) || 0), 0);
    return {
      numero: pay.recNumero || fallbackNumero("REC", pay.date, pay.id), date: pay.date, factureNumero: d.numero,
      clientNom: d.clientNom, whatsapp: d.whatsapp, email: d.email, adresse: d.adresse,
      service: d.objet || (d.items || []).map(it => it.label).join(", "), montant: Number(pay.montant) || 0,
      mode: pay.mode, note: pay.note, prixTotal: t.total, totalPaye: paid, reste: Math.max(0, t.total - paid),
    };
  }
  function pdf(d) { (isDevis ? buildDevisPDF : buildFacturePDF)(d, agency, BRAND_LOGO); }
  function waText(d) {
    const t = docTotals(d);
    return [
      `Bonjour ${d.clientNom},`, "",
      `Voici ${isDevis ? "votre devis" : "votre facture"} N° ${d.numero} — ${agency?.name || "KBS Digital Agency"}.`,
      ...(d.items || []).map(it => `• ${it.label} : ${Number(it.qte) || 1} x ${money(it.prix)}`),
      `Total : ${money(t.total)}`,
      ...(isDevis ? (d.validite ? [`Valable jusqu'au ${frDate(d.validite)}.`] : []) : [t.paye > 0 ? `Déjà réglé : ${money(t.paye)} — Reste : ${money(t.reste)}` : "", d.echeance ? `Échéance : ${frDate(d.echeance)}` : ""].filter(Boolean)),
      ...(agency?.paymentInfo ? ["", `Paiement : ${agency.paymentInfo}`] : []),
      "", "Le document PDF vous est envoyé en pièce jointe. Merci pour votre confiance 🙏",
    ].join("\n");
  }

  const totals = docTotals(form);
  const list = docs.slice().reverse().filter(d => !search.trim() ||
    `${d.numero} ${d.clientNom} ${d.objet}`.toLowerCase().includes(search.trim().toLowerCase()));
  const sumTotal = docs.reduce((s, d) => s + docTotals(d).total, 0);
  const sumReste = isDevis ? 0 : docs.reduce((s, d) => s + docTotals(d).reste, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>{isDevis ? "Total des devis" : "Total facturé"} ({docs.length})</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.goldLight }}>{fcfa(sumTotal)}</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>{isDevis ? "Devis acceptés" : "Reste à encaisser"}</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: isDevis ? C.greenLight : (sumReste > 0 ? C.rustLight : C.greenLight) }}>
            {isDevis ? docs.filter(d => d.statut === "Accepté").length : fcfa(sumReste)}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Eyebrow>{editingId ? `Modifier ${isDevis ? "le devis" : "la facture"} ${form.numero || ""}` : (isDevis ? "Nouveau devis" : "Nouvelle facture")}</Eyebrow>
          {editingId && <button onClick={cancelEdit} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Annuler</button>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <select value={form.linkedId} onChange={e => pickClient(e.target.value)} style={inputStyle}>
            <option value="">— Choisir un client du CRM (optionnel) —</option>
            {prospects.map(p => <option key={p.id} value={p.id}>{clientFullName(p)}</option>)}
          </select>
          <input placeholder="Nom du client / entreprise" value={form.clientNom} onChange={e => setForm({ ...form, clientNom: e.target.value })} style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="Email (optionnel)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input placeholder="Adresse du client (optionnel)" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} style={inputStyle} />
          <input placeholder="Objet (ex : Pack 1 — Formation + Vente)" value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 3 }}>Date
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            </label>
            <label style={{ flex: 1, fontSize: 11, color: C.muted, display: "flex", flexDirection: "column", gap: 3 }}>{isDevis ? "Valable jusqu'au" : "Échéance"}
              <input type="date" value={isDevis ? form.validite : form.echeance} onChange={e => setForm({ ...form, [isDevis ? "validite" : "echeance"]: e.target.value })} style={inputStyle} />
            </label>
          </div>

          <Eyebrow>Prestations</Eyebrow>
          {form.items.map((it, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input placeholder="Désignation" value={it.label} onChange={e => updateItem(idx, { label: e.target.value })} style={{ ...inputStyle, flex: 2 }} />
              <input type="number" placeholder="Qté" value={it.qte} onChange={e => updateItem(idx, { qte: e.target.value })} style={{ ...inputStyle, flex: "0 0 52px" }} />
              <input type="number" placeholder="Prix unit." value={it.prix} onChange={e => updateItem(idx, { prix: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              {form.items.length > 1 && <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: C.rustLight, cursor: "pointer" }}><Trash2 size={14} /></button>}
            </div>
          ))}
          <button onClick={addItem} style={{ ...iconBtn, alignSelf: "flex-start", padding: "6px 10px" }}><Plus size={12} /> Ajouter une ligne</button>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 11, color: C.muted }}>Remise :</label>
            <input type="number" placeholder="0" value={form.remise} onChange={e => setForm({ ...form, remise: e.target.value })} style={{ ...inputStyle, width: 90 }} />
            <select value={form.remiseType} onChange={e => setForm({ ...form, remiseType: e.target.value })} style={{ ...inputStyle, width: 80 }}>
              <option value="FCFA">FCFA</option><option value="%">%</option>
            </select>
            {isDevis && (<>
              <label style={{ fontSize: 11, color: C.muted }}>Acompte :</label>
              <input type="number" placeholder="%" value={form.acompte} onChange={e => setForm({ ...form, acompte: e.target.value })} style={{ ...inputStyle, width: 70 }} />
              <span style={{ fontSize: 11, color: C.muted }}>%</span>
            </>)}
          </div>
          <textarea placeholder="Notes / conditions particulières (optionnel)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: 50, resize: "vertical" }} />

          <div style={{ background: C.cardAlt, borderRadius: 8, padding: "8px 10px", fontSize: 12.5, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.muted }}>Sous-total</span><span>{fcfa(totals.sousTotal)}</span></div>
            {totals.remise > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.muted }}>Remise</span><span>- {fcfa(totals.remise)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: C.goldLight, fontSize: 14 }}><span>Total</span><span>{fcfa(totals.total)}</span></div>
            <div style={{ fontSize: 10.5, color: C.muted, fontStyle: "italic" }}>{amountInWords(totals.total)}</div>
          </div>

          <button onClick={save} style={btnGold}>{editingId ? <><Save size={14} /> Enregistrer les modifications</> : <><Plus size={14} /> {isDevis ? "Créer le devis" : "Créer la facture"}</>}</button>
        </div>
      </Card>

      {docs.length > 2 && (
        <input placeholder={`🔍 Rechercher (n°, client, objet)…`} value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {docs.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Aucun{isDevis ? " devis" : "e facture"} pour l'instant.</div>}
        {list.map(d => {
          const t = docTotals(d);
          const st = isDevis ? (d.statut || "Envoyé") : factureStatut(d);
          const open = openId === d.id;
          return (
            <Card key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                <div onClick={() => setOpenId(open ? null : d.id)} style={{ cursor: "pointer", flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: 0.5 }}>{d.numero || fallbackNumero(prefix, d.date, d.id)}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{d.clientNom}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{frDate(d.date)}{d.objet ? ` · ${d.objet}` : ""}</div>
                </div>
                <EditDeleteButtons editing={editingId === d.id} onEdit={() => editingId === d.id ? cancelEdit() : startEdit(d)} onDelete={() => remove(d)} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8 }}>
                {isDevis ? (
                  <select value={st} onChange={e => setStatut(d, e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, width: "auto", color: statutColor(st) }}>
                    {DEVIS_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 800, color: statutColor(st), background: C.cardAlt, padding: "4px 8px", borderRadius: 6 }}>{st}</span>
                )}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.goldLight }}>{fcfa(t.total)}</div>
                  {!isDevis && t.paye > 0 && t.reste > 0 && <div style={{ fontSize: 11, color: C.rustLight, fontWeight: 700 }}>Reste {fcfa(t.reste)}</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <button onClick={() => pdf(d)} style={{ ...btnGold, flex: "1 1 130px", padding: 8, fontSize: 12 }}><FileText size={13} /> PDF</button>
                {d.whatsapp && <a href={waLink(d.whatsapp, waText(d))} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, flex: "1 1 110px", padding: 8, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Send size={12} /> WhatsApp</a>}
                {isDevis && onConvert && <button onClick={() => onConvert(d)} style={{ ...iconBtn, flex: "1 1 130px", padding: 8, color: C.goldLight, borderColor: C.gold, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Receipt size={12} /> Convertir en facture</button>}
                <button onClick={() => duplicate(d)} style={{ ...iconBtn, flex: "0 0 auto", padding: 8, display: "flex", alignItems: "center", gap: 4 }}><Copy size={12} /> Dupliquer</button>
                {!isDevis && <button onClick={() => setOpenId(open ? null : d.id)} style={{ ...iconBtn, flex: "1 1 110px", padding: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Banknote size={12} /> Règlements ({(d.paiements || []).length})</button>}
              </div>

              {open && !isDevis && (
                <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  {(d.paiements || []).length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Aucun règlement enregistré.</div>}
                  {(d.paiements || []).map(pay => {
                    const r = recuFromFacture(d, pay);
                    return (
                      <div key={pay.id} style={{ background: C.cardAlt, borderRadius: 8, padding: 8, fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: C.muted }}>{frDate(pay.date)} · {pay.mode}{pay.note ? ` · ${pay.note}` : ""} · <span style={{ fontSize: 10.5 }}>{r.numero}</span></span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <b style={{ color: C.greenLight }}>+{fcfa(pay.montant)}</b>
                            <EditDeleteButtons editing={editingPay === pay.id} onEdit={() => setEditingPay(editingPay === pay.id ? null : pay.id)} onDelete={() => delPay(d, pay.id)} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <button onClick={() => buildRecuPDF(r, agency, BRAND_LOGO)} style={{ ...iconBtn, flex: 1, padding: 6, color: C.goldLight, borderColor: C.gold }}>Reçu PDF</button>
                          {d.whatsapp && <a href={waLink(d.whatsapp, receiptText(r, agency))} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, flex: 1, padding: 6, textAlign: "center", textDecoration: "none" }}>Reçu WhatsApp</a>}
                        </div>
                        {editingPay === pay.id && (
                          <EditFields value={{ montant: pay.montant ?? "", date: pay.date || "", mode: pay.mode || PAY_MODES[0], note: pay.note || "" }}
                            fields={[
                              { key: "montant", label: "Montant (FCFA)", type: "number" },
                              { key: "date", label: "Date", type: "date" },
                              { key: "mode", label: "Mode", type: "select", options: PAY_MODES },
                              { key: "note", label: "Note" },
                            ]}
                            onSave={(f) => savePay(d, pay.id, f)} onCancel={() => setEditingPay(null)} />
                        )}
                      </div>
                    );
                  })}
                  {t.reste > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="number" placeholder={`Montant (reste ${t.reste})`} value={payForm.montant} onChange={e => setPayForm({ ...payForm, montant: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                        <input type="date" value={payForm.date} onChange={e => setPayForm({ ...payForm, date: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <select value={payForm.mode} onChange={e => setPayForm({ ...payForm, mode: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12 }}>
                          {PAY_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <button onClick={() => addPay(d)} style={{ ...btnGold, width: "auto", padding: "0 12px", fontSize: 12 }}><Plus size={13} /> Enregistrer le règlement</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- TAB: KANBAN ---------------------------------- */
function TabKanban({ kanban, setKanban, checks, setChecks, team, setTeam, codes }) {
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [taskAssignee, setTaskAssignee] = useState(team[0]?.id || "");
  const [myUnlock, setMyUnlock] = useState(null);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [whoPicker, setWhoPicker] = useState(team[0]?.id || "");
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockError, setUnlockError] = useState(false);
  const cols = [
    { id: "todo", label: "À faire" }, { id: "doing", label: "En cours" },
    { id: "review", label: "À valider" }, { id: "done", label: "Terminé" },
  ];
  function addTask() {
    if (!newTask.trim()) return;
    setKanban({ ...kanban, todo: [...kanban.todo, { id: Date.now(), text: newTask, assignedTo: taskAssignee }] });
    setNewTask("");
  }
  function move(colId, taskId, dir) {
    const order = ["todo", "doing", "review", "done"];
    const idx = order.indexOf(colId);
    const target = order[idx + dir];
    if (!target) return;
    const task = kanban[colId].find(t => t.id === taskId);
    setKanban({ ...kanban, [colId]: kanban[colId].filter(t => t.id !== taskId), [target]: [...kanban[target], task] });
  }
  const [editingTask, setEditingTask] = useState(null);
  function removeTask(colId, taskId) {
    if (!confirmDelete("cette tâche")) return;
    setKanban({ ...kanban, [colId]: kanban[colId].filter(t => t.id !== taskId) });
  }
  function saveTask(colId, taskId, f) {
    if (!f.text.trim()) return;
    setKanban({ ...kanban, [colId]: kanban[colId].map(t => t.id === taskId ? { ...t, text: f.text, assignedTo: f.assignedTo } : t) });
    setEditingTask(null);
  }
  function canEdit(personId) { return adminUnlocked || myUnlock === personId; }
  // Une tâche sans responsable (ancienne tâche) reste modifiable par tout le monde.
  function canEditTask(t) { return !t.assignedTo || canEdit(t.assignedTo); }
  function toggleCheck(person, idx) {
    if (!canEdit(person)) return;
    const list = checks[person] || [];
    const next = list.includes(idx) ? list.filter(i => i !== idx) : [...list, idx];
    setChecks({ ...checks, [person]: next });
  }
  function resetChecks(person) {
    if (!canEdit(person)) return;
    setChecks({ ...checks, [person]: [] });
  }
  function tryUnlockMine() {
    const member = team.find(m => m.id === whoPicker);
    if (member && codeMatchesStrict(unlockCode, member.code)) { setMyUnlock(member.id); setUnlockError(false); setUnlockCode(""); }
    else setUnlockError(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <Eyebrow>Nouvelle tâche</Eyebrow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <input placeholder="Décrire la tâche…" value={newTask} onChange={e => setNewTask(e.target.value)} style={{ ...inputStyle, flex: "1 1 100%" }} />
          <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
            {team.map(m => <option key={m.id} value={m.id}>Pour : {m.name}</option>)}
          </select>
          <button onClick={addTask} style={{ ...btnGold, width: "auto", padding: "0 16px" }}><Plus size={16} /></button>
        </div>
      </Card>

      {!adminUnlocked ? (
        <Card>
          <Eyebrow>Déverrouiller mes tâches &amp; ma checklist</Eyebrow>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 6, marginBottom: 8 }}>Entre ton code personnel pour déplacer les tâches qui te sont assignées et cocher ta checklist.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select value={whoPicker} onChange={e => { setWhoPicker(e.target.value); setUnlockError(false); }} style={{ ...inputStyle, flex: "1 1 120px" }}>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="password" placeholder="Ton code" value={unlockCode}
              onChange={e => { setUnlockCode(e.target.value); setUnlockError(false); }}
              onKeyDown={e => { if (e.key === "Enter") tryUnlockMine(); }}
              style={{ ...inputStyle, flex: "1 1 100px" }} />
            <button onClick={tryUnlockMine} style={{ ...iconBtn, padding: "0 14px" }}>OK</button>
          </div>
          {unlockError && <div style={{ color: C.rustLight, fontSize: 11, marginTop: 6 }}>Code incorrect.</div>}
          {myUnlock && <div style={{ color: C.greenLight, fontSize: 11, marginTop: 6 }}>✓ {team.find(m => m.id === myUnlock)?.name} peut gérer ses tâches et sa checklist.</div>}
          <div style={{ marginTop: 8 }}>
            <MiniUnlock strict code={codes.admin} label="Ou code Administration (CEO — tout déverrouiller)" onUnlock={() => setAdminUnlocked(true)} />
          </div>
        </Card>
      ) : (
        <div style={{ color: C.greenLight, fontSize: 12 }}>✓ Mode Administration : toutes les tâches et checklists sont modifiables.</div>
      )}

      <div>
        <H2>Tableau Kanban</H2>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Chaque tâche ne peut être déplacée ou supprimée que par la personne à qui elle est assignée (ou le CEO).</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cols.map((col, colIdx) => (
            <Card key={col.id}>
              <Eyebrow>{col.label} ({kanban[col.id]?.length || 0})</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {(kanban[col.id] || []).map(t => {
                  const editable = canEditTask(t);
                  const who = team.find(m => m.id === t.assignedTo);
                  const isEditing = editingTask === t.id;
                  return (
                    <div key={t.id} style={{ background: C.cardAlt, borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 13 }}>{t.text}</span>
                        {who && <span style={{ fontSize: 10.5, fontWeight: 700, color: editable ? C.goldLight : C.muted }}>{who.name}{editable ? "" : " 🔒"}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                        {editable ? (
                          <>
                            {colIdx > 0 && <button onClick={() => move(col.id, t.id, -1)} style={iconBtn}>←</button>}
                            {colIdx < 3 && <button onClick={() => move(col.id, t.id, 1)} style={iconBtn}>→</button>}
                            <EditDeleteButtons editing={isEditing} onEdit={() => setEditingTask(isEditing ? null : t.id)} onDelete={() => removeTask(col.id, t.id)} />
                          </>
                        ) : (
                          <Lock size={13} color={C.muted} />
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <EditFields value={{ text: t.text || "", assignedTo: t.assignedTo || team[0]?.id || "" }}
                        fields={[
                          { key: "text", label: "Tâche", type: "textarea" },
                          { key: "assignedTo", label: "Pour", type: "select", options: team.map(m => ({ value: m.id, label: m.name })) },
                        ]}
                        onSave={(f) => saveTask(col.id, t.id, f)} onCancel={() => setEditingTask(null)} />
                    )}
                    </div>
                  );
                })}
                {(kanban[col.id] || []).length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Vide</div>}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <H2>Checklists quotidiennes</H2>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Chacun voit toutes les checklists, mais ne peut cocher que la sienne (déverrouille ton code en haut). Le CEO peut tout cocher avec le code Administration.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {team.map(m => {
            const editable = canEdit(m.id);
            return (
              <Card key={m.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Eyebrow>{m.name}{editable ? "" : " 🔒"}</Eyebrow>
                  {editable && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button onClick={() => resetChecks(m.id)} title="Tout décocher" style={iconBtn}><RotateCcw size={12} /></button>
                      <EditDeleteButtons editing={editingChecklist === m.id} onEdit={() => setEditingChecklist(editingChecklist === m.id ? null : m.id)}
                        onDelete={() => { if (confirmDelete(`toute la checklist de ${m.name}`)) { setTeam(team.map(x => x.id === m.id ? { ...x, checklist: [] } : x)); setChecks({ ...checks, [m.id]: [] }); } }} />
                    </div>
                  )}
                </div>
                {editingChecklist === m.id && (
                  <EditFields value={{ items: (m.checklist || []).join("\n") }} fields={[{ key: "items", label: "Checklist (une tâche par ligne)", type: "textarea" }]}
                    onSave={(f) => { setTeam(team.map(x => x.id === m.id ? { ...x, checklist: linesToArr(f.items) } : x)); setChecks({ ...checks, [m.id]: [] }); setEditingChecklist(null); }}
                    onCancel={() => setEditingChecklist(null)} />
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                  {(m.checklist || []).map((item, idx) => {
                    const done = (checks[m.id] || []).includes(idx);
                    return (
                      <div key={idx} onClick={() => toggleCheck(m.id, idx)} style={{ display: "flex", gap: 8, alignItems: "center", cursor: editable ? "pointer" : "default", opacity: editable ? 1 : 0.7 }}>
                        {done ? <CheckCircle2 size={16} color={C.greenLight} /> : <Circle size={16} color={C.muted} />}
                        <span style={{ fontSize: 13, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- TAB: DISPONIBILITÉS ÉQUIPE (PLANNING UNIQUE) ---------------------------------- */
function TabDispos({ dispos, setDispos, team }) {
  const [whoAmI, setWhoAmI] = useState(null);
  const [viewing, setViewing] = useState(null);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const now = new Date();
  const firstWeekdayOffset = new Date(now.getFullYear(), now.getMonth(), 1).getDay(); // 0=Dim ... 6=Sam
  const todayDayNum = now.getDate();

  useEffect(() => {
    if (!viewing && team.length) setViewing(team[0].id);
  }, [team, viewing]);

  const viewingMember = team.find(m => m.id === viewing);
  const isEditing = whoAmI && whoAmI === viewing;
  const dayData = dispos[viewing] || defaultDispoDays();

  function updateDay(d, patch) {
    if (!isEditing) return;
    const memberDays = dispos[viewing] || defaultDispoDays();
    setDispos({ ...dispos, [viewing]: { ...memberDays, [d]: { ...memberDays[d], ...patch } } });
  }
  function toggleDay(d) { updateDay(d, { disponible: !dayData[d]?.disponible }); }
  function resetMine() {
    if (!isEditing) return;
    setDispos({ ...dispos, [viewing]: defaultDispoDays() });
  }

  const availableCount = days.filter(d => dayData[d]?.disponible).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ background: C.cardAlt }}>
        <div style={{ fontSize: 13 }}>📅 Chaque membre indique ici ses jours et heures de disponibilité (Jour 1 à 30 du mois). Tout le monde peut consulter, mais seule la personne concernée peut modifier son propre calendrier.</div>
      </Card>

      {!whoAmI && (
        <Card style={{ textAlign: "center" }}>
          <Eyebrow>Qui es-tu ?</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 8 }}>
            {team.map(m => (
              <button key={m.id} onClick={() => { setWhoAmI(m.id); setViewing(m.id); }} style={{
                padding: "8px 14px", borderRadius: 999, border: `1px solid ${C.border}`,
                background: "transparent", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>{m.name}</button>
            ))}
          </div>
        </Card>
      )}

      {whoAmI && (
      <>
        <div style={{ display: "flex", overflowX: "auto", gap: 6 }}>
          {team.map(m => {
            const active = viewing === m.id;
            return (
              <button key={m.id} onClick={() => setViewing(m.id)} style={{
                display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                border: `1px solid ${active ? m.color : C.border}`,
                background: active ? "rgba(243,146,0,0.12)" : "transparent",
                color: active ? m.color : C.muted, cursor: "pointer", flexShrink: 0
              }}>{m.name}{m.id === whoAmI ? " (toi)" : ""}</button>
            );
          })}
        </div>

        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: C.muted }}>Jours disponibles — {viewingMember?.name}</div>
          <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>{availableCount} / 30</div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Eyebrow>{isEditing ? "Ton calendrier (modifiable)" : `Calendrier de ${viewingMember?.name} (lecture seule)`}</Eyebrow>
            {isEditing && <button onClick={resetMine} style={iconBtn}><RotateCcw size={12} /> Réinitialiser</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {WEEKDAYS_FR.map(w => (
              <div key={w} style={{ textAlign: "center", fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5, color: (w === "Sam" || w === "Dim") ? C.gold : C.muted }}>{w}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {Array.from({ length: firstWeekdayOffset }).map((_, i) => <div key={`blank-${i}`} />)}
            {days.map(d => {
              const av = dayData[d]?.disponible;
              const isToday = d === todayDayNum;
              return (
                <button key={d}
                  onClick={() => toggleDay(d)}
                  title={[dayData[d]?.heure, dayData[d]?.note].filter(Boolean).join(" — ")}
                  style={{
                    aspectRatio: "1", borderRadius: 8,
                    border: isToday ? `2px solid ${C.goldLight}` : `1px solid ${av ? C.greenLight : C.border}`,
                    background: av ? "rgba(60,190,124,0.18)" : "rgba(255,255,255,0.04)",
                    color: av ? C.greenLight : C.muted, fontWeight: 700, fontSize: 13,
                    cursor: isEditing ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1
                  }}>
                  {d}
                  {av && dayData[d]?.heure && <span style={{ fontSize: 8, fontWeight: 600 }}>{dayData[d].heure}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 11, color: C.muted }}>
            <span><span style={{ color: C.muted }}>●</span> Indisponible</span>
            <span><span style={{ color: C.greenLight }}>●</span> Disponible</span>
          </div>
        </Card>

        {isEditing && (
          <Card>
            <Eyebrow>Ajouter une heure et une note sur un jour disponible</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {days.filter(d => dayData[d]?.disponible).map(d => (
                <div key={d} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ width: 26, fontSize: 12, fontWeight: 700, color: C.greenLight }}>J{d}</span>
                  <input type="time" value={dayData[d]?.heure || ""} onChange={e => updateDay(d, { heure: e.target.value })} style={{ ...inputStyle, width: 90, fontSize: 12, padding: "6px 8px" }} />
                  <input placeholder="Ex: dispo l'après-midi, sur RDV…" value={dayData[d]?.note || ""} onChange={e => updateDay(d, { note: e.target.value })} style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "6px 8px" }} />
                </div>
              ))}
              {availableCount === 0 && <div style={{ fontSize: 12, color: C.muted }}>Coche un jour disponible ci-dessus pour ajouter une heure.</div>}
            </div>
          </Card>
        )}

        <button onClick={() => setWhoAmI(null)} style={{ ...iconBtn, alignSelf: "center" }}>Changer d'identité</button>
      </>
      )}
    </div>
  );
}

/* ---------------------------------- CONTENU EDITABLE (Marketing / Ressources) ----------------------------------
   Les textes de depart sont dans le code (AI_TOOLS, HOOKS...). Des qu'on modifie
   quelque chose, la nouvelle version est enregistree dans "kbs:content" et remplace
   le texte d'origine. */
function useContentKey(content, setContent, key, fallback) {
  const value = content && content[key] !== undefined ? content[key] : fallback;
  return [value, (v) => setContent(c => ({ ...(c || {}), [key]: v }))];
}
const DEFAULT_TERRAIN_GUIDE = Object.entries(PROSPECTION_GUIDE).map(([categorie, services]) => ({ categorie, services }));

function GroupTitle({ title, expanded, onToggle, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
      <button onClick={onToggle} style={{ background: "none", border: "none", color: C.text, flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0, textAlign: "left" }}>
        <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 14 }}>{title}</span>
        {expanded ? <ChevronDown size={16} color={C.gold} /> : <ChevronRight size={16} color={C.gold} />}
      </button>
      {actions}
    </div>
  );
}

function TabOutils({ content, setContent }) {
  const [groups, setGroups] = useContentKey(content, setContent, "aiTools", AI_TOOLS);
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ color: C.muted, fontSize: 12.5, marginBottom: 4 }}>Boîte à outils de l'agence — chaque outil et chaque catégorie peut être modifié ou supprimé.</div>
      <EditableList items={groups} onChange={setGroups} itemLabel={g => g.cat}
        fields={[{ key: "cat", label: "Nom de la catégorie" }]} newItem={{ cat: "", items: [] }} addLabel="Ajouter une catégorie"
        render={(group, gi, actions) => {
          const expanded = open === gi;
          return (
            <Card>
              <GroupTitle title={group.cat} expanded={expanded} onToggle={() => setOpen(expanded ? -1 : gi)} actions={actions} />
              {expanded && (
                <EditableList style={{ marginTop: 12 }} items={group.items} itemLabel={t => t.name}
                  onChange={items => setGroups(groups.map((g, i) => i === gi ? { ...g, items } : g))}
                  fields={[{ key: "name", label: "Nom de l'outil" }, { key: "url", label: "Lien (https://…)" }, { key: "role", label: "À quoi il sert", type: "textarea" }, { key: "adv", label: "Avantage", type: "textarea" }]}
                  newItem={{ name: "", url: "", role: "", adv: "" }} addLabel="Ajouter un outil"
                  render={(tool, ti, acts) => (
                    <div style={{ background: C.cardAlt, borderRadius: 10, padding: 12 }}>
                      <Row actions={acts}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{tool.name}</span>
                          {tool.url && <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{ color: C.goldLight, display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>Ouvrir <ExternalLink size={12} /></a>}
                        </div>
                        <div style={{ fontSize: 12.5, color: C.text, marginTop: 6 }}>{tool.role}</div>
                        {tool.adv && <div style={{ fontSize: 12, color: C.greenLight, marginTop: 4 }}>+ {tool.adv}</div>}
                      </Row>
                    </div>
                  )} />
              )}
            </Card>
          );
        }} />
    </div>
  );
}

/* ---------------------------------- TAB: PLAN 30 JOURS ---------------------------------- */
function TabPlan({ content, setContent }) {
  const [weeks, setWeeks] = useContentKey(content, setContent, "plan", WEEKS);
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <EditableList items={weeks} onChange={setWeeks} itemLabel={w => w.title}
        fields={[{ key: "title", label: "Titre de la semaine" }, { key: "tasks", label: "Tâches", type: "lines" }]}
        newItem={{ title: "", tasks: [] }} addLabel="Ajouter une semaine"
        render={(w, i, actions) => {
          const expanded = open === i;
          return (
            <Card>
              <GroupTitle title={w.title} expanded={expanded} onToggle={() => setOpen(expanded ? -1 : i)} actions={actions} />
              {expanded && (
                <EditableList style={{ marginTop: 10 }} items={w.tasks} primitive
                  onChange={tasks => setWeeks(weeks.map((x, j) => j === i ? { ...x, tasks } : x))}
                  fields={[{ key: "text", label: "Tâche", type: "textarea" }]} newItem="" addLabel="Ajouter une tâche"
                  render={(t, idx, acts) => (
                    <Row actions={acts}>
                      <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                        <TrendingUp size={14} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{t}</span>
                      </div>
                    </Row>
                  )} />
              )}
            </Card>
          );
        }} />
    </div>
  );
}

/* ---------------------------------- TAB: CIBLE ---------------------------------- */
function TabCible({ content, setContent }) {
  const [personas, setPersonas] = useContentKey(content, setContent, "personas", PERSONAS);
  const [groupes, setGroupes] = useContentKey(content, setContent, "groupesCibles", GROUPES_CIBLES);
  const [methode, setMethode] = useContentKey(content, setContent, "methodeProspection", METHODE_PROSPECTION);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <H2>Nos clients cibles</H2>
        <EditableList items={personas} onChange={setPersonas} itemLabel={p => p.title}
          fields={[{ key: "title", label: "Profil" }, { key: "age", label: "Âge" }, { key: "desc", label: "Description", type: "textarea" }, { key: "tone", label: "Comment lui parler", type: "textarea" }]}
          newItem={{ title: "", age: "", desc: "", tone: "" }} addLabel="Ajouter un profil"
          render={(p, i, actions) => (
            <Card>
              <Row actions={actions}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.title} {p.age && <span style={{ color: C.muted, fontWeight: 500, fontSize: 12 }}>({p.age})</span>}</div>
                <div style={{ fontSize: 12.5, color: C.text, marginTop: 6 }}>{p.desc}</div>
                {p.tone && <div style={{ fontSize: 12, color: C.goldLight, marginTop: 6 }}>Comment lui parler : {p.tone}</div>}
              </Row>
            </Card>
          )} />
      </div>
      <div>
        <H2>Groupes à cibler</H2>
        <Card>
          <EditableList items={groupes} onChange={setGroupes} primitive fields={[{ key: "text", label: "Groupe", type: "textarea" }]} newItem="" addLabel="Ajouter un groupe"
            render={(g, i, acts) => <Row actions={acts}><div style={{ fontSize: 13 }}>• {g}</div></Row>} />
        </Card>
      </div>
      <div>
        <H2>Méthode de prospection (sans budget pub)</H2>
        <Card>
          <EditableList items={methode} onChange={setMethode} primitive fields={[{ key: "text", label: "Étape", type: "textarea" }]} newItem="" addLabel="Ajouter une étape"
            render={(m, i, acts) => (
              <Row actions={acts}><div style={{ display: "flex", gap: 8, fontSize: 13 }}><span style={{ color: C.gold, fontWeight: 700 }}>{i + 1}.</span> {m}</div></Row>
            )} />
        </Card>
      </div>
      <Card style={{ textAlign: "center", background: C.cardAlt }}>
        <div style={{ fontSize: 13 }}>Les hooks et les scripts complets sont dans l'onglet <span style={{ color: C.gold, fontWeight: 700 }}>Laboratoire Copywriting</span> 🔥</div>
      </Card>
    </div>
  );
}

/* ---------------------------------- TAB: COPYWRITING ---------------------------------- */
function TabCopywriting({ content, setContent }) {
  const [hooks, setHooks] = useContentKey(content, setContent, "hooks", HOOKS);
  const [scripts, setScripts] = useContentKey(content, setContent, "scripts", SCRIPTS);
  const [openHook, setOpenHook] = useState(0);
  const [openScript, setOpenScript] = useState(null);
  const nbHooks = hooks.reduce((s, g) => s + (g.items || []).length, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: C.cardAlt }}>
        <div style={{ fontSize: 13 }}>🔥 <strong>Stratégie :</strong> utilise un hook différent chaque jour pour tester ce qui accroche le mieux ton audience, puis reprends les scripts complets pour vendre en message privé.</div>
      </Card>
      <div>
        <H2>{nbHooks} hooks & accroches</H2>
        <EditableList items={hooks} onChange={setHooks} itemLabel={g => g.cat}
          fields={[{ key: "cat", label: "Catégorie" }]} newItem={{ cat: "", items: [] }} addLabel="Ajouter une catégorie"
          render={(group, gi, actions) => {
            const expanded = openHook === gi;
            return (
              <Card>
                <GroupTitle title={`${group.cat} (${(group.items || []).length})`} expanded={expanded} onToggle={() => setOpenHook(expanded ? -1 : gi)} actions={actions} />
                {expanded && (
                  <EditableList style={{ marginTop: 10 }} items={group.items} primitive
                    onChange={items => setHooks(hooks.map((g, i) => i === gi ? { ...g, items } : g))}
                    fields={[{ key: "text", label: "Hook", type: "textarea" }]} newItem="" addLabel="Ajouter un hook"
                    render={(h, i, acts) => (
                      <div style={{ display: "flex", gap: 8, fontSize: 12.5, background: C.cardAlt, borderRadius: 8, padding: 10 }}>
                        <Flame size={13} color={C.rustLight} style={{ flexShrink: 0, marginTop: 2 }} />
                        <Row actions={acts} style={{ flex: 1 }}><span>{h}</span></Row>
                      </div>
                    )} />
                )}
              </Card>
            );
          }} />
      </div>
      <div>
        <H2>{scripts.length} scripts vidéo complets</H2>
        <EditableList items={scripts} onChange={setScripts} itemLabel={s => s.title}
          fields={[{ key: "title", label: "Titre" }, { key: "hook", label: "Crochet", type: "textarea" }, { key: "probleme", label: "Problème", type: "textarea" }, { key: "solution", label: "Solution", type: "textarea" }, { key: "cta", label: "Appel à l'action", type: "textarea" }]}
          newItem={{ title: "", hook: "", probleme: "", solution: "", cta: "" }} addLabel="Ajouter un script"
          render={(s, i, actions) => {
            const expanded = openScript === i;
            return (
              <Card>
                <GroupTitle title={s.title} expanded={expanded} onToggle={() => setOpenScript(expanded ? null : i)} actions={actions} />
                {expanded && (
                  <div style={{ marginTop: 10 }}>
                    <ScriptLine label="Crochet" text={s.hook} />
                    <ScriptLine label="Problème" text={s.probleme} />
                    <ScriptLine label="Solution" text={s.solution} />
                    <ScriptLine label="Appel à l'action" text={s.cta} color={C.rustLight} />
                  </div>
                )}
              </Card>
            );
          }} />
      </div>
    </div>
  );
}

/* ---------------------------------- TAB: ACADÉMIE GRATUITE ---------------------------------- */
function TabAcademie({ content, setContent }) {
  const [list, setList] = useContentKey(content, setContent, "academie", ACADEMIE);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ color: C.muted, fontSize: 12.5 }}>Formations officielles et gratuites, spécifiques à notre domaine (marketing digital, publicité, e-commerce, IA).</div>
      <EditableList items={list} onChange={setList} itemLabel={a => a.name}
        fields={[{ key: "name", label: "Nom" }, { key: "url", label: "Lien (https://…)" }, { key: "desc", label: "Description", type: "textarea" }, { key: "certif", label: "Certificat", type: "textarea" }]}
        newItem={{ name: "", url: "", desc: "", certif: "" }} addLabel="Ajouter une formation"
        render={(a, i, actions) => (
          <Card>
            <Row actions={actions}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span>
                {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: C.goldLight, display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>Ouvrir <ExternalLink size={12} /></a>}
              </div>
              <div style={{ fontSize: 12.5, marginTop: 6 }}>{a.desc}</div>
              {a.certif && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.greenLight, marginTop: 6 }}><Award size={13} /> {a.certif}</div>}
            </Row>
          </Card>
        )} />
    </div>
  );
}

/* ---------------------------------- TAB: TARIFS ---------------------------------- */
function TabTarifs({ pricing, setPricing }) {
  const priceFields = [{ key: "name", label: "Nom de l'offre" }, { key: "online", label: "Prix en ligne (FCFA)", type: "number" }, { key: "presentiel", label: "Prix présentiel (FCFA, vide si non proposé)", type: "number" }, { key: "note", label: "Note (ex : Sur devis)" }];
  const priceRow = (r, i, acts) => (
    <Row actions={acts} style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
      <div style={{ fontSize: 12, color: C.muted }}>
        En ligne : <b style={{ color: C.goldLight }}>{r.online ? fcfa(r.online) : (r.note || "—")}</b>
        {r.presentiel != null && r.presentiel !== "" && <> · Présentiel : <b style={{ color: C.goldLight }}>{fcfa(r.presentiel)}</b></>}
      </div>
    </Row>
  );
  const setList = (key) => (rows) => setPricing({ ...pricing, [key]: rows });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <H2>Formations & Coaching</H2>
        <Card><EditableList items={pricing.formations} onChange={setList("formations")} itemLabel={r => r.name} fields={priceFields} newItem={{ name: "", online: "", presentiel: "", note: "" }} addLabel="Ajouter une formation" render={priceRow} /></Card>
      </div>
      <div>
        <H2>Prestations techniques & créatives</H2>
        <Card>
          <EditableList items={pricing.prestations} onChange={setList("prestations")} itemLabel={r => r.name}
            fields={[{ key: "name", label: "Prestation" }, { key: "price", label: "Prix (texte libre)" }]} newItem={{ name: "", price: "" }} addLabel="Ajouter une prestation"
            render={(p, i, acts) => (
              <Row actions={acts} style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 8 }}><span>{p.name}</span><span style={{ color: C.goldLight, fontWeight: 700 }}>{p.price}</span></div>
              </Row>
            )} />
        </Card>
      </div>
      <div>
        <H2>Packs stratégiques</H2>
        <Card><EditableList items={pricing.packs} onChange={setList("packs")} itemLabel={r => r.name} fields={priceFields} newItem={{ name: "", online: "", presentiel: "", note: "" }} addLabel="Ajouter un pack" render={priceRow} /></Card>
      </div>
    </div>
  );
}

function ScriptLine({ label, text, color }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: color || C.greenLight, textTransform: "uppercase" }}>{label} — </span>
      <span style={{ fontSize: 12.5 }}>{text}</span>
    </div>
  );
}

/* ---------------------------------- TAB: TRÉSORERIE ---------------------------------- */
function TabTresorerie({ prospects, setProspects, expenses, setExpenses, totalCA, totalCommission, totalDepenses, beneficeNet, team, codes, commissionRate }) {
  const [form, setForm] = useState({ label: "", categorie: DEPENSES_CATEGORIES[0], montant: "", addedBy: team[0]?.id || "" });
  const [catherineUnlocked, setCatherineUnlocked] = useState(false);
  const clientsPayants = prospects.filter(p => Number(p.montant) > 0);

  function addExpense() {
    if (!form.label.trim() || !form.montant) return;
    setExpenses([...expenses, { ...form, id: Date.now(), date: new Date().toISOString().slice(0, 10) }]);
    notifyTeam("Nouvelle dépense 💸", `${form.label} — ${fcfa(form.montant)}`, "tresorerie");
    setForm({ label: "", categorie: DEPENSES_CATEGORIES[0], montant: "", addedBy: team[0]?.id || "" });
  }
  const [editingExp, setEditingExp] = useState(null);
  function removeExpense(e) {
    if (!confirmDelete(`la dépense « ${e.label} »`)) return;
    setExpenses(expenses.filter(x => x.id !== e.id));
  }
  function saveExpense(id, f) {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...f } : e));
    setEditingExp(null);
  }
  function updateSuivi(id, suivi) { setProspects(prospects.map(p => p.id === id ? { ...p, suivi } : p)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <H2>Bilan financier (synchronisé)</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted }}>Revenus (CRM)</div>
            <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.goldLight, fontSize: 15 }}>{fcfa(totalCA)}</div>
          </Card>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted }}>Total commissions (par membre)</div>
            <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.rustLight, fontSize: 15 }}>{fcfa(totalCommission)}</div>
          </Card>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted }}>Dépenses</div>
            <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.rustLight, fontSize: 15 }}>{fcfa(totalDepenses)}</div>
          </Card>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted }}>Bénéfice net</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontWeight: 800, fontFamily: "Archivo, sans-serif", color: beneficeNet >= 0 ? C.greenLight : C.rustLight, fontSize: 15 }}>
              {beneficeNet >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {fcfa(beneficeNet)}
            </div>
          </Card>
        </div>
        <div style={{ color: C.muted, fontSize: 11.5, marginTop: 6 }}>Bénéfice net = Revenus encaissés − Total des commissions individuelles − Dépenses. Chaque membre touche son propre pourcentage sur ses ventes ; il n'y a pas de commission d'équipe.</div>
      </div>

      <div>
        <H2>Dépenses</H2>
        <Card>
          <Eyebrow>Ajouter une dépense</Eyebrow>
          {catherineUnlocked ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <input placeholder="Description (ex: Boost pub TikTok)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} style={inputStyle} />
              <div style={{ display: "flex", gap: 8 }}>
                <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                  {DEPENSES_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Montant" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              </div>
              <select value={form.addedBy} onChange={e => setForm({ ...form, addedBy: e.target.value })} style={inputStyle}>
                {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <button onClick={addExpense} style={btnGold}><Plus size={14} /> Ajouter la dépense</button>
            </div>
          ) : (
            <MiniUnlock code={codes.catherine} label="Réservé à Catherine" onUnlock={() => setCatherineUnlocked(true)} />
          )}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {expenses.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Aucune dépense enregistrée.</div>}
          {expenses.slice().reverse().map(e => (
            <Card key={e.id} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{e.categorie} · {e.date} · {team.find(m => m.id === e.addedBy)?.name}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 700, color: C.rustLight, fontSize: 13 }}>-{fcfa(e.montant)}</div>
                  {catherineUnlocked && <EditDeleteButtons editing={editingExp === e.id} onEdit={() => setEditingExp(editingExp === e.id ? null : e.id)} onDelete={() => removeExpense(e)} />}
                </div>
              </div>
              {editingExp === e.id && (
                <EditFields value={{ label: e.label || "", categorie: e.categorie || DEPENSES_CATEGORIES[0], montant: e.montant ?? "", date: e.date || "", addedBy: e.addedBy || "" }}
                  fields={[
                    { key: "label", label: "Description" },
                    { key: "categorie", label: "Catégorie", type: "select", options: DEPENSES_CATEGORIES },
                    { key: "montant", label: "Montant (FCFA)", type: "number" },
                    { key: "date", label: "Date", type: "date" },
                    { key: "addedBy", label: "Ajoutée par", type: "select", options: team.map(m => ({ value: m.id, label: m.name })) },
                  ]}
                  onSave={(f) => saveExpense(e.id, f)} onCancel={() => setEditingExp(null)} />
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <H2>Suivi des clients payants</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clientsPayants.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Aucun client payant pour l'instant.</div>}
          {clientsPayants.map(p => (
            <Card key={p.id}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.nom}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{p.pack} · {fcfa(p.montant)}</div>
              {catherineUnlocked ? (
                <select value={p.suivi || SUIVI_STATUTS[0]} onChange={e => updateSuivi(p.id, e.target.value)} style={{ ...inputStyle, marginTop: 8, fontSize: 12 }}>
                  {SUIVI_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>{p.suivi || SUIVI_STATUTS[0]}</div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- TAB: DETTES & RAPPELS ---------------------------------- */
function TabDettes({ dettes, setDettes, prospects }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ clientNom: "", whatsapp: "", service: "", montantDu: "", dateEcheance: today, statut: "En attente", linkedId: "" });

  function pickClient(id) {
    const p = prospects.find(pp => String(pp.id) === String(id));
    if (p) setForm({ ...form, linkedId: id, clientNom: `${p.prenom || ""} ${p.nom}`.trim(), whatsapp: p.whatsapp || "", service: p.pack || "" });
    else setForm({ ...form, linkedId: "" });
  }
  function addDette() {
    if (!form.clientNom.trim() || !form.montantDu) return;
    setDettes([...dettes, { ...form, id: Date.now() }]);
    notifyTeam("Nouvelle dette à suivre 🧾", `${form.clientNom} doit ${fcfa(form.montantDu)}`, "dettes");
    setForm({ clientNom: "", whatsapp: "", service: "", montantDu: "", dateEcheance: today, statut: "En attente", linkedId: "" });
  }
  function markPaid(id) { setDettes(dettes.map(d => d.id === id ? { ...d, statut: "Payée" } : d)); }
  const [editingDette, setEditingDette] = useState(null);
  function removeDette(d) {
    if (!confirmDelete(`la dette de « ${d.clientNom} »`)) return;
    setDettes(dettes.filter(x => x.id !== d.id));
  }
  function saveDette(id, f) {
    setDettes(dettes.map(d => d.id === id ? { ...d, ...f } : d));
    setEditingDette(null);
  }

  function urgency(d) {
    if (d.statut === "Payée") return "payee";
    return d.dateEcheance < today ? "retard" : "attente";
  }
  const sorted = dettes.slice().sort((a, b) => {
    const order = { retard: 0, attente: 1, payee: 2 };
    return order[urgency(a)] - order[urgency(b)];
  });
  const totalDu = dettes.filter(d => d.statut !== "Payée").reduce((s, d) => s + (Number(d.montantDu) || 0), 0);
  const enRetard = dettes.filter(d => urgency(d) === "retard").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>Total dû (impayé)</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: C.goldLight, fontSize: 15 }}>{fcfa(totalDu)}</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted }}>Échéances en retard</div>
          <div style={{ fontWeight: 800, fontFamily: "Archivo, sans-serif", color: enRetard > 0 ? C.rustLight : C.greenLight, fontSize: 15 }}>{enRetard}</div>
        </Card>
      </div>

      <Card>
        <Eyebrow>Enregistrer une dette / échéance</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <select value={form.linkedId} onChange={e => pickClient(e.target.value)} style={inputStyle}>
            <option value="">— Choisir un client existant (optionnel) —</option>
            {prospects.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
          </select>
          <input placeholder="Nom du client" value={form.clientNom} onChange={e => setForm({ ...form, clientNom: e.target.value })} style={inputStyle} />
          <input placeholder="Numéro WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={inputStyle} />
          <input placeholder="Service concerné" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" placeholder="Montant dû (FCFA)" value={form.montantDu} onChange={e => setForm({ ...form, montantDu: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <input type="date" value={form.dateEcheance} onChange={e => setForm({ ...form, dateEcheance: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <button onClick={addDette} style={btnGold}><Plus size={14} /> Enregistrer la dette</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Aucune dette enregistrée. 🎉</div>}
        {sorted.map(d => {
          const u = urgency(d);
          const color = u === "retard" ? C.rustLight : u === "payee" ? C.greenLight : C.goldLight;
          const label = u === "retard" ? "En retard" : u === "payee" ? "Payée" : "À échoir";
          return (
            <Card key={d.id} style={{ borderColor: u === "retard" ? C.rust : C.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{d.clientNom}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{d.service}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Échéance : {d.dateEcheance}</div>
                </div>
                <EditDeleteButtons editing={editingDette === d.id} onEdit={() => setEditingDette(editingDette === d.id ? null : d.id)} onDelete={() => removeDette(d)} />
              </div>
              {editingDette === d.id && (
                <EditFields value={{ clientNom: d.clientNom || "", whatsapp: d.whatsapp || "", service: d.service || "", montantDu: d.montantDu ?? "", dateEcheance: d.dateEcheance || "", statut: d.statut || "En attente" }}
                  fields={[
                    { key: "clientNom", label: "Nom du client" },
                    { key: "whatsapp", label: "WhatsApp" },
                    { key: "service", label: "Service concerné" },
                    { key: "montantDu", label: "Montant dû (FCFA)", type: "number" },
                    { key: "dateEcheance", label: "Échéance", type: "date" },
                    { key: "statut", label: "Statut", type: "select", options: ["En attente", "Payée"] },
                  ]}
                  onSave={(f) => saveDette(d.id, f)} onCancel={() => setEditingDette(null)} />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 6 }}>{label}</span>
                <div style={{ fontWeight: 700, color: C.goldLight, fontSize: 13 }}>{fcfa(d.montantDu)}</div>
              </div>
              {d.statut !== "Payée" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {d.whatsapp && (
                    <a href={whatsappRappelLink(d)} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, flex: 1, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Send size={12} /> Rappel WhatsApp
                    </a>
                  )}
                  <button onClick={() => markPaid(d.id)} style={{ ...iconBtn, flex: 1, color: C.greenLight, borderColor: C.green }}>Marquer payée</button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card style={{ background: C.cardAlt }}>
        <div style={{ fontSize: 11.5, color: C.muted }}>💡 Le rappel WhatsApp s'ouvre en un clic avec le message pré-rédigé. Pour un envoi vraiment automatique sans intervention, il faudra la version Supabase + Make.com.</div>
      </Card>
    </div>
  );
}
/* ---------------------------------- TAB: PROSPECTION RÉSEAUX ---------------------------------- */
function TabProspection({ prospection, setProspection, prospects, setProspects, team, pricing, allServicesFlat, content, setContent }) {
  const [dmScripts, setDmScripts] = useContentKey(content, setContent, "dmScripts", DM_SCRIPTS);
  const [service, setService] = useState(allServicesFlat[0]);
  const [copiedStage, setCopiedStage] = useState(null);
  const [form, setForm] = useState({ nom: "", whatsapp: "", source: "", commentaire: "", interet: "Chaud", statut: "À répondu", scriptUtilise: DM_SCRIPTS[0].stage, note: "" });

  const priceInfo = findServiceInfo(service, pricing);

  function renderScript(text) {
    return text.replaceAll("[Service]", service).replaceAll("[Prix]", priceInfo.price);
  }
  function copyScript(stage, text) {
    try {
      navigator.clipboard.writeText(renderScript(text));
      setCopiedStage(stage);
      setTimeout(() => setCopiedStage(null), 1500);
    } catch { /* ignore */ }
  }

  function addEntry() {
    if (!form.nom.trim()) return;
    setProspection([...prospection, { ...form, id: Date.now(), date: new Date().toISOString().slice(0, 10) }]);
    setForm({ nom: "", whatsapp: "", source: "", commentaire: "", interet: "Chaud", statut: "À répondu", scriptUtilise: DM_SCRIPTS[0].stage, note: "" });
  }
  function updateStatut(id, statut) { setProspection(prospection.map(p => p.id === id ? { ...p, statut } : p)); }
  const [editingEntry, setEditingEntry] = useState(null);
  function removeEntry(id) { setProspection(prev => prev.filter(p => p.id !== id)); }
  function deleteEntry(p) {
    if (!confirmDelete(`le contact « ${p.nom} »`)) return;
    removeEntry(p.id);
  }
  function saveEntry(id, f) {
    setProspection(prospection.map(p => p.id === id ? { ...p, ...f } : p));
    setEditingEntry(null);
  }
  function convertToClient(p) {
    setProspects([...prospects, {
      id: Date.now(), nom: p.nom, prenom: "", whatsapp: p.whatsapp, email: "", adresse: "", quartier: "",
      dateInscription: new Date().toISOString().slice(0, 10), pack: pricing.packs[0]?.name || "", statut: "En discussion",
      montant: "", owner: team[0]?.id || "", historique: [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), note: `Converti depuis la prospection (source : ${p.source || "réseaux sociaux"})` }],
    }]);
    removeEntry(p.id);
  }

  const interetColor = { Chaud: C.rustLight, Tiède: C.goldLight, Froid: "#7FB3E8" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: C.cardAlt }}>
        <div style={{ fontSize: 13 }}>🎯 Ces messages sont pour Catherine : à envoyer en réponse aux commentaires Facebook/TikTok, puis en DM privé. Choisis le service concerné, le texte se met à jour automatiquement.</div>
      </Card>

      <Card>
        <Eyebrow>Service à mettre en avant</Eyebrow>
        <select value={service} onChange={e => setService(e.target.value)} style={{ ...inputStyle, marginTop: 8 }}>
          {allServicesFlat.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Card>

      <div>
        <H2>Scripts DM — copier-coller</H2>
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Dans les textes, [Service] et [Prix] sont remplacés automatiquement.</div>
        <EditableList items={dmScripts} onChange={setDmScripts} itemLabel={s => s.stage}
          fields={[{ key: "stage", label: "Étape" }, { key: "text", label: "Message", type: "textarea" }]}
          newItem={{ stage: "", text: "" }} addLabel="Ajouter un script DM"
          render={(s, i, actions) => (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 6 }}>
                <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.gold, flex: 1 }}>{s.stage}</span>
                <button onClick={() => copyScript(s.stage, s.text)} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5 }}>
                  <Copy size={12} /> {copiedStage === s.stage ? "Copié !" : "Copier"}
                </button>
                {actions}
              </div>
              <div style={{ fontSize: 12.5, whiteSpace: "pre-line", color: C.text, background: C.cardAlt, borderRadius: 8, padding: 10 }}>{renderScript(s.text)}</div>
            </Card>
          )} />
      </div>

      <div>
        <H2>Suivi des commentaires & DM</H2>
        <Card>
          <Eyebrow>Ajouter un contact repéré</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <input placeholder="Nom & Prénom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={inputStyle} />
            <input placeholder="Contact WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={inputStyle} />
            <input placeholder="Source (groupe / page)" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={inputStyle} />
            <input placeholder="Commentaire vu" value={form.commentaire} onChange={e => setForm({ ...form, commentaire: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 8 }}>
              <select value={form.interet} onChange={e => setForm({ ...form, interet: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                {INTERET_NIVEAUX.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <select value={form.scriptUtilise} onChange={e => setForm({ ...form, scriptUtilise: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                {dmScripts.map(s => <option key={s.stage} value={s.stage}>{s.stage}</option>)}
              </select>
            </div>
            <button onClick={addEntry} style={btnGold}><Plus size={14} /> Ajouter au suivi</button>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {prospection.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Aucun contact repéré pour l'instant.</div>}
          {prospection.slice().reverse().map(p => (
            <Card key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.nom}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.whatsapp} · {p.source}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>"{p.commentaire}"</div>
                </div>
                <EditDeleteButtons editing={editingEntry === p.id} onEdit={() => setEditingEntry(editingEntry === p.id ? null : p.id)} onDelete={() => deleteEntry(p)} />
              </div>
              {editingEntry === p.id && (
                <EditFields value={{ nom: p.nom || "", whatsapp: p.whatsapp || "", source: p.source || "", commentaire: p.commentaire || "", interet: p.interet || "Chaud", scriptUtilise: p.scriptUtilise || dmScripts[0]?.stage || "" }}
                  fields={[
                    { key: "nom", label: "Nom & Prénom" },
                    { key: "whatsapp", label: "WhatsApp" },
                    { key: "source", label: "Source" },
                    { key: "commentaire", label: "Commentaire vu", type: "textarea" },
                    { key: "interet", label: "Intérêt", type: "select", options: INTERET_NIVEAUX },
                    { key: "scriptUtilise", label: "Script utilisé", type: "select", options: dmScripts.map(s => s.stage) },
                  ]}
                  onSave={(f) => saveEntry(p.id, f)} onCancel={() => setEditingEntry(null)} />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 6 }}>
                <select value={p.statut} onChange={e => updateStatut(p.id, e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, width: "auto" }}>
                  {PROSPECTION_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ fontSize: 11, fontWeight: 700, color: interetColor[p.interet] }}>{p.interet}</span>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Script utilisé : {p.scriptUtilise} · {p.date}</div>
              <button onClick={() => convertToClient(p)} style={{ ...iconBtn, marginTop: 8, width: "100%", color: C.greenLight, borderColor: C.green }}>
                ✓ Convertir en client (CRM)
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- TAB: PROSPECTION TERRAIN ---------------------------------- */
function TabProspectionTerrain({ agency, content, setContent }) {
  const [methode, setMethode] = useContentKey(content, setContent, "methodeTerrain", METHODE_TERRAIN);
  const [guide, setGuide] = useContentKey(content, setContent, "terrainGuide", DEFAULT_TERRAIN_GUIDE);
  const [openService, setOpenService] = useState(null);
  const [openMethode, setOpenMethode] = useState(true);
  const serviceFields = [
    { key: "name", label: "Service" }, { key: "cible", label: "Cible idéale", type: "textarea" },
    { key: "portfolio", label: "Portefeuille à montrer", type: "textarea" }, { key: "accroche", label: "Accroche", type: "textarea" },
    { key: "objection", label: "Objection fréquente", type: "textarea" }, { key: "reponse", label: "Réponse", type: "textarea" },
    { key: "script", label: "Script complet", type: "lines" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ background: C.cardAlt }}>
        <div style={{ fontSize: 13 }}>🚪 Guide complet pour approcher, convaincre et convertir des entreprises physiques (boutiques, restaurants, PME…) en face à face. Une fiche par service : qui viser, quoi montrer, quoi dire.</div>
      </Card>

      <button onClick={() => generateProspectionPDF(agency, methode, guide)} style={{ ...btnGold, justifyContent: "center" }}>
        <FileText size={14} /> Télécharger le guide complet en PDF
      </button>

      <div>
        <div onClick={() => setOpenMethode(!openMethode)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <H2>Méthode universelle en {methode.length} étapes</H2>
          {openMethode ? <ChevronDown size={18} color={C.muted} /> : <ChevronRight size={18} color={C.muted} />}
        </div>
        {openMethode && (
          <EditableList items={methode} onChange={setMethode} itemLabel={m => m.titre}
            fields={[{ key: "titre", label: "Titre de l'étape" }, { key: "points", label: "Points", type: "lines" }]}
            newItem={{ titre: "", points: [] }} addLabel="Ajouter une étape"
            render={(m, i, actions) => (
              <Card>
                <Row actions={actions}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: C.goldLight, marginBottom: 6 }}>{i + 1}. {m.titre}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(m.points || []).map((p, j) => <div key={j} style={{ fontSize: 12.5, color: C.text }}>• {p}</div>)}
                  </div>
                </Row>
              </Card>
            )} />
        )}
      </div>

      <EditableList items={guide} onChange={setGuide} itemLabel={g => g.categorie}
        fields={[{ key: "categorie", label: "Nom de la catégorie" }]} newItem={{ categorie: "", services: [] }} addLabel="Ajouter une catégorie de services"
        render={(g, gi, actions) => (
          <div>
            <Row actions={actions}><H2>{g.categorie}</H2></Row>
            <EditableList items={g.services} itemLabel={s => s.name}
              onChange={services => setGuide(guide.map((x, i) => i === gi ? { ...x, services } : x))}
              fields={serviceFields} newItem={{ name: "", cible: "", portfolio: "", accroche: "", objection: "", reponse: "", script: [] }} addLabel="Ajouter un service"
              render={(s, si, acts) => {
                const key = `${gi}-${si}`;
                const open = openService === key;
                return (
                  <Card>
                    <GroupTitle title={s.name} expanded={open} onToggle={() => setOpenService(open ? null : key)} actions={acts} />
                    {open && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                        <div><Eyebrow>Cible idéale</Eyebrow><div style={{ fontSize: 12.5 }}>{s.cible}</div></div>
                        <div><Eyebrow>Portefeuille à montrer</Eyebrow><div style={{ fontSize: 12.5 }}>{s.portfolio}</div></div>
                        <div><Eyebrow>Accroche</Eyebrow><div style={{ fontSize: 12.5, fontStyle: "italic", color: C.goldLight }}>"{s.accroche}"</div></div>
                        <div><Eyebrow>Objection fréquente</Eyebrow><div style={{ fontSize: 12.5, color: C.rustLight }}>{s.objection}</div></div>
                        <div><Eyebrow>Réponse</Eyebrow><div style={{ fontSize: 12.5 }}>{s.reponse}</div></div>
                        {(s.script || []).length > 0 && (
                          <div>
                            <Eyebrow>Script complet — du début à la fin</Eyebrow>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                              {s.script.map((step, i) => (
                                <div key={i} style={{ fontSize: 12, display: "flex", gap: 6 }}><span style={{ color: C.gold, fontWeight: 700 }}>{i + 1}.</span> {step}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              }} />
          </div>
        )} />
    </div>
  );
}


function PriceTable({ rows }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: 11, color: C.muted, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ flex: 2 }}>Offre</div><div style={{ flex: 1, textAlign: "right" }}>En ligne</div><div style={{ flex: 1, textAlign: "right" }}>Présentiel</div>
      </div>
      {rows.map(r => (
        <div key={r.name} style={{ display: "flex", fontSize: 12.5, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ flex: 2 }}>{r.name}</div>
          <div style={{ flex: 1, textAlign: "right", color: C.goldLight, fontWeight: 700 }}>{fcfa(r.online)}</div>
          <div style={{ flex: 1, textAlign: "right", color: C.muted }}>{r.presentiel ? fcfa(r.presentiel) : (r.note || "—")}</div>
        </div>
      ))}
    </div>
  );
}

/* Éditeur générique pour les 3 listes de tarifs (Packs, Formations, Prestations) dans Administration */
function PricingListEditor({ title, rows, onChange, priceMode }) {
  const isText = priceMode === "text";
  const [newRow, setNewRow] = useState(isText ? { name: "", price: "" } : { name: "", online: "", presentiel: "", note: "" });

  function updateRow(idx, patch) {
    onChange(rows.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }
  function addRow() {
    if (!newRow.name.trim()) return;
    if (isText) {
      onChange([...rows, { name: newRow.name, price: newRow.price }]);
      setNewRow({ name: "", price: "" });
    } else {
      onChange([...rows, {
        name: newRow.name,
        online: Number(newRow.online) || 0,
        presentiel: newRow.presentiel === "" ? null : Number(newRow.presentiel),
        note: newRow.note || undefined,
      }]);
      setNewRow({ name: "", online: "", presentiel: "", note: "" });
    }
  }

  return (
    <Card style={{ marginBottom: 14 }}>
      <Eyebrow>{title}</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {rows.map((r, idx) => (
          <div key={idx} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", background: C.cardAlt, borderRadius: 8, padding: 8 }}>
            <input value={r.name} onChange={e => updateRow(idx, { name: e.target.value })} style={{ ...inputStyle, flex: "1 1 160px" }} placeholder="Nom" />
            {isText ? (
              <input value={r.price} onChange={e => updateRow(idx, { price: e.target.value })} style={{ ...inputStyle, flex: "1 1 140px" }} placeholder="Prix (texte libre)" />
            ) : (
              <>
                <input type="number" value={r.online ?? ""} onChange={e => updateRow(idx, { online: Number(e.target.value) || 0 })} style={{ ...inputStyle, width: 100 }} placeholder="En ligne" />
                <input type="number" value={r.presentiel ?? ""} onChange={e => updateRow(idx, { presentiel: e.target.value === "" ? null : Number(e.target.value) })} style={{ ...inputStyle, width: 100 }} placeholder="Présentiel" />
                <input value={r.note || ""} onChange={e => updateRow(idx, { note: e.target.value })} style={{ ...inputStyle, flex: "1 1 100px" }} placeholder="Note (ex: Sur devis)" />
              </>
            )}
            <button aria-label="Supprimer" onClick={() => { if (confirmDelete(`l'offre « ${r.name} »`)) onChange(rows.filter((_, i) => i !== idx)); }}
              style={{ background: "none", border: "none", color: C.rustLight, cursor: "pointer", padding: 4 }}><Trash2 size={15} /></button>
          </div>
        ))}
        {rows.length === 0 && <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: 10 }}>Aucune offre pour l'instant.</div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <input value={newRow.name} onChange={e => setNewRow({ ...newRow, name: e.target.value })} style={{ ...inputStyle, flex: "1 1 160px" }} placeholder="Nouvelle offre" />
        {isText ? (
          <input value={newRow.price} onChange={e => setNewRow({ ...newRow, price: e.target.value })} style={{ ...inputStyle, flex: "1 1 140px" }} placeholder="Prix" />
        ) : (
          <>
            <input type="number" value={newRow.online} onChange={e => setNewRow({ ...newRow, online: e.target.value })} style={{ ...inputStyle, width: 100 }} placeholder="En ligne" />
            <input type="number" value={newRow.presentiel} onChange={e => setNewRow({ ...newRow, presentiel: e.target.value })} style={{ ...inputStyle, width: 100 }} placeholder="Présentiel" />
          </>
        )}
        <button onClick={addRow} style={{ ...iconBtn, padding: "0 12px" }}><Plus size={14} /></button>
      </div>
    </Card>
  );
}

/* ---------------------------------- TAB: LIENS PARTAGÉS ---------------------------------- */
function TabLiens({ links, setLinks, team }) {
  const [form, setForm] = useState({ label: "", url: "", addedBy: team[0]?.id || "" });
  function add() {
    if (!form.label.trim() || !form.url.trim()) return;
    setLinks([...links, { ...form, id: Date.now() }]);
    setForm({ label: "", url: "", addedBy: team[0]?.id || "" });
  }
  const [editingLink, setEditingLink] = useState(null);
  function removeLink(l) {
    if (!confirmDelete(`le lien « ${l.label} »`)) return;
    setLinks(links.filter(x => x.id !== l.id));
  }
  function saveLink(id, f) {
    if (!f.label.trim() || !f.url.trim()) return;
    setLinks(links.map(l => l.id === id ? { ...l, ...f } : l));
    setEditingLink(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: C.muted, fontSize: 12.5 }}>Cet espace est partagé entre les 3 membres — tout ce que l'un ajoute, les autres le voient.</div>
      <Card>
        <Eyebrow>Ajouter un lien utile</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <input placeholder="Nom du lien / outil" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} style={inputStyle} />
          <input placeholder="https://…" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={inputStyle} />
          <select value={form.addedBy} onChange={e => setForm({ ...form, addedBy: e.target.value })} style={inputStyle}>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button onClick={add} style={btnGold}><Plus size={14} /> Ajouter</button>
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucun lien ajouté pour l'instant.</div>}
        {links.slice().reverse().map(l => (
          <Card key={l.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{l.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Ajouté par {team.find(m => m.id === l.addedBy)?.name}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: C.goldLight }}><ExternalLink size={16} /></a>
                <EditDeleteButtons editing={editingLink === l.id} onEdit={() => setEditingLink(editingLink === l.id ? null : l.id)} onDelete={() => removeLink(l)} />
              </div>
            </div>
            {editingLink === l.id && (
              <EditFields value={{ label: l.label || "", url: l.url || "", addedBy: l.addedBy || "" }}
                fields={[
                  { key: "label", label: "Nom du lien" },
                  { key: "url", label: "Adresse (https://…)" },
                  { key: "addedBy", label: "Ajouté par", type: "select", options: team.map(m => ({ value: m.id, label: m.name })) },
                ]}
                onSave={(f) => saveLink(l.id, f)} onCancel={() => setEditingLink(null)} />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- FORMATION: GUIDES EDITABLES ---------------------------------- */
// Format simple et editable dans Administration :
// "## Titre" = en-tete de section — "- texte" = puce — ligne normale = paragraphe
const DEFAULT_GUIDES = {
  catherine: `## Ta posture
Tu es le premier visage professionnel de KBS DIGITAL AGENCY.
- Tu réponds vite — moins de 30 min en journée. Un client qui attend va voir ailleurs.
- Tu ne mens jamais sur un délai, un prix ou une prestation.
- Tu gardes le contrôle poli de la conversation — c'est toi qui poses les questions.

## Les 3 canaux, 3 façons de parler
- Groupes / commentaires publics : réponse courte et chaleureuse, jamais commerciale. Objectif : faire passer en privé.
- WhatsApp privé : ici se fait 90% du travail réel. Toujours commencer par le prénom.
- Appel vocal/vidéo : réservé aux clients chauds (Packs 3, 4, 6, 7 ou budget important).

## La structure d'une conversation qui closes
- 1. Accroche — remercier + montrer qu'on a compris la situation.
- 2. Qualification — 2-3 questions AVANT d'envoyer un tarif (besoin, budget, urgence).
- 3. Offre adaptée — jamais toute la liste de prix, 1 ou 2 solutions maximum.
- 4. Objection — répondre par une question, jamais une excuse.
- 5. Closing — voir ci-dessous.

## Scripts prêts à adapter (avec nos vrais tarifs)
- Petit budget : « Pack 1 (Formation + Vente) à partir de 45 000 FCFA. »
- Présence pro complète : « Pack 4 (Présence Pro) à 170 000 FCFA. »
- Hésitant : « On peut commencer petit : une page de vente à 25 000 FCFA. »
- Relance douce : « Je reviens vers vous — vous avez eu le temps de regarder l'offre ? »

## Gérer les objections
- « C'est trop cher » → « Regardons ensemble ce qui compte le plus pour vous. »
- « Je vais réfléchir » → « Qu'est-ce qui vous ferait hésiter précisément ? »
- « Pas confiance » → Envoyer un exemple concret + devis/reçu officiel dès le 1er échange.
- « Un autre moins cher » → « La différence : un suivi réel, pas juste une livraison. »

## Le closing
- Par choix : « On part sur la version en ligne ou en présentiel ? »
- Par urgence légitime : « Je peux vous bloquer une place cette semaine. »
- Par confirmation simple : « Je vous envoie le devis, vous confirmez et on démarre. »
- Après un closing réussi : toujours envoyer un devis/reçu PDF dans les 10 minutes.

## Finance & Trésorerie
- Chaque paiement reçu = reçu PDF envoyé immédiatement.
- Chaque devis a une date de validité claire.
- Relance de paiement en retard : ferme mais respectueuse.
- Un message = un objectif — ne jamais mélanger technique et argent.

## Checklist quotidienne
- Tous les messages de la veille ont une réponse
- Aucun message resté plus de 30 min sans réponse
- Chaque prospect qualifié avant envoi d'un prix
- Chaque vente confirmée = devis/reçu PDF envoyé le jour même
- Chaque impayé de +3 jours = relance envoyée`,

  sacko: `## Ta posture
Double casquette : coordonner l'équipe et produire du visuel professionnel.
- Règle : auto-formation active — pratique le jour même sur un vrai projet client.
- 1 nouvel outil appris = 1 application immédiate sur un visuel réel.

## Applications & sites gratuits — Graphisme
- Canva (gratuit) — posts, carrousels, présentations
- Adobe Express — visuels rapides, retouche simple
- Figma (gratuit) — maquettes, pages de vente
- Remove.bg — détourage d'images en 1 clic
- Inkscape (gratuit) — logos, vectoriel
- CapCut — montage vidéo courts formats

## Intelligence Artificielle gratuite — Graphisme
- Canva IA — génération d'image + suppression d'arrière-plan
- Microsoft Designer — gratuit, bannières et posts LinkedIn/Instagram
- Adobe Firefly — génération d'image utilisable commercialement
- Leonardo AI / Krea.ai — génération plus créative, contrôle avancé
- Claude ou ChatGPT — prompts, brief, idées de concepts

## Outils gratuits — Coordination
- Trello (gratuit) — Kanban visuel d'équipe
- Notion (gratuit) — centraliser notes, plannings, documents
- Google Agenda + Google Sheets — suivi de planning
- WhatsApp Business — messages automatiques, catalogue

## Chaînes YouTube à suivre
- Balo — identité visuelle, redesign de logo
- Emmanuel Correia — Photoshop, Illustrator, InDesign
- AdobeFrance — nouveautés et astuces officielles Adobe
- PiXimperfect (anglais) — Photoshop niveau pro

## Mots-clés YouTube / TikTok
- graphisme débutant tuto / Canva tutoriel français
- règles de composition design / théorie des couleurs
- identité visuelle marque tuto / design post Instagram Canva
- CapCut tutoriel français / motion design débutant
- Canva IA astuce / Adobe Firefly tutoriel
- Trello tutoriel français débutant / Notion organisation équipe
- tendances graphisme 2026

## Plan d'auto-formation — 4 premières semaines
- Semaine 1 — Bases Canva + configurer un Trello simple pour l'équipe.
- Semaine 2 — Identité visuelle : refaire un visuel client existant.
- Semaine 3 — IA appliquée sur un client réel.
- Semaine 4 — Coordination avancée : planning complet sur Trello/Notion.

## Checklist hebdomadaire
- Au moins 1 nouvelle technique apprise et appliquée sur un vrai visuel
- Planning de l'équipe à jour
- Une chaîne YouTube ou un mot-clé exploré cette semaine
- Un visuel produit avec l'aide d'une IA, testé et validé`,

  oumou: `## Ta posture
Tu captes l'attention en 3 secondes — un contenu qui n'accroche pas est un contenu mort.

## Les fondamentaux d'un bon contenu
- Le hook — les 3 premières secondes, jamais un simple « Bonjour à tous ».
- Le storytelling — problème → solution → résultat.
- Un seul message par contenu.
- L'appel à l'action clair.
- La régularité — 3x/semaine bat 1x/mois parfait.

## Outils gratuits — Création
- Canva (gratuit) — posts, carrousels, miniatures
- CapCut — montage Reels/TikTok, sous-titres automatiques
- InShot — alternative simple sur mobile
- Adobe Express — visuels rapides par réseau

## Intelligence Artificielle gratuite — Contenu
- Claude ou ChatGPT — idées de hooks, scripts de Reel
- Canva Magic Media — génération d'images IA
- Microsoft Designer / Bing Image Creator — génération gratuite
- Lumen5 — transforme un texte en vidéo courte
- Conseil : utilise l'IA pour le 1er jet, réécris avec ta propre voix.

## Chaînes YouTube à suivre
- Les Mots Magiques — fondamentaux du copywriting
- Yann Leonardi — copywriting, storytelling
- Dan Noël — algorithmes Instagram, TikTok, LinkedIn

## Mots-clés YouTube / TikTok
- copywriting débutant / comment écrire une accroche
- storytelling réseaux sociaux / légende Instagram qui convertit
- créer du contenu TikTok débutant / script Reel Instagram
- hook vidéo première seconde / content creator tips
- algorithme TikTok 2026 / algorithme Instagram
- ChatGPT idées de contenu / prompt copywriting IA
- tendances TikTok 2026

## Plan d'auto-formation — 4 premières semaines
- Semaine 1 — Les hooks : réécrire les 5 derniers posts KBS.
- Semaine 2 — Storytelling : 3 posts problème → solution → résultat.
- Semaine 3 — Formats courts : maîtriser CapCut, 2 Reels test.
- Semaine 4 — IA appliquée : 10 idées générées puis réécrites.

## Checklist par contenu
- Le hook donne envie de rester dans les 3 premières secondes
- Un seul message clair
- Appel à l'action explicite à la fin
- Le texte sonne naturel, pas généré par IA
- Le format est adapté à la plateforme`,
};

function renderGuideText(text) {
  const lines = (text || "").split("\n");
  const blocks = [];
  let list = [];
  function flushList() {
    if (list.length) { blocks.push({ type: "list", items: list }); list = []; }
  }
  lines.forEach((line) => {
    const t = line.trim();
    if (!t) { flushList(); return; }
    if (t.startsWith("## ")) { flushList(); blocks.push({ type: "heading", text: t.slice(3) }); }
    else if (t.startsWith("- ")) { list.push(t.slice(2)); }
    else { flushList(); blocks.push({ type: "p", text: t }); }
  });
  flushList();
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "heading") return <Eyebrow key={i}>{b.text}</Eyebrow>;
        if (b.type === "list") return (
          <ul key={i} style={{ margin: "0 0 12px", paddingLeft: 18 }}>
            {b.items.map((it, j) => <li key={j} style={{ fontSize: 13, color: C.text, marginBottom: 5, lineHeight: 1.45 }}>{it}</li>)}
          </ul>
        );
        return <p key={i} style={{ fontSize: 13, color: C.text, marginBottom: 10, lineHeight: 1.5 }}>{b.text}</p>;
      })}
    </>
  );
}

/* ---------------------------------- TAB: FORMATION ---------------------------------- */
const FORMATION_SECTIONS = [
  { id: "guides", label: "Guide" },
  { id: "liens", label: "Liens" },
];

// Les sections de Formation suivent l'equipe : tout nouveau membre recrute dans
// Administration obtient automatiquement son guide et ses liens, deverrouilles
// par son propre code personnel.
function TabFormation({ team, codes, guides, formationLiens }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [unlockedId, setUnlockedId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [section, setSection] = useState("guides");

  const labels = Object.fromEntries(team.map(m => [m.id, m.name]));

  function tryUnlock() {
    // Le code Administration (ou le code maître) ouvre tout (vue CEO).
    if (codeMatchesStrict(code, codes.admin)) {
      setUnlockedId("admin"); setError(false); setCode(""); setViewing(team[0]?.id || null);
      return;
    }
    const member = team.find(m => codeMatchesStrict(code, m.code));
    if (member) {
      setUnlockedId(member.id); setError(false); setCode(""); setViewing(member.id);
      return;
    }
    setError(true);
  }

  if (!unlockedId) {
    return (
      <div>
        <H2>Formation</H2>
        <Card>
          <Eyebrow>Ton espace personnel</Eyebrow>
          <div style={{ color: C.muted, fontSize: 12, margin: "6px 0 10px" }}>Entre ton code personnel pour voir ton guide et tes liens — chaque guide est privé. Seul le code Administration ouvre ceux de toute l'équipe.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="password" placeholder="Ton code" value={code}
              onChange={e => { setCode(e.target.value); setError(false); }}
              onKeyDown={e => { if (e.key === "Enter") tryUnlock(); }}
              style={{ ...inputStyle, flex: 1 }} />
            <button onClick={tryUnlock} style={{ ...iconBtn, padding: "0 16px" }}>OK</button>
          </div>
          {error && <div style={{ color: C.rustLight, fontSize: 11, marginTop: 6 }}>Code incorrect.</div>}
        </Card>
      </div>
    );
  }

  const availableGuides = unlockedId === "admin" ? team.map(m => m.id) : [unlockedId];
  const activeId = (viewing && availableGuides.includes(viewing)) ? viewing : availableGuides[0];
  const liens = (formationLiens || {})[activeId] || [];
  const guideText = (guides || {})[activeId] || "";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <H2>Formation</H2>
        <button onClick={() => { setUnlockedId(null); setViewing(null); }} style={iconBtn}><Lock size={12} /></button>
      </div>
      {availableGuides.length > 1 && (
        <div className="kbs-navbar" style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
          {availableGuides.map(gid => (
            <button key={gid} onClick={() => setViewing(gid)} style={{
              padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
              border: `1px solid ${activeId === gid ? C.gold : C.border}`,
              background: activeId === gid ? "rgba(243,146,0,0.16)" : "transparent",
              color: activeId === gid ? C.goldLight : C.muted,
            }}>{labels[gid]}</button>
          ))}
        </div>
      )}
      <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 17, marginBottom: 2 }}>Formation de {labels[activeId] || "—"}</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>KBS DIGITAL AGENCY</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {FORMATION_SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            flex: 1, padding: "8px 10px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${section === s.id ? C.gold : C.border}`,
            background: section === s.id ? "rgba(243,146,0,0.16)" : "transparent",
            color: section === s.id ? C.goldLight : C.muted,
          }}>{s.label}</button>
        ))}
      </div>

      {section === "guides" && (
        guideText.trim() === "" ? (
          <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucun guide pour l'instant. Le CEO peut en ajouter un depuis Administration.</div>
        ) : <Card>{renderGuideText(guideText)}</Card>
      )}

      {section === "liens" && (
        liens.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucun lien ajoute pour l'instant.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {liens.map(l => (
              <Card key={l.id}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>{l.label}</div>
                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: C.goldLight, display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700 }}>Ouvrir <ExternalLink size={13} /></a>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ---------------------------------- TAB: ADMINISTRATION ---------------------------------- */
/* ---------------------------------- TAB: CAISSE PERSO (privée CEO, sous Administration) ---------------------------------- */
function TabCaissePerso({ caisse, setCaisse }) {
  const ops = caisse?.ops || [];
  const debts = caisse?.debts || [];
  const nowD = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const hhmm = (d) => d.toTimeString().slice(0, 5);
  const fmt = (n) => Math.abs(n).toLocaleString("fr-FR").replace(/\s/g, " ");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const monthLabel = (ym) => { const p = ym.split("-"); return cap(new Date(p[0], p[1] - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })); };

  const [view, setView] = useState("ops");
  const [masked, setMasked] = useState(true);
  const [viewMonth, setViewMonth] = useState(iso(nowD).slice(0, 7));

  const [oType, setOType] = useState("out");
  const [oMontant, setOMontant] = useState("");
  const [oLabel, setOLabel] = useState("");
  const [oDate, setODate] = useState(iso(nowD));
  const [oTime, setOTime] = useState(hhmm(nowD));
  const [editOp, setEditOp] = useState(null);

  const [dDir, setDDir] = useState("owed");
  const [dMontant, setDMontant] = useState("");
  const [dPrenom, setDPrenom] = useState("");
  const [dNom, setDNom] = useState("");
  const [dNumero, setDNumero] = useState("");
  const [dMotif, setDMotif] = useState("");
  const [dDate, setDDate] = useState(iso(nowD));
  const [dTime, setDTime] = useState(hhmm(nowD));
  const [editDebt, setEditDebt] = useState(null);

  function setOpsList(next) { setCaisse({ ...caisse, ops: next, debts }); }
  function setDebtsList(next) { setCaisse({ ...caisse, ops, debts: next }); }
  function prefillOp() { const n = new Date(); setODate(iso(n)); setOTime(hhmm(n)); }
  function prefillDebt() { const n = new Date(); setDDate(iso(n)); setDTime(hhmm(n)); }

  function saveOp() {
    const m = parseInt(oMontant, 10);
    if (!m || m <= 0) return;
    const label = oLabel.trim() || (oType === "out" ? "Dépense" : "Entrée");
    if (editOp) {
      setOpsList(ops.map(o => o.id === editOp ? { id: editOp, type: oType, montant: m, label, date: oDate, time: oTime } : o));
      setEditOp(null);
    } else {
      setOpsList([...ops, { id: Date.now(), type: oType, montant: m, label, date: oDate, time: oTime }]);
    }
    setViewMonth(oDate.slice(0, 7));
    setOMontant(""); setOLabel(""); setOType("out"); prefillOp();
  }
  function startEditOp(o) { setEditOp(o.id); setOType(o.type); setOMontant(String(o.montant)); setOLabel(o.label); setODate(o.date); setOTime(o.time); }
  function cancelEditOp() { setEditOp(null); setOType("out"); setOMontant(""); setOLabel(""); prefillOp(); }
  function delOp(id) { if (!confirmDelete("cette opération")) return; setOpsList(ops.filter(o => o.id !== id)); if (editOp === id) cancelEditOp(); }

  function saveDebt() {
    const m = parseInt(dMontant, 10);
    if (!m || m <= 0) return;
    const base = { dir: dDir, montant: m, prenom: dPrenom.trim(), nom: dNom.trim(), numero: dNumero.trim(), motif: dMotif.trim(), date: dDate, time: dTime };
    if (editDebt) {
      const old = debts.find(x => x.id === editDebt);
      setDebtsList(debts.map(x => x.id === editDebt ? { ...base, id: editDebt, settled: old ? old.settled : false, settledDate: old ? old.settledDate : null } : x));
      setEditDebt(null);
    } else {
      setDebtsList([...debts, { ...base, id: Date.now(), settled: false, settledDate: null }]);
    }
    clearDebtForm();
  }
  function clearDebtForm() { setDMontant(""); setDPrenom(""); setDNom(""); setDNumero(""); setDMotif(""); setDDir("owed"); prefillDebt(); }
  function startEditDebt(d) { setEditDebt(d.id); setDDir(d.dir); setDMontant(String(d.montant)); setDPrenom(d.prenom || ""); setDNom(d.nom || ""); setDNumero(d.numero || ""); setDMotif(d.motif || ""); setDDate(d.date); setDTime(d.time); }
  function cancelEditDebt() { setEditDebt(null); clearDebtForm(); }
  function toggleSettle(id) { setDebtsList(debts.map(d => d.id === id ? { ...d, settled: !d.settled, settledDate: !d.settled ? iso(new Date()) : null } : d)); }
  function delDebt(id) { if (!confirmDelete("cette dette")) return; setDebtsList(debts.filter(d => d.id !== id)); if (editDebt === id) cancelEditDebt(); }
  function shiftMonth(delta) { const p = viewMonth.split("-"); setViewMonth(iso(new Date(p[0], p[1] - 1 + delta, 1)).slice(0, 7)); }

  let tin = 0, tout = 0;
  ops.forEach(o => { if (o.type === "in") tin += o.montant; else tout += o.montant; });
  let settledOwed = 0, settledIOwe = 0, openOwed = 0, openIOwe = 0;
  debts.forEach(d => {
    if (d.settled) { if (d.dir === "owed") settledOwed += d.montant; else settledIOwe += d.montant; }
    else { if (d.dir === "owed") openOwed += d.montant; else openIOwe += d.montant; }
  });
  const solde = (tin - tout) + settledOwed - settledIOwe;

  const monthOps = ops.filter(o => o.date.slice(0, 7) === viewMonth);
  let mIn = 0, mOut = 0; monthOps.forEach(o => { if (o.type === "in") mIn += o.montant; else mOut += o.montant; });
  const byDay = {}; monthOps.forEach(o => { (byDay[o.date] = byDay[o.date] || []).push(o); });
  const days = Object.keys(byDay).sort().reverse();
  const prettyDate = (d) => { const p = d.split("-"); const dt = new Date(p[0], p[1] - 1, p[2]); if (d === iso(new Date())) return "Aujourd'hui"; if (d === iso(new Date(Date.now() - 86400000))) return "Hier"; return dt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); };
  const openDebts = debts.filter(d => !d.settled).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const doneDebts = debts.filter(d => d.settled).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  function genPDF() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const list = monthOps.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    doc.setFontSize(16); doc.setTextColor(1, 27, 69); doc.text("KBS — Caisse Perso", 14, 18);
    doc.setFontSize(11); doc.setTextColor(40, 40, 40); doc.text("Releve : " + monthLabel(viewMonth), 14, 26);
    autoTable(doc, {
      startY: 32,
      head: [["Date", "Libelle", "Type", "Montant (FCFA)"]],
      body: list.map(o => [o.date.split("-").reverse().join("/"), o.label, o.type === "in" ? "Entree" : "Depense", (o.type === "in" ? "+" : "-") + fmt(o.montant)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [1, 27, 69] },
    });
    let y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 40) + 10;
    doc.setFontSize(11); doc.setTextColor(30, 120, 70); doc.text("Total entrees : +" + fmt(mIn) + " FCFA", 14, y);
    doc.setTextColor(180, 60, 45); doc.text("Total depenses : -" + fmt(mOut) + " FCFA", 14, y + 7);
    doc.setTextColor(20, 20, 20); doc.setFontSize(13); doc.text("Net du mois : " + ((mIn - mOut) >= 0 ? "+" : "-") + fmt(mIn - mOut) + " FCFA", 14, y + 16);
    doc.save("caisse-perso-" + viewMonth + ".pdf");
  }

  function debtCard(d) {
    const isOwed = d.dir === "owed"; const col = isOwed ? C.greenLight : C.rustLight;
    const name = ((d.prenom || "") + " " + (d.nom || "")).trim() || "Sans nom";
    return (
      <Card key={d.id} style={{ opacity: d.settled ? 0.6 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{name}{d.settled && <span style={{ fontSize: 11, fontWeight: 800, color: C.greenLight, marginLeft: 6 }}>· Réglée</span>}</div>
            {d.numero && <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{d.numero}</div>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: col, whiteSpace: "nowrap" }}>{(isOwed ? "+" : "−") + (masked ? "•••" : fmt(d.montant))}</div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{(isOwed ? "On me doit" : "Je dois")}{d.motif ? " · " + d.motif : ""} · {d.date.split("-").reverse().join("/")} {d.time}</div>
        <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
          <button onClick={() => toggleSettle(d.id)} style={{ ...iconBtn, padding: "7px 11px", color: d.settled ? C.muted : C.greenLight }}>{d.settled ? "↺ Remettre en cours" : "✓ Marquer réglée"}</button>
          <button onClick={() => startEditDebt(d)} style={{ ...iconBtn, padding: "7px 11px" }}>Modifier</button>
          <button onClick={() => delDebt(d.id)} style={{ ...iconBtn, padding: "7px 11px", color: C.rustLight }}>Supprimer</button>
        </div>
      </Card>
    );
  }

  const seg = (activeCol) => ({ flex: 1, padding: 9, border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: C.muted, fontSize: 11.5 }}>Espace privé — tes dépenses, entrées et dettes personnelles, séparées de la trésorerie de l'agence.</div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: C.muted, fontSize: 12, fontWeight: 600 }}>Solde disponible (total)</span>
          <button onClick={() => setMasked(!masked)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: 0 }}>{masked ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6, color: solde < 0 ? C.rustLight : C.text }}>{masked ? "•••••" : fmt(solde)} <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>FCFA</span></div>
        <div style={{ display: "flex", gap: 22, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Entrées<div style={{ fontSize: 14, fontWeight: 700, color: C.greenLight, marginTop: 2 }}>{masked ? "•••••" : fmt(tin + settledOwed)}</div></div>
          <div style={{ fontSize: 12, color: C.muted }}>Dépenses<div style={{ fontSize: 14, fontWeight: 700, color: C.rustLight, marginTop: 2 }}>{masked ? "•••••" : fmt(tout + settledIOwe)}</div></div>
        </div>
      </Card>

      <div style={{ display: "flex", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
        <button onClick={() => setView("ops")} style={{ ...seg(), background: view === "ops" ? C.gold : "transparent", color: view === "ops" ? "#FFFFFF" : C.muted }}>Opérations</button>
        <button onClick={() => setView("debts")} style={{ ...seg(), background: view === "debts" ? C.gold : "transparent", color: view === "debts" ? "#FFFFFF" : C.muted }}>Dettes</button>
      </div>

      {view === "ops" && (<>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Eyebrow>{editOp ? "Modifier l'opération" : "Nouvelle opération"}</Eyebrow>
            {editOp && <button onClick={cancelEditOp} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Annuler</button>}
          </div>
          <div style={{ display: "flex", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 8 }}>
            <button onClick={() => setOType("out")} style={{ ...seg(), background: oType === "out" ? "rgba(192,57,43,0.15)" : "transparent", color: oType === "out" ? C.rustLight : C.muted }}>− Dépense</button>
            <button onClick={() => setOType("in")} style={{ ...seg(), background: oType === "in" ? "rgba(46,139,111,0.15)" : "transparent", color: oType === "in" ? C.greenLight : C.muted }}>+ Entrée</button>
          </div>
          <input type="number" inputMode="numeric" placeholder="Montant (FCFA)" value={oMontant} onChange={e => setOMontant(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <input placeholder="Libellé (ex: taxi, carburant, achat...)" value={oLabel} onChange={e => setOLabel(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input type="date" value={oDate} onChange={e => setODate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input type="time" value={oTime} onChange={e => setOTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <button onClick={saveOp} style={btnGold}>{editOp ? "Mettre à jour" : "Enregistrer"}</button>
        </Card>

        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px" }}>
          <button onClick={() => shiftMonth(-1)} style={{ ...iconBtn, padding: "6px 9px" }}><ChevronLeft size={16} /></button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, textTransform: "capitalize" }}>{monthLabel(viewMonth)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: (mIn - mOut) < 0 ? C.rustLight : C.greenLight }}>{masked ? "•••••" : ("Net " + ((mIn - mOut) >= 0 ? "+" : "−") + fmt(mIn - mOut) + " FCFA")}</div>
          </div>
          <button onClick={() => shiftMonth(1)} style={{ ...iconBtn, padding: "6px 9px" }}><ChevronRight size={16} /></button>
        </div>

        <button onClick={genPDF} style={{ ...iconBtn, width: "100%", padding: 11, color: C.gold, borderColor: C.gold, borderStyle: "dashed", display: "flex", justifyContent: "center", gap: 8, fontWeight: 700 }}><FileText size={15} /> Télécharger le relevé du mois (PDF)</button>

        {days.length === 0 && <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: 20 }}>Aucune opération en {monthLabel(viewMonth).toLowerCase()}.</div>}
        {days.map(d => {
          const list = byDay[d].slice().sort((a, b) => b.time.localeCompare(a.time));
          let sin = 0, sout = 0; list.forEach(e => { if (e.type === "in") sin += e.montant; else sout += e.montant; });
          const dayS = sin - sout;
          return (
            <div key={d}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 2px 6px" }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, textTransform: "capitalize" }}>{prettyDate(d)}</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: dayS < 0 ? C.rustLight : C.greenLight }}>{masked ? "•••••" : ((dayS >= 0 ? "+" : "−") + fmt(dayS) + " FCFA")}</span>
              </div>
              {list.map(o => {
                const isIn = o.type === "in"; const col = isIn ? C.greenLight : C.rustLight;
                return (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{o.label}</div>
                      <div style={{ fontSize: 11.5, color: C.muted }}>{o.time}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: col, whiteSpace: "nowrap" }}>{(isIn ? "+" : "−") + (masked ? "•••" : fmt(o.montant))}</span>
                    <button onClick={() => startEditOp(o)} style={{ ...iconBtn, padding: "5px 7px" }}><Pencil size={13} /></button>
                    <button onClick={() => delOp(o.id)} style={{ background: "none", border: "none", color: C.rustLight, cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </>)}

      {view === "debts" && (<>
        <div style={{ display: "flex", gap: 10 }}>
          <Card style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>On me doit</div><div style={{ fontSize: 18, fontWeight: 800, color: C.greenLight, marginTop: 5 }}>{masked ? "•••••" : fmt(openOwed)} F</div></Card>
          <Card style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Je dois</div><div style={{ fontSize: 18, fontWeight: 800, color: C.rustLight, marginTop: 5 }}>{masked ? "•••••" : fmt(openIOwe)} F</div></Card>
        </div>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Eyebrow>{editDebt ? "Modifier la dette" : "Nouvelle dette"}</Eyebrow>
            {editDebt && <button onClick={cancelEditDebt} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Annuler</button>}
          </div>
          <div style={{ display: "flex", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 8 }}>
            <button onClick={() => setDDir("owed")} style={{ ...seg(), background: dDir === "owed" ? "rgba(46,139,111,0.15)" : "transparent", color: dDir === "owed" ? C.greenLight : C.muted }}>On me doit</button>
            <button onClick={() => setDDir("iowe")} style={{ ...seg(), background: dDir === "iowe" ? "rgba(192,57,43,0.15)" : "transparent", color: dDir === "iowe" ? C.rustLight : C.muted }}>Je dois</button>
          </div>
          <input type="number" inputMode="numeric" placeholder="Montant (FCFA)" value={dMontant} onChange={e => setDMontant(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Prénom (facultatif)" value={dPrenom} onChange={e => setDPrenom(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="Nom (facultatif)" value={dNom} onChange={e => setDNom(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input placeholder="Numéro (facultatif)" value={dNumero} onChange={e => setDNumero(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <input placeholder="Motif (facultatif)" value={dMotif} onChange={e => setDMotif(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input type="date" value={dDate} onChange={e => setDDate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input type="time" value={dTime} onChange={e => setDTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <button onClick={saveDebt} style={btnGold}>{editDebt ? "Mettre à jour" : "Enregistrer la dette"}</button>
        </Card>

        <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1, color: C.muted, textTransform: "uppercase", margin: "4px 2px" }}>En cours ({openDebts.length})</div>
        {openDebts.length === 0 && <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: 14 }}>Aucune dette en cours.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{openDebts.map(d => debtCard(d))}</div>
        {doneDebts.length > 0 && <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1, color: C.muted, textTransform: "uppercase", margin: "14px 2px 4px" }}>Réglées ({doneDebts.length})</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{doneDebts.map(d => debtCard(d))}</div>
      </>)}
    </div>
  );
}

/* ---------------------------------- TAB: ARCHIVES ---------------------------------- */
// Historique fige, mois par mois. Chaque mois est archive automatiquement quand un
// nouveau mois commence (voir buildSnapshot dans App). Consultation en lecture seule.
function TabArchives({ archives, period, team, codes, onDelete, onUpdate, onCreate }) {
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [newMonth, setNewMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); });
  const secTitle = { fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 };
  const rowStyle = { fontSize: 12.5, background: C.cardAlt, borderRadius: 8, padding: "6px 10px" };
  function askDelete(a, label) {
    const c = window.prompt(`Supprimer définitivement l'archive « ${label} » ?\nEntre le code Administration pour confirmer :`);
    if (c == null) return;
    if (!codeMatchesStrict(c, codes.admin)) { window.alert("Code incorrect — rien n'a été supprimé."); return; }
    onDelete(a);
  }
  const list = (archives || []).slice().sort((a, b) => b.period.localeCompare(a.period)); // plus recent en premier
  const monthLabel = (ym) => {
    const p = (ym || "").split("-");
    if (p.length < 2) return ym || "—";
    const d = new Date(Number(p[0]), Number(p[1]) - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return d.charAt(0).toUpperCase() + d.slice(1);
  };
  const [openId, setOpenId] = useState(list[0]?.id || list[0]?.period || null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        <Eyebrow>Archives mensuelles</Eyebrow>
        <div style={{ color: C.muted, fontSize: 12.5, marginTop: 4 }}>
          À chaque changement de mois, tout est mis de côté ici (clients &amp; CA, trésorerie &amp; dépenses, dettes, objectif atteint) puis les compteurs repartent à zéro. Appuie sur un mois pour revoir tout ce qui s'est passé, sans exception.
        </div>
        <div style={{ color: C.muted, fontSize: 11.5, marginTop: 6 }}>Mois en cours : <b style={{ color: C.goldLight }}>{monthLabel(period)}</b> (encore en direct, pas encore archivé).</div>
        {!editUnlocked ? (
          <MiniUnlock code={codes.admin} label="Modifier les archives (ajouter / corriger / supprimer) — code Administration" onUnlock={() => setEditUnlocked(true)} />
        ) : (
          <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <div style={{ fontSize: 12, color: C.greenLight, marginBottom: 6 }}>✓ Mode modification activé : ouvre un mois pour ajouter, corriger ou supprimer ses ventes, dépenses et dettes.</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ fontSize: 12, color: C.muted }}>Créer le mois :</label>
              <input type="month" value={newMonth} max={period} onChange={e => setNewMonth(e.target.value)} style={{ ...inputStyle, width: 160 }} />
              <button onClick={() => onCreate(newMonth)} style={{ ...btnGold, width: "auto", padding: "8px 12px", fontSize: 12 }}><Plus size={13} /> Créer l'archive</button>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Pratique pour ressaisir un mois perdu (ex. septembre) à partir des reçus WhatsApp ou des paiements Orange Money / Wave.</div>
          </div>
        )}
      </Card>

      {list.length === 0 && (
        <Card style={{ textAlign: "center" }}>
          <Archive size={26} color={C.muted} style={{ margin: "4px auto 8px", display: "block" }} />
          <div style={{ color: C.muted, fontSize: 13 }}>Aucune archive pour l'instant. Le premier mois sera archivé automatiquement au changement de mois.</div>
        </Card>
      )}

      {list.map(a => {
        const key = a.id || a.period;
        const open = openId === key;
        const clients = a.clients || [];
        const expenses = a.expenses || [];
        const dettes = a.dettes || [];
        return (
          <Card key={key}>
            <div onClick={() => setOpenId(open ? null : key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <div>
                <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, textTransform: "capitalize" }}>{monthLabel(a.period)}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>CA {fcfa(a.totalCA)} · {clients.length} client{clients.length > 1 ? "s" : ""}</div>
              </div>
              {open ? <ChevronDown size={18} color={C.gold} /> : <ChevronRight size={18} color={C.gold} />}
            </div>

            {open && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Résumé financier */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <ArchStat label="CA encaissé" value={fcfa(a.totalCA)} color={C.goldLight} />
                  <ArchStat label={`Commissions (${a.commissionRate ?? "—"}%)`} value={fcfa(a.totalCommission)} color={C.greenLight} />
                  <ArchStat label="Dépenses" value={fcfa(a.totalDepenses)} color={C.rustLight} />
                  <ArchStat label="Bénéfice net" value={fcfa(a.beneficeNet)} color={a.beneficeNet >= 0 ? C.greenLight : C.rustLight} />
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Objectif atteint : <b style={{ color: C.goldLight }}>{a.pctObjectif}%</b> de {fcfa(a.goal)}</div>

                {/* Par personne */}
                {(a.byMember || []).some(m => m.ca > 0) && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Par personne</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {(a.byMember || []).filter(m => m.ca > 0).map(m => (
                        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: m.color, marginRight: 6 }} />{m.name} <span style={{ color: C.muted }}>· {m.rate}%</span></span>
                          <span style={{ color: C.muted }}>{fcfa(m.ca)} → <span style={{ color: C.greenLight }}>{fcfa(m.commission)}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editUnlocked ? (<>
                  <div>
                    <div style={secTitle}>Clients &amp; CA ({clients.length})</div>
                    <EditableList items={clients} onChange={list => onUpdate({ ...a, clients: list })} itemLabel={c => `${c.prenom || ""} ${c.nom || ""}`.trim()}
                      fields={[
                        { key: "prenom", label: "Prénom" }, { key: "nom", label: "Nom" }, { key: "whatsapp", label: "WhatsApp" },
                        { key: "pack", label: "Service / pack" }, { key: "dateInscription", label: "Date", type: "date" },
                        { key: "montant", label: "Montant payé (FCFA)", type: "number" }, { key: "prixTotal", label: "Prix total (FCFA, optionnel)", type: "number" },
                        { key: "owner", label: "Suivi par", type: "select", options: team.map(m => ({ value: m.id, label: m.name })) },
                        { key: "statut", label: "Statut", type: "select", options: ["Payé", "En discussion", "Devis envoyé", "Perdu", "À contacter"] },
                      ]}
                      newItem={{ id: Date.now(), prenom: "", nom: "", whatsapp: "", pack: "", dateInscription: `${a.period}-01`, montant: "", prixTotal: "", owner: team[0]?.id || "", statut: "Payé", historique: [] }}
                      addLabel="Ajouter une vente à ce mois"
                      render={(c, i, acts) => (
                        <Row actions={acts} style={rowStyle}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <span>{c.prenom} {c.nom} <span style={{ color: C.muted }}>· {c.pack || c.statut}</span></span>
                            <span style={{ fontWeight: 700, color: C.goldLight, whiteSpace: "nowrap" }}>{fcfa(c.montant)}</span>
                          </div>
                        </Row>
                      )} />
                  </div>
                  <div>
                    <div style={secTitle}>Trésorerie — dépenses ({expenses.length})</div>
                    <EditableList items={expenses} onChange={list => onUpdate({ ...a, expenses: list })} itemLabel={e => e.label}
                      fields={[{ key: "label", label: "Description" }, { key: "categorie", label: "Catégorie", type: "select", options: DEPENSES_CATEGORIES }, { key: "montant", label: "Montant (FCFA)", type: "number" }, { key: "date", label: "Date", type: "date" }]}
                      newItem={{ id: Date.now(), label: "", categorie: DEPENSES_CATEGORIES[0], montant: "", date: `${a.period}-01` }} addLabel="Ajouter une dépense"
                      render={(e, i, acts) => (
                        <Row actions={acts} style={rowStyle}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <span>{e.label || "Dépense"}</span><span style={{ fontWeight: 700, color: C.rustLight }}>{fcfa(e.montant)}</span>
                          </div>
                        </Row>
                      )} />
                  </div>
                  <div>
                    <div style={secTitle}>Dettes &amp; rappels ({dettes.length})</div>
                    <EditableList items={dettes} onChange={list => onUpdate({ ...a, dettes: list })} itemLabel={d => d.clientNom}
                      fields={[{ key: "clientNom", label: "Client" }, { key: "service", label: "Service" }, { key: "montantDu", label: "Montant dû (FCFA)", type: "number" }, { key: "dateEcheance", label: "Échéance", type: "date" }, { key: "statut", label: "Statut", type: "select", options: ["En attente", "Payée"] }]}
                      newItem={{ id: Date.now(), clientNom: "", service: "", montantDu: "", dateEcheance: `${a.period}-01`, statut: "En attente" }} addLabel="Ajouter une dette"
                      render={(d, i, acts) => (
                        <Row actions={acts} style={rowStyle}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <span>{d.clientNom || "Dette"} <span style={{ color: C.muted }}>{d.statut ? "· " + d.statut : ""}</span></span>
                            <span style={{ fontWeight: 700, color: d.statut === "Payée" ? C.greenLight : C.goldLight }}>{fcfa(d.montantDu)}</span>
                          </div>
                        </Row>
                      )} />
                  </div>
                </>) : (<>
                {/* Clients du mois */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Clients &amp; CA ({clients.length})</div>
                  {clients.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Aucun client ce mois-là.</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {clients.map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, background: C.cardAlt, borderRadius: 8, padding: "6px 10px" }}>
                        <span>{c.prenom} {c.nom} <span style={{ color: C.muted }}>· {c.statut}</span></span>
                        <span style={{ fontWeight: 700, color: C.goldLight }}>{fcfa(c.montant)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dépenses du mois */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Trésorerie — dépenses ({expenses.length})</div>
                  {expenses.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Aucune dépense ce mois-là.</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {expenses.map((e, i) => (
                      <div key={e.id || i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, background: C.cardAlt, borderRadius: 8, padding: "6px 10px" }}>
                        <span>{e.label || e.nom || e.description || "Dépense"}</span>
                        <span style={{ fontWeight: 700, color: C.rustLight }}>{fcfa(e.montant)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dettes du mois */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Dettes &amp; rappels ({dettes.length})</div>
                  {dettes.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Aucune dette ce mois-là.</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dettes.map((d, i) => (
                      <div key={d.id || i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, background: C.cardAlt, borderRadius: 8, padding: "6px 10px" }}>
                        <span>{d.clientNom || "Dette"} <span style={{ color: C.muted }}>{d.statut ? "· " + d.statut : ""}</span></span>
                        <span style={{ fontWeight: 700, color: d.statut === "Payée" ? C.greenLight : C.goldLight }}>{fcfa(d.montantDu)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                </>)}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => askDelete(a, monthLabel(a.period))} style={{ ...iconBtn, color: C.rustLight, padding: "5px 9px", display: "flex", alignItems: "center", gap: 4 }}><Trash2 size={12} /> Supprimer l'archive</button>
                  <div style={{ fontSize: 10.5, color: C.muted, textAlign: "right" }}>{a.recovered ? "Récupérée" : "Archivé"} le {a.closedAt ? new Date(a.closedAt).toLocaleDateString("fr-FR") : "—"}</div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------------------------- ADMIN : RÉCUPÉRATION ---------------------------------- */
// Fouille TOUTE la base (listes, archives, sauvegardes, diagnostics IA) pour
// retrouver les clients/ventes d'un mois donne, puis permet d'en recreer l'archive.
function monthOfClient(c) {
  const fromDate = (s) => (typeof s === "string" && /^\d{4}-\d{2}/.test(s)) ? s.slice(0, 7) : "";
  const fromId = () => {
    const n = Number(c.id);
    return n > 1500000000000 && n < 4000000000000 ? new Date(n).toISOString().slice(0, 7) : "";
  };
  return fromDate(c.dateInscription) || fromId();
}
function collectClients(value, sourceKey, out, depth = 0) {
  if (!value || depth > 6) return;
  if (Array.isArray(value)) { value.forEach(v => collectClients(v, sourceKey, out, depth + 1)); return; }
  if (typeof value !== "object") return;
  if (value.id != null && typeof value.nom === "string" && ("montant" in value || "dateInscription" in value || "pack" in value)) {
    out.push({ client: value, source: sourceKey });
  }
  Object.values(value).forEach(v => { if (v && typeof v === "object") collectClients(v, sourceKey, out, depth + 1); });
}

function AdminRecuperation({ onRestoreArchive }) {
  const prevMonth = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })();
  const [month, setMonth] = useState(prevMonth);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { clients, diagOnly, keys }
  const [restored, setRestored] = useState(false);

  async function scan() {
    setBusy(true); setError(""); setResult(null); setRestored(false);
    const rows = await loadByPrefix("");
    setBusy(false);
    if (!rows) { setError("Lecture de la base impossible. Vérifie la connexion et réessaie."); return; }
    const found = [];
    const diags = [];
    rows.forEach(r => {
      if (r.key.startsWith("diagnostic:")) { diags.push(r.value); return; }
      collectClients(r.value, r.key, found);
    });
    // Dedoublonnage par id : on garde la version la plus complete (plus gros montant paye).
    const byId = new Map();
    found.filter(f => monthOfClient(f.client) === month).forEach(f => {
      const k = String(f.client.id);
      const prev = byId.get(k);
      const sources = new Set([...(prev?.sources || []), f.source]);
      if (!prev || (Number(f.client.montant) || 0) > (Number(prev.client.montant) || 0)) byId.set(k, { client: f.client, sources });
      else prev.sources = sources;
    });
    // Clients connus seulement par leur diagnostic IA (nom/WhatsApp, sans montant).
    const diagOnly = diags.filter(d => d && d.clientId && !byId.has(String(d.clientId)) && monthOfClient({ id: d.clientId }) === month)
      .map(d => ({ id: d.clientId, nom: d.formData?.nom || d.clientNom || "", prenom: d.formData?.prenom || "", whatsapp: d.formData?.whatsapp || "" }));
    setResult({
      clients: [...byId.values()].map(v => ({ ...v.client, _sources: [...v.sources] })),
      diagOnly,
      keys: rows.map(r => ({ key: r.key, updated: r.updated_at })).sort((a, b) => (b.updated || "").localeCompare(a.updated || "")),
    });
  }

  function restore() {
    if (!result || !result.clients.length) return;
    if (!window.confirm(`Créer l'archive de ${month} avec ${result.clients.length} client(s) retrouvé(s) ?`)) return;
    onRestoreArchive(month, result.clients.map(({ _sources, ...c }) => c));
    setRestored(true);
  }

  const total = result ? result.clients.reduce((s, c) => s + (Number(c.montant) || 0), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <H2>Récupérer les ventes d'un mois</H2>
      <Card style={{ borderColor: C.gold }}>
        <div style={{ fontSize: 12.5, color: C.muted }}>
          Cet outil fouille <b style={{ color: C.text }}>toute la base</b> (clients en cours, archives, sauvegardes automatiques, diagnostics IA) pour retrouver les clients inscrits pendant le mois choisi, puis peut recréer l'archive de ce mois.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: C.muted }}>Mois :</label>
          <input type="month" value={month} onChange={e => { setMonth(e.target.value); setResult(null); }} style={{ ...inputStyle, width: 160 }} />
          <button onClick={scan} disabled={busy} style={{ ...btnGold, width: "auto", padding: "8px 14px" }}><Search size={14} /> {busy ? "Recherche…" : "Rechercher"}</button>
        </div>
        {error && <div style={{ color: C.rustLight, fontSize: 12, marginTop: 8 }}>{error}</div>}
      </Card>

      {result && (<>
        <Card>
          <Eyebrow>Clients retrouvés ({result.clients.length}) — CA {fcfa(total)}</Eyebrow>
          {result.clients.length === 0 && (
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>
              <b>Rien n'a été retrouvé pour {new Date(month + "-15").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.</b>
              <div style={{ color: C.muted, marginTop: 6 }}>
                L'outil a fouillé toute la base : les clients en cours, toutes les archives et toutes les sauvegardes. Aucune vente de ce mois n'y est enregistrée.
                Ces données ont donc été effacées avant la mise en place des protections (sauvegarde chaque jour, archives en double). Ça ne peut plus se reproduire de la même façon.
              </div>
              <div style={{ marginTop: 8, fontWeight: 700 }}>Que faire maintenant :</div>
              <div style={{ color: C.muted }}>
                1. Ressaisir les ventes à partir des reçus WhatsApp, des PDF envoyés et de l'historique Orange Money / Wave : Ventes &amp; finances → Archives → « Créer le mois », puis « Ajouter une vente à ce mois ».<br />
                2. Si ton projet Supabase a un forfait payant, regarder dans Supabase → Database → Backups s'il existe une copie de cette période.
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            {result.clients.map(c => (
              <div key={c.id} style={{ background: C.cardAlt, borderRadius: 8, padding: "6px 10px", fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{c.prenom} {c.nom} <span style={{ color: C.muted }}>· {c.pack || "—"} · {c.dateInscription || ""}</span></span>
                  <b style={{ color: C.goldLight }}>{fcfa(c.montant)}</b>
                </div>
                <div style={{ fontSize: 10.5, color: C.muted }}>Trouvé dans : {c._sources.join(", ")}</div>
              </div>
            ))}
          </div>
          {result.clients.length > 0 && (
            <button onClick={restore} disabled={restored} style={{ ...btnGold, marginTop: 10, background: C.green }}>
              <Archive size={14} /> {restored ? "Archive recréée ✓ (voir Ventes & Finance → Archives)" : `Recréer l'archive de ${month}`}
            </button>
          )}
        </Card>

        {result.diagOnly.length > 0 && (
          <Card>
            <Eyebrow>Clients retrouvés via les diagnostics IA ({result.diagOnly.length})</Eyebrow>
            <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Nom et WhatsApp connus, mais le montant payé n'a pas été retrouvé : à ressaisir dans le CRM si besoin.</div>
            {result.diagOnly.map(c => (
              <div key={c.id} style={{ fontSize: 12.5, padding: "4px 0" }}>{c.prenom} {c.nom} <span style={{ color: C.muted }}>· {c.whatsapp || "—"}</span></div>
            ))}
          </Card>
        )}

        <details style={{ background: C.card, borderRadius: 16, padding: "12px 14px" }}>
          <summary style={{ cursor: "pointer", fontSize: 12.5, color: C.muted, fontWeight: 700 }}>Détails techniques ({result.keys.length} lignes dans la base, pour le développeur)</summary>
          <div style={{ fontSize: 11.5, color: C.muted, margin: "8px 0 6px" }}>Chaque ligne est un module de l'application (clients, stock, factures…) avec la date de sa dernière modification. Les lignes « backup:… » sont les sauvegardes, « archive:… » les mois clôturés.</div>
          <div style={{ maxHeight: 220, overflowY: "auto", fontSize: 11.5, fontFamily: "monospace" }}>
            {result.keys.map(k => <div key={k.key}>{k.key} <span style={{ color: C.muted }}>· {k.updated ? new Date(k.updated).toLocaleString("fr-FR") : ""}</span></div>)}
          </div>
        </details>
      </>)}
    </div>
  );
}

function ArchStat({ label, value, color }) {
  return (
    <div style={{ background: C.cardAlt, borderRadius: 10, padding: "8px 10px" }}>
      <div style={{ fontSize: 10.5, color: C.muted }}>{label}</div>
      <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 14, color }}>{value}</div>
    </div>
  );
}

function TabAdministration({ section, caisse, setCaisse, team, setTeam, codes, setCodes, onResetAll, onCloseMonth, onRestoreArchive, onBackupNow, onRestoreBackup, currentMonth, agency, setAgency, guides, setGuides, formationLiens, setFormationLiens, pricing, setPricing, commissionRate, setCommissionRate }) {
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  // Mois a archiver par defaut = le mois precedent (ex. aujourd'hui septembre -> "2026-08").
  const prevMonth = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })();
  const [closeMonthValue, setCloseMonthValue] = useState(prevMonth);
  const [closeMonthStep, setCloseMonthStep] = useState(false);
  const [closeMonthDone, setCloseMonthDone] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", checklistText: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", checklistText: "", code: "", email: "", commissionPct: "" });
  const [rateForm, setRateForm] = useState(commissionRate);
  const [rateSaved, setRateSaved] = useState(false);
  const [codesForm, setCodesForm] = useState(codes);
  const [codesSaved, setCodesSaved] = useState(false);
  const [codesReset, setCodesReset] = useState("");
  const [agencyForm, setAgencyForm] = useState(agency);
  const [agencySaved, setAgencySaved] = useState(false);
  const [guidesForm, setGuidesForm] = useState(guides || DEFAULT_GUIDES);
  const [guidesSaved, setGuidesSaved] = useState(false);
  const [lienForm, setLienForm] = useState({});
  const [resetStep, setResetStep] = useState(false);
  const [resetCodeInput, setResetCodeInput] = useState("");
  const [resetError, setResetError] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function addMember() {
    if (!form.name.trim()) return;
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) + "-" + Date.now().toString().slice(-4);
    const color = TEAM_COLORS[team.length % TEAM_COLORS.length];
    const checklist = form.checklistText.split(",").map(s => s.trim()).filter(Boolean);
    setTeam([...team, { id, name: form.name, role: form.role || "Membre de l'équipe", color, code: autoCode(form.name),
      commissionPct: commissionRate,
      checklist: checklist.length ? checklist : ["Vérifier les tâches du jour", "Mettre à jour son suivi", "Communiquer avec l'équipe"] }]);
    setForm({ name: "", role: "", checklistText: "" });
  }
  function removeMember(id) {
    if (team.length <= 1) return;
    const m = team.find(x => x.id === id);
    if (!confirmDelete(`le membre « ${m?.name || ""} » de l'équipe`)) return;
    setTeam(team.filter(m => m.id !== id));
    if (editingId === id) setEditingId(null);
  }
  function startEdit(m) {
    setEditingId(m.id);
    setEditForm({ name: m.name, role: m.role, checklistText: (m.checklist || []).join(", "), code: m.code || autoCode(m.name), email: m.email || "",
      commissionPct: m.commissionPct != null ? m.commissionPct : commissionRate });
  }
  function saveEdit(id) {
    const checklist = editForm.checklistText.split(",").map(s => s.trim()).filter(Boolean);
    const pctRaw = Number(editForm.commissionPct);
    const pct = Number.isFinite(pctRaw) && editForm.commissionPct !== "" ? Math.max(0, Math.min(100, pctRaw)) : commissionRate;
    setTeam(team.map(m => m.id === id ? { ...m, name: editForm.name || m.name, role: editForm.role, code: editForm.code || m.code, email: (editForm.email || "").trim(), commissionPct: pct, checklist } : m));
    setEditingId(null);
  }
  async function saveRate() {
    const v = Math.max(0, Math.min(100, Number(rateForm) || 0));
    setCommissionRate(v);
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2000);
  }
  async function saveCodes() {
    setCodes(codesForm);
    // On attend la vraie ecriture en base avant d'annoncer un succes.
    const err = await saveShared("kbs:codes", codesForm);
    if (err) { setCodesSaved(false); return; }
    setCodesSaved(true);
    setTimeout(() => setCodesSaved(false), 2000);
  }
  async function saveAgency() {
    setAgency(agencyForm);
    const err = await saveShared("kbs:agency", agencyForm);
    if (err) { setAgencySaved(false); return; }
    setAgencySaved(true);
    setTimeout(() => setAgencySaved(false), 2000);
  }
  async function saveGuides() {
    setGuides(guidesForm);
    const err = await saveShared("kbs:guides", guidesForm);
    if (err) { setGuidesSaved(false); return; }
    setGuidesSaved(true);
    setTimeout(() => setGuidesSaved(false), 2000);
  }
  function addLien(gid) {
    const entry = lienForm[gid];
    if (!entry?.label?.trim() || !entry?.url?.trim()) return;
    const current = (formationLiens || {})[gid] || [];
    setFormationLiens({ ...(formationLiens || {}), [gid]: [...current, { ...entry, id: Date.now() }] });
    setLienForm({ ...lienForm, [gid]: { label: "", url: "" } });
  }
  function removeLien(gid, id) {
    if (!confirmDelete("ce lien de formation")) return;
    const current = (formationLiens || {})[gid] || [];
    setFormationLiens({ ...(formationLiens || {}), [gid]: current.filter(l => l.id !== id) });
  }
  const [editingLien, setEditingLien] = useState(null);
  function saveLien(gid, id, f) {
    if (!f.label.trim() || !f.url.trim()) return;
    const current = (formationLiens || {})[gid] || [];
    setFormationLiens({ ...(formationLiens || {}), [gid]: current.map(l => l.id === id ? { ...l, ...f } : l) });
    setEditingLien(null);
  }
  function confirmReset() {
    if (!codeMatchesStrict(resetCodeInput, codes.reset)) { setResetError(true); return; }
    onResetAll();
    setResetStep(false);
    setResetCodeInput("");
    setResetError(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  }

  if (!adminUnlocked) {
    return (
      <Card style={{ textAlign: "center" }}>
        <MiniUnlock code={codes.admin} label="Zone Administration — réservée au CEO" onUnlock={() => setAdminUnlocked(true)} />
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {section === "adminDiagnostics" && <AdminDiagnostics />}

      {section === "adminEquipe" && (<>
      <div>
        <H2>Taux de commission</H2>
        <Card style={{ borderColor: C.gold }}>
          <Eyebrow>Taux officiel de l'agence</Eyebrow>
          <div style={{ color: C.muted, fontSize: 12, margin: "4px 0 10px" }}>
            C'est le pourcentage appliqué par défaut à tous les membres. Tu peux le changer quand tu veux — tous les calculs de commission se recalculent automatiquement.
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Percent size={16} color={C.gold} />
            <input type="number" min="0" max="100" value={rateForm}
              onChange={e => setRateForm(e.target.value)}
              style={{ ...inputStyle, width: 100 }} />
            <span style={{ fontSize: 13, color: C.muted }}>%</span>
            <button onClick={saveRate} style={{ ...btnGold, flex: 1 }}><Save size={14} /> {rateSaved ? "Enregistré ✓" : "Enregistrer le taux"}</button>
          </div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>Taux actuel : <b style={{ color: C.goldLight }}>{commissionRate}%</b>. Pour donner un pourcentage différent à une personne précise, modifie sa fiche ci-dessous (crayon).</div>
        </Card>
      </div>

      <div>
        <H2>Équipe actuelle ({team.length})</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {team.map(m => {
            const editing = editingId === m.id;
            return (
              <Card key={m.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: m.color }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.name}</div>
                      <div style={{ fontSize: 11.5, color: C.muted }}>{m.role}</div>
                      <div style={{ fontSize: 11, color: C.greenLight, marginTop: 2, fontWeight: 700 }}>Commission : {memberRate(team, m.id, commissionRate)}%</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => editing ? setEditingId(null) : startEdit(m)} style={{ background: "none", border: "none", color: C.goldLight, cursor: "pointer" }}>
                      {editing ? <X size={16} /> : <Pencil size={15} />}
                    </button>
                    {team.length > 1 && <button onClick={() => removeMember(m.id)} style={{ background: "none", border: "none", color: C.rustLight, cursor: "pointer" }}><Trash2 size={16} /></button>}
                  </div>
                </div>

                {editing && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    <input placeholder="Nom" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                    <input placeholder="Rôle / statut" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={inputStyle} />
                    <textarea placeholder="Checklist quotidienne (séparée par des virgules)" value={editForm.checklistText} onChange={e => setEditForm({ ...editForm, checklistText: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Percent size={14} color={C.muted} />
                      <input type="number" min="0" max="100" placeholder={`Commission (défaut ${commissionRate}%)`} value={editForm.commissionPct} onChange={e => setEditForm({ ...editForm, commissionPct: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                      <span style={{ fontSize: 13, color: C.muted }}>%</span>
                    </div>
                    <input type="email" placeholder="Adresse Gmail (pour l'inscription Google)" value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={inputStyle} />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <KeyRound size={14} color={C.muted} />
                      <CodeInput placeholder="Code personnel (checklist)" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} style={{ flex: 1 }} />
                    </div>
                    <button onClick={() => saveEdit(m.id)} style={btnGold}><Save size={14} /> Enregistrer</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        <div style={{ color: C.muted, fontSize: 11.5, marginTop: 6 }}>Le crayon permet de modifier le nom, le rôle, la checklist et le code personnel de chaque membre — uniquement pour cette personne.</div>
      </div>

      <div>
        <H2>Recruter un nouveau membre</H2>
        <Card>
          <Eyebrow>Ajouter automatiquement à l'outil</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <input placeholder="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Rôle / statut (ex: Développeur, Assistant commercial…)" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle} />
            <input placeholder="Checklist quotidienne (séparée par des virgules, optionnel)" value={form.checklistText} onChange={e => setForm({ ...form, checklistText: e.target.value })} style={inputStyle} />
            <button onClick={addMember} style={btnGold}><UserPlus size={14} /> Ajouter à l'équipe</button>
          </div>
        </Card>
        <div style={{ color: C.muted, fontSize: 11.5, marginTop: 6 }}>La personne apparaît immédiatement dans le CRM, la Trésorerie, le Kanban, les Disponibilités et les Liens partagés, avec un code personnel généré automatiquement (modifiable ensuite avec le crayon).</div>
      </div>
      </>)}

      {section === "adminCodes" && (<>
      <div>
        <H2>Codes d'accès — modifiables</H2>
        <Card style={{ borderColor: C.gold, marginBottom: 10 }}>
          <Eyebrow>Code maître unique — ouvre toutes les sections</Eyebrow>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.goldLight, letterSpacing: 1, margin: "4px 0" }}>{MASTER_CODE}</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>Ce code fonctionne toujours, sur <b>tous</b> les écrans verrouillés de l'app (connexion, Objectif, CRM, Trésorerie, Ressources, Administration, Kanban, checklists de chaque membre, Formation, Réinitialisation) — même si les codes ci-dessous sont oubliés. Il n'est pas modifiable : c'est ton filet de sécurité. Garde-le pour toi seul.</div>
        </Card>
        <Card style={{ marginBottom: 10 }}>
          <Eyebrow>Codes oubliés ?</Eyebrow>
          <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8 }}>
            Remet tous les codes à leur valeur d'origine : général <b>{DEFAULT_CODES.app}</b>, Objectif <b>{DEFAULT_CODES.ceo}</b>, CRM/Trésorerie <b>{DEFAULT_CODES.catherine}</b>, Ressources <b>{DEFAULT_CODES.ressources}</b>, Administration <b>{DEFAULT_CODES.admin}</b>, Réinitialisation <b>{DEFAULT_CODES.reset}</b> — et chaque membre reçoit le code <b>PRÉNOM2026</b> (ex. {team[0] ? autoCode(team[0].name) : "KADER2026"}).
          </div>
          <button onClick={async () => {
            if (!window.confirm("Réinitialiser TOUS les codes (sections + membres) à leur valeur d'origine ?")) return;
            setCodes(DEFAULT_CODES);
            setCodesForm(DEFAULT_CODES);
            setTeam(team.map(m => ({ ...m, code: autoCode(m.name) })));
            const err = await saveShared("kbs:codes", DEFAULT_CODES);
            setCodesReset(err ? `Erreur : ${err}` : "✓ Tous les codes ont été réinitialisés.");
          }} style={{ ...iconBtn, color: C.goldLight, borderColor: C.gold, padding: "8px 12px", fontSize: 12 }}>
            <RotateCcw size={13} /> Réinitialiser tous les codes
          </button>
          {codesReset && <div style={{ fontSize: 12, color: codesReset.startsWith("✓") ? C.greenLight : C.rustLight, marginTop: 8 }}>{codesReset}</div>}
        </Card>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
            <label style={{ color: C.muted }}>Mot de passe général de l'outil
              <CodeInput value={codesForm.app} onChange={e => setCodesForm({ ...codesForm, app: e.target.value.toUpperCase() })} style={{ marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Objectif (modifier le montant cible)
              <CodeInput value={codesForm.ceo} onChange={e => setCodesForm({ ...codesForm, ceo: e.target.value.toUpperCase() })} style={{ marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>CRM & Trésorerie (Catherine)
              <CodeInput value={codesForm.catherine} onChange={e => setCodesForm({ ...codesForm, catherine: e.target.value.toUpperCase() })} style={{ marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Ressources (Boîte à outils, Académie, Plan 30j, Liens, Formation)
              <CodeInput value={codesForm.ressources} onChange={e => setCodesForm({ ...codesForm, ressources: e.target.value.toUpperCase() })} style={{ marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Administration (cette section)
              <CodeInput value={codesForm.admin} onChange={e => setCodesForm({ ...codesForm, admin: e.target.value.toUpperCase() })} style={{ marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Réinitialisation totale (zone dangereuse — garde-le pour toi seul)
              <CodeInput value={codesForm.reset} onChange={e => setCodesForm({ ...codesForm, reset: e.target.value.toUpperCase() })} style={{ marginTop: 4 }} />
            </label>
          </div>
          <button onClick={saveCodes} style={{ ...btnGold, marginTop: 10 }}><Save size={14} /> {codesSaved ? "Enregistré ✓" : "Enregistrer les codes"}</button>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 10 }}>Chaque code est indépendant : connaître l'un ne donne accès à aucun autre (seul le code maître ouvre tout).</div>
        </Card>

        <H2 style={{ marginTop: 18 }}>Codes personnels de l'équipe</H2>
        <Card>
          <Eyebrow>Un code par personne — checklist Kanban + sa Formation</Eyebrow>
          <div style={{ color: C.muted, fontSize: 11.5, margin: "6px 0 12px" }}>
            Modifie ici le code de n'importe quel membre, y compris une nouvelle recrue. L'enregistrement est immédiat.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {team.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: m.color, flexShrink: 0 }} />
                <div style={{ flex: "1 1 90px", minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ fontSize: 10.5, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.role}</div>
                </div>
                <CodeInput
                  value={m.code || ""}
                  onChange={e => setTeam(team.map(x => x.id === m.id ? { ...x, code: e.target.value.toUpperCase() } : x))}
                  placeholder="CODE2026"
                  style={{ flex: "1 1 130px" }} />
              </div>
            ))}
          </div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 12 }}>
            Pour créer un nouveau membre (et donc un nouveau code), va dans l'onglet <b>Équipe</b> → "Recruter un nouveau membre".
          </div>
        </Card>
      </div>
      </>)}

      {section === "adminAgence" && (<>
      <div>
        <H2>Coordonnées de l'agence (reçus & devis PDF)</H2>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
            <label style={{ color: C.muted }}>Nom de l'entreprise
              <input value={agencyForm.name} onChange={e => setAgencyForm({ ...agencyForm, name: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Email
              <input value={agencyForm.email} onChange={e => setAgencyForm({ ...agencyForm, email: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Téléphone 1
              <input value={agencyForm.phone1} onChange={e => setAgencyForm({ ...agencyForm, phone1: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Téléphone 2 (optionnel)
              <input value={agencyForm.phone2} onChange={e => setAgencyForm({ ...agencyForm, phone2: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Adresse (optionnel)
              <input value={agencyForm.address || ""} onChange={e => setAgencyForm({ ...agencyForm, address: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Slogan (sous le nom, en haut des documents)
              <input value={agencyForm.slogan || ""} onChange={e => setAgencyForm({ ...agencyForm, slogan: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
            </label>
            <label style={{ color: C.muted }}>Site web / page Facebook (optionnel)
              <input value={agencyForm.website || ""} onChange={e => setAgencyForm({ ...agencyForm, website: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ color: C.muted, flex: 1 }}>RCCM (optionnel)
                <input value={agencyForm.rccm || ""} onChange={e => setAgencyForm({ ...agencyForm, rccm: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
              </label>
              <label style={{ color: C.muted, flex: 1 }}>NIF (optionnel)
                <input value={agencyForm.nif || ""} onChange={e => setAgencyForm({ ...agencyForm, nif: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
              </label>
            </div>
            <label style={{ color: C.muted }}>Modalités de paiement (Orange Money, Wave, banque…)
              <textarea value={agencyForm.paymentInfo || ""} onChange={e => setAgencyForm({ ...agencyForm, paymentInfo: e.target.value })} style={{ ...inputStyle, marginTop: 4, minHeight: 50, resize: "vertical" }} />
            </label>
            <label style={{ color: C.muted }}>Conditions par défaut des devis (optionnel)
              <textarea value={agencyForm.conditionsDevis || ""} onChange={e => setAgencyForm({ ...agencyForm, conditionsDevis: e.target.value })} placeholder="Ex : Devis valable 15 jours. Acompte de 50 % à la commande." style={{ ...inputStyle, marginTop: 4, minHeight: 50, resize: "vertical" }} />
            </label>
            <label style={{ color: C.muted }}>Notes par défaut des factures (optionnel)
              <textarea value={agencyForm.conditionsFacture || ""} onChange={e => setAgencyForm({ ...agencyForm, conditionsFacture: e.target.value })} placeholder="Ex : Merci de régler avant la date d'échéance." style={{ ...inputStyle, marginTop: 4, minHeight: 50, resize: "vertical" }} />
            </label>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4 }}>
              <Eyebrow>Logo &amp; couleurs (reçus, devis, factures)</Eyebrow>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                <img src={agencyForm.logo || BRAND_LOGO} alt="Logo" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 10, background: C.cardAlt }} />
                <label style={{ ...iconBtn, padding: "8px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: C.goldLight, borderColor: C.gold }}>
                  <Upload size={13} /> Changer le logo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files && e.target.files[0]; if (f) resizeLogo(f).then(url => setAgencyForm(a => ({ ...a, logo: url }))); e.target.value = ""; }} />
                </label>
                {agencyForm.logo && <button onClick={() => setAgencyForm({ ...agencyForm, logo: "" })} style={{ ...iconBtn, padding: "8px 12px", fontSize: 12 }}>Logo officiel KBS</button>}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                <label style={{ color: C.muted, display: "flex", alignItems: "center", gap: 6 }}><Palette size={13} /> Couleur principale
                  <input type="color" value={agencyForm.brandColor || "#011B45"} onChange={e => setAgencyForm({ ...agencyForm, brandColor: e.target.value })} style={{ width: 40, height: 28, border: "none", background: "none" }} />
                </label>
                <label style={{ color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>Couleur d'accent
                  <input type="color" value={agencyForm.brandColor2 || "#F39200"} onChange={e => setAgencyForm({ ...agencyForm, brandColor2: e.target.value })} style={{ width: 40, height: 28, border: "none", background: "none" }} />
                </label>
                <button onClick={() => setAgencyForm({ ...agencyForm, brandColor: "#011B45", brandColor2: "#F39200" })} style={{ ...iconBtn, padding: "6px 10px" }}>Couleurs du logo KBS</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11.5, color: C.muted, alignSelf: "center" }}>Aperçu :</span>
                <button onClick={() => buildFacturePDF(SAMPLE_DOC("FAC"), agencyForm, BRAND_LOGO)} style={{ ...iconBtn, padding: "6px 10px" }}>Facture</button>
                <button onClick={() => buildDevisPDF(SAMPLE_DOC("DEV"), agencyForm, BRAND_LOGO)} style={{ ...iconBtn, padding: "6px 10px" }}>Devis</button>
                <button onClick={() => buildRecuPDF(SAMPLE_RECU, agencyForm, BRAND_LOGO)} style={{ ...iconBtn, padding: "6px 10px" }}>Reçu</button>
              </div>
            </div>
          </div>
          <button onClick={saveAgency} style={{ ...btnGold, marginTop: 10 }}><Save size={14} /> {agencySaved ? "Enregistré ✓" : "Enregistrer les coordonnées"}</button>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 10 }}>Ces informations apparaissent automatiquement en en-tête et en pied de page de chaque reçu et devis PDF.</div>
        </Card>
      </div>
      </>)}

      {section === "adminTarifs" && (<>
      <div>
        <H2>Tarifs</H2>
        <div style={{ color: C.muted, fontSize: 11.5, marginBottom: 10 }}>
          Ces prix s'appliquent partout dans l'appli : Tarifs, CRM (choix du pack) et Prospection Réseaux (scripts avec prix automatique). Chaque changement est enregistré immédiatement.
        </div>
        <PricingListEditor title="Packs stratégiques (En ligne / Présentiel)" rows={pricing.packs} onChange={(packs) => setPricing({ ...pricing, packs })} />
        <PricingListEditor title="Formations & Coaching (En ligne / Présentiel)" rows={pricing.formations} onChange={(formations) => setPricing({ ...pricing, formations })} />
        <PricingListEditor title="Prestations techniques & créatives" rows={pricing.prestations} onChange={(prestations) => setPricing({ ...pricing, prestations })} priceMode="text" />
      </div>
      </>)}

      {section === "adminFormation" && (<>
      <div>
        <H2>Formation — Guide & Liens (par personne)</H2>
        <div style={{ color: C.muted, fontSize: 11.5, marginBottom: 10 }}>
          Chaque personne ne voit que sa propre Formation, deverrouillee par son code personnel. Toute nouvelle recrue apparait ici automatiquement.
          Format du guide : une ligne commencant par <b>## </b> devient un titre, une ligne commencant par <b>- </b> devient une puce.
        </div>
        {team.map(m => (
          <Card key={m.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: m.color }} />
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 15, color: C.goldLight }}>{m.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>· code {m.code}</div>
            </div>

            <Eyebrow>Guide (texte)</Eyebrow>
            <textarea
              value={guidesForm[m.id] || ""}
              onChange={e => setGuidesForm({ ...guidesForm, [m.id]: e.target.value })}
              placeholder="Ecris ici le guide de cette personne…"
              style={{ ...inputStyle, marginTop: 6, marginBottom: 14, minHeight: 140, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
            />

            <Eyebrow>Liens</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6, marginBottom: 8 }}>
              {((formationLiens || {})[m.id] || []).map(l => (
                <div key={l.id} style={{ background: C.cardAlt, borderRadius: 8, padding: "6px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12.5 }}>{l.label}</span>
                    <EditDeleteButtons editing={editingLien === l.id} onEdit={() => setEditingLien(editingLien === l.id ? null : l.id)} onDelete={() => removeLien(m.id, l.id)} />
                  </div>
                  {editingLien === l.id && (
                    <EditFields value={{ label: l.label || "", url: l.url || "" }}
                      fields={[{ key: "label", label: "Titre du lien" }, { key: "url", label: "Adresse (https://…)" }]}
                      onSave={(f) => saveLien(m.id, l.id, f)} onCancel={() => setEditingLien(null)} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input placeholder="Titre du lien" value={lienForm[m.id]?.label || ""} onChange={e => setLienForm({ ...lienForm, [m.id]: { ...lienForm[m.id], label: e.target.value } })} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="https://…" value={lienForm[m.id]?.url || ""} onChange={e => setLienForm({ ...lienForm, [m.id]: { ...lienForm[m.id], url: e.target.value } })} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => addLien(m.id)} style={{ ...iconBtn, padding: "0 12px" }}><Plus size={14} /></button>
            </div>
          </Card>
        ))}
        <div style={{ color: C.muted, fontSize: 11.5, marginBottom: 6 }}>Les liens s'enregistrent immediatement. Pour le texte des guides, clique sur "Enregistrer les guides" une fois tes modifications faites.</div>
        <button onClick={saveGuides} style={btnGold}><Save size={14} /> {guidesSaved ? "Enregistré ✓" : "Enregistrer les guides"}</button>
      </div>
      </>)}

      {section === "adminCaisse" && <TabCaissePerso caisse={caisse} setCaisse={setCaisse} />}

      {section === "adminRecup" && <AdminRecuperation onRestoreArchive={onRestoreArchive} />}

      {section === "adminSauvegardes" && <AdminSauvegardes onBackupNow={onBackupNow} onRestoreBackup={onRestoreBackup} />}

      {section === "adminReset" && (<>
      <div>
        <H2>Clôturer un mois</H2>
        <Card style={{ borderColor: C.green }}>
          <Eyebrow>Archiver le mois puis repartir à zéro</Eyebrow>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>
            Les chiffres actuels (clients &amp; CA, trésorerie &amp; dépenses, dettes, objectif atteint) sont <b style={{ color: C.greenLight }}>sauvegardés dans les Archives sous le mois choisi</b>, puis les compteurs du mois repartent à zéro. L'équipe, les tarifs et le Kanban ne sont pas touchés.
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: C.muted }}>Mois à archiver :</label>
            <input type="month" value={closeMonthValue} max={currentMonth}
              onChange={e => { setCloseMonthValue(e.target.value); setCloseMonthStep(false); }}
              style={{ ...inputStyle, width: 160 }} />
          </div>
          {!closeMonthStep ? (
            <button onClick={() => { setCloseMonthStep(true); setCloseMonthDone(false); }} style={{ ...btnGold, marginTop: 10, background: C.green }}>
              <Archive size={14} /> Clôturer ce mois
            </button>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: C.greenLight, fontWeight: 700, marginBottom: 6 }}>
                Confirmer : archiver les chiffres actuels sous « {closeMonthValue} » et remettre le mois en cours à zéro ?
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => { onCloseMonth(closeMonthValue); setCloseMonthStep(false); setCloseMonthDone(true); setTimeout(() => setCloseMonthDone(false), 3000); }}
                  style={{ ...btnGold, width: "auto", padding: "8px 14px", background: C.green }}>Oui, archiver et remettre à zéro</button>
                <button onClick={() => setCloseMonthStep(false)} style={iconBtn}>Annuler</button>
              </div>
            </div>
          )}
          {closeMonthDone && <div style={{ fontSize: 12, color: C.greenLight, marginTop: 8 }}>✓ Mois archivé. Consulte-le dans Ventes &amp; Finance → Archives.</div>}
        </Card>
      </div>

      <div>
        <H2>Zone dangereuse</H2>
        <Card style={{ borderColor: C.rust }}>
          <Eyebrow>Réinitialiser toutes les données</Eyebrow>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>Efface tous les clients, dépenses, dettes, prospections, tâches Kanban, coches de checklist, disponibilités, devis et liens — remet l'objectif à 250 000 FCFA. L'équipe et les codes d'accès ne sont pas touchés. <b style={{ color: C.greenLight }}>Avant l'effacement, le mois en cours (clients &amp; CA, trésorerie, dettes, objectif) est automatiquement sauvegardé dans les Archives</b> — tu pourras toujours le reconsulter. Le reste de l'action est irréversible.</div>
          {!resetStep ? (
            <button onClick={() => setResetStep(true)} style={{ ...iconBtn, marginTop: 10, color: C.rustLight, borderColor: C.rust, padding: "8px 12px" }}>
              <RefreshCw size={13} /> Tout réinitialiser
            </button>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: C.rustLight, fontWeight: 700, marginBottom: 6 }}>Ce code est différent du code Administration — confirme pour continuer :</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input type="password" placeholder="Code de réinitialisation" value={resetCodeInput}
                  onChange={e => { setResetCodeInput(e.target.value); setResetError(false); }}
                  onKeyDown={e => { if (e.key === "Enter") confirmReset(); }}
                  style={{ ...inputStyle, width: 170 }} />
                <button onClick={confirmReset} style={{ ...btnGold, width: "auto", padding: "8px 14px", background: C.rust, color: C.white }}>Oui, tout effacer</button>
                <button onClick={() => { setResetStep(false); setResetCodeInput(""); setResetError(false); }} style={iconBtn}>Annuler</button>
              </div>
              {resetError && <div style={{ color: C.rustLight, fontSize: 11, marginTop: 6 }}>Code incorrect.</div>}
            </div>
          )}
          {resetDone && <div style={{ fontSize: 12, color: C.greenLight, marginTop: 8 }}>✓ Données réinitialisées.</div>}
        </Card>
      </div>
      </>)}
    </div>
  );
}

/* ====================================================================================
   KBS GESTION — nouveaux ecrans (maquette validee) : Accueil, Menu, Stock, Vendre
   ==================================================================================== */

/* Petites briques visuelles communes aux nouveaux ecrans */
const tint = {
  or: { background: "rgba(243,146,0,.16)", color: "#FDB402" },
  ok: { background: "rgba(92,192,140,.16)", color: "#6FD39E" },
  ko: { background: "rgba(255,122,107,.15)", color: "#FF8F82" },
  bl: { background: "rgba(127,179,232,.16)", color: "#9CC6F0" },
  gr: { background: "rgba(169,180,208,.14)", color: "#C9D2E8" },
};
function Pill({ kind = "gr", children }) {
  return <span style={{ ...tint[kind], fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap" }}>{children}</span>;
}
function IconTile({ kind = "or", children, size = 40 }) {
  return <span style={{ ...tint[kind], width: size, height: size, borderRadius: 12, display: "grid", placeItems: "center", flexShrink: 0 }}>{children}</span>;
}
function Hero({ children, style }) {
  return (
    <div style={{ borderRadius: 24, padding: 18, background: "linear-gradient(150deg,#173571,#0A1F45)", position: "relative", overflow: "hidden", ...style }}>
      <div aria-hidden="true" style={{ position: "absolute", width: 230, height: 230, borderRadius: "50%", border: "1px solid rgba(243,146,0,.28)", right: -95, top: -120, pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: C.card, borderRadius: 14, padding: 4 }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{ flex: 1, textAlign: "center", padding: "9px 4px", borderRadius: 11, fontWeight: 700, fontSize: 12.5, border: "none", cursor: "pointer", background: value === v ? C.card2 : "transparent", color: value === v ? C.text : C.muted }}>{l}</button>
      ))}
    </div>
  );
}
function Chips({ options, value, onChange }) {
  return (
    <div className="kbs-navbar" style={{ display: "flex", gap: 6, overflowX: "auto", flexWrap: "nowrap" }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{ flex: "none", padding: "8px 13px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: value === o ? C.text : C.card, color: value === o ? C.bg : C.muted }}>{o}</button>
      ))}
    </div>
  );
}
function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
      <span style={{ fontFamily: "Archivo, sans-serif", fontSize: 16, fontWeight: 700 }}>{children}</span>
      {action && <button onClick={onAction} style={{ background: "none", border: "none", color: C.gold, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{action}</button>}
    </div>
  );
}
function ListRow({ children, onClick, style }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={onClick ? "kbs-tap" : undefined} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.card, borderRadius: 16, border: "none", color: C.text, width: "100%", textAlign: "left", cursor: onClick ? "pointer" : "default", boxSizing: "border-box", ...style }}>{children}</Tag>
  );
}
const numFr = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/* ---------------------------------- ACCUEIL ---------------------------------- */
function TabAccueil({ go, totalCA, totalReste, goal, pct, beneficeNet, lowStock, facturesRetard, kanban, prospects }) {
  const vendu = totalCA + totalReste;
  const encPct = vendu > 0 ? Math.round((totalCA / vendu) * 100) : 100;
  const tasks = (kanban.doing || []).length + (kanban.review || []).length + (kanban.todo || []).length;
  const toValidate = (kanban.review || []).length;
  const debtors = prospects.filter(p => resteAPayer(p) > 0).length;
  const resteFactures = facturesRetard.reduce((s, f) => s + docTotals(f).reste, 0);
  const QA = [
    { id: "vendre", label: "Vendre", icon: ShoppingBag },
    { id: "crm", label: "Client", icon: UserPlus },
    { id: "factures", label: "Facture", icon: Receipt },
    { id: "tresorerie", label: "Dépense", icon: Wallet },
    { id: "calendrier", label: "Calendrier", icon: CalendarDays },
  ];
  const recent = prospects.flatMap(p => paymentsOf(p).map(x => ({ p, x })))
    .sort((a, b) => String(b.x.date || "").localeCompare(String(a.x.date || "")) || (Number(b.x.id) || 0) - (Number(a.x.id) || 0)).slice(0, 6);
  return (
    <div className="kbs-home">
      <div>
      <Hero>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.muted, fontSize: 12.5, fontWeight: 600 }}>Chiffre d'affaires du mois</span>
          <Pill kind={encPct >= 80 ? "ok" : "or"}>{encPct} % encaissé</Pill>
        </div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 32, fontWeight: 800, marginTop: 8, letterSpacing: "-0.02em" }}>{numFr(vendu)} <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>FCFA</span></div>
        <div style={{ height: 9, borderRadius: 9, background: "rgba(255,143,130,.35)", overflow: "hidden", display: "flex", marginTop: 14 }}><i style={{ display: "block", width: `${encPct}%`, background: C.greenLight }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 12.5 }}>
          <span><b style={{ color: C.greenLight }}>{numFr(totalCA)}</b> <span style={{ color: C.muted }}>encaissé</span></span>
          <span><b style={{ color: C.rustLight }}>{numFr(totalReste)}</b> <span style={{ color: C.muted }}>reste dehors</span></span>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <button onClick={() => go("objectif")} style={{ flex: 1, background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "10px 12px", border: "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
            <div style={{ color: C.muted, fontSize: 11.5 }}>Objectif du mois</div>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, marginTop: 3 }}>{pct} %</div>
            <div style={{ height: 5, borderRadius: 5, background: "rgba(169,180,208,.2)", marginTop: 6 }}><i style={{ display: "block", width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 5, background: C.gold }} /></div>
            <div style={{ color: C.muted, fontSize: 10.5, marginTop: 4 }}>sur {fcfa(goal)}</div>
          </button>
          <button onClick={() => go("tresorerie")} style={{ flex: 1, background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "10px 12px", border: "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
            <div style={{ color: C.muted, fontSize: 11.5 }}>Bénéfice net</div>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, marginTop: 3, color: beneficeNet >= 0 ? C.greenLight : C.rustLight }}>{numFr(beneficeNet)}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>après commissions et dépenses</div>
          </button>
        </div>
      </Hero>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6, marginTop: 18 }}>
        {QA.map(q => {
          const Icon = q.icon;
          return (
            <button key={q.id} onClick={() => go(q.id)} className="kbs-tap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: C.text, background: "none", border: "none", cursor: "pointer" }}>
              <span style={{ width: 56, height: 56, borderRadius: 18, background: C.card, display: "grid", placeItems: "center", color: C.goldLight }}><Icon size={22} /></span>
              {q.label}
            </button>
          );
        })}
      </div>

      </div>
      <div>
      <SectionTitle>À traiter</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lowStock.length > 0 && (
          <ListRow onClick={() => go("stock")}>
            <IconTile kind="ko"><AlertTriangle size={19} /></IconTile>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{lowStock.length} produit{lowStock.length > 1 ? "s" : ""} presque épuisé{lowStock.length > 1 ? "s" : ""}</div><div style={{ color: C.muted, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lowStock.map(p => p.nom).join(", ")}</div></div>
            <Pill kind="ko">Stock</Pill>
          </ListRow>
        )}
        {debtors > 0 && (
          <ListRow onClick={() => go("crm")}>
            <IconTile kind="or"><Clock size={19} /></IconTile>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{debtors} client{debtors > 1 ? "s" : ""} doi{debtors > 1 ? "vent" : "t"} encore payer</div><div style={{ color: C.muted, fontSize: 12 }}>{fcfa(totalReste)} à encaisser</div></div>
            <Pill kind="or">Relancer</Pill>
          </ListRow>
        )}
        {facturesRetard.length > 0 && (
          <ListRow onClick={() => go("factures")}>
            <IconTile kind="ko"><Receipt size={19} /></IconTile>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{facturesRetard.length} facture{facturesRetard.length > 1 ? "s" : ""} en retard</div><div style={{ color: C.muted, fontSize: 12 }}>{fcfa(resteFactures)} à relancer</div></div>
            <Pill kind="ko">Factures</Pill>
          </ListRow>
        )}
        <ListRow onClick={() => go("kanban")}>
          <IconTile kind="ok"><CheckCircle size={19} /></IconTile>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{tasks} tâche{tasks > 1 ? "s" : ""} de l'équipe</div><div style={{ color: C.muted, fontSize: 12 }}>{toValidate > 0 ? `dont ${toValidate} à valider` : "rien à valider pour l'instant"}</div></div>
          <Pill kind="gr">Tâches</Pill>
        </ListRow>
      </div>
      {recent.length > 0 && (<>
        <SectionTitle>Derniers encaissements</SectionTitle>
        <div style={{ background: C.card, borderRadius: 18, padding: "4px 14px" }}>
          {recent.map(({ p, x }, i) => (
            <button key={`${p.id}-${x.id}-${i}`} onClick={() => go("calendrier")} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 0", background: "none", border: "none", borderTop: i ? `1px solid ${C.border}` : "none", color: C.text, cursor: "pointer", textAlign: "left", fontSize: 13 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clientFullName(p) || "Client"}</div>
                <div style={{ color: C.muted, fontSize: 11.5 }}>{x.date ? frDate(x.date) : ""}{x.mode ? ` · ${x.mode}` : ""}</div>
              </div>
              <b style={{ color: C.greenLight, fontFamily: "Archivo, sans-serif" }}>+{numFr(x.montant)}</b>
            </button>
          ))}
        </div>
      </>)}
      </div>
    </div>
  );
}

/* ---------------------------------- MENU ---------------------------------- */
/* ---------------------------------- CALENDRIER ---------------------------------- */
// Tout ce qui s'est passe un jour donne : encaissements, ventes en caisse, nouveaux
// clients, depenses, factures. Lit le mois en cours ET toutes les archives.
const ymd = (d) => String(d || "").slice(0, 10);
const todayYmd = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function buildDayEvents({ prospects, expenses, archives, factures, team }) {
  const nameOf = (id) => (team.find(m => m.id === id) || {}).name || "";
  const byDay = new Map();
  const seen = new Set();
  function add(ev) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ev.date) || seen.has(ev.key)) return;
    seen.add(ev.key);
    if (!byDay.has(ev.date)) byDay.set(ev.date, []);
    byDay.get(ev.date).push(ev);
  }
  // Le mois en cours en premier : en cas de doublon, c'est la version a jour qui compte.
  const clientSources = [...(prospects || []), ...(archives || []).flatMap(a => a.clients || [])];
  clientSources.forEach(c => {
    const nom = clientFullName(c) || "Client";
    paymentsOf(c).forEach(pay => {
      const m = Number(pay.montant) || 0;
      if (m <= 0) return;
      add({ key: `pay|${c.id}|${pay.id}|${ymd(pay.date)}|${m}`, type: "pay", date: ymd(pay.date), label: nom, sub: [pay.mode, pay.note && pay.note !== "Paiement" ? pay.note : "", pay.recNumero].filter(Boolean).join(" · "), montant: m, who: nameOf(c.owner) });
    });
    (c.achats || []).forEach(a => {
      const items = (a.items || []).map(it => `${it.label}${Number(it.qte) > 1 ? ` ×${it.qte}` : ""}`).join(", ");
      add({ key: `vente|${c.id}|${a.id}`, type: "vente", date: ymd(a.date), label: nom, sub: items, montant: Number(a.total) || 0, who: a.vendeur || "" });
    });
    if (c.dateInscription && !c.reportDe) {
      add({ key: `client|${c.id}`, type: "client", date: ymd(c.dateInscription), label: nom, sub: [c.pack, c.statut].filter(Boolean).join(" · "), montant: 0, who: nameOf(c.owner) });
    }
  });
  [...(expenses || []), ...(archives || []).flatMap(a => a.expenses || [])].forEach(e => {
    add({ key: `dep|${e.id}|${ymd(e.date)}|${e.montant}`, type: "dep", date: ymd(e.date), label: e.label || "Dépense", sub: e.categorie || "", montant: Number(e.montant) || 0, who: nameOf(e.addedBy) });
  });
  (factures || []).forEach(f => {
    add({ key: `fac|${f.id}`, type: "fac", date: ymd(f.date), label: f.clientNom || "Facture", sub: f.numero || "", montant: docTotals(f).total, who: "" });
  });
  return byDay;
}
function dayTotals(list) {
  const t = { enc: 0, dep: 0, ventes: 0, clients: 0 };
  (list || []).forEach(e => {
    if (e.type === "pay") t.enc += e.montant;
    if (e.type === "dep") t.dep += e.montant;
    if (e.type === "vente") t.ventes += 1;
    if (e.type === "client") t.clients += 1;
  });
  return t;
}

function TabCalendrier({ prospects, expenses, archives, factures, team }) {
  const [day, setDay] = useState(todayYmd());
  const [view, setView] = useState(todayYmd().slice(0, 7)); // mois affiche "YYYY-MM"
  const byDay = useMemo(() => buildDayEvents({ prospects, expenses, archives, factures, team }), [prospects, expenses, archives, factures, team]);

  const [vy, vm] = view.split("-").map(Number);
  const first = new Date(vy, vm - 1, 1);
  const offset = (first.getDay() + 6) % 7; // lundi = 0
  const nbDays = new Date(vy, vm, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: nbDays }, (_, i) => `${view}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);

  const monthList = [...byDay.entries()].filter(([d]) => d.startsWith(view)).flatMap(([, l]) => l);
  const mt = dayTotals(monthList);
  const list = (byDay.get(day) || []).slice().sort((a, b) => ["pay", "vente", "client", "fac", "dep"].indexOf(a.type) - ["pay", "vente", "client", "fac", "dep"].indexOf(b.type));
  const t = dayTotals(list);
  const today = todayYmd();

  function shiftMonth(n) {
    const d = new Date(vy, vm - 1 + n, 1);
    setView(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  function pick(d) { if (!d) return; setDay(d); setView(d.slice(0, 7)); }

  const TYPES = {
    pay: { label: "Encaissement", kind: "ok", icon: Banknote, color: C.greenLight, sign: "+" },
    vente: { label: "Vente en caisse", kind: "or", icon: ShoppingBag, color: C.goldLight, sign: "" },
    client: { label: "Nouveau client", kind: "bl", icon: UserPlus, color: C.text, sign: "" },
    fac: { label: "Facture", kind: "bl", icon: Receipt, color: C.text, sign: "" },
    dep: { label: "Dépense", kind: "ko", icon: Wallet, color: C.rustLight, sign: "−" },
  };
  const dayLabel = new Date(day + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="kbs-cal" style={{ gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <label htmlFor="kbs-cal-date" style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>Choisir une date</label>
          <input id="kbs-cal-date" type="date" value={day} onChange={e => pick(e.target.value)} style={{ ...inputStyle, width: "auto", flex: "1 1 160px", colorScheme: "dark" }} />
          {day !== today && <button onClick={() => pick(today)} style={{ ...iconBtn, padding: "9px 12px" }}>Aujourd'hui</button>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <button onClick={() => shiftMonth(-1)} aria-label="Mois précédent" style={{ ...iconBtn, padding: 8 }}><ChevronLeft size={18} /></button>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 17, textTransform: "capitalize" }}>{MOIS_FR[vm - 1]} {vy}</div>
          <button onClick={() => shiftMonth(1)} aria-label="Mois suivant" style={{ ...iconBtn, padding: 8 }}><ChevronRight size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4, marginTop: 10 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, color: C.muted, fontWeight: 700, paddingBottom: 2 }}>{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dt = dayTotals(byDay.get(d));
            const sel = d === day, isToday = d === today;
            const has = dt.enc || dt.dep || dt.ventes || dt.clients;
            return (
              <button key={d} onClick={() => pick(d)} aria-label={d} aria-pressed={sel}
                style={{ minHeight: 50, borderRadius: 11, border: isToday && !sel ? `1px solid ${C.gold}` : "1px solid transparent", background: sel ? C.gold : has ? C.cardAlt : "transparent", color: sel ? "#011B45" : C.text, cursor: "pointer", padding: "5px 2px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{Number(d.slice(8))}</span>
                {dt.enc > 0 && <span style={{ fontSize: 9.5, fontWeight: 700, color: sel ? "#011B45" : C.greenLight, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dt.enc >= 1000 ? `${Math.round(dt.enc / 1000)}k` : dt.enc}</span>}
                <span style={{ display: "flex", gap: 3 }}>
                  {(dt.ventes > 0 || dt.clients > 0) && <i style={{ width: 5, height: 5, borderRadius: 3, background: sel ? "#011B45" : C.goldLight }} />}
                  {dt.dep > 0 && <i style={{ width: 5, height: 5, borderRadius: 3, background: sel ? "#011B45" : C.rustLight }} />}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12, fontSize: 12, color: C.muted }}>
          <span>Mois : <b style={{ color: C.greenLight }}>{fcfa(mt.enc)}</b> encaissé</span>
          <span><b style={{ color: C.rustLight }}>{fcfa(mt.dep)}</b> de dépenses</span>
          <span>{mt.ventes} vente{mt.ventes > 1 ? "s" : ""} en caisse</span>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 18, textTransform: "capitalize" }}>{dayLabel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 10 }}>
          <ArchStat label="Encaissé" value={fcfa(t.enc)} color={C.greenLight} />
          <ArchStat label="Dépenses" value={fcfa(t.dep)} color={C.rustLight} />
          <ArchStat label="Solde du jour" value={fcfa(t.enc - t.dep)} color={t.enc - t.dep >= 0 ? C.goldLight : C.rustLight} />
        </div>
      </div>

      {list.length === 0 ? (
        <Card><div style={{ color: C.muted, fontSize: 13 }}>Rien d'enregistré ce jour-là. Les jours avec de l'activité sont surlignés dans le calendrier.</div></Card>
      ) : list.map(ev => {
        const T = TYPES[ev.type]; const Icon = T.icon;
        return (
          <div key={ev.key} style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, borderRadius: 14, padding: "11px 12px" }}>
            <IconTile kind={T.kind} size={38}><Icon size={17} /></IconTile>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.label}</div>
              <div style={{ fontSize: 11.5, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{T.label}{ev.sub ? ` · ${ev.sub}` : ""}{ev.who ? ` · ${ev.who}` : ""}</div>
            </div>
            {ev.montant > 0 && <b style={{ color: T.color, fontFamily: "Archivo, sans-serif", whiteSpace: "nowrap" }}>{T.sign}{numFr(ev.montant)}</b>}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function TabMenu({ go, categories, meta, unread, me, onLogout, upd }) {
  const kinds = { ventes: "or", produits: "bl", pilotage: "ok", marketing: "or", ressources: "ok", admin: "bl" };
  return (
    <div>
      {me && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, borderRadius: 16, padding: "10px 12px" }}>
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: me.color || C.gold, color: "#011B45", display: "grid", placeItems: "center", fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 13 }}>{(me.name || "?").slice(0, 2).toUpperCase()}</span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{me.name}</div><div style={{ color: C.muted, fontSize: 12 }}>{me.role}</div></div>
          <button onClick={onLogout} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5, padding: "8px 11px" }}><LogOut size={14} /> Déconnexion</button>
        </div>
      )}
      {categories.map(cat => (
        <div key={cat.id}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", margin: "18px 0 8px 2px" }}>{cat.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
            {cat.tabs.map(t => {
              const m = meta[t]; if (!m) return null;
              const Icon = m.icon;
              const n = unread[t] || 0;
              return (
                <button key={t} onClick={() => go(t)} className="kbs-tap" style={{ background: C.card, borderRadius: 16, padding: "13px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", fontSize: 12, fontWeight: 600, lineHeight: 1.25, color: C.text, border: "none", cursor: "pointer", position: "relative" }}>
                  <IconTile kind={kinds[cat.id]}><Icon size={19} /></IconTile>
                  {m.label}
                  {n > 0 && <span style={{ position: "absolute", top: 8, right: 8, minWidth: 18, height: 18, borderRadius: 9, background: C.gold, color: "#011B45", fontSize: 10.5, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 4px" }}>{n}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {upd && <UpdateCard upd={upd} />}
    </div>
  );
}

/* ---------------------------------- PRODUITS : outils ---------------------------------- */
const PRODUCT_CATEGORIES = ["Matériel", "Formation", "Service", "Digital"];
const PRODUCT_UNITS = ["Pièce", "Carton", "Sac", "Lot", "Kg", "Litre", "Séance", "Heure", "Mois"];
function productIcon(p, size = 20) {
  const c = (p && p.categorie) || "";
  if (c === "Formation") return <BookOpen size={size} />;
  if (c === "Pack") return <Award size={size} />;
  if (c === "Service") return <Sparkles size={size} />;
  if (c === "Digital") return <FileText size={size} />;
  if (c === "Matériel") return <Package size={size} />;
  return <Tag size={size} />;
}
function productKind(p) {
  const c = (p && p.categorie) || "";
  return c === "Pack" ? "or" : c === "Formation" ? "ok" : c === "Service" ? "or" : c === "Digital" ? "bl" : c === "Matériel" ? "or" : "gr";
}
const hasStock = (p) => p && p.suiviStock !== false;
// Etat du stock : Epuise / Bas / Moyen / OK, ou Service (pas de stock).
function stockState(p) {
  if (!hasStock(p)) return { label: "Service", kind: "gr", pct: 100 };
  const st = Number(p.stock) || 0, seuil = Number(p.seuil) || 0;
  const pct = Math.max(4, Math.min(100, seuil > 0 ? (st / (seuil * 3)) * 100 : 100));
  if (st <= 0) return { label: "Épuisé", kind: "ko", pct: 4 };
  if (seuil > 0 && st <= seuil) return { label: "Bas", kind: "ko", pct };
  if (seuil > 0 && st <= seuil * 2) return { label: "Moyen", kind: "or", pct };
  return { label: "OK", kind: "ok", pct };
}

// --- Packs, formations et prestations de « Tarifs » vendus comme des services ---
function parsePrice(v) {
  if (typeof v === "number") return v;
  const m = String(v || "").replace(/[\s  .]/g, "").match(/\d+/);
  return m ? Number(m[0]) : 0;
}
function slugify(t) {
  return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
function tarifProducts(pricing) {
  const P = pricing || {}, out = [];
  const withVariants = (list, categorie, key) => (list || []).forEach(x => {
    if (!x || !x.name) return;
    [["online", "en ligne"], ["presentiel", "présentiel"]].forEach(([k, l]) => {
      const prix = Number(x[k]);
      if (prix > 0) out.push({ id: `tarif-${key}-${slugify(x.name)}-${k}`, nom: `${x.name} (${l})`, categorie, prixVente: prix, suiviStock: false, fromTarifs: true, description: x.note || "" });
    });
  });
  withVariants(P.packs, "Pack", "pack");
  withVariants(P.formations, "Formation", "formation");
  (P.prestations || []).forEach(x => {
    const prix = parsePrice(x && x.price);
    if (x && x.name && prix > 0) out.push({ id: `tarif-service-${slugify(x.name)}`, nom: x.name, categorie: "Service", prixVente: prix, suiviStock: false, fromTarifs: true, description: x.price });
  });
  return out;
}
// Catalogue de vente = produits du stock + offres de Tarifs (sans doublon de nom).
function saleCatalog(products, pricing) {
  const names = new Set((products || []).map(p => String(p.nom || "").trim().toLowerCase()));
  return [...(products || []), ...tarifProducts(pricing).filter(t => !names.has(t.nom.toLowerCase()))];
}
// Lien public d'un produit / service (page que les clients peuvent ouvrir).
function productLink(p) { return `${window.location.origin}/p/${encodeURIComponent(p.id)}`; }
function shopLink() { return `${window.location.origin}/boutique`; }
function ProductThumb({ p, size = 42, radius = 12 }) {
  if (p && p.photo) return <img src={p.photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0 }} />;
  return <span style={{ ...tint[productKind(p)], width: size, height: size, borderRadius: radius, display: "grid", placeItems: "center", flexShrink: 0 }}>{productIcon(p, Math.round(size * 0.45))}</span>;
}
// Photo de produit reduite (max 360 px, JPEG) pour rester legere en base.
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 360 / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
// Un mouvement de stock : met a jour la quantite du produit et garde une trace.
function stockMove({ products, setProducts, setStockMoves, productId, delta, type, motif, by, ref, setTo }) {
  const p = products.find(x => x.id === productId);
  if (!p) return;
  const before = Number(p.stock) || 0;
  const after = setTo != null ? Number(setTo) : before + Number(delta);
  setProducts(prev => prev.map(x => x.id === productId ? { ...x, stock: after } : x));
  setStockMoves(prev => [...prev, {
    id: Date.now() + Math.random(), date: new Date().toISOString(), productId, productName: p.nom,
    type, delta: after - before, before, after, motif: motif || "", by: by || "", ref: ref || "",
  }]);
}

/* Lecteur de code-barres par la camera (si le telephone le permet), sinon saisie. */
function BarcodeScanner({ onCode, onClose }) {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("Place le code-barres devant la caméra…");
  useEffect(() => {
    let stream, stop = false, timer;
    (async () => {
      if (!("BarcodeDetector" in window) || !navigator.mediaDevices) { setMsg("Ce téléphone ne permet pas le scan par caméra. Tape le code ou utilise un lecteur de code-barres."); return; }
      try {
        const det = new window.BarcodeDetector();
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        const tick = async () => {
          if (stop || !videoRef.current) return;
          try {
            const codes = await det.detect(videoRef.current);
            if (codes && codes[0]) { onCode(codes[0].rawValue); return; }
          } catch (e) { /* image pas prete */ }
          timer = setTimeout(tick, 250);
        };
        tick();
      } catch (e) { setMsg("Caméra indisponible : autorise l'accès à la caméra, ou tape le code."); }
    })();
    return () => { stop = true; clearTimeout(timer); if (stream) stream.getTracks().forEach(t => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(1,6,13,.86)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 14 }}>
      <video ref={videoRef} muted playsInline style={{ width: "100%", maxWidth: 420, borderRadius: 20, background: "#000", aspectRatio: "4 / 3", objectFit: "cover" }} />
      <div style={{ color: C.text, fontSize: 13, textAlign: "center", maxWidth: 360 }}>{msg}</div>
      <button onClick={onClose} style={{ ...btnGold, width: 200 }}>Fermer</button>
    </div>
  );
}

/* ---------------------------------- STOCK ---------------------------------- */
const MOVE_MOTIFS = {
  entree: ["Achat fournisseur", "Retour client", "Correction"],
  sortie: ["Casse", "Perte", "Usage interne", "Cadeau / échantillon", "Correction"],
};
function emptyProduct() {
  return { nom: "", categorie: PRODUCT_CATEGORIES[0], codeBarre: "", unite: PRODUCT_UNITS[0], prixAchat: "", prixVente: "", stock: "", seuil: "", fournisseur: "", suiviStock: true, photo: "", description: "" };
}

function ShareButtons({ url, text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch (e) { window.prompt("Copie ce lien :", url); }
  }
  const b = { ...iconBtn, display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 11px", textDecoration: "none", fontSize: 12.5 };
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button onClick={copy} style={b}><Copy size={14} /> {copied ? "Copié ✓" : "Copier"}</button>
      <a href={waLink("", `${text}\n${url}`)} target="_blank" rel="noreferrer" style={{ ...b, color: "#25D366", borderColor: "rgba(37,211,102,.5)" }}><Send size={14} /> WhatsApp</a>
      <a href={url} target="_blank" rel="noreferrer" style={b} aria-label="Ouvrir le lien"><ExternalLink size={14} /></a>
    </div>
  );
}

// Liens publics : la boutique entiere + une page par produit / service / pack.
function ProductLinks({ catalog }) {
  const items = catalog.filter(p => Number(p.prixVente) > 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
      <Card style={{ borderColor: C.gold }}>
        <div style={{ fontWeight: 700 }}>Boutique en ligne</div>
        <div style={{ color: C.muted, fontSize: 12.5, margin: "3px 0 8px" }}>Tous tes produits, services et packs sur une seule page. Le client clique et commande sur WhatsApp.</div>
        <div style={{ fontSize: 12.5, color: C.goldLight, wordBreak: "break-all", marginBottom: 8 }}>{shopLink()}</div>
        <ShareButtons url={shopLink()} text="Découvre nos produits et services :" />
      </Card>
      {items.length === 0 && <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Ajoute un produit avec un prix pour avoir son lien.</div>}
      {items.map(p => (
        <div key={p.id} style={{ background: C.card, borderRadius: 16, padding: "11px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ProductThumb p={p} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 13.5, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nom}</b>
              <div style={{ color: C.muted, fontSize: 12 }}>{fcfa(p.prixVente)} · {p.fromTarifs ? `${p.categorie} (Tarifs)` : p.categorie || "Produit"}</div>
            </div>
          </div>
          <div style={{ marginTop: 8 }}><ShareButtons url={productLink(p)} text={`${p.nom} — ${fcfa(p.prixVente)}`} /></div>
        </div>
      ))}
    </div>
  );
}

function TabStock({ products, setProducts, stockMoves, setStockMoves, team, currentUser, pricing }) {
  const [seg, setSeg] = useState("produits");
  const [view, setView] = useState("list");      // list | form | move
  const [form, setForm] = useState(emptyProduct());
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");
  const [mv, setMv] = useState({ type: "entree", productId: "", qte: 1, motif: MOVE_MOTIFS.entree[0], note: "" });
  const [counts, setCounts] = useState({});
  const by = (team.find(m => m.id === currentUser) || {}).name || "";

  const physical = products.filter(hasStock);
  const valeur = physical.reduce((s, p) => s + (Number(p.stock) || 0) * (Number(p.prixAchat) || 0), 0);
  const aRacheter = physical.filter(p => ["Bas", "Épuisé"].includes(stockState(p).label));
  const cats = ["Tous", ...Array.from(new Set([...PRODUCT_CATEGORIES, ...products.map(p => p.categorie).filter(Boolean)]))];
  const list = products.filter(p => (cat === "Tous" || p.categorie === cat) &&
    (!search.trim() || `${p.nom} ${p.codeBarre || ""} ${p.fournisseur || ""}`.toLowerCase().includes(search.trim().toLowerCase())))
    .slice().sort((a, b) => (stockState(a).kind === "ko" ? 0 : 1) - (stockState(b).kind === "ko" ? 0 : 1) || a.nom.localeCompare(b.nom));

  function openNew() { setEditingId(null); setForm(emptyProduct()); setView("form"); }
  function openEdit(p) { setEditingId(p.id); setForm({ ...emptyProduct(), ...p, stock: p.stock ?? "" }); setView("form"); }
  function saveProduct() {
    if (!form.nom.trim()) { window.alert("Indique le nom du produit."); return; }
    if (!(Number(form.prixVente) >= 0) || form.prixVente === "") { window.alert("Indique le prix de vente."); return; }
    const clean = { ...form, nom: form.nom.trim(), prixAchat: Number(form.prixAchat) || 0, prixVente: Number(form.prixVente) || 0, seuil: Number(form.seuil) || 0 };
    if (editingId) {
      const old = products.find(p => p.id === editingId);
      const newStock = Number(form.stock) || 0;
      setProducts(products.map(p => p.id === editingId ? { ...p, ...clean, stock: old.stock } : p));
      // Un changement de quantite passe par un mouvement « Correction » (trace gardee).
      if (hasStock(clean) && newStock !== (Number(old.stock) || 0)) {
        stockMove({ products: products.map(p => p.id === editingId ? { ...p, ...clean, stock: old.stock } : p), setProducts, setStockMoves, productId: editingId, setTo: newStock, type: "inventaire", motif: "Correction (fiche produit)", by });
      }
    } else {
      const id = Date.now();
      const st = hasStock(clean) ? Number(form.stock) || 0 : 0;
      setProducts([...products, { ...clean, id, stock: st, createdAt: new Date().toISOString() }]);
      if (st > 0) setStockMoves(prev => [...prev, { id: id + 1, date: new Date().toISOString(), productId: id, productName: clean.nom, type: "entree", delta: st, before: 0, after: st, motif: "Stock de départ", by }]);
    }
    setView("list");
  }
  function deleteProduct(p) {
    if (!confirmDelete(`le produit « ${p.nom} »`)) return;
    setProducts(products.filter(x => x.id !== p.id));
    if (view === "form") setView("list");
  }
  function openMove(type, productId) {
    setMv({ type, productId: productId || (physical[0] && physical[0].id) || "", qte: type === "inventaire" ? 0 : 1, motif: type === "inventaire" ? "Inventaire" : MOVE_MOTIFS[type][0], note: "" });
    setView("move");
  }
  function saveMove() {
    const p = products.find(x => String(x.id) === String(mv.productId));
    if (!p) { window.alert("Choisis un produit."); return; }
    const q = Number(mv.qte) || 0;
    if (mv.type !== "inventaire" && q <= 0) { window.alert("Indique une quantité."); return; }
    const motif = [mv.motif, mv.note.trim()].filter(Boolean).join(" — ");
    if (mv.type === "inventaire") stockMove({ products, setProducts, setStockMoves, productId: p.id, setTo: q, type: "inventaire", motif, by });
    else stockMove({ products, setProducts, setStockMoves, productId: p.id, delta: mv.type === "entree" ? q : -q, type: mv.type, motif, by });
    setView("list"); setSeg("mouvements");
  }
  function deleteMove(m) {
    if (!confirmDelete("ce mouvement (la quantité du produit sera corrigée)")) return;
    setProducts(products.map(p => p.id === m.productId ? { ...p, stock: (Number(p.stock) || 0) - (Number(m.delta) || 0) } : p));
    setStockMoves(stockMoves.filter(x => x.id !== m.id));
  }
  function editMoveNote(m) {
    const v = window.prompt("Motif du mouvement :", m.motif || "");
    if (v == null) return;
    setStockMoves(stockMoves.map(x => x.id === m.id ? { ...x, motif: v } : x));
  }
  function applyInventory() {
    const entries = Object.entries(counts).filter(([, v]) => v !== "" && v != null);
    if (!entries.length) return;
    if (!window.confirm(`Enregistrer l'inventaire de ${entries.length} produit(s) ? Les quantités seront remplacées par celles comptées.`)) return;
    let cur = products;
    const moves = [];
    entries.forEach(([pid, v]) => {
      const p = cur.find(x => String(x.id) === pid); if (!p) return;
      const after = Number(v) || 0, before = Number(p.stock) || 0;
      if (after === before) return;
      cur = cur.map(x => x.id === p.id ? { ...x, stock: after } : x);
      moves.push({ id: Date.now() + Math.random(), date: new Date().toISOString(), productId: p.id, productName: p.nom, type: "inventaire", delta: after - before, before, after, motif: "Inventaire", by });
    });
    setProducts(cur); setStockMoves(prev => [...prev, ...moves]); setCounts({});
    window.alert(`Inventaire enregistré : ${moves.length} correction(s).`);
  }

  /* ---- Formulaire produit ---- */
  if (view === "form") {
    const marge = (Number(form.prixVente) || 0) - (Number(form.prixAchat) || 0);
    const margePct = Number(form.prixVente) > 0 ? Math.round(marge / Number(form.prixVente) * 100) : 0;
    const F = (k) => ({ value: form[k] ?? "", onChange: e => setForm({ ...form, [k]: e.target.value }) });
    const lbl = { display: "block", fontSize: 12, color: C.muted, marginBottom: 5, fontWeight: 600 };
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setView("list")} aria-label="Retour" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><ChevronLeft size={20} /></button>
          <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 21, fontWeight: 800, flex: 1 }}>{editingId ? "Modifier le produit" : "Nouveau produit"}</div>
          {editingId && <EditDeleteButtons onDelete={() => deleteProduct(products.find(p => p.id === editingId))} />}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          <label style={{ width: 78, height: 78, borderRadius: 20, border: `1.5px dashed ${C.muted}`, display: "grid", placeItems: "center", color: C.muted, flexShrink: 0, cursor: "pointer", overflow: "hidden" }} aria-label="Photo du produit">
            {form.photo ? <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera size={26} />}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files && e.target.files[0]; if (f) resizePhoto(f).then(url => setForm(x => ({ ...x, photo: url }))); e.target.value = ""; }} />
          </label>
          <div style={{ flex: 1 }}><label style={lbl}>Nom du produit *</label><input placeholder="Ex : Ring light LED 18 pouces" {...F("nom")} style={inputStyle} /></div>
        </div>
        {form.photo && <button onClick={() => setForm({ ...form, photo: "" })} style={{ ...iconBtn, marginTop: 6 }}>Retirer la photo</button>}

        <label style={{ ...lbl, marginTop: 12 }}>Catégorie</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Array.from(new Set([...PRODUCT_CATEGORIES, ...products.map(p => p.categorie).filter(Boolean)])).map(c => (
            <button key={c} onClick={() => setForm({ ...form, categorie: c })} style={{ padding: "7px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: form.categorie === c ? C.text : C.card, color: form.categorie === c ? C.bg : C.muted }}>{c}</button>
          ))}
          <button onClick={() => { const v = window.prompt("Nom de la nouvelle catégorie :"); if (v && v.trim()) setForm({ ...form, categorie: v.trim() }); }} style={{ padding: "7px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: C.card, color: C.goldLight }}>+ Nouvelle</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, background: C.card, borderRadius: 14, padding: 4 }}>
          {[[true, "Produit avec stock"], [false, "Service (sans stock)"]].map(([v, l]) => (
            <button key={l} onClick={() => setForm({ ...form, suiviStock: v })} style={{ flex: 1, padding: "9px 4px", borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: (form.suiviStock !== false) === v ? C.card2 : "transparent", color: (form.suiviStock !== false) === v ? C.text : C.muted }}>{l}</button>
          ))}
        </div>

        <div className="kbs-grid2" style={{ marginTop: 12 }}>
          <div><label style={lbl}>Code-barres</label><input placeholder="Facultatif" {...F("codeBarre")} style={inputStyle} /></div>
          <div><label style={lbl}>Unité</label><select {...F("unite")} style={inputStyle}>{PRODUCT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
          <div><label style={lbl}>Prix d'achat (FCFA)</label><input type="number" inputMode="numeric" {...F("prixAchat")} style={inputStyle} /></div>
          <div><label style={lbl}>Prix de vente (FCFA) *</label><input type="number" inputMode="numeric" {...F("prixVente")} style={inputStyle} /></div>
        </div>
        {Number(form.prixVente) > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, ...tint.ok, borderRadius: 15, padding: "11px 14px", fontSize: 13 }}>
            <BarChart3 size={19} />
            <span style={{ color: C.text }}>Bénéfice : <b style={{ color: C.greenLight }}>{fcfa(marge)}</b> par {String(form.unite || "pièce").toLowerCase()} · marge {margePct} %</span>
          </div>
        )}
        {form.suiviStock !== false && (
          <div className="kbs-grid2" style={{ marginTop: 12 }}>
            <div><label style={lbl}>{editingId ? "Quantité en stock" : "Stock de départ"}</label><input type="number" inputMode="numeric" {...F("stock")} style={inputStyle} /></div>
            <div><label style={lbl}>Alerte sous</label><input type="number" inputMode="numeric" {...F("seuil")} style={inputStyle} /></div>
          </div>
        )}
        <label style={{ ...lbl, marginTop: 12 }}>Description (affichée sur le lien du produit)</label>
        <textarea placeholder="Ce que le client reçoit, les avantages, la durée…" rows={3} {...F("description")} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        <label style={{ ...lbl, marginTop: 12 }}>Fournisseur</label>
        <input placeholder="Facultatif" {...F("fournisseur")} style={inputStyle} />
        <button onClick={saveProduct} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 54, marginTop: 18 }}><Save size={17} /> Enregistrer le produit</button>
      </div>
    );
  }

  /* ---- Mouvement de stock ---- */
  if (view === "move") {
    const p = products.find(x => String(x.id) === String(mv.productId));
    const st = p ? Number(p.stock) || 0 : 0;
    const q = Number(mv.qte) || 0;
    const after = mv.type === "inventaire" ? q : mv.type === "entree" ? st + q : st - q;
    const recent = stockMoves.filter(m => p && m.productId === p.id).slice(-4).reverse();
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setView("list")} aria-label="Retour" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><ChevronLeft size={20} /></button>
          <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 21, fontWeight: 800 }}>Mouvement de stock</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {[["entree", "Entrée", ArrowDownToLine, C.greenLight], ["sortie", "Sortie", ArrowUpFromLine, C.rustLight], ["inventaire", "Inventaire", ClipboardList, "#9CC6F0"]].map(([t, l, Icon, col]) => (
            <button key={t} onClick={() => setMv({ ...mv, type: t, qte: t === "inventaire" ? st : 1, motif: t === "inventaire" ? "Inventaire" : MOVE_MOTIFS[t][0] })} style={{ background: mv.type === t ? "rgba(243,146,0,.10)" : C.card, border: `1.5px solid ${mv.type === t ? C.gold : "transparent"}`, borderRadius: 16, padding: "12px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, color: C.text, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
              <Icon size={20} color={col} />{l}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, margin: "16px 0 8px 2px" }}>Produit</div>
        <select value={mv.productId} onChange={e => { const np = products.find(x => String(x.id) === e.target.value); setMv({ ...mv, productId: e.target.value, qte: mv.type === "inventaire" ? (Number(np && np.stock) || 0) : mv.qte }); }} style={inputStyle}>
          {physical.map(x => <option key={x.id} value={x.id}>{x.nom} — {Number(x.stock) || 0} en stock</option>)}
        </select>
        <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, margin: "16px 0 8px 2px" }}>{mv.type === "inventaire" ? "Quantité comptée" : mv.type === "entree" ? "Quantité reçue" : "Quantité sortie"}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, borderRadius: 18, padding: 10 }}>
          <button onClick={() => setMv({ ...mv, qte: Math.max(0, q - 1) })} aria-label="Diminuer" style={{ width: 48, height: 48, borderRadius: 14, background: C.card2, color: C.text, border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}><Minus size={20} /></button>
          <div style={{ textAlign: "center" }}>
            <input type="number" inputMode="numeric" value={mv.qte} onChange={e => setMv({ ...mv, qte: e.target.value })} aria-label="Quantité" style={{ width: 110, textAlign: "center", background: "transparent", border: "none", color: C.text, fontFamily: "Archivo, sans-serif", fontSize: 30, fontWeight: 800 }} />
            <div style={{ color: after < 0 ? C.rustLight : C.muted, fontSize: 12 }}>nouveau stock : {after}</div>
          </div>
          <button onClick={() => setMv({ ...mv, qte: q + 1 })} aria-label="Augmenter" style={{ width: 48, height: 48, borderRadius: 14, background: C.gold, color: "#011B45", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={20} /></button>
        </div>
        {mv.type !== "inventaire" && (<>
          <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, margin: "16px 0 8px 2px" }}>Motif</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {MOVE_MOTIFS[mv.type].map(m => <button key={m} onClick={() => setMv({ ...mv, motif: m })} style={{ padding: "8px 12px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: mv.motif === m ? C.text : C.card, color: mv.motif === m ? C.bg : C.muted }}>{m}</button>)}
          </div>
        </>)}
        <input placeholder="Note (facultatif : fournisseur, n° de bon…)" value={mv.note} onChange={e => setMv({ ...mv, note: e.target.value })} style={{ ...inputStyle, marginTop: 10 }} />
        {recent.length > 0 && (<>
          <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, margin: "16px 0 8px 2px" }}>Derniers mouvements</div>
          <div style={{ background: C.card, borderRadius: 16, padding: "4px 14px" }}>
            {recent.map((m, i) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", fontSize: 12.5, borderTop: i ? `1px solid ${C.border}` : "none" }}>
                <b style={{ color: m.delta < 0 ? C.rustLight : C.greenLight, width: 38 }}>{m.delta > 0 ? "+" : ""}{m.delta}</b>
                <span style={{ flex: 1 }}>{m.motif}{m.by ? ` · ${m.by}` : ""}</span>
                <span style={{ color: C.muted }}>{frDate(m.date)}</span>
              </div>
            ))}
          </div>
        </>)}
        <button onClick={saveMove} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 54, marginTop: 18 }}><CheckCircle size={17} /> Valider {mv.type === "entree" ? "l'entrée" : mv.type === "sortie" ? "la sortie" : "l'inventaire"}</button>
      </div>
    );
  }

  /* ---- Liste ---- */
  return (
    <div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={() => openMove("entree")} disabled={!physical.length} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, padding: "10px 13px", color: C.text, background: C.card, border: "none", fontWeight: 700 }}><Truck size={16} /> Entrée / sortie</button>
        <button onClick={openNew} className="kbs-tap" style={{ ...btnGold, padding: "10px 14px" }}><Plus size={16} /> Nouveau produit</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        <div style={{ background: C.card, borderRadius: 16, padding: "11px 12px" }}><div style={{ color: C.muted, fontSize: 11.5 }}>Valeur du stock</div><div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 17, marginTop: 4 }}>{numFr(valeur)}</div></div>
        <div style={{ background: C.card, borderRadius: 16, padding: "11px 12px" }}><div style={{ color: C.muted, fontSize: 11.5 }}>Produits</div><div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 17, marginTop: 4 }}>{products.length}</div></div>
        <div style={{ background: C.card, borderRadius: 16, padding: "11px 12px" }}><div style={{ color: C.muted, fontSize: 11.5 }}>À racheter</div><div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 17, marginTop: 4, color: aRacheter.length ? C.rustLight : C.greenLight }}>{aRacheter.length}</div></div>
      </div>
      <div style={{ marginTop: 14 }}><Seg options={[["produits", "Produits"], ["liens", "Liens"], ["mouvements", "Mouvements"], ["inventaire", "Inventaire"]]} value={seg} onChange={setSeg} /></div>

      {seg === "produits" && (<>
        <input placeholder="Rechercher un produit, un code-barres…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginTop: 12 }} />
        <div style={{ marginTop: 10 }}><Chips options={cats} value={cat} onChange={setCat} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {products.length === 0 && (
            <Card style={{ textAlign: "center" }}>
              <Package size={30} color={C.muted} style={{ margin: "4px auto 8px", display: "block" }} />
              <div style={{ fontWeight: 700 }}>Aucun produit pour l'instant</div>
              <div style={{ color: C.muted, fontSize: 12.5, margin: "4px 0 12px" }}>Ajoute ton premier produit (matériel, formation, service…) pour pouvoir le vendre.</div>
              <button onClick={openNew} style={{ ...btnGold, margin: "0 auto" }}><Plus size={16} /> Ajouter un produit</button>
            </Card>
          )}
          {list.map(p => {
            const s = stockState(p);
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", background: C.card, borderRadius: 16 }}>
                <ProductThumb p={p} />
                <button onClick={() => openEdit(p)} style={{ flex: 1, minWidth: 0, background: "none", border: "none", color: C.text, textAlign: "left", cursor: "pointer", padding: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b style={{ fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nom}</b><Pill kind={s.kind}>{s.label}</Pill></div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                    {hasStock(p) ? `${numFr(p.stock)} ${String(p.unite || "pièce").toLowerCase()}${Number(p.stock) > 1 ? "s" : ""} · seuil ${p.seuil || 0} · ` : ""}vente {numFr(p.prixVente)}{p.prixAchat ? ` · achat ${numFr(p.prixAchat)}` : ""}
                  </div>
                  {hasStock(p) && <div style={{ height: 5, borderRadius: 5, background: "rgba(169,180,208,.18)", marginTop: 6 }}><i style={{ display: "block", height: "100%", borderRadius: 5, width: `${s.pct}%`, background: s.kind === "ko" ? C.rustLight : s.kind === "or" ? C.goldLight : C.greenLight }} /></div>}
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <EditDeleteButtons onEdit={() => openEdit(p)} onDelete={() => deleteProduct(p)} />
                  <button onClick={() => setSeg("liens")} aria-label="Lien à partager" title="Lien à partager" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}><Link2 size={15} /></button>
                  {hasStock(p) && <button onClick={() => openMove("entree", p.id)} aria-label="Entrée ou sortie" title="Entrée / sortie" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}><Truck size={15} /></button>}
                </div>
              </div>
            );
          })}
        </div>
        {aRacheter.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 12, ...tint.ko, borderRadius: 16, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.45, alignItems: "center" }}>
            <AlertTriangle size={19} style={{ flexShrink: 0 }} />
            <span style={{ color: C.text }}><b>{aRacheter.length} produit{aRacheter.length > 1 ? "s" : ""} sous le seuil :</b> <span style={{ color: C.muted }}>{aRacheter.map(p => `${p.nom} (${numFr(p.stock)})`).join(", ")}.</span></span>
          </div>
        )}
      </>)}

      {seg === "liens" && <ProductLinks catalog={saleCatalog(products, pricing)} />}

      {seg === "mouvements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {stockMoves.length === 0 && <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Aucun mouvement pour l'instant.</div>}
          {stockMoves.slice().reverse().slice(0, 150).map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", background: C.card, borderRadius: 16 }}>
              <IconTile kind={m.type === "vente" ? "or" : m.delta < 0 ? "ko" : m.type === "inventaire" ? "bl" : "ok"}>{m.type === "vente" ? <ShoppingBag size={18} /> : m.delta < 0 ? <ArrowUpFromLine size={18} /> : m.type === "inventaire" ? <ClipboardList size={18} /> : <ArrowDownToLine size={18} />}</IconTile>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b style={{ fontSize: 13.5 }}>{m.productName}</b><b style={{ color: m.delta < 0 ? C.rustLight : C.greenLight }}>{m.delta > 0 ? "+" : ""}{m.delta}</b></div>
                <div style={{ color: C.muted, fontSize: 12 }}>{m.motif || m.type}{m.ref ? ` · ${m.ref}` : ""}{m.by ? ` · ${m.by}` : ""} · {frDate(m.date)} {String(m.date).slice(11, 16)} · {m.before} → {m.after}</div>
              </div>
              <EditDeleteButtons onEdit={() => editMoveNote(m)} onDelete={() => deleteMove(m)} />
            </div>
          ))}
        </div>
      )}

      {seg === "inventaire" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: C.muted, fontSize: 12.5, marginBottom: 10 }}>Compte les produits en rayon et tape la quantité réelle. Seuls les produits remplis sont corrigés.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {physical.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.card, borderRadius: 16 }}>
                <ProductThumb p={p} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13.5 }}>{p.nom}</b><div style={{ color: C.muted, fontSize: 12 }}>Prévu : {numFr(p.stock)}</div></div>
                <input type="number" inputMode="numeric" placeholder="Compté" aria-label={`Quantité comptée pour ${p.nom}`} value={counts[p.id] ?? ""} onChange={e => setCounts({ ...counts, [p.id]: e.target.value })} style={{ ...inputStyle, width: 96, textAlign: "center" }} />
              </div>
            ))}
          </div>
          {physical.length > 0 && <button onClick={applyInventory} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 52, marginTop: 14 }}><ClipboardList size={17} /> Enregistrer l'inventaire</button>}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- VENDRE ---------------------------------- */
/* ---------------------------------- VENTES : annuler / modifier ---------------------------------- */
// Paiement cree par la vente (meme id + 1, ou meme numero de recu).
function salePayment(p, a) {
  const pays = paymentsOf(p);
  return pays.find(x => x.id === a.id + 1) || (a.recNumero ? pays.find(x => x.recNumero && x.recNumero === a.recNumero) : null) || null;
}
// Annule (next = null) ou modifie une vente deja faite, en gardant tout synchronise :
// total du client, paiement de la vente, stock (mouvement trace), historique du client.
function changeSale({ prospects, products, clientId, achatId, next, by }) {
  const p = prospects.find(x => String(x.id) === String(clientId));
  const a = p && (p.achats || []).find(x => x.id === achatId);
  if (!p || !a) return null;
  const today = new Date().toISOString().slice(0, 10);
  const oldPay = salePayment(p, a);
  const ref = a.recNumero || clientFullName(p);

  // Stock : difference entre les anciennes et les nouvelles quantites (positif = retour en stock).
  const qty = (items) => { const m = new Map(); (items || []).forEach(it => { if (it.productId != null) m.set(it.productId, (m.get(it.productId) || 0) + (Number(it.qte) || 0)); }); return m; };
  const before = qty(a.items), after = qty(next ? next.items : []);
  let cur = products; const moves = [];
  new Set([...before.keys(), ...after.keys()]).forEach(pid => {
    const diff = (before.get(pid) || 0) - (after.get(pid) || 0);
    const prod = cur.find(x => x.id === pid);
    if (!diff || !prod || !hasStock(prod)) return;
    const b = Number(prod.stock) || 0, af = b + diff;
    cur = cur.map(x => x.id === pid ? { ...x, stock: af } : x);
    moves.push({ id: Date.now() + Math.random(), date: new Date().toISOString(), productId: pid, productName: prod.nom, type: next ? "correction" : "annulation", delta: diff, before: b, after: af, motif: next ? "Vente modifiée" : "Vente annulée", by, ref });
  });

  const oldTotal = Number(a.total) || 0;
  let pays, achats, prixTotal, note;
  if (!next) {
    pays = paymentsOf(p).filter(x => x !== oldPay);
    achats = (p.achats || []).filter(x => x.id !== achatId);
    prixTotal = Math.max(0, prixTotalOf(p) - oldTotal);
    note = `Vente annulée (${money(oldTotal)}${a.recNumero ? `, reçu ${a.recNumero}` : ""})${by ? ` par ${by}` : ""}`;
  } else {
    const sousTotal = next.items.reduce((s, it) => s + (Number(it.prix) || 0) * (Number(it.qte) || 0), 0);
    const remise = Math.min(sousTotal, Math.max(0, Number(next.remise) || 0));
    const total = sousTotal - remise;
    const paye = Math.max(0, Number(next.paye) || 0);
    achats = (p.achats || []).map(x => x.id === achatId ? { ...x, items: next.items, sousTotal, remise, total, modifieLe: today } : x);
    prixTotal = Math.max(0, prixTotalOf(p) - oldTotal) + total;
    if (oldPay) {
      pays = paye > 0 ? paymentsOf(p).map(x => x === oldPay ? { ...x, montant: paye, mode: next.mode || x.mode } : x) : paymentsOf(p).filter(x => x !== oldPay);
    } else {
      const recNumero = nextNumero("REC", prospects.flatMap(paymentsOf).map(x => ({ numero: x.recNumero })), today);
      pays = paye > 0 ? [...paymentsOf(p), { id: a.id + 1, date: today, montant: paye, mode: next.mode || PAY_MODES[0], recNumero, note: "Vente modifiée" }] : paymentsOf(p);
      if (paye > 0) achats = achats.map(x => x.id === achatId ? { ...x, recNumero } : x);
    }
    note = `Vente modifiée : ${money(oldTotal)} → ${money(total)}${by ? ` par ${by}` : ""}`;
  }

  const hist = [...(p.historique || []), { id: Date.now(), date: today, note }];
  let nextProspects;
  if (!next && p.source === "vente" && achats.length === 0 && pays.length === 0) {
    nextProspects = prospects.filter(x => x.id !== p.id); // client cree par cette seule vente
  } else {
    let up = withPayments({ ...p, achats, prixTotal, historique: hist }, pays);
    const paid = Number(up.montant) || 0;
    if (up.statut === "Payé" && prixTotal > 0 && paid < prixTotal) up = { ...up, statut: paid > 0 ? "En discussion" : "Prospect" };
    nextProspects = prospects.map(x => x.id === p.id ? up : x);
  }
  const updated = nextProspects.find(x => x.id === p.id);
  const trop = updated ? (Number(updated.montant) || 0) - prixTotalOf(updated) : 0;
  return { prospects: nextProspects, products: cur, moves, trop: trop > 0 && prixTotalOf(updated) >= 0 ? trop : 0 };
}

function SalesHistory({ prospects, setProspects, products, setProducts, setStockMoves, team, currentUser, codes, agency, onBack }) {
  const [editing, setEditing] = useState(null); // { clientId, achatId, items, remise, paye, mode }
  const [msg, setMsg] = useState("");
  const by = (team.find(m => m.id === currentUser) || {}).name || "";
  const sales = prospects.flatMap(p => (p.achats || []).map(a => ({ p, a, pay: salePayment(p, a) })))
    .sort((x, y) => String(y.a.date).localeCompare(String(x.a.date)) || y.a.id - x.a.id);

  function askCode(action) {
    const c = window.prompt(`${action} une vente : code du CEO`);
    if (c == null) return false;
    if (!codeMatches(c, codes.ceo)) { window.alert("Code incorrect."); return false; }
    return true;
  }
  function apply(res, text) {
    if (!res) return;
    setProspects(res.prospects);
    if (res.moves.length) { setProducts(res.products); setStockMoves(prev => [...prev, ...res.moves]); }
    setMsg(text + (res.trop > 0 ? ` Attention : le client a payé ${money(res.trop)} de plus que le nouveau total, pense à le rembourser.` : ""));
  }
  function cancel(s) {
    if (!askCode("Annuler")) return;
    if (!window.confirm(`Annuler la vente de ${money(s.a.total)} à ${clientFullName(s.p)} ?\nLe montant est retiré du client, le paiement est supprimé et les produits reviennent en stock.`)) return;
    apply(changeSale({ prospects, products, clientId: s.p.id, achatId: s.a.id, next: null, by }), "Vente annulée ✓ Montants et stock mis à jour.");
  }
  function startEdit(s) {
    if (!askCode("Modifier")) return;
    setMsg("");
    setEditing({ clientId: s.p.id, achatId: s.a.id, items: (s.a.items || []).map(it => ({ ...it })), remise: s.a.remise || 0, paye: s.pay ? s.pay.montant : 0, mode: (s.pay && s.pay.mode) || PAY_MODES[0] });
  }
  function saveEdit() {
    const items = editing.items.filter(it => (Number(it.qte) || 0) > 0).map(it => ({ ...it, qte: Number(it.qte) || 0, prix: Number(it.prix) || 0 }));
    if (!items.length) { window.alert("La vente n'a plus d'article : utilise « Annuler la vente »."); return; }
    apply(changeSale({ prospects, products, clientId: editing.clientId, achatId: editing.achatId, next: { ...editing, items }, by }), "Vente modifiée ✓ Montants et stock mis à jour.");
    setEditing(null);
  }

  if (editing) {
    const sub = editing.items.reduce((s, it) => s + (Number(it.prix) || 0) * (Number(it.qte) || 0), 0);
    const tot = Math.max(0, sub - (Number(editing.remise) || 0));
    const reste = Math.max(0, tot - (Number(editing.paye) || 0));
    const setItem = (i, patch) => setEditing({ ...editing, items: editing.items.map((it, j) => j === i ? { ...it, ...patch } : it) });
    const lbl = { display: "block", fontSize: 12.5, color: C.muted, margin: "14px 0 6px 2px", fontWeight: 600 };
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setEditing(null)} aria-label="Retour" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><ChevronLeft size={20} /></button>
          <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 21, fontWeight: 800 }}>Modifier la vente</div>
        </div>
        <div style={{ background: C.card, borderRadius: 20, padding: "6px 14px" }}>
          {editing.items.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderTop: i ? `1px solid ${C.border}` : "none", fontSize: 13.5, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px", minWidth: 0, fontWeight: 600 }}>{it.label}</div>
              <button onClick={() => setItem(i, { qte: Math.max(0, (Number(it.qte) || 0) - 1) })} aria-label="Moins" style={{ width: 32, height: 32, borderRadius: 10, background: C.card2, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}>{Number(it.qte) <= 1 ? <Trash2 size={14} /> : <Minus size={15} />}</button>
              <b style={{ width: 24, textAlign: "center", color: Number(it.qte) ? C.text : C.rustLight }}>{it.qte}</b>
              <button onClick={() => setItem(i, { qte: (Number(it.qte) || 0) + 1 })} aria-label="Plus" style={{ width: 32, height: 32, borderRadius: 10, background: C.card2, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={15} /></button>
              <input type="number" inputMode="numeric" value={it.prix} onChange={e => setItem(i, { prix: e.target.value })} aria-label={`Prix de ${it.label}`} style={{ ...inputStyle, width: 100, padding: "8px 10px" }} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.border}`, gap: 8 }}>
            <span style={{ color: C.muted }}>Remise</span>
            <input type="number" inputMode="numeric" value={editing.remise} onChange={e => setEditing({ ...editing, remise: e.target.value })} aria-label="Remise" style={{ ...inputStyle, width: 120, padding: "8px 10px" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16 }}>Nouveau total</span>
            <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 21, color: C.goldLight }}>{money(tot)}</span>
          </div>
        </div>
        <span style={lbl}>Montant payé pour cette vente</span>
        <input type="number" inputMode="numeric" value={editing.paye} onChange={e => setEditing({ ...editing, paye: e.target.value })} aria-label="Montant payé" style={inputStyle} />
        <span style={lbl}>Moyen de paiement</span>
        <select value={editing.mode} onChange={e => setEditing({ ...editing, mode: e.target.value })} style={inputStyle}>{PAY_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select>
        {reste > 0 && <div style={{ marginTop: 10, ...tint.or, borderRadius: 14, padding: "10px 12px", fontSize: 13, color: C.text }}>Reste à payer sur cette vente : <b>{money(reste)}</b></div>}
        <button onClick={saveEdit} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 54, marginTop: 16 }}><Save size={17} /> Enregistrer les modifications</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button onClick={onBack} aria-label="Retour" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><ChevronLeft size={20} /></button>
        <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 21, fontWeight: 800 }}>Ventes faites</div>
      </div>
      <div style={{ color: C.muted, fontSize: 12.5, marginBottom: 10 }}>Annuler ou modifier une vente met à jour le client, les montants payés et le stock. Le code du CEO est demandé.</div>
      {msg && <div style={{ ...tint.ok, borderRadius: 14, padding: "10px 12px", fontSize: 13, color: C.text, marginBottom: 10 }}>{msg}</div>}
      {sales.length === 0 && <Card><div style={{ color: C.muted }}>Aucune vente ce mois-ci.</div></Card>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sales.map(({ p, a, pay }) => {
          const payé = pay ? Number(pay.montant) || 0 : 0;
          const reste = Math.max(0, (Number(a.total) || 0) - payé);
          return (
            <div key={`${p.id}-${a.id}`} style={{ background: C.card, borderRadius: 16, padding: "12px 13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <b>{clientFullName(p)}</b>
                  <div style={{ color: C.muted, fontSize: 12 }}>{frDate(a.date)}{a.recNumero ? ` · ${a.recNumero}` : ""}{a.vendeur ? ` · ${a.vendeur}` : ""}{a.modifieLe ? " · modifiée" : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b style={{ fontFamily: "Archivo, sans-serif", color: C.goldLight }}>{money(a.total)}</b>
                  <div style={{ fontSize: 11.5, color: reste > 0 ? C.rustLight : C.greenLight }}>{reste > 0 ? `reste ${numFr(reste)}` : "payé"}</div>
                </div>
              </div>
              <div style={{ color: C.muted, fontSize: 12.5, marginTop: 4 }}>{(a.items || []).map(it => `${it.qte} × ${it.label}`).join(", ")}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                {pay && <button onClick={() => buildRecuPDF(recuData(p, pay), agency, BRAND_LOGO)} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5, padding: "8px 11px" }}><FileText size={14} /> Reçu</button>}
                <button onClick={() => startEdit({ p, a, pay })} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5, padding: "8px 11px", color: C.goldLight, borderColor: C.gold }}><Pencil size={14} /> Modifier</button>
                <button onClick={() => cancel({ p, a, pay })} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 5, padding: "8px 11px", color: C.rustLight, borderColor: "rgba(255,143,130,.5)" }}><X size={14} /> Annuler la vente</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabVendre({ products, setProducts, stockMoves, setStockMoves, prospects, setProspects, team, currentUser, codes, agency, go, pricing }) {
  const [step, setStep] = useState("catalogue"); // catalogue | encaisser | recu
  const [cart, setCart] = useState([]);          // [{ key, productId, label, prix, qte }]
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tous");
  const [scan, setScan] = useState(false);
  const [free, setFree] = useState(null);         // article libre en cours { label, prix }
  const [clientMode, setClientMode] = useState("comptoir"); // comptoir | existant | nouveau
  const [clientId, setClientId] = useState("");
  const [newClient, setNewClient] = useState({ nom: "", whatsapp: "" });
  const [vendeur, setVendeur] = useState(currentUser || (team[0] && team[0].id) || "");
  const [mode, setMode] = useState(PAY_MODES[0]);
  const [recu, setRecu] = useState("");
  const [remise, setRemise] = useState(0);
  const [lastSale, setLastSale] = useState(null);
  const searchRef = useRef(null);

  const catalog = useMemo(() => saleCatalog(products, pricing), [products, pricing]);
  const cats = ["Tous", ...Array.from(new Set(catalog.map(p => p.categorie).filter(Boolean)))];
  const visible = catalog.filter(p => (cat === "Tous" || p.categorie === cat) &&
    (!search.trim() || `${p.nom} ${p.codeBarre || ""}`.toLowerCase().includes(search.trim().toLowerCase())));
  const qteOf = (pid) => (cart.find(c => c.productId === pid) || {}).qte || 0;
  const sousTotal = cart.reduce((s, c) => s + c.prix * c.qte, 0);
  const total = Math.max(0, sousTotal - (Number(remise) || 0));
  const nbArticles = cart.reduce((s, c) => s + c.qte, 0);
  const recuNum = recu === "" ? total : Number(recu) || 0;
  const paye = Math.min(recuNum, total);
  const rendu = Math.max(0, recuNum - total);
  const reste = Math.max(0, total - recuNum);

  function add(p) {
    if (hasStock(p) && qteOf(p.id) + 1 > (Number(p.stock) || 0)) {
      if (!window.confirm(`Stock insuffisant pour « ${p.nom} » (${Number(p.stock) || 0} en stock). Ajouter quand même ?`)) return;
    }
    setCart(prev => prev.some(c => c.productId === p.id)
      ? prev.map(c => c.productId === p.id ? { ...c, qte: c.qte + 1 } : c)
      : [...prev, { key: `p-${p.id}`, productId: p.id, label: p.nom, prix: Number(p.prixVente) || 0, qte: 1 }]);
  }
  function setQte(key, q) {
    setCart(prev => q <= 0 ? prev.filter(c => c.key !== key) : prev.map(c => c.key === key ? { ...c, qte: q } : c));
  }
  function onSearchKey(e) {
    if (e.key !== "Enter") return;
    const code = search.trim();
    const p = products.find(x => x.codeBarre && x.codeBarre === code);
    if (p) { add(p); setSearch(""); }
  }
  function onScanned(code) {
    setScan(false);
    const p = products.find(x => x.codeBarre && x.codeBarre === code);
    if (p) add(p); else { setSearch(code); window.alert(`Aucun produit avec le code ${code}.`); }
  }
  function addFree() {
    if (!free || !free.label.trim() || !(Number(free.prix) > 0)) return;
    setCart(prev => [...prev, { key: `f-${Date.now()}`, productId: null, label: free.label.trim(), prix: Number(free.prix), qte: 1 }]);
    setFree(null);
  }
  function askRemise() {
    const c = window.prompt("Remise : code du CEO (le vendeur ne peut pas baisser un prix seul)");
    if (c == null) return;
    if (!codeMatches(c, codes.ceo)) { window.alert("Code incorrect — remise refusée."); return; }
    const v = window.prompt(`Montant de la remise en FCFA (sous-total : ${numFr(sousTotal)})`, String(remise || ""));
    if (v == null) return;
    setRemise(Math.max(0, Math.min(sousTotal, Number(v) || 0)));
  }
  function resetSale() {
    setCart([]); setRemise(0); setRecu(""); setClientMode("comptoir"); setClientId(""); setNewClient({ nom: "", whatsapp: "" }); setMode(PAY_MODES[0]); setStep("catalogue");
  }

  function validate() {
    if (!cart.length) return;
    if (reste > 0 && clientMode === "comptoir") { window.alert("Le client ne paie pas tout : choisis ou crée le client pour garder le reste dans ses crédits."); return; }
    if (clientMode === "nouveau" && !newClient.nom.trim()) { window.alert("Indique le nom du nouveau client."); return; }
    if (clientMode === "existant" && !clientId) { window.alert("Choisis le client."); return; }
    const today = new Date().toISOString().slice(0, 10);
    const saleId = Date.now();
    const items = cart.map(c => ({ productId: c.productId, label: c.label, qte: c.qte, prix: c.prix }));
    const summary = items.map(it => `${it.qte > 1 ? it.qte + " × " : ""}${it.label}`).join(", ");
    const vendeurName = (team.find(m => m.id === vendeur) || {}).name || "";
    const allPays = prospects.flatMap(paymentsOf).map(x => ({ numero: x.recNumero }));
    const recNumero = nextNumero("REC", allPays, today);
    const pay = paye > 0 ? { id: saleId + 1, date: today, montant: paye, mode, recNumero, note: summary.slice(0, 80) } : null;
    const achat = { id: saleId, date: today, items, sousTotal, remise: Number(remise) || 0, total, vendeur: vendeurName, recNumero: pay ? recNumero : "" };

    let client;
    if (clientMode === "existant") {
      const p = prospects.find(x => String(x.id) === String(clientId));
      const base = prixTotalOf(p) || Number(p.montant) || 0;
      const updated = { ...p, prixTotal: base + total, achats: [...(p.achats || []), achat], pack: p.pack || summary };
      client = withPayments(updated, [...paymentsOf(p), ...(pay ? [pay] : [])]);
      setProspects(prospects.map(x => x.id === p.id ? client : x));
    } else {
      const nom = clientMode === "nouveau" ? newClient.nom.trim() : "Client comptoir";
      const fresh = {
        id: saleId, nom, prenom: "", whatsapp: clientMode === "nouveau" ? newClient.whatsapp.trim() : "", email: "", adresse: "", quartier: "",
        dateInscription: today, pack: summary, statut: reste > 0 ? "En discussion" : "Payé", owner: vendeur, prixTotal: total,
        achats: [achat], historique: [{ id: saleId + 2, date: today, note: `Vente en caisse : ${summary}` }], source: "vente",
      };
      client = withPayments(fresh, pay ? [pay] : []);
      setProspects([...prospects, client]);
    }

    // Sortie de stock pour chaque produit suivi.
    let cur = products;
    const moves = [];
    items.forEach(it => {
      const p = cur.find(x => x.id === it.productId);
      if (!p || !hasStock(p)) return;
      const before = Number(p.stock) || 0, after = before - it.qte;
      cur = cur.map(x => x.id === p.id ? { ...x, stock: after } : x);
      moves.push({ id: saleId + Math.random(), date: new Date().toISOString(), productId: p.id, productName: p.nom, type: "vente", delta: -it.qte, before, after, motif: "Vente", by: vendeurName, ref: pay ? recNumero : clientFullName(client) });
    });
    if (moves.length) { setProducts(cur); setStockMoves(prev => [...prev, ...moves]); }

    notifyTeam("Nouvelle vente 🛒", `${clientFullName(client)} — ${money(total)}${reste > 0 ? ` (reste ${money(reste)})` : ""}`, "vendre");
    setLastSale({
      client, items, sousTotal, remise: Number(remise) || 0, total, paye, rendu, reste, mode, vendeur: vendeurName, date: new Date(),
      recu: {
        numero: pay ? recNumero : fallbackNumero("REC", today, saleId), date: today, clientNom: clientFullName(client), whatsapp: client.whatsapp, email: client.email,
        adresse: "", service: summary, montant: paye, mode, note: "", prixTotal: total, totalPaye: paye, reste,
      },
    });
    setStep("recu");
  }

  /* ---- Ventes faites (annuler / modifier) ---- */
  if (step === "ventes") {
    return <SalesHistory prospects={prospects} setProspects={setProspects} products={products} setProducts={setProducts} setStockMoves={setStockMoves} team={team} currentUser={currentUser} codes={codes} agency={agency} onBack={() => setStep("catalogue")} />;
  }

  /* ---- Recu ---- */
  if (step === "recu" && lastSale) {
    const r = lastSale.recu;
    const tr = { display: "flex", justifyContent: "space-between", gap: 8, margin: "4px 14px" };
    return (
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, color: C.greenLight, fontWeight: 700 }}><CheckCircle size={19} /> Vente enregistrée</div>
        <div className="kbs-print" style={{ background: "#FFFFFF", color: "#011B45", borderRadius: "16px 16px 0 0", marginTop: 14, overflow: "hidden", fontSize: 12.5, paddingBottom: 14 }}>
          <div style={{ background: "#011B45", color: "#F4F6FB", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <img src={agency.logo || BRAND_LOGO} alt="" style={{ width: 34, height: 34, borderRadius: "50%" }} />
            <div style={{ flex: 1 }}><div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 14 }}>{agency.name || "KBS DIGITAL AGENCY"}</div><div style={{ fontSize: 10.5, opacity: .8 }}>{agency.phone1}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, color: "#F39200", fontSize: 15 }}>REÇU</div><div style={{ fontSize: 10, opacity: .8 }}>{r.numero}</div></div>
          </div>
          <div style={{ height: 3, background: "#F39200" }} />
          <div style={{ ...tr, marginTop: 12 }}><span style={{ color: "#5A6B85" }}>Date</span><b>{lastSale.date.toLocaleDateString("fr-FR")} · {lastSale.date.toTimeString().slice(0, 5)}</b></div>
          <div style={tr}><span style={{ color: "#5A6B85" }}>Client</span><b>{r.clientNom}</b></div>
          {lastSale.vendeur && <div style={tr}><span style={{ color: "#5A6B85" }}>Vendeur</span><b>{lastSale.vendeur}</b></div>}
          <div style={{ borderTop: "1px dashed #B8C2D6", margin: "9px 14px" }} />
          {lastSale.items.map((it, i) => <div key={i} style={tr}><span>{it.qte} × {it.label}</span><b>{numFr(it.qte * it.prix)}</b></div>)}
          {lastSale.remise > 0 && <div style={tr}><span>Remise</span><b>− {numFr(lastSale.remise)}</b></div>}
          <div style={{ borderTop: "1px dashed #B8C2D6", margin: "9px 14px" }} />
          <div style={{ ...tr, fontSize: 14.5 }}><b style={{ fontFamily: "Archivo, sans-serif" }}>TOTAL</b><b style={{ fontFamily: "Archivo, sans-serif" }}>{money(lastSale.total)}</b></div>
          <div style={tr}><span style={{ color: "#5A6B85" }}>Payé · {lastSale.mode}</span><b style={{ color: "#1E8A5F" }}>{numFr(lastSale.paye)}</b></div>
          {lastSale.rendu > 0 && <div style={tr}><span style={{ color: "#5A6B85" }}>Monnaie rendue</span><b>{numFr(lastSale.rendu)}</b></div>}
          {lastSale.reste > 0 && <div style={{ ...tr, background: "#FFF2DC", margin: "6px 0", padding: "7px 14px" }}><b>Reste à payer</b><b style={{ color: "#C2410C" }}>{money(lastSale.reste)}</b></div>}
          <div style={{ margin: "8px 14px 0", fontSize: 10.5, color: "#5A6B85", fontStyle: "italic" }}>Arrêté à la somme de {amountInWords(lastSale.total).replace(/^./, c => c.toLowerCase())}.</div>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, fontWeight: 700 }}>Merci pour votre confiance</div>
        </div>
        <div aria-hidden="true" style={{ height: 10, background: "radial-gradient(circle at 7px 0, transparent 6px, #FFFFFF 6.5px) repeat-x", backgroundSize: "14px 10px", transform: "rotate(180deg)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
          {r.whatsapp ? (
            <a href={waLink(r.whatsapp, receiptText(r, agency))} target="_blank" rel="noopener noreferrer" className="kbs-tap" style={{ ...btnGold, background: "#25D366", color: "#05301A", textDecoration: "none", height: 52, boxSizing: "border-box" }}><Send size={17} /> Envoyer sur WhatsApp</a>
          ) : null}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => buildRecuPDF(r, agency, BRAND_LOGO)} style={{ ...btnGold, flex: 1, background: C.card, color: C.text }}><FileText size={16} /> PDF</button>
            <button onClick={() => window.print()} style={{ ...btnGold, flex: 1, background: C.card, color: C.text }}><Printer size={16} /> Imprimer</button>
          </div>
          <button onClick={resetSale} className="kbs-tap" style={{ ...btnGold, height: 52 }}>Nouvelle vente</button>
          <button onClick={() => { resetSale(); go("crm"); }} style={{ ...iconBtn, padding: 10 }}>Voir la fiche du client</button>
          <button onClick={() => { resetSale(); setStep("ventes"); }} style={{ ...iconBtn, padding: 10 }}>Annuler ou modifier cette vente</button>
        </div>
      </div>
    );
  }

  /* ---- Encaisser ---- */
  if (step === "encaisser") {
    const lbl = { display: "block", fontSize: 12.5, color: C.muted, margin: "16px 0 8px 2px", fontWeight: 600 };
    const payColors = { "Orange Money": ["#FF7900", "#111", "OM"], "Wave": ["#1DC8FF", "#04253A", "W"], "Espèces": ["#3E6B52", "#fff", "CFA"], "Moov Money": ["#0066B3", "#fff", "MM"] };
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setStep("catalogue")} aria-label="Retour" style={{ width: 40, height: 40, borderRadius: 13, background: C.card, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><ChevronLeft size={20} /></button>
          <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 21, fontWeight: 800 }}>Encaisser</div>
        </div>
        <div style={{ background: C.card, borderRadius: 20, padding: "6px 14px" }}>
          {cart.map((c, i) => (
            <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderTop: i ? `1px solid ${C.border}` : "none", fontSize: 13.5 }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{c.label}</div><div style={{ color: C.muted, fontSize: 12 }}>{numFr(c.prix)} FCFA</div></div>
              <button onClick={() => setQte(c.key, c.qte - 1)} aria-label="Moins" style={{ width: 32, height: 32, borderRadius: 10, background: C.card2, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}>{c.qte === 1 ? <Trash2 size={14} /> : <Minus size={15} />}</button>
              <b style={{ width: 24, textAlign: "center" }}>{c.qte}</b>
              <button onClick={() => { const p = products.find(x => x.id === c.productId); if (p) add(p); else setQte(c.key, c.qte + 1); }} aria-label="Plus" style={{ width: 32, height: 32, borderRadius: 10, background: C.card2, border: "none", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={15} /></button>
              <b style={{ width: 70, textAlign: "right" }}>{numFr(c.prix * c.qte)}</b>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${C.border}`, fontSize: 13.5 }}>
            <span style={{ color: C.muted }}>Remise</span>
            <button onClick={askRemise} style={{ background: "none", border: "none", color: C.goldLight, fontWeight: 700, cursor: "pointer" }}>{remise > 0 ? `− ${numFr(remise)} (modifier)` : "Demander au CEO"}</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16 }}>Total</span>
            <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 21, color: C.goldLight }}>{money(total)}</span>
          </div>
        </div>

        <span style={lbl}>Client</span>
        <Seg options={[["comptoir", "Comptoir"], ["existant", "Client existant"], ["nouveau", "Nouveau"]]} value={clientMode} onChange={setClientMode} />
        {clientMode === "existant" && (
          <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ ...inputStyle, marginTop: 8 }}>
            <option value="">— Choisir le client —</option>
            {prospects.slice().sort((a, b) => clientFullName(a).localeCompare(clientFullName(b))).map(p => <option key={p.id} value={p.id}>{clientFullName(p)}{p.whatsapp ? ` · ${p.whatsapp}` : ""}{resteAPayer(p) > 0 ? ` · doit ${numFr(resteAPayer(p))}` : ""}</option>)}
          </select>
        )}
        {clientMode === "nouveau" && (
          <div className="kbs-grid2" style={{ marginTop: 8 }}>
            <input placeholder="Nom et prénom *" value={newClient.nom} onChange={e => setNewClient({ ...newClient, nom: e.target.value })} style={inputStyle} />
            <input placeholder="WhatsApp" inputMode="tel" value={newClient.whatsapp} onChange={e => setNewClient({ ...newClient, whatsapp: e.target.value })} style={inputStyle} />
          </div>
        )}

        <span style={lbl}>Vendeur</span>
        <select value={vendeur} onChange={e => setVendeur(e.target.value)} style={inputStyle}>{team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>

        <span style={lbl}>Moyen de paiement</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {PAY_MODES.slice(0, 4).map(m => {
            const [bg, fg, ab] = payColors[m] || ["#555", "#fff", "?"];
            return (
              <button key={m} onClick={() => setMode(m)} style={{ display: "flex", alignItems: "center", gap: 9, padding: 11, borderRadius: 14, background: mode === m ? "rgba(243,146,0,.10)" : C.card, border: `1.5px solid ${mode === m ? C.gold : "transparent"}`, color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 10, background: bg, color: fg, flexShrink: 0 }}>{ab}</span>{m}
              </button>
            );
          })}
        </div>
        <select value={PAY_MODES.slice(0, 4).includes(mode) ? "" : mode} onChange={e => e.target.value && setMode(e.target.value)} style={{ ...inputStyle, marginTop: 8 }}>
          <option value="">Autre moyen…</option>
          {PAY_MODES.slice(4).map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <span style={lbl}>Montant reçu maintenant</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 56, borderRadius: 15, border: `1.5px solid ${C.gold}`, boxShadow: "0 0 0 3px rgba(243,146,0,.16)", background: C.surf, padding: "0 16px" }}>
          <input type="number" inputMode="numeric" value={recu === "" ? total : recu} onChange={e => setRecu(e.target.value)} aria-label="Montant reçu" style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontFamily: "Archivo, sans-serif", fontSize: 22, fontWeight: 800, minWidth: 0 }} />
          <span style={{ color: C.muted }}>FCFA</span>
        </div>
        {reste > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 12, ...tint.or, borderRadius: 16, padding: "12px 14px", fontSize: 13, lineHeight: 1.45 }}>
            <Clock size={19} style={{ flexShrink: 0 }} />
            <span style={{ color: C.text }}><b>Avance : reste {money(reste)}</b><br /><span style={{ color: C.muted }}>Ajouté automatiquement aux crédits du client.</span></span>
          </div>
        )}
        {rendu > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 12, ...tint.ok, borderRadius: 16, padding: "12px 14px", fontSize: 13 }}>
            <Banknote size={19} style={{ flexShrink: 0 }} />
            <span style={{ color: C.text }}>Monnaie à rendre : <b>{money(rendu)}</b></span>
          </div>
        )}
        <button onClick={validate} className="kbs-tap" style={{ ...btnGold, width: "100%", height: 56, marginTop: 18, fontSize: 16 }}><CheckCircle size={18} /> Valider la vente</button>
      </div>
    );
  }

  /* ---- Catalogue ---- */
  const nbVentes = prospects.reduce((s, p) => s + (p.achats || []).length, 0);
  return (
    <div>
      {scan && <BarcodeScanner onCode={onScanned} onClose={() => setScan(false)} />}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button onClick={() => setStep("ventes")} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, padding: "9px 13px", fontWeight: 700 }}><History size={15} /> Ventes faites ({nbVentes}) · annuler / modifier</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 50, borderRadius: 15, border: `1px solid ${C.border}`, background: C.surf, padding: "0 5px 0 14px", color: C.muted }}>
        <Search size={19} />
        <input ref={searchRef} placeholder="Nom du produit ou code-barres" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={onSearchKey} style={{ flex: 1, background: "transparent", border: "none", color: C.text, fontSize: 14.5, minWidth: 0, outline: "none" }} />
        <button onClick={() => setScan(true)} aria-label="Scanner un code-barres" style={{ width: 40, height: 40, borderRadius: 11, background: C.gold, color: "#011B45", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}><ScanLine size={20} /></button>
      </div>
      {cats.length > 1 && <div style={{ marginTop: 12 }}><Chips options={cats} value={cat} onChange={setCat} /></div>}

      {catalog.length === 0 ? (
        <Card style={{ textAlign: "center", marginTop: 14 }}>
          <ShoppingBag size={30} color={C.muted} style={{ margin: "4px auto 8px", display: "block" }} />
          <div style={{ fontWeight: 700 }}>Ton catalogue est vide</div>
          <div style={{ color: C.muted, fontSize: 12.5, margin: "4px 0 12px" }}>Ajoute tes produits et services dans « Stock », ou vends un article libre ci-dessous.</div>
          <button onClick={() => go("stock")} style={{ ...btnGold, margin: "0 auto" }}><Plus size={16} /> Ajouter des produits</button>
        </Card>
      ) : null}

      <div className="kbs-prod" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 14 }}>
        {visible.map(p => {
          const q = qteOf(p.id);
          const s = stockState(p);
          return (
            <button key={p.id} onClick={() => add(p)} className="kbs-tap" style={{ background: C.card, borderRadius: 18, padding: 10, position: "relative", border: "none", color: C.text, textAlign: "left", cursor: "pointer", boxShadow: q ? `inset 0 0 0 2px ${C.gold}` : "none" }}>
              {q > 0 && <span style={{ position: "absolute", top: 8, right: 8, minWidth: 24, height: 24, borderRadius: 12, background: C.gold, color: "#011B45", fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 12, lineHeight: "24px", textAlign: "center", padding: "0 7px", zIndex: 1 }}>{q}</span>}
              {p.photo
                ? <img src={p.photo} alt="" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 13, marginBottom: 9, display: "block" }} />
                : <div style={{ ...tint[productKind(p)], height: 80, borderRadius: 13, display: "grid", placeItems: "center", marginBottom: 9 }}>{productIcon(p, 34)}</div>}
              <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.25, height: 31, overflow: "hidden" }}>{p.nom}</div>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: 14.5, marginTop: 4 }}>{numFr(p.prixVente)} <span style={{ fontFamily: "Figtree, sans-serif", fontWeight: 500, fontSize: 11, color: C.muted }}>FCFA</span></div>
              <div style={{ fontSize: 11.5, marginTop: 2, color: s.kind === "ko" ? C.rustLight : C.muted }}>{hasStock(p) ? `${numFr(p.stock)} en stock` : p.fromTarifs ? `${p.categorie} · Tarifs` : "Service · sans stock"}</div>
              <span aria-hidden="true" style={{ position: "absolute", right: 10, bottom: 10, width: 30, height: 30, borderRadius: 10, background: C.card2, display: "grid", placeItems: "center" }}><Plus size={16} /></span>
            </button>
          );
        })}
        <button onClick={() => setFree({ label: "", prix: "" })} style={{ background: "transparent", borderRadius: 18, padding: 10, border: `1.5px dashed ${C.muted}`, color: C.muted, cursor: "pointer", minHeight: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, fontSize: 12.5 }}>
          <Plus size={24} /> Article libre
        </button>
      </div>
      {free && (
        <Card style={{ marginTop: 12 }}>
          <Eyebrow>Article libre (hors catalogue)</Eyebrow>
          <div className="kbs-grid2">
            <input placeholder="Désignation" value={free.label} onChange={e => setFree({ ...free, label: e.target.value })} style={inputStyle} />
            <input type="number" inputMode="numeric" placeholder="Prix (FCFA)" value={free.prix} onChange={e => setFree({ ...free, prix: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={addFree} style={{ ...btnGold, flex: 1 }}><Plus size={15} /> Ajouter au panier</button>
            <button onClick={() => setFree(null)} style={{ ...iconBtn, padding: "0 14px" }}>Annuler</button>
          </div>
        </Card>
      )}

      {cart.length > 0 && (
        <button onClick={() => { setRecu(""); setStep("encaisser"); }} className="kbs-tap" style={{ position: "fixed", left: 12, right: 12, bottom: "calc(92px + env(safe-area-inset-bottom))", zIndex: 25, maxWidth: 560, margin: "0 auto", background: C.gold, color: "#011B45", borderRadius: 18, padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, fontWeight: 700, boxShadow: "0 12px 30px rgba(243,146,0,.35)", border: "none", cursor: "pointer" }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, background: "#011B45", color: "#FDB402", display: "grid", placeItems: "center", fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 15 }}>{nbArticles}</span>
          <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", fontSize: 12, opacity: .8 }}>{nbArticles} article{nbArticles > 1 ? "s" : ""}</span><span style={{ fontFamily: "Archivo, sans-serif", fontSize: 17, fontWeight: 800 }}>{money(sousTotal)}</span></span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Archivo, sans-serif" }}>Encaisser <ChevronRight size={18} /></span>
        </button>
      )}
      {cart.length > 0 && <div style={{ height: 80 }} />}
    </div>
  );
}

/* ---------------------------------- SHARED STYLES ---------------------------------- */
const inputStyle = { background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 13, color: C.text, padding: "12px 13px", fontSize: 14, width: "100%", boxSizing: "border-box" };
const btnGold = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.gold, color: "#011B45", border: "none", borderRadius: 15, padding: "13px", fontWeight: 800, fontSize: 14, fontFamily: "Archivo, sans-serif", cursor: "pointer" };
const iconBtn = { background: "none", border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, padding: "5px 8px", fontSize: 12, cursor: "pointer" };


/* ---------------------------------- BOUTIQUE PUBLIQUE ---------------------------------- */
// Pages ouvertes par les clients (sans code) : /boutique et /p/<id>. Lecture seule :
// rien n'est jamais ecrit dans la base depuis ces pages.
function isPublicPath() { return /^\/(p\/|boutique\/?$)/.test(window.location.pathname); }

function PublicShop() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [cat, setCat] = useState("Tous");
  const path = window.location.pathname;
  const productId = path.startsWith("/p/") ? decodeURIComponent(path.slice(3).replace(/\/$/, "")) : null;

  useEffect(() => {
    (async () => {
      const fails = [];
      const products = await loadShared("kbs:products", [], fails);
      const pricing = await loadShared("kbs:pricing", DEFAULT_PRICING, fails);
      const agency = await loadShared("kbs:agency", DEFAULT_AGENCY, fails);
      if (fails.length) { setFailed(true); return; }
      setData({ catalog: saleCatalog(products || [], { ...DEFAULT_PRICING, ...pricing }).filter(p => Number(p.prixVente) > 0), agency: { ...DEFAULT_AGENCY, ...agency } });
    })();
  }, []);

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Figtree, sans-serif", fontSize: 14 }}>
      <style>{FONT_IMPORT}</style>
      {children}
    </div>
  );
  if (failed) return shell(<div style={{ padding: 40, textAlign: "center", color: C.muted }}>Connexion impossible. Vérifie ta connexion puis recharge la page.</div>);
  if (!data) return shell(<div style={{ padding: 40, textAlign: "center", color: C.muted }}>Chargement…</div>);

  const { catalog, agency } = data;
  const phone = agency.whatsapp || agency.phone1 || "";
  const logo = agency.logo || BRAND_LOGO;
  const order = (p) => waLink(phone, `Bonjour ${agency.name || ""}, je suis intéressé(e) par : ${p.nom} (${fcfa(p.prixVente)}).\n${productLink(p)}`);
  const header = (
    <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${C.border}`, background: C.surf }}>
      <img src={logo} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 17 }}>{agency.name || "KBS Digital Agency"}</div>
        <div style={{ color: C.muted, fontSize: 12 }}>{[agency.phone1, agency.address].filter(Boolean).join(" · ")}</div>
      </div>
    </header>
  );
  const orderBtn = (p, big) => (
    <a href={order(p)} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: big ? 54 : 40, borderRadius: big ? 16 : 12, background: "#25D366", color: "#05301A", fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: big ? 16 : 13, textDecoration: "none" }}>
      <Send size={big ? 18 : 15} /> Commander sur WhatsApp
    </a>
  );

  if (productId) {
    const p = catalog.find(x => String(x.id) === productId);
    return shell(<>
      {header}
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "18px 18px 40px" }}>
        {!p ? (
          <div style={{ textAlign: "center", color: C.muted, padding: 30 }}>Ce produit n'est plus disponible.</div>
        ) : (<>
          {p.photo
            ? <img src={p.photo} alt={p.nom} style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 22, display: "block" }} />
            : <div style={{ ...tint[productKind(p)], height: 200, borderRadius: 22, display: "grid", placeItems: "center" }}>{productIcon(p, 72)}</div>}
          <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Pill kind={productKind(p)}>{p.categorie || "Produit"}</Pill>
            {hasStock(p) && <Pill kind={Number(p.stock) > 0 ? "ok" : "ko"}>{Number(p.stock) > 0 ? "Disponible" : "Bientôt de retour"}</Pill>}
          </div>
          <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: 26, fontWeight: 800, margin: "10px 0 4px", lineHeight: 1.15 }}>{p.nom}</h1>
          <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 28, fontWeight: 800, color: C.goldLight }}>{numFr(p.prixVente)} <span style={{ fontSize: 15, color: C.muted, fontWeight: 600 }}>FCFA</span></div>
          {p.description && <p style={{ color: C.muted, lineHeight: 1.6, whiteSpace: "pre-line", marginTop: 12 }}>{p.description}</p>}
          <div style={{ marginTop: 18 }}>{orderBtn(p, true)}</div>
        </>)}
        <a href="/boutique" style={{ display: "block", textAlign: "center", marginTop: 18, color: C.goldLight, fontWeight: 700, textDecoration: "none" }}>Voir tous nos produits et services</a>
      </main>
    </>);
  }

  const cats = ["Tous", ...Array.from(new Set(catalog.map(p => p.categorie).filter(Boolean)))];
  const shown = catalog.filter(p => cat === "Tous" || p.categorie === cat);
  return shell(<>
    {header}
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "18px 16px 40px" }}>
      <h1 style={{ fontFamily: "Archivo, sans-serif", fontSize: 24, fontWeight: 800, margin: "0 0 12px" }}>Nos produits et services</h1>
      {cats.length > 2 && <div style={{ marginBottom: 14 }}><Chips options={cats} value={cat} onChange={setCat} /></div>}
      {shown.length === 0 && <div style={{ color: C.muted }}>Aucun produit pour l'instant.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
        {shown.map(p => (
          <div key={p.id} style={{ background: C.card, borderRadius: 18, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <a href={`/p/${encodeURIComponent(p.id)}`} style={{ color: C.text, textDecoration: "none" }}>
              {p.photo
                ? <img src={p.photo} alt="" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 13, display: "block" }} />
                : <div style={{ ...tint[productKind(p)], height: 130, borderRadius: 13, display: "grid", placeItems: "center" }}>{productIcon(p, 40)}</div>}
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8, lineHeight: 1.3 }}>{p.nom}</div>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, color: C.goldLight, marginTop: 3 }}>{fcfa(p.prixVente)}</div>
            </a>
            <div style={{ marginTop: "auto" }}>{orderBtn(p, false)}</div>
          </div>
        ))}
      </div>
    </main>
  </>);
}

export default function Root() {
  return isPublicPath() ? <PublicShop /> : <App />;
}
