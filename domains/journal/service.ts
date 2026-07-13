import { journal } from "@/data/journal";
import { getLatest } from "@/lib/content/getLatest";

export const JournalService = {
  latest(limit = 3) { return getLatest(journal, limit); },
  all() { return journal; },
};
