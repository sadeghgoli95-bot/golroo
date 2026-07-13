"use client";

import { useMemo, useState } from "react";
import { journal } from "@/data/journal";
import { search } from "@/lib/content/search";
import SearchBox from "@/components/Search/SearchBox";
import JournalCard from "@/components/Journal/JournalCard";
import EmptySearch from "@/components/Search/EmptySearch";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    if (!query) return [];
    return search(query, journal);
  }, [query]);

  return (
    <main className="editorial-space">
      <div className="container">
        <SearchBox value={query} onChange={setQuery} />
        <div style={{ height: 48 }} />
        {items.length
          ? items.map(item => <JournalCard key={item.id} item={item} />)
          : query && <EmptySearch />
        }
      </div>
    </main>
  );
}
