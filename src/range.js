// Takes a number "n" and maps it from the range [a, b] to the range [c, d]
export function mapRange(n, a, b, c, d) {
  return (n - a) * (d - c) / (b - a) + c;
}

export function mapRangeClamp(n, a, b, c, d) {
  const m = mapRange(n, a, b, c, d);

  if (c < d) {
    return Math.min(Math.max(m, c), d);
  }

  return Math.max(Math.min(m, c), d);
}
