export function omit<T extends object, K extends [...(keyof T)[]]>(
  obj: T,
  ...keys: K
) {
  const result = {} as {
    [K in keyof T]: T[K];
  };

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !keys.includes(key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  return keys.reduce(
    (result, key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }

      return result;
    },
    {} as Pick<T, K>,
  );
}
