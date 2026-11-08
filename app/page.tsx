import type { Metadata } from "next";
import Link from "next/link";
import { QrCode } from "@/components/qr-code";
import { Reveal } from "@/components/reveal";
import { contentAddressLines, getSiteContent } from "@/lib/content";
import { getCalendarEmbedUrl } from "@/lib/integrations";
import { site as fallbackSite } from "@/lib/site";
import { getPrayerUrl, getSiteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "PIWC Antwerp: The Centre where God lives",
  description: fallbackSite.description,
};

export default async function HomePage() {
  const content = await getSiteContent();
  const { site, gatherings, mission, word, giving, announcements } = content;
  const prayerUrl = await getPrayerUrl();
  const siteUrl = await getSiteUrl();
  const calendar = getCalendarEmbedUrl();
  const email = process.env.CONTACT_EMAIL?.trim() || site.email;
  const address = contentAddressLines(site);

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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:30",
        closes: "12:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "19:30",
      },
    ],
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="hero" aria-labelledby="hero-brand">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="wrap hero-copy">
          <p className="eyebrow hero-in hero-in-1">Antwerpen · Welkom</p>
          <h1 className="hero-brand hero-in hero-in-2" id="hero-brand">
            {site.name}
          </h1>
          <p className="hero-title hero-in hero-in-3">{site.tagline}.</p>
          <p className="lede hero-in hero-in-4">{site.lede}</p>
          <div className="actions hero-in hero-in-4">
            <a className="button" href="#visit">
              Plan your visit
            </a>
            <Link className="button button-ghost" href="/pray">
              Send a prayer request
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section id="gather" aria-labelledby="gather-title">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Gather with us</p>
              <h2 id="gather-title">This week</h2>
              <p>
                Sunday worship and Friday Impact Service at the church. Morning devotion and
                Wednesday Bible study usually meet on Zoom.
              </p>
            </div>
          </Reveal>
          <div className="week-list">
            {gatherings.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <a
                  className={`gather${item.note ? " gather-has-note" : ""}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>{item.name}</strong>
                  <span>
                    {item.when} · {item.place}
                  </span>
                  {item.note ? <small className="gather-note">{item.note}</small> : null}
                  <em>{item.cta}</em>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {announcements.length > 0 ? (
          <section id="notices" aria-labelledby="notices-title">
            <Reveal>
              <div className="section-head">
                <p className="eyebrow">This week</p>
                <h2 id="notices-title">Announcements</h2>
              </div>
            </Reveal>
            <div className="week-list">
              {announcements.map((item, index) => (
                <Reveal key={item.id} delay={index * 60}>
                  {item.link ? (
                    <a
                      className="gather"
                      href={item.link}
                      target={/^https?:\/\//i.test(item.link) ? "_blank" : undefined}
                      rel={/^https?:\/\//i.test(item.link) ? "noopener noreferrer" : undefined}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                      <em>{item.cta}</em>
                    </a>
                  ) : (
                    <div className="gather">
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        <section id="visit" aria-labelledby="visit-title">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Find us</p>
              <h2 id="visit-title">Visit</h2>
              <p>
                Sundays 9:30am to 12 noon and Fridays at 7:30pm are in person. Morning devotion is on
                Zoom. Wednesday Bible study is usually online, and sometimes at the church. Watch
                Instagram and TikTok for those updates.
              </p>
            </div>
          </Reveal>
          <div className="split">
            <Reveal>
              <div className="panel">
                <p className="address">
                  {address.map((line) => (
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
                  <li>A multicultural congregation of {site.denomination}. Worship is in English.</li>
                  <li>Friday Impact Service every week at 19:30.</li>
                  <li>A faith-based nonprofit serving Antwerp through the Gospel and Christian love.</li>
                </ul>
                <div className="actions">
                  <a
                    className="button"
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
            </Reveal>
            <Reveal delay={90}>
              <div className="map-shell">
                <iframe
                  className="map-frame"
                  title="Map showing PIWC Antwerp at Merksemsesteenweg 32/34, 2100 Antwerpen"
                  src={site.mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section id="about" aria-labelledby="about-title">
          <Reveal>
            <div className="section-head about-head">
              <p className="eyebrow">{mission.eyebrow}</p>
              <h2 id="about-title">{mission.title}</h2>
            </div>
          </Reveal>
          <div className="about">
            <Reveal>
              <div className="about-copy">
                {mission.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <ul className="pillars">
                {mission.pillars.map((pillar) => (
                  <li key={pillar.name}>
                    <strong>{pillar.name}</strong>
                    <span>{pillar.detail}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section id="word" aria-labelledby="word-title">
          <Reveal>
            <figure className="word">
              <p className="eyebrow">{word.eyebrow}</p>
              <blockquote>
                <p id="word-title">“{word.text}”</p>
              </blockquote>
              <figcaption>
                <cite>{word.reference}</cite>
                <span>{word.note}</span>
              </figcaption>
            </figure>
          </Reveal>
        </section>

        {calendar ? (
          <section aria-labelledby="calendar-title">
            <Reveal>
              <div className="section-head">
                <h2 id="calendar-title">Calendar</h2>
                <p>Times below come from the church Google Calendar, in the Brussels time zone.</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <iframe className="calendar" title="PIWC Antwerp Google Calendar" src={calendar} />
            </Reveal>
          </section>
        ) : null}

        <section id="welcome" aria-labelledby="welcome-title">
          <Reveal>
            <div className="welcome">
              <div>
                <p className="eyebrow">New here</p>
                <h2 id="welcome-title">You belong in the room.</h2>
                <p>
                  Whether you are new to faith or looking for a church family in Antwerp, come a
                  little early, take a seat, and let someone welcome you. No dress code, only a
                  multicultural community ready to worship with you.
                </p>
              </div>
              <div className="actions">
                <a className="button" href="#visit">
                  See how to find us
                </a>
                <a
                  className="button button-ghost"
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Say hello on Instagram
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="give" aria-labelledby="give-title">
          <Reveal>
            <div className="give-band">
              <div>
                <p className="eyebrow">Partner with us</p>
                <h2 id="give-title">Support the work in Antwerp.</h2>
                <p>
                  Scan the payment QR with your banking app, or transfer to the church account.
                  Gifts help PIWC Antwerp worship, teach, and serve the city.
                </p>
                <ul className="facts give-facts">
                  <li>
                    <strong>IBAN</strong>
                    <span>{giving.ibanDisplay}</span>
                  </li>
                  <li>
                    <strong>BIC</strong>
                    <span>{giving.bic}</span>
                  </li>
                  <li>
                    <strong>Beneficiary</strong>
                    <span>{giving.beneficiary}</span>
                  </li>
                </ul>
                <div className="actions">
                  {giving.stripePaymentUrl ? (
                    <a
                      className="button"
                      href={giving.stripePaymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {giving.ctaLabel}
                    </a>
                  ) : null}
                  <Link
                    className={giving.stripePaymentUrl ? "button button-ghost" : "button"}
                    href="/give"
                  >
                    Open giving page
                  </Link>
                  <a className="button button-ghost" href="/api/qr/give">
                    Download QR
                  </a>
                </div>
              </div>
              <div className="qr-card">
                <QrCode
                  url={giving.epcPayload}
                  label="Payment QR code for PIWC Antwerp bank transfer"
                />
                <p>Scan with your banking app</p>
                <Link href="/give">Bank details</Link>
              </div>
            </div>
          </Reveal>
        </section>

        <section aria-labelledby="prayer-title">
          <Reveal>
            <div className="prayer-band">
              <div>
                <p className="eyebrow eyebrow-on-dark">House of prayer</p>
                <h2 id="prayer-title">Tell us what to pray.</h2>
                <p>
                  Scan the code in the church, or send a request from your phone. It goes to the
                  PIWC Antwerp prayer team in the church Google Workspace.
                </p>
                <p className="verse">
                  “My house shall be called a house of prayer.” Matthew 21:13
                </p>
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
                <QrCode url={prayerUrl} label="QR code for the prayer form" />
                <p>Scan for prayer requests</p>
                <Link href="/pray">Open the form</Link>
              </div>
            </div>
          </Reveal>
        </section>

        <section aria-labelledby="worship-title">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Listen</p>
              <h2 id="worship-title">Worship</h2>
              <p>
                The {site.playlistTitle} playlist.{" "}
                <a href={site.spotify}>Open on Spotify</a>
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <iframe
              className="playlist"
              title="PIWC Antwerp playlist on Spotify"
              src={site.spotifyEmbed}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </Reveal>
        </section>

        <section id="follow" aria-labelledby="follow-title">
          <Reveal>
            <div className="follow">
              <div className="section-head">
                <p className="eyebrow">Stay close</p>
                <h2 id="follow-title">Follow the life of the church</h2>
                <p>
                  Service updates, Wednesday venue changes, and midweek encouragement land first on
                  our media platforms.
                </p>
              </div>
              <div className="follow-links">
                <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                  <strong>Instagram</strong>
                  <span>{site.instagramHandle}</span>
                </a>
                <a href={site.tiktok} target="_blank" rel="noopener noreferrer">
                  <strong>TikTok</strong>
                  <span>{site.tiktokHandle}</span>
                </a>
                <a href={site.spotify} target="_blank" rel="noopener noreferrer">
                  <strong>Spotify</strong>
                  <span>{site.playlistTitle}</span>
                </a>
                <Link href="/give">
                  <strong>Give</strong>
                  <span>{giving.ibanDisplay}</span>
                </Link>
                {email ? (
                  <a href={`mailto:${email}`}>
                    <strong>Email</strong>
                    <span>{email}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
