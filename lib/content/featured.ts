export function featured<T extends { featured: boolean }>(items: T[]) {
  return items.filter(item => item.featured);
}
