export function getLatest<T extends { createdAt: string }>(items: T[], limit = 3) {
  return [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
