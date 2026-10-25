import type { Metadata } from "next";
import { PrintButton } from "@/components/print-button";
import { QrCode } from "@/components/qr-code";
import { site } from "@/lib/site";
import { getPrayerUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Prayer QR code",
  description: "Printable QR code for PIWC Antwerp prayer requests.",
};

export default async function QrPage() {
  const prayerUrl = await getPrayerUrl();

  return (
    <main id="main" className="wrap">
      <header className="page-intro no-print">
        <p className="eyebrow">For the foyer</p>
        <h1>Prayer QR code</h1>
        <p className="lede">
          Print this page, or download the image, and place it where people can scan it. The code
          opens the prayer form on this website. Each request is delivered to the church Google
          Workspace.
        </p>
        <div className="actions">
          <a className="button" href="/api/qr">
            Download PNG
          </a>
          <PrintButton />
        </div>
        <p className="form-note">
          Print keeps the poster and leaves the site header off the page.
        </p>
      </header>

      <article className="poster">
        <p className="eyebrow">{site.denomination}</p>
        <h1>Prayer requests</h1>
        <p>{site.name}</p>
        <QrCode url={prayerUrl} size={640} />
        <p>Scan with your phone camera</p>
        <a className="url-chip" href={prayerUrl}>
          {prayerUrl.replace(/^https?:\/\//, "")}
        </a>
        <p className="poster-line">{site.tagline}</p>
      </article>
    </main>
  );
}
