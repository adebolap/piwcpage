import type { Metadata } from "next";
import { getContactEmail } from "@/lib/integrations";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How PIWC Antwerp handles prayer requests sent from this website.",
};

export default function PrivacyPage() {
  const email = getContactEmail();

  return (
    <main id="main" className="wrap prose">
      <header className="page-intro">
        <p className="eyebrow">Privacy</p>
        <h1>Prayer requests</h1>
      </header>
      <p>
        {site.fullName}, {site.address.line}, {site.address.postalCode} {site.address.city}, receives
        the prayer requests sent from this website.
      </p>
      <p>The form may include:</p>
      <ul>
        <li>your name, if you give it</li>
        <li>a phone number or email, if you want a reply</li>
        <li>the prayer request itself</li>
        <li>whether the prayer team may share it when the church prays together</li>
      </ul>
      <p>
        The church uses this only to pray and, when you leave contact details, to follow up. Requests
        are stored in the church Google Workspace (a private spreadsheet and an email to the prayer
        team). They are not published on this website and they are not sold.
      </p>
      <p>
        The prayer team keeps a request only as long as they need it for prayer and follow-up. You
        can ask to see, correct, or delete what you sent
        {email ? (
          <>
            {" "}
            by writing to <a href={`mailto:${email}`}>{email}</a> or by messaging{" "}
            <a href={site.instagram}>{site.instagramHandle}</a> on Instagram.
          </>
        ) : (
          <>
            {" "}
            by messaging <a href={site.instagram}>{site.instagramHandle}</a> on Instagram.
          </>
        )}
      </p>
      <p>
        The visit page embeds Google Maps, and the worship page embeds Spotify. Those services
        receive the fact that your browser loaded them, under their own privacy terms. A Google
        Calendar appears only when the church has connected one.
      </p>
    </main>
  );
}
