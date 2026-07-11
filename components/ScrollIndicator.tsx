"use client";

import { useEffect, useState } from "react";

export default function ScrollIndicator() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const scroll = () => {
      setHide(window.scrollY > 120);
    };
    scroll();
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 40,
        bottom: 40,
        opacity: hide ? 0 : 1,
        transition: ".6s",
        fontSize: 12,
        letterSpacing: ".25em",
        color: "var(--text-light)",
      }}
    >
      SCROLL
    </div>
  );
}
