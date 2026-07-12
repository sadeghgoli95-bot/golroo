export function getBySlug<T extends { slug: string }>(items: T[], slug: string) {
  return items.find(item => item.slug === slug);
}
