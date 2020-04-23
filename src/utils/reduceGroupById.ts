export function reduceGroupById<T>(items: T[], property: string): unknown {
  return items.reduce((grouping, service) => {
    for (const item of service[property]) {
      if (!grouping[item.id]) grouping[item.id] = [];
      grouping[item.id].push(service);
    }

    return grouping;
  }, {});
}
