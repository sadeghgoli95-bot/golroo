"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navLinks } from "./navLinks";
import SearchOverlay from "./Search/SearchOverlay";

export default function MobileMenu() {
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
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          flexDirection: "column",
          gap: "5px",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="hamburger-btn"
      >
        <span
          style={{
            display: "block",
            width: "22px",
            height: "1.5px",
            background: "var(--text)",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
          }}
        />
        <span
          style={{
            display: "block",
            width: "22px",
            height: "1.5px",
            background: "var(--text)",
            transition: "all 0.3s ease",
            opacity: isOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            display: "block",
            width: "22px",
            height: "1.5px",
            background: "var(--text)",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
          }}
        />
      </button>

      {isOpen && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,23,20,.4)",
            zIndex: 998,
          }}
        />
      )}

      <div
        id="mobile-menu-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="ناوبری موبایل"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "280px",
          maxWidth: "85vw",
          height: "100vh",
          background: "var(--bg)",
          zIndex: 999,
          padding: "80px 32px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          borderLeft: "1px solid var(--line)",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <SearchOverlay />
        </div>

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            style={{
              fontSize: "1.4rem",
              fontWeight: 300,
              color: "var(--text)",
              textDecoration: "none",
              padding: "12px 0",
              borderBottom: "1px solid var(--line-soft)",
              display: "block",
            }}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/appointment"
          onClick={close}
          style={{
            marginTop: "24px",
            padding: "14px 24px",
            background: "var(--accent)",
            color: "white",
            textDecoration: "none",
            textAlign: "center",
            fontSize: "1rem",
            borderRadius: "8px",
          }}
        >
          رزرو جلسه
        </Link>
      </div>
    </>
  );
}
