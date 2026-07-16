"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import SearchOverlay from "./Search/SearchOverlay";

const anchorLinks: [string, string][] = [
  ["درباره", "#about"],
  ["خدمات", "#services"],
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
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function close() {
    setIsOpen(false);
    toggleRef.current?.focus();
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the panel when it opens.
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    firstFocusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 999,
        backdropFilter: "blur(18px)",
        background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        borderBottom: "1px solid var(--line)",
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
              color: "var(--text)",
            }}
          >
            گل‌رو
          </Link>

          <nav className="navbar-links" aria-label="ناوبری اصلی">
            <Link
              href="/journal"
              style={{
                color: "var(--text-muted)",
                transition: ".2s ease-out",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              ژورنال
            </Link>
            {anchorLinks.map(([title, href]) => (
              <a
                key={title}
                href={href}
                style={{
                  color: "var(--text-muted)",
                  transition: ".25s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text)";
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
            ref={toggleRef}
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

      {isOpen && <div className="navbar-mobile-backdrop" onClick={close} />}

      <div
        id="navbar-mobile-panel"
        ref={panelRef}
        className={`navbar-mobile-panel${isOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="ناوبری موبایل"
      >
        <nav className="navbar-mobile-links" aria-label="ناوبری موبایل">
          <div style={{ padding: "16px 4px" }}>
            <SearchOverlay />
          </div>
          <Link href="/journal" onClick={close}>
            ژورنال
          </Link>
          {anchorLinks.map(([title, href]) => (
            <a key={title} href={href} onClick={close}>
              {title}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
