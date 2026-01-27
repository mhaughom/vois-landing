import type { CornerData } from './homography';

const cache = new Map<string, CornerData>();

/**
 * Fetch and cache screen-corners.json.
 *
 * The JSON is an array of N entries (one per frame). Each entry is an array
 * of 4 { x, y } objects (normalized 0–1) in order:
 *   [topLeft, topRight, bottomRight, bottomLeft]
 *
 * @param path  URL to the corners JSON (defaults to phone corners)
 */
export async function loadScreenCorners(
  path = '/frames/phone/screen-corners.json',
): Promise<CornerData> {
  const cached = cache.get(path);
  if (cached) return cached;

  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);

  const data: CornerData = await res.json();
  cache.set(path, data);
  return data;
}
