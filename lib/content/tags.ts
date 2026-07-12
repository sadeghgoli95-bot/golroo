export function uniqueTags(items: { tags: string[] }[]) {
  return [...new Set(items.flatMap(i => i.tags))];
}
