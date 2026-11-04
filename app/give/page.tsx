import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { QrCode } from "@/components/qr-code";
import { Reveal } from "@/components/reveal";
import { giving, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Give",
  description: "Support the ministry of PIWC Antwerp by bank transfer or payment QR code.",
};

export default function GivePage() {
  return (
    <main id="main" className="wrap">
      <header className="page-intro no-print">
        <p className="eyebrow">Partner with us</p>
        <h1>Give to PIWC Antwerp</h1>
        <p className="lede">
          Your gift helps the church worship, teach, and serve Antwerp. Scan the payment QR with
          your banking app, or transfer to the account below. Leave the amount blank in the code so
          you can choose what to give.
        </p>
        <div className="actions">
          <a className="button" href="/api/qr/give">
            Download QR PNG
          </a>
          <PrintButton />
          <Link className="button button-ghost" href="/#give">
            Back to the site
          </Link>
        </div>
      </header>

      <section className="split no-print">
        <Reveal>
          <div className="panel">
            <h2>Bank transfer</h2>
            <ul className="facts give-facts">
              <li>
                <strong>Beneficiary</strong>
                <span>{giving.beneficiary}</span>
              </li>
              <li>
                <strong>IBAN</strong>
                <span>{giving.ibanDisplay}</span>
              </li>
              <li>
                <strong>BIC</strong>
                <span>{giving.bic}</span>
              </li>
            </ul>
            <p className="form-note">
              This is the church nonprofit account for Church of Pentecost VZW Antwerp P.I.W.C.
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="panel">
            <h2>Scan to give</h2>
            <p>Open your Belgian banking app and scan this code.</p>
            <div className="qr-card">
              <QrCode
                url={giving.epcPayload}
                label="Payment QR code for PIWC Antwerp bank transfer"
              />
              <p>EPC payment QR</p>
            </div>
          </div>
        </Reveal>
      </section>

      <article className="poster">
        <p className="eyebrow">{site.denomination}</p>
        <h1>Give</h1>
        <p>{site.name}</p>
        <QrCode
          url={giving.epcPayload}
          size={640}
          label="Printable payment QR code for PIWC Antwerp"
        />
        <p>Scan with your banking app</p>
        <p className="url-chip">{giving.ibanDisplay}</p>
        <p className="poster-line">{giving.beneficiary}</p>
      </article>
    </main>
  );
}
