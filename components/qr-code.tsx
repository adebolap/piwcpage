import QRCode from "qrcode";

export async function QrCode({
  url,
  size = 280,
  label = "QR code",
}: {
  url: string;
  size?: number;
  label?: string;
}) {
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: size,
    errorCorrectionLevel: "M",
    color: { dark: "#1A1614", light: "#00000000" },
  });

  return (
    <div
      className="qr"
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
