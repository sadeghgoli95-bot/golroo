"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import SearchOverlay from "./Search/SearchOverlay";

const navLinks: [string, string][] = [
  ["درباره", "#about"],
  ["خدمات", "#services"],
  ["شیوه کار", "#philosophy"],
  ["ارتباط", "#contact"],
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 999,
        backdropFilter: "blur(18px)",
        background: "color-mix(in srgb, var(--bg) 82%, transparent)",
        borderBottom: "1px solid color-mix(in srgb, var(--primary) 8%, transparent)",
        boxShadow: "0 1px 24px color-mix(in srgb, var(--primary) 4%, transparent)",
      }}
    >
      <Container>
        <div
          style={{
            height: 82,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: ".08em",
              color: "var(--primary)",
            }}
          >
            گل‌رو
          </Link>

          <nav className="navbar-links" aria-label="ناوبری اصلی">
            {navLinks.map(([title, href]) => (
              <a
                key={title}
                href={href}
                style={{
                  color: "var(--text-muted)",
                  transition: ".25s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {title}
              </a>
            ))}
            <SearchOverlay />
          </nav>

          <button
            type="button"
            className="navbar-menu-toggle"
            aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={isOpen}
            aria-controls="navbar-mobile-panel"
            onClick={() => setIsOpen((open) => !open)}
          >
            <MenuIcon open={isOpen} />
          </button>
        </div>
      </Container>

      <div id="navbar-mobile-panel" className={`navbar-mobile-panel${isOpen ? " is-open" : ""}`}>
        <nav className="navbar-mobile-links" aria-label="ناوبری موبایل">
          <div style={{ padding: "16px 4px" }}>
            <SearchOverlay />
          </div>
          {navLinks.map(([title, href]) => (
            <a key={title} href={href} onClick={() => setIsOpen(false)}>
              {title}
            </a>
          ))}
          <Link href="/journal" onClick={() => setIsOpen(false)}>
            ژورنال
          </Link>
          <Link href="/faq" onClick={() => setIsOpen(false)}>
            پرسش‌های متداول
          </Link>
        </nav>
      </div>
    </header>
  );
}
