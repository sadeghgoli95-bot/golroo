import { Metadata } from "next";

export function generateMetadata(title: string, description: string): Metadata {
  return { title, description };
}
