import type { Metadata } from "next";
import { PrayerForm } from "@/components/prayer-form";
import { QrCode } from "@/components/qr-code";
import { Reveal } from "@/components/reveal";
import { getContactEmail } from "@/lib/integrations";
import { getPrayerUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Prayer request",
  description: "Send a private prayer request to the PIWC Antwerp prayer team.",
};

export default async function PrayPage() {
  const prayerUrl = await getPrayerUrl();

  return (
    <main id="main" className="wrap">
      <header className="page-intro">
        <p className="eyebrow">Prayer</p>
        <h1>We will pray with you.</h1>
        <p className="lede">
          Write what you would like the church to bring to God. Your request is sent to the PIWC
          Antwerp prayer team and kept in the church Google Workspace. It is not shown on this
          website.
        </p>
      </header>
      <section className="split">
        <Reveal>
          <div className="panel">
            <PrayerForm email={getContactEmail()} />
          </div>
        </Reveal>
        <Reveal delay={90}>
          <aside className="panel">
            <h2>In the church</h2>
            <p>This is the same code printed for the foyer. A phone camera opens this page.</p>
            <div className="qr-card">
              <QrCode url={prayerUrl} />
              <p>{prayerUrl.replace(/^https?:\/\//, "")}</p>
            </div>
          </aside>
        </Reveal>
      </section>
    </main>
  );
}
