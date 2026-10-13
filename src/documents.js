/* ============================================================================
   DOCUMENTS COMMERCIAUX — Reçu, Devis, Facture (PDF A4)
   Un seul gabarit, aux couleurs et au logo de l'agence (Administration → Agence).
   ========================================================================== */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const DEFAULT_BRAND_COLOR = "#011B45";

/* ---------- Couleurs ---------- */
export function hexToRgb(hex) {
  const h = (hex || DEFAULT_BRAND_COLOR).replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(rgb, withRgb, t) { return rgb.map((v, i) => Math.round(v * (1 - t) + withRgb[i] * t)); }
function brandPalette(agency) {
  const primary = hexToRgb(agency?.brandColor || DEFAULT_BRAND_COLOR);
  const secondary = hexToRgb(agency?.brandColor2 || "#F39200");
  return {
    primary,
    secondary,
    tint: mix(primary, [255, 255, 255], 0.9),     // fond tres clair
    tint2: mix(primary, [255, 255, 255], 0.96),   // lignes alternees
    text: [33, 30, 28],
    muted: [112, 106, 100],
    line: [222, 216, 208],
    green: [38, 140, 100],
    red: [192, 57, 43],
  };
}

/* ---------- Montants ---------- */
// toLocaleString("fr-FR") produit des espaces fines insecables que la police PDF
// ne sait pas afficher : on force un espace normal.
export function money(n) {
  const v = Math.round(Number(n) || 0);
  return `${v < 0 ? "-" : ""}${String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

const UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
function below100(n) {
  if (n < 20) return UNITS[n];
  if (n < 70) {
    const t = Math.floor(n / 10), u = n % 10;
    return TENS[t] + (u === 0 ? "" : u === 1 ? " et un" : "-" + UNITS[u]);
  }
  if (n < 80) return n === 71 ? "soixante et onze" : "soixante-" + UNITS[n - 60];
  if (n === 80) return "quatre-vingts";
  return "quatre-vingt-" + UNITS[n - 80];
}
function below1000(n) {
  const c = Math.floor(n / 100), r = n % 100;
  let s = "";
  if (c > 0) s = (c === 1 ? "cent" : UNITS[c] + " cent" + (r === 0 ? "s" : ""));
  if (r > 0) s += (s ? " " : "") + below100(r);
  return s || "zéro";
}
// 25000 -> "vingt-cinq mille"
export function numberToFrench(num) {
  let n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "zéro";
  const parts = [];
  const billions = Math.floor(n / 1e9); n %= 1e9;
  const millions = Math.floor(n / 1e6); n %= 1e6;
  const thousands = Math.floor(n / 1000); n %= 1000;
  if (billions) parts.push(below1000(billions) + (billions > 1 ? " milliards" : " milliard"));
  if (millions) parts.push(below1000(millions) + (millions > 1 ? " millions" : " million"));
  if (thousands) parts.push(thousands === 1 ? "mille" : below1000(thousands).replace(/cents$/, "cent").replace(/vingts$/, "vingt") + " mille");
  if (n) parts.push(below1000(n));
  return parts.join(" ");
}
export function amountInWords(n) {
  const w = numberToFrench(n);
  return `${w.charAt(0).toUpperCase()}${w.slice(1)} francs CFA`;
}

/* ---------- Numerotation ---------- */
// Prochain numero sequentiel : DEV-2026-0001, FAC-2026-0002...
export function nextNumero(prefix, list, dateStr) {
  const year = (dateStr || new Date().toISOString()).slice(0, 4);
  const re = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  const max = (list || []).reduce((m, d) => {
    const x = re.exec(d.numero || "");
    return x ? Math.max(m, Number(x[1])) : m;
  }, 0);
  return `${prefix}-${year}-${String(max + 1).padStart(4, "0")}`;
}
export function fallbackNumero(prefix, dateStr, id) {
  const year = (dateStr || new Date().toISOString()).slice(0, 4);
  return `${prefix}-${year}-${String(id).slice(-4)}`;
}
export function frDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}
export function lineTotal(it) { return (Number(it.qte) || 0) * (Number(it.prix) || 0); }
export function itemsTotal(items) { return (items || []).reduce((s, it) => s + lineTotal(it), 0); }
// Totaux d'un devis/facture : sous-total, remise (montant ou %), total net.
export function docTotals(d) {
  const sousTotal = itemsTotal(d.items);
  const r = Number(d.remise) || 0;
  const remise = d.remiseType === "%" ? Math.round(sousTotal * r / 100) : r;
  const total = Math.max(0, sousTotal - remise);
  const paye = (d.paiements || []).reduce((s, p) => s + (Number(p.montant) || 0), 0);
  return { sousTotal, remise, total, paye, reste: Math.max(0, total - paye) };
}

/* ---------- Gabarit commun ---------- */
const PAGE_W = 210, PAGE_H = 297, MX = 16;

function drawLogo(doc, agency, fallbackLogo, x, y, maxW, maxH) {
  const src = agency?.logo || fallbackLogo;
  if (!src) return 0;
  try {
    const props = doc.getImageProperties(src);
    const ratio = props.width / props.height;
    let w = maxW, h = maxW / ratio;
    if (h > maxH) { h = maxH; w = maxH * ratio; }
    doc.addImage(src, props.fileType || "PNG", x, y, w, h);
    return w;
  } catch (e) { return 0; }
}

// En-tete : bande de couleur, logo + coordonnees a gauche, titre + references a droite.
function header(doc, P, agency, fallbackLogo, title, refs) {
  doc.setFillColor(...P.primary);
  doc.rect(0, 0, PAGE_W, 5, "F");
  doc.setFillColor(...P.secondary);
  doc.rect(0, 5, PAGE_W, 1.2, "F");

  const logoW = drawLogo(doc, agency, fallbackLogo, MX, 13, 30, 26);
  const tx = MX + (logoW ? logoW + 5 : 0);
  let y = 18;
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...P.primary);
  doc.text(agency?.name || "KBS DIGITAL AGENCY", tx, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...P.muted);
  const lines = [
    agency?.slogan,
    agency?.address,
    [agency?.phone1, agency?.phone2].filter(Boolean).join("  /  "),
    [agency?.email, agency?.website].filter(Boolean).join("  •  "),
  ].filter(Boolean);
  lines.forEach(l => { y += 4.3; doc.text(doc.splitTextToSize(l, 95)[0], tx, y); });

  // Titre du document
  doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(...P.secondary);
  doc.text(title, PAGE_W - MX, 21, { align: "right" });
  // Cartouche des references
  const boxW = 66, boxX = PAGE_W - MX - boxW;
  let by = 26;
  const boxH = refs.length * 5.6 + 3;
  doc.setFillColor(...P.tint);
  doc.roundedRect(boxX, by, boxW, boxH, 1.8, 1.8, "F");
  by += 5.2;
  refs.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...P.muted);
    doc.text(k, boxX + 3.5, by);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...P.text);
    doc.text(String(v || "—"), boxX + boxW - 3.5, by, { align: "right" });
    by += 5.6;
  });
  return Math.max(y, by) + 8;
}

// Bloc "Client" a gauche + bloc libre a droite (objet, statut...).
function partyBlocks(doc, P, y, leftTitle, client, rightTitle, rightLines) {
  const w = (PAGE_W - MX * 2 - 6) / 2;
  const clientLines = [
    client.nom,
    client.whatsapp ? `Tél. / WhatsApp : ${client.whatsapp}` : "",
    client.email ? `Email : ${client.email}` : "",
    client.adresse || "",
  ].filter(Boolean);
  const h = Math.max(clientLines.length, (rightLines || []).length, 1) * 4.8 + 11;

  function block(x, title, ls, boldFirst) {
    doc.setDrawColor(...P.line); doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 1.8, 1.8, "S");
    doc.setFillColor(...P.primary); doc.rect(x, y + 2, 1.2, h - 4, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...P.primary);
    doc.text(title.toUpperCase(), x + 5, y + 6);
    let ly = y + 11;
    ls.forEach((l, i) => {
      doc.setFont("helvetica", boldFirst && i === 0 ? "bold" : "normal");
      doc.setFontSize(boldFirst && i === 0 ? 10.5 : 9);
      doc.setTextColor(...P.text);
      doc.text(doc.splitTextToSize(String(l), w - 8)[0], x + 5, ly);
      ly += 4.8;
    });
  }
  block(MX, leftTitle, clientLines.length ? clientLines : ["—"], true);
  if (rightTitle) block(MX + w + 6, rightTitle, rightLines && rightLines.length ? rightLines : ["—"], false);
  return y + h + 7;
}

function itemsTable(doc, P, y, items) {
  const body = (items && items.length ? items : [{ label: "—", qte: 1, prix: 0 }]).map((it, i) => [
    String(i + 1),
    it.label || "—",
    String(Number(it.qte) || 0),
    money(it.prix),
    money(lineTotal(it)),
  ]);
  autoTable(doc, {
    startY: y,
    margin: { left: MX, right: MX },
    head: [["N°", "Désignation", "Qté", "Prix unitaire", "Montant"]],
    body,
    theme: "plain",
    headStyles: { fillColor: P.primary, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, cellPadding: 3 },
    bodyStyles: { fontSize: 9.2, textColor: P.text, cellPadding: 3 },
    alternateRowStyles: { fillColor: P.tint2 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "head") data.cell.styles.halign = [0, 2].includes(data.column.index) ? "center" : data.column.index >= 3 ? "right" : "left";
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        doc.setDrawColor(...P.line); doc.setLineWidth(0.2);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    },
  });
  return doc.lastAutoTable.finalY + 6;
}

// Colonne de totaux a droite. rows = [[label, valeur, style]] ; style "total" = surligne.
function totalsBlock(doc, P, y, rows) {
  const w = 82, x = PAGE_W - MX - w;
  rows.forEach(([label, value, style]) => {
    if (style === "total") {
      doc.setFillColor(...P.primary);
      doc.roundedRect(x, y - 1, w, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(255, 255, 255);
      doc.text(label, x + 4, y + 5);
      doc.text(value, x + w - 4, y + 5, { align: "right" });
      y += 11;
    } else {
      const color = style === "due" ? P.red : style === "ok" ? P.green : P.text;
      doc.setFont("helvetica", style ? "bold" : "normal"); doc.setFontSize(9.5);
      doc.setTextColor(...P.muted); doc.text(label, x + 4, y + 4);
      doc.setTextColor(...color); doc.text(value, x + w - 4, y + 4, { align: "right" });
      doc.setDrawColor(...P.line); doc.setLineWidth(0.2); doc.line(x, y + 6.5, x + w, y + 6.5);
      y += 8;
    }
  });
  return y + 3;
}

function wordsLine(doc, P, y, prefix, amount) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...P.muted);
  const txt = `${prefix} ${amountInWords(amount)} (${money(amount)}).`;
  const ls = doc.splitTextToSize(txt, PAGE_W - MX * 2);
  doc.setFont("helvetica", "italic"); doc.setTextColor(...P.text);
  doc.text(ls, MX, y);
  return y + ls.length * 4.5 + 4;
}

function infoBox(doc, P, y, title, text) {
  if (!text) return y;
  const ls = doc.splitTextToSize(text, PAGE_W - MX * 2 - 8);
  const h = ls.length * 4.3 + 10;
  if (y + h > PAGE_H - 50) { doc.addPage(); y = 20; }
  doc.setFillColor(...P.tint2); doc.setDrawColor(...P.line);
  doc.roundedRect(MX, y, PAGE_W - MX * 2, h, 1.8, 1.8, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...P.primary);
  doc.text(title.toUpperCase(), MX + 4, y + 5.5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.8); doc.setTextColor(...P.text);
  doc.text(ls, MX + 4, y + 10.5);
  return y + h + 5;
}

function signatures(doc, P, y, left, right) {
  if (y > PAGE_H - 62) { doc.addPage(); y = 25; }
  const w = 70;
  [[MX, left], [PAGE_W - MX - w, right]].forEach(([x, label]) => {
    if (!label) return;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...P.muted);
    doc.text(label, x, y);
    doc.setDrawColor(...P.line); doc.setLineWidth(0.3);
    doc.roundedRect(x, y + 2.5, w, 22, 1.5, 1.5, "S");
  });
  return y + 30;
}

function stamp(doc, P, text, color) {
  try {
    doc.saveGraphicsState();
    if (doc.GState) doc.setGState(new doc.GState({ opacity: 0.16 }));
    doc.setFont("helvetica", "bold"); doc.setFontSize(54); doc.setTextColor(...color);
    doc.text(text, 62, 262, { angle: 18 });
    doc.restoreGraphicsState();
  } catch (e) { /* tampon facultatif */ }
}

function footers(doc, P, agency) {
  const n = doc.getNumberOfPages();
  const legal = [agency?.rccm ? `RCCM : ${agency.rccm}` : "", agency?.nif ? `NIF : ${agency.nif}` : ""].filter(Boolean).join("   •   ");
  const contact = [agency?.name, agency?.phone1, agency?.email].filter(Boolean).join("   •   ");
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...P.primary); doc.setLineWidth(0.6);
    doc.line(MX, PAGE_H - 17, PAGE_W - MX, PAGE_H - 17);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.8); doc.setTextColor(...P.muted);
    doc.text(contact, PAGE_W / 2, PAGE_H - 12, { align: "center" });
    if (legal) doc.text(legal, PAGE_W / 2, PAGE_H - 8, { align: "center" });
    doc.text(`Page ${i} / ${n}`, PAGE_W - MX, PAGE_H - 4, { align: "right" });
    doc.setFillColor(...P.primary); doc.rect(0, PAGE_H - 2, PAGE_W, 2, "F");
  }
}

function fileName(numero, nom) {
  return `${numero}_${(nom || "client").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_")}.pdf`;
}

/* ============================== DEVIS ============================== */
export function generateDevisPDF(dv, agency, fallbackLogo) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = brandPalette(agency);
  const dateStr = dv.date || new Date().toISOString().slice(0, 10);
  const numero = dv.numero || fallbackNumero("DEV", dateStr, dv.id);
  let y = header(doc, P, agency, fallbackLogo, "DEVIS", [
    ["N° devis", numero],
    ["Date", frDate(dateStr)],
    ["Valable jusqu'au", frDate(dv.validite)],
  ]);
  y = partyBlocks(doc, P, y, "Client", { nom: dv.clientNom, whatsapp: dv.whatsapp, email: dv.email, adresse: dv.adresse },
    "Objet", [dv.objet || "Proposition de prestations", dv.statut ? `Statut : ${dv.statut}` : ""].filter(Boolean));
  y = itemsTable(doc, P, y, dv.items);
  const t = docTotals(dv);
  const rows = [["Sous-total", money(t.sousTotal)]];
  if (t.remise) rows.push([`Remise${dv.remiseType === "%" ? ` (${dv.remise} %)` : ""}`, `- ${money(t.remise)}`]);
  rows.push(["TOTAL", money(t.total), "total"]);
  if (Number(dv.acompte) > 0) rows.push([`Acompte à la commande (${dv.acompte} %)`, money(Math.round(t.total * Number(dv.acompte) / 100)), "strong"]);
  y = totalsBlock(doc, P, y, rows);
  y = wordsLine(doc, P, y, "Arrêté le présent devis à la somme de :", t.total);
  y = infoBox(doc, P, y, "Conditions", dv.notes || agency?.conditionsDevis ||
    "Devis valable jusqu'à la date indiquée. La commande devient ferme après signature « Bon pour accord » et versement de l'acompte convenu.");
  y = infoBox(doc, P, y, "Modalités de paiement", agency?.paymentInfo);
  signatures(doc, P, y + 2, "Le client — « Bon pour accord »", `Pour ${agency?.name || "l'agence"}`);
  footers(doc, P, agency);
  doc.save(fileName(numero, dv.clientNom));
}

/* ============================== FACTURE ============================== */
export function generateFacturePDF(f, agency, fallbackLogo) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = brandPalette(agency);
  const dateStr = f.date || new Date().toISOString().slice(0, 10);
  const numero = f.numero || fallbackNumero("FAC", dateStr, f.id);
  const t = docTotals(f);
  const statut = t.total > 0 && t.reste === 0 ? "Payée" : t.paye > 0 ? "Partiellement payée" : "À payer";
  let y = header(doc, P, agency, fallbackLogo, "FACTURE", [
    ["N° facture", numero],
    ["Date", frDate(dateStr)],
    ["Échéance", frDate(f.echeance)],
    ...(f.devisNumero ? [["Réf. devis", f.devisNumero]] : []),
  ]);
  y = partyBlocks(doc, P, y, "Facturé à", { nom: f.clientNom, whatsapp: f.whatsapp, email: f.email, adresse: f.adresse },
    "Objet", [f.objet || "Prestations réalisées", `Statut : ${statut}`]);
  y = itemsTable(doc, P, y, f.items);
  const rows = [["Sous-total", money(t.sousTotal)]];
  if (t.remise) rows.push([`Remise${f.remiseType === "%" ? ` (${f.remise} %)` : ""}`, `- ${money(t.remise)}`]);
  rows.push(["TOTAL À PAYER", money(t.total), "total"]);
  if (t.paye > 0) {
    rows.push(["Déjà réglé", money(t.paye), "ok"]);
    rows.push(["Reste à payer", money(t.reste), t.reste > 0 ? "due" : "ok"]);
  }
  y = totalsBlock(doc, P, y, rows);
  y = wordsLine(doc, P, y, "Arrêtée la présente facture à la somme de :", t.total);
  if ((f.paiements || []).length) {
    y = infoBox(doc, P, y, "Règlements reçus", f.paiements.map(p => `${frDate(p.date)} — ${money(p.montant)}${p.mode ? ` (${p.mode})` : ""}${p.note ? ` — ${p.note}` : ""}`).join("\n"));
  }
  y = infoBox(doc, P, y, "Modalités de paiement", agency?.paymentInfo);
  y = infoBox(doc, P, y, "Notes", f.notes || agency?.conditionsFacture);
  signatures(doc, P, y + 2, "", `Pour ${agency?.name || "l'agence"} — signature & cachet`);
  if (statut === "Payée") stamp(doc, P, "PAYÉE", P.green);
  footers(doc, P, agency);
  doc.save(fileName(numero, f.clientNom));
}

