import { notFound } from "next/navigation";

type Props = {
  params: { topic: string; slug: string };
};

// Orphaned route: no UI links here, and its content was hardcoded/
// placeholder (params.slug was never actually used). Disabled via
// notFound() — the branded not-found.tsx — until it's wired to real
// content.
export default function ArticlePage(_props: Props) {
  notFound();
}
