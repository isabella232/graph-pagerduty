export function reduceGroupById<T>(
  items: T[],
  property: string,
): { [k: string]: T[] } {
  return items.reduce((grouping, item) => {
    for (const itemPropertyValue of item[property]) {
      if (!grouping[itemPropertyValue.id]) grouping[itemPropertyValue.id] = [];
      grouping[itemPropertyValue.id].push(item);
    }

    return grouping;
  }, {} as { [k: string]: T[] });
}
