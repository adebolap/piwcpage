"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#gather", label: "Gatherings" },
  { href: "/#visit", label: "Visit" },
  { href: "/#about", label: "About" },
  { href: "/pray", label: "Prayer", id: "pray" },
] as const;

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="site-header">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Link className="brand" href="/">
        <span className="mark" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M6 1h2v12H6zM1 6h12v2H1z" fill="currentColor" />
          </svg>
        </span>
        <span>
          <span className="brand-name">PIWC Antwerp</span>
          <span className="brand-place">The Church of Pentecost</span>
        </span>
      </Link>
      <nav className="nav" aria-label="Primary">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={"id" in link && path === `/${link.id}` ? "page" : undefined}
            className={"id" in link && link.id === "pray" ? "nav-pray" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
