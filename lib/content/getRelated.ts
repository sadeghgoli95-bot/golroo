export function getRelated<T extends { tags: string[] }>(items: T[], tags: string[], limit = 3) {
  return items.filter(item => item.tags.some(tag => tags.includes(tag))).slice(0, limit);
}
