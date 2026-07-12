export function search(query: string, items: any[]) {
  const q = query.toLowerCase();
  return items.filter(
    item =>
      item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q)
  );
}
