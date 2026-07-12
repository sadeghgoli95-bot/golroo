export function getFeatured<T extends { featured: boolean }>(items: T[]) {
  return items.find(item => item.featured);
}
