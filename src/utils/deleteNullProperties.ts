export function deleteNullProperties(obj: object): object {
  const props = Object.getOwnPropertyNames(obj);

  for (const prop of props) {
    if (obj[prop] === null || obj[prop] === undefined) {
      delete obj[prop];
    }
  }
  return obj;
}