/* ============================== REÇU ==============================
   r = { numero, date, clientNom, whatsapp, email, adresse, service, montant,
         mode, note, prixTotal, totalPaye, reste, factureNumero }          */
export function generateRecuPDF(r, agency, fallbackLogo) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = brandPalette(agency);
  const dateStr = r.date || new Date().toISOString().slice(0, 10);
  let y = header(doc, P, agency, fallbackLogo, "REÇU", [
    ["N° reçu", r.numero],
    ["Date", frDate(dateStr)],
    ...(r.factureNumero ? [["Réf. facture", r.factureNumero]] : []),
  ]);
  y = partyBlocks(doc, P, y, "Reçu de", { nom: r.clientNom, whatsapp: r.whatsapp, email: r.email, adresse: r.adresse },
    "Paiement", [`Mode : ${r.mode || "—"}`, r.note ? `Note : ${r.note}` : ""].filter(Boolean));

  // Montant recu, bien mis en valeur
  doc.setFillColor(...P.tint);
  doc.roundedRect(MX, y, PAGE_W - MX * 2, 26, 2, 2, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...P.muted);
  doc.text("MONTANT REÇU", MX + 6, y + 8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...P.primary);
  doc.text(money(r.montant), MX + 6, y + 18);
  doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(...P.text);
  doc.text(doc.splitTextToSize(amountInWords(r.montant), 92), PAGE_W - MX - 6, y + 11, { align: "right" });
  y += 33;

  autoTable(doc, {
    startY: y,
    margin: { left: MX, right: MX },
    head: [["Désignation", "Montant"]],
    body: [[`Règlement — ${r.service || "Prestation"}`, money(r.montant)]],
    theme: "plain",
    headStyles: { fillColor: P.primary, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, cellPadding: 3 },
    bodyStyles: { fontSize: 9.5, textColor: P.text, cellPadding: 3.2 },
    columnStyles: { 1: { cellWidth: 40, halign: "right", fontStyle: "bold" } },
    didParseCell: (data) => { if (data.section === "head" && data.column.index === 1) data.cell.styles.halign = "right"; },
  });
  y = doc.lastAutoTable.finalY + 6;

  const solde = Number(r.prixTotal) > 0 && Number(r.reste) <= 0;
  if (Number(r.prixTotal) > 0) {
    y = totalsBlock(doc, P, y, [
      ["Prix total du service", money(r.prixTotal)],
      ["Total réglé à ce jour", money(r.totalPaye), "ok"],
      ["Reste à payer", solde ? "Soldé" : money(r.reste), solde ? "ok" : "due"],
    ]);
  }
  y = wordsLine(doc, P, y + 2, "Nous reconnaissons avoir reçu la somme de :", r.montant);
  y = infoBox(doc, P, y, "Remarque", "Ce reçu atteste du paiement indiqué ci-dessus. Merci de le conserver comme preuve de règlement.");
  signatures(doc, P, y + 2, "", `Pour ${agency?.name || "l'agence"} — signature & cachet`);
  stamp(doc, P, solde || !(Number(r.prixTotal) > 0) ? "PAYÉ" : "ACOMPTE", solde || !(Number(r.prixTotal) > 0) ? P.green : P.primary);
  footers(doc, P, agency);
  doc.save(fileName(r.numero, r.clientNom));
}

/* ---------- Texte WhatsApp ---------- */
export function waLink(phone, text) {
  return `https://wa.me/${(phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
}
