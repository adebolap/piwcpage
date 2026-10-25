"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function PrayerForm({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [testMode, setTestMode] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/prayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          contact: data.get("contact"),
          request: data.get("request"),
          shareWithCongregation: data.get("shareWithCongregation") === "on",
          consent: data.get("consent") === "on",
          company: data.get("company"),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; delivered?: boolean };
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.error || "We could not send this request. Please try again.");
        return;
      }
      form.reset();
      setTestMode(payload.delivered === false);
      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage("We could not send this request. Please try again in a moment.");
    }
  }

  if (status === "sent") {
    return (
      <div className="status" role="status">
        <p>
          <strong>We have received your prayer request.</strong> The PIWC Antwerp prayer team will
          pray with you. It will not be published on this website.
        </p>
        {testMode ? (
          <p>
            This copy of the site is not connected to Google Workspace yet, so the request was not
            stored for the prayer team.
          </p>
        ) : null}
        <p>
          <button className="button" type="button" onClick={() => setStatus("idle")}>
            Send another request
          </button>
        </p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="hp" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="field">
        <span>Your name (optional)</span>
        <input name="name" autoComplete="name" maxLength={80} />
      </label>

      <label className="field">
        <span>How can we reach you? (optional)</span>
        <input
          name="contact"
          autoComplete="email"
          maxLength={120}
          placeholder="Phone or email, if you would like a reply"
        />
      </label>

      <label className="field">
        <span>Prayer request</span>
        <textarea name="request" required minLength={8} maxLength={2000} />
      </label>

      <label className="check">
        <input name="shareWithCongregation" type="checkbox" />
        <span>
          The prayer team may share this when the church prays together. Leave this unticked to
          keep it with the prayer team only.
        </span>
      </label>

      <label className="check">
        <input name="consent" type="checkbox" required />
        <span>
          I agree that PIWC Antwerp receives this request and keeps it in the church Google
          Workspace so the team can pray. It is not posted on the website.
        </span>
      </label>
      <p className="form-note">
        <a href="/privacy">Read the privacy note</a> before you send.
      </p>

      {status === "error" ? (
        <p className="alert" role="alert">
          {message}
        </p>
      ) : null}

      <button className="button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send prayer request"}
      </button>
      <p className="form-note">
        You can also write to <a href={`mailto:${email}`}>{email}</a> or message{" "}
        <a href="https://www.instagram.com/piwc_antwerp/">@piwc_antwerp</a> on Instagram.
      </p>
    </form>
  );
}
