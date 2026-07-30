/** Max display weight for supporter name (half-width = 1, CJK / full-width = 2). */
export const NAME_WEIGHT_MAX = 40;

/**
 * Weight of a name string: code points ≤ U+00FF count as 1,
 * everything else (CJK, full-width symbols, etc.) as 2.
 * Iterates by code point so surrogate pairs are handled correctly.
 */
export function getNameWeight(str: string): number {
  let weight = 0;
  for (const char of str) {
    weight += (char.codePointAt(0) ?? 0) > 0xff ? 2 : 1;
  }
  return weight;
}

/** Longest prefix of `str` whose weight is ≤ `maxWeight`. */
export function truncateNameByWeight(
  str: string,
  maxWeight: number = NAME_WEIGHT_MAX,
): string {
  let weight = 0;
  let result = "";
  for (const char of str) {
    const w = (char.codePointAt(0) ?? 0) > 0xff ? 2 : 1;
    if (weight + w > maxWeight) break;
    weight += w;
    result += char;
  }
  return result;
}
