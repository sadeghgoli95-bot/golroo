import { BaseContent } from "./content";

export interface Observation extends BaseContent {
  category: "Attachment" | "Emotion" | "Relationship" | "Parenting";
}
