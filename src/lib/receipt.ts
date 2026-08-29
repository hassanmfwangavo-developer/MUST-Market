export type ReceiptData = {
  orderRef: string;
  placedAt: string;
  customerName?: string;
  phone?: string;
  area: string;
  room: string;
  vendorName?: string;
  eta: string;
  lines: { label: string; qty: number; amount: number }[];
  total: number;
};

const W = 900;
const PAD = 56;

function money(n: number) {
  return `TSh ${new Intl.NumberFormat("en-US").format(Math.round(n))}`;
}

/** Draws the receipt on a canvas and returns it as a PNG blob. */
export async function buildReceiptPng(d: ReceiptData): Promise<Blob> {
  const rows = d.lines.length;
  const H = 760 + rows * 54;
  const canvas = document.createElement("canvas");
  const dpr = 2;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.scale(dpr, dpr);

  // background
  ctx.fillStyle = "#FAFBF6";
  ctx.fillRect(0, 0, W, H);

  // header band
  ctx.fillStyle = "#008542";
  ctx.fillRect(0, 0, W, 150);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 40px Inter, system-ui, sans-serif";
  ctx.fillText("Msosi Fasta", PAD, 68);
  ctx.font = "400 24px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("MUST Market · Risiti ya Agizo", PAD, 106);

  ctx.textAlign = "right";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 30px Inter, system-ui, sans-serif";
  ctx.fillText(`#${d.orderRef}`, W - PAD, 76);
  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(d.placedAt, W - PAD, 106);
  ctx.textAlign = "left";

  let y = 214;
  const label = (t: string, x: number) => {
    ctx.fillStyle = "#64748B";
    ctx.font = "500 19px Inter, system-ui, sans-serif";
    ctx.fillText(t, x, y);
  };
  const value = (t: string, x: number) => {
    ctx.fillStyle = "#0F172A";
    ctx.font = "600 24px Inter, system-ui, sans-serif";
    ctx.fillText(t, x, y + 32);
  };

  const col2 = W / 2 + 20;
  label("Mteja", PAD);
  value(d.customerName || "—", PAD);
  label("Simu", col2);
  value(d.phone ? `+${d.phone}` : "—", col2);
  y += 88;

  label("Eneo la Kufikishia", PAD);
  value(d.area || "—", PAD);
  label("Mtaa / Chumba", col2);
  value(d.room || "—", col2);
  y += 88;

  label("Mpishi / Jikoni", PAD);
  value(d.vendorName || "Msosi Fasta", PAD);
  label("Muda wa Kufikishiwa", col2);
  value(d.eta, col2);
  y += 96;

  // items table
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 44;

  ctx.fillStyle = "#64748B";
  ctx.font = "600 19px Inter, system-ui, sans-serif";
  ctx.fillText("BIDHAA", PAD, y);
  ctx.textAlign = "right";
  ctx.fillText("KIASI", W - PAD, y);
  ctx.textAlign = "left";
  y += 34;

  for (const line of d.lines) {
    ctx.fillStyle = "#0F172A";
    ctx.font = "500 23px Inter, system-ui, sans-serif";
    ctx.fillText(
      line.qty > 1 ? `${line.label}  ×${line.qty}` : line.label,
      PAD,
      y + 18,
    );
    ctx.textAlign = "right";
    ctx.fillText(money(line.amount), W - PAD, y + 18);
    ctx.textAlign = "left";
    y += 54;
  }

  y += 12;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 60;

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 28px Inter, system-ui, sans-serif";
  ctx.fillText("JUMLA ILIYOLIPWA", PAD, y);
  ctx.textAlign = "right";
  ctx.fillStyle = "#008542";
  ctx.font = "800 34px Inter, system-ui, sans-serif";
  ctx.fillText(money(d.total), W - PAD, y + 4);
  ctx.textAlign = "left";
  y += 70;

  ctx.fillStyle = "#ECFDF5";
  ctx.fillRect(PAD, y, W - PAD * 2, 96);
  ctx.fillStyle = "#046C42";
  ctx.font = "600 21px Inter, system-ui, sans-serif";
  ctx.fillText("Asante kwa kuagiza na Msosi Fasta 🍲", PAD + 28, y + 42);
  ctx.fillStyle = "#4B7A66";
  ctx.font = "400 18px Inter, system-ui, sans-serif";
  ctx.fillText(
    "Onyesha risiti hii kwa mletaji wakati wa kupokea chakula chako.",
    PAD + 28,
    y + 72,
  );

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("blob failed"))),
      "image/png",
    ),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function shareBlob(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    await nav.share({ files: [file], title: "Risiti — Msosi Fasta", text });
    return true;
  }
  return false;
}
