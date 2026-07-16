"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const RECENT_KEY = "golroo:recent-searches";
const MAX_RECENT = 5;

type Suggestion = {
  title: string;
  slug: { current: string };
  readingTime?: number;
  publishedAt?: string;
  category?: { title: string };
};

type PopularTag = {
  title: string;
  slug: { current: string };
};

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const current = readRecentSearches().filter((item) => item !== trimmed);
  const next = [trimmed, ...current].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export default function SearchOverlay() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSuggestions([]);
    setActiveIndex(-1);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setRecent(readRecentSearches());
    if (popularTags.length === 0) {
      fetch("/api/search/popular-tags")
        .then((res) => res.json())
        .then((data) => setPopularTags(data.tags || []))
        .catch(() => setPopularTags([]));
    }
  }, [popularTags.length]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data.suggestions || []);
          setActiveIndex(-1);
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const submitSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      saveRecentSearch(trimmed);
      close();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [close, router]
  );

  const selectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      saveRecentSearch(query.trim());
      close();
      router.push(`/journal/${suggestion.slug.current}`);
    },
    [close, query, router]
  );

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (!query.trim() || visibleSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % visibleSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? visibleSuggestions.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && visibleSuggestions[activeIndex]) {
        selectSuggestion(visibleSuggestions[activeIndex]);
      } else {
        submitSearch(query);
      }
    }
  }

  function handleTrapFocus(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'input, button, a[href]'
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

  function clearRecent() {
    window.localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  }

  const visibleSuggestions = query.trim() ? suggestions : [];
  const showEmpty = query.trim().length > 0 && visibleSuggestions.length === 0;
  const showIdleLists = query.trim().length === 0;

  return (
    <>
      <button
        type="button"
        className="search-icon-btn"
        onClick={open}
        aria-label="جستجو"
      >
        <SearchIcon />
      </button>

      {isOpen && (
        <>
          <div className="search-overlay-backdrop" onClick={close} />
          <div
            ref={panelRef}
            className="search-overlay-panel"
            role="dialog"
            aria-modal="true"
            aria-label="جستجو"
            onKeyDown={(event) => {
              handleKeyDown(event);
              handleTrapFocus(event);
            }}
          >
            <div className="search-overlay-input-row">
              <SearchIcon />
              <input
                ref={inputRef}
                type="search"
                className="search-overlay-input"
                placeholder="جستجو در ژورنال..."
                aria-label="جستجو در ژورنال"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="button" className="search-overlay-close" onClick={close}>
                بستن (Esc)
              </button>
            </div>

            <div className="search-overlay-body">
              {query.trim() && visibleSuggestions.length > 0 && (
                <div>
                  <p className="search-overlay-section-label">پیشنهادها</p>
                  {visibleSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.slug.current}
                      type="button"
                      className="search-suggestion"
                      data-active={activeIndex === index}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <span className="search-suggestion-title">{suggestion.title}</span>
                      <span className="search-suggestion-meta">
                        {suggestion.category?.title}
                        {suggestion.category?.title && suggestion.readingTime ? " · " : ""}
                        {suggestion.readingTime ? `${suggestion.readingTime} دقیقه مطالعه` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {showEmpty && (
                <p style={{ padding: "1.5rem 1rem", color: "var(--muted)" }}>نتیجه‌ای پیدا نشد.</p>
              )}

              {showIdleLists && recent.length > 0 && (
                <div>
                  <p className="search-overlay-section-label">
                    <span>جستجوهای اخیر</span>
                    <button
                      type="button"
                      onClick={clearRecent}
                      style={{ background: "none", border: "none", color: "var(--caption)", cursor: "pointer", fontSize: ".78rem" }}
                    >
                      پاک کردن
                    </button>
                  </p>
                  {recent.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="search-recent-item"
                      onClick={() => submitSearch(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}

              {showIdleLists && recent.length === 0 && popularTags.length > 0 && (
                <div>
                  <p className="search-overlay-section-label">جستجوهای پرطرفدار</p>
                  {popularTags.map((tag) => (
                    <button
                      key={tag.slug.current}
                      type="button"
                      className="search-recent-item"
                      onClick={() => submitSearch(tag.title)}
                    >
                      {tag.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
