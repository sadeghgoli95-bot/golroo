import { journal } from "@/data/journal";
import JournalCard from "./JournalCard";

export default function JournalGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "2rem" }}>
      {journal.map(item => (
        <JournalCard key={item.id} item={item} />
      ))}
    </div>
  );
}
