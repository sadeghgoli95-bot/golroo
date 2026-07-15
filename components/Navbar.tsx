"use client";

import Link from "next/link";
import Container from "./Container";

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
        background: "color-mix(in srgb, var(--bg) 82%, transparent)",
        borderBottom: "1px solid var(--divider)",
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
          <nav style={{ display: "flex", gap: 42, fontSize: 15 }}>
            {[
              ["درباره", "#about"],
              ["خدمات", "#services"],
              ["شیوه کار", "#philosophy"],
              ["ارتباط", "#contact"],
            ].map(([title, href]) => (
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
          </nav>
        </div>
      </Container>
    </header>
  );
}
