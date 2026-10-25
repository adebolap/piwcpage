import type { Metadata } from "next";
import Link from "next/link";
import { QrCode } from "@/components/qr-code";
import { getCalendarEmbedUrl, getContactEmail } from "@/lib/integrations";
import { addressLines, gatherings, site } from "@/lib/site";
import { getPrayerUrl, getSiteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "PIWC Antwerp — The Centre where God lives",
  description: site.description,
};

export default async function HomePage() {
  const prayerUrl = await getPrayerUrl();
  const siteUrl = await getSiteUrl();
  const calendar = getCalendarEmbedUrl();
  const email = getContactEmail();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: site.name,
    alternateName: site.fullName,
    description: site.description,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: site.address.countryCode,
    },
    sameAs: [site.instagram, site.tiktok, site.spotify],
    ...(email ? { email } : {}),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "09:30",
      closes: "12:00",
    },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="wrap">
        <section className="hero">
          <div>
            <p className="eyebrow">Antwerpen · Welkom</p>
            <h1>{site.tagline}.</h1>
            <p className="lede">
              {site.fullName} is a worshipping church in the city. You are welcome to come as you
              are — to sing, to pray, and to hear the Bible taught.
            </p>
            <div className="actions">
              <a className="button" href="#visit">
                Plan your visit
              </a>
              <Link className="button button-ghost" href="/pray">
                Send a prayer request
              </Link>
            </div>
          </div>
          <aside className="week" id="gather" aria-labelledby="gather-title">
            <p className="eyebrow">Gather with us</p>
            <h2 id="gather-title">This week</h2>
            {gatherings.map((item) => (
              <a key={item.id} className="gather" href={item.href} target="_blank" rel="noopener noreferrer">
                <strong>{item.name}</strong>
                <span>
                  {item.when} · {item.place}
                </span>
                <em>{item.cta}</em>
              </a>
            ))}
          </aside>
        </section>

        <section id="visit" aria-labelledby="visit-title">
          <div className="section-head">
            <h2 id="visit-title">Visit</h2>
            <p>
              Sunday worship is in person from 9:30am until 12 noon. Morning devotion and
              Wednesday Bible study are on Zoom.
            </p>
          </div>
          <div className="split">
            <div className="panel">
              <p className="address">
                {addressLines().map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <p>
                {site.address.district}, in the city of Antwerp. Part of {site.denomination}.
              </p>
              <ul className="facts">
                <li>An international congregation. Worship is in English.</li>
                <li>Bethel Grounds morning devotion and Wednesday Bible study meet on Zoom.</li>
                <li>Prayer requests stay with the prayer team. They are never posted here.</li>
              </ul>
              <div className="actions">
                <a className="button" href={site.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                </a>
                {email ? (
                  <a className="button button-ghost" href={`mailto:${email}`}>
                    {email}
                  </a>
                ) : (
                  <a className="button button-ghost" href={site.instagram}>
                    Message on Instagram
                  </a>
                )}
              </div>
            </div>
            <iframe
              className="map-frame"
              title="Map showing PIWC Antwerp at Merksemsesteenweg 32/34, 2100 Antwerpen"
              src={site.mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {calendar ? (
          <section aria-labelledby="calendar-title">
            <div className="section-head">
              <h2 id="calendar-title">Calendar</h2>
              <p>Times below come from the church Google Calendar, in the Brussels time zone.</p>
            </div>
            <iframe className="calendar" title="PIWC Antwerp Google Calendar" src={calendar} />
          </section>
        ) : null}

        <section aria-labelledby="prayer-title">
          <div className="prayer-band">
            <div>
              <p className="eyebrow eyebrow-on-dark">House of prayer</p>
              <h2 id="prayer-title">Tell us what to pray.</h2>
              <p>
                Scan the code in the church, or send a request from your phone. It goes to the
                PIWC Antwerp prayer team in the church Google Workspace.
              </p>
              <p className="verse">“My house shall be called a house of prayer.” — Matthew 21:13</p>
              <div className="actions">
                <Link className="button button-light" href="/pray">
                  Write a prayer request
                </Link>
                <Link className="button button-on-dark" href="/qr">
                  Print the QR code
                </Link>
              </div>
            </div>
            <div className="qr-card">
              <QrCode url={prayerUrl} />
              <p>Scan for prayer requests</p>
              <Link href="/pray">Open the form</Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="worship-title">
          <div className="section-head">
            <h2 id="worship-title">Worship</h2>
            <p>
              The {site.playlistTitle} playlist. <a href={site.spotify}>Open on Spotify</a>
            </p>
          </div>
          <iframe
            className="playlist"
            title="PIWC Antwerp playlist on Spotify"
            src={site.spotifyEmbed}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </section>
      </div>
    </main>
  );
}
