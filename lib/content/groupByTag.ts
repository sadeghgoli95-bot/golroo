export function groupByTag<T extends { tags: string[] }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    item.tags.forEach(tag => {
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(item);
    });
    return acc;
  }, {});
}
