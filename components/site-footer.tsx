import Link from "next/link";
import { getContactEmail } from "@/lib/integrations";
import { addressLines, site } from "@/lib/site";

export function SiteFooter() {
  const email = getContactEmail();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          {site.fullName}
          <br />
          {addressLines().join(", ")}
        </p>
        <p>
          <a href={site.instagram}>Instagram</a>
          {" · "}
          <a href={site.tiktok}>TikTok</a>
          {" · "}
          <a href={site.spotify}>Spotify</a>
          {email ? (
            <>
              {" · "}
              <a href={`mailto:${email}`}>{email}</a>
            </>
          ) : null}
          <br />
          <Link href="/privacy">Privacy</Link>
          {" · "}
          <Link href="/qr">Prayer QR code</Link>
        </p>
      </div>
    </footer>
  );
}
