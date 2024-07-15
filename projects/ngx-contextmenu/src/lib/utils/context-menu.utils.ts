export function evaluateIfFunction<T, TItem>(value: T | ((state: TItem) => T), item: TItem): T {
  return value instanceof Function ? value(item) : value;
}
