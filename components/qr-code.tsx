import QRCode from "qrcode";

export async function QrCode({ url, size = 280 }: { url: string; size?: number }) {
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: size,
    errorCorrectionLevel: "H",
    color: { dark: "#1A1614", light: "#00000000" },
  });

  return (
    <div
      className="qr"
      role="img"
      aria-label="QR code for the prayer form"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
