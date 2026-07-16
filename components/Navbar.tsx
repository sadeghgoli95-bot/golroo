"use client";

import Link from "next/link";
import Container from "./Container";
import SearchOverlay from "./Search/SearchOverlay";
import MobileMenu from "./MobileMenu";
import { navLinks } from "./navLinks";

export default function Navbar() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 999,
        backdropFilter: "blur(18px)",
        background: "color-mix(in srgb, var(--bg) 95%, transparent)",
        borderBottom: "1px solid rgba(212,167,106,.2)",
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
              color: "var(--accent)",
            }}
          >
            گل‌رو
          </Link>

          <nav className="desktop-nav" aria-label="ناوبری اصلی">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "var(--text-muted)",
                  transition: ".2s ease-out",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {link.label}
              </Link>
            ))}
            <SearchOverlay />
          </nav>

          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
