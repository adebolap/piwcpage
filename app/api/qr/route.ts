import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getPrayerUrl } from "@/lib/url";

export const runtime = "nodejs";

export async function GET() {
  const url = await getPrayerUrl();
  const png = await QRCode.toBuffer(url, {
    type: "png",
    margin: 2,
    width: 1200,
    errorCorrectionLevel: "H",
    color: { dark: "#1A1614", light: "#FFFFFF" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="piwc-antwerp-prayer-qr.png"',
      "Cache-Control": "private, max-age=300",
    },
  });
}
