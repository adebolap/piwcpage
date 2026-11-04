import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { giving } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const png = await QRCode.toBuffer(giving.epcPayload, {
    type: "png",
    margin: 2,
    width: 1200,
    errorCorrectionLevel: "M",
    color: { dark: "#1A1614", light: "#FFFFFF" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="piwc-antwerp-giving-qr.png"',
      "Cache-Control": "private, max-age=300",
    },
  });
}
