/** Input is the raw Markdown body slice already isolated by parseArticle (metadata and FAQ/Sources sections excluded). */
export function extractBody(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}
