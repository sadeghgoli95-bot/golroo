export function search<T extends { title: string; excerpt: string }>(
  query: string,
  items: T[]
) {
  const q = query.toLowerCase();
  return items.filter(
    item =>
      item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q)
  );
}
