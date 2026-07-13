import { observations } from "@/data/observations";
import { getLatest } from "@/lib/content/getLatest";

export const ObservationService = {
  latest(limit = 6) { return getLatest(observations, limit); },
  all() { return observations; },
};
