export const hasProperty = <
  K extends keyof T,
  T extends Record<string, unknown>
>(
  object: T,
  key: K
): boolean => {
  return !!object && Object.prototype.hasOwnProperty.call(object, key)
}
