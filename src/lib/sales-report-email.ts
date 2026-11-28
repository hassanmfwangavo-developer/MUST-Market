import type { DailySalesReport } from "./sales-report";

// Semantic email tokens mirror the app's emerald and neutral surfaces.
const theme = { background: "#ffffff", surface: "#f4f7f6", ink: "#20332b", muted: "#52675e", primary: "#006b4b", border: "#dce5df" };
const esc = (value: unknown) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
const money = (amount: number) => `TSh ${amount.toLocaleString("en-GB")}`;

export function renderSalesReportEmail(report: DailySalesReport): { subject: string; html: string; text: string } {
  const { paid, preorders, latePaid, latePreorders, window: w } = report;
  const table = (headers: string[], rows: unknown[][]) => `<table role="table" style="width:100%;table-layout:fixed;border-collapse:collapse;margin:12px 0;font-size:13px"><thead><tr>${headers.map((h) => `<th scope="col" style="text-align:left;overflow-wrap:anywhere;padding:10px 6px;background:${theme.surface};border-bottom:2px solid ${theme.border}">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row, index) => `<tr${index === rows.length - 1 ? ` style="font-weight:bold;background:${theme.surface}"` : ""}>${row.map((cell) => `<td style="padding:10px 6px;vertical-align:top;border-bottom:1px solid ${theme.border};overflow-wrap:anywhere">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const paidRows = (p: typeof paid) => [
    ...p.groups.map((g) => [g.vendor, g.count, money(g.gross), money(g.commission), money(g.restaurant)]),
    ["JUMLA KUU", p.count, money(p.gross), money(p.commission), money(p.restaurant)],
  ];
  const paidHeaders = ["Mgahawa", "Oda", "Jumla ya mauzo", "Jero lako (markup)", "Mgao wa mgahawa"];
  const preorderRows = (p: typeof preorders) => [["Hostel / Batch", p.batch], ["Book Now", p.direct], ["JUMLA PRE-ORDERS", p.count]];
  const hasLate = latePaid.count > 0 || latePreorders.count > 0;
  // Keep safety alerts aggregate-only: customer details and order references stay in the dashboard.
  const warnings: unknown[][] = [];
  for (const [label, summary] of [["Leo", paid], ["Nyongeza ya jana", latePaid]] as const) {
    const unallocated = summary.groups.filter((g) => g.needsReview).reduce((sum, g) => sum + g.count, 0);
    const refundReview = summary.orders.filter((o) => /cancel|refund/i.test(o.status)).length;
    if (unallocated) warnings.push([label, "Oda zenye mgawanyo unaohitaji uhakiki", unallocated]);
    if (refundReview) warnings.push([label, "Oda zilizolipwa zenye hali ya cancel/refund; hakiki kabla ya mgao", refundReview]);
  }
  const subject = `MUST Market · Ripoti ya ${w.date}`;
  const textTable = (headers: string[], rows: unknown[][]) => [headers.join(" | "), ...rows.map((row) => row.join(" | "))].join("\n");
  const note = "Mgao ni kabla ya ada za Sonic Pesa na SMS; jumla ya mauzo si salio halisi la wallet.";
  const text = [
    `MUST MARKET · MSOSI FASTA — Ripoti ya ${w.date} (00:00–23:58 EAT; 23:58 haijajumuishwa).`,
    "Mauzo yaliyolipwa", textTable(paidHeaders, paidRows(paid)),
    "Pre-orders za leo — hazijalipwa mtandaoni", textTable(["Aina", "Idadi"], preorderRows(preorders)),
    ...(hasLate ? [
      `Nyongeza tofauti ya ${w.previousDate} (23:58–23:59:59) — haijajumuishwa kwenye jumla ya leo.`,
      ...(latePaid.count ? [textTable(paidHeaders, paidRows(latePaid))] : []),
      ...(latePreorders.count ? ["Pre-orders za nyongeza — si mapato", textTable(["Aina", "Idadi"], preorderRows(latePreorders))] : []),
    ] : []),
    ...(warnings.length ? [textTable(["Kipindi", "Uhakiki kabla ya mgao", "Idadi"], warnings)] : []),
    note,
  ].join("\n\n");
  const html = `<!DOCTYPE html><html lang="sw"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:${theme.background};color:${theme.ink};font-family:Arial,sans-serif;line-height:1.5"><main style="max-width:720px;margin:0 auto;padding:20px 12px">
    <header style="border-bottom:3px solid ${theme.primary};padding-bottom:12px"><p style="color:${theme.primary};font-weight:bold;margin:0">MUST MARKET · MSOSI FASTA</p><h1 style="font-size:22px;margin:6px 0">Ripoti ya mauzo · ${esc(w.date)}</h1><p style="margin:0;color:${theme.muted};font-size:12px">00:00 hadi kabla ya 23:58 EAT</p></header>
    <section><h2 style="font-size:16px;color:${theme.primary};margin:18px 0 0">Mauzo yaliyolipwa</h2>${table(paidHeaders, paidRows(paid))}</section>
    <section><h2 style="font-size:16px;margin:18px 0 0">Pre-orders za leo <span style="font-size:12px;font-weight:normal;color:${theme.muted}">— hazijalipwa mtandaoni</span></h2>${table(["Aina", "Idadi"], preorderRows(preorders))}</section>
    ${hasLate ? `<section style="border-top:1px solid ${theme.border};margin-top:18px"><h2 style="font-size:16px;margin:16px 0 4px">Nyongeza tofauti ya ${esc(w.previousDate)}</h2><p style="font-size:12px;color:${theme.muted};margin:0">23:58–23:59:59 · Haijajumuishwa kwenye jumla ya leo.</p>${latePaid.count ? table(paidHeaders, paidRows(latePaid)) : ""}${latePreorders.count ? `<h3 style="font-size:14px">Pre-orders za nyongeza — si mapato</h3>${table(["Aina", "Idadi"], preorderRows(latePreorders))}` : ""}</section>` : ""}
    ${warnings.length ? table(["Kipindi", "Uhakiki kabla ya mgao", "Idadi"], warnings) : ""}
    <footer style="font-size:11px;color:${theme.muted};border-top:1px solid ${theme.border};padding-top:10px">${esc(note)}</footer>
  </main></body></html>`;
  return { subject, html, text };
}