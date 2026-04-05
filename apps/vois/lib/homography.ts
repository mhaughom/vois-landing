// ── Types ────────────────────────────────────────────────────────────────────

export interface Point2D {
  x: number;
  y: number;
}

/** Per-frame screen corners: [topLeft, topRight, bottomRight, bottomLeft] */
export type ScreenCorners = [Point2D, Point2D, Point2D, Point2D];

/** Array of per-frame corner data (one ScreenCorners per frame) */
export type CornerData = ScreenCorners[];

// ── Homography solver ────────────────────────────────────────────────────────

/**
 * Compute a 3×3 homography mapping a source quadrilateral to a destination
 * quadrilateral.  Returns 9 elements [h0…h8] in row-major order (h8 = 1).
 *
 *   ┌         ┐ ┌    ┐     ┌    ┐
 *   │ h0 h1 h2│ │ sx │     │ dx │
 *   │ h3 h4 h5│ │ sy │  ~  │ dy │   (up to scale)
 *   │ h6 h7  1│ │  1 │     │  w │
 *   └         ┘ └    ┘     └    ┘
 *
 * Uses Direct Linear Transform with Gaussian elimination on an 8×8 system.
 */
export function computeHomography(
  src: [Point2D, Point2D, Point2D, Point2D],
  dst: [Point2D, Point2D, Point2D, Point2D],
): number[] {
  // Build the 8×9 augmented matrix (8 equations, 8 unknowns + RHS)
  // For each point pair (sx,sy) → (dx,dy):
  //   sx*h0 + sy*h1 + h2  - dx*sx*h6 - dx*sy*h7 = dx
  //   sx*h3 + sy*h4 + h5  - dy*sx*h6 - dy*sy*h7 = dy
  const A: number[][] = [];

  for (let i = 0; i < 4; i++) {
    const { x: sx, y: sy } = src[i];
    const { x: dx, y: dy } = dst[i];

    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy, dx]);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy, dy]);
  }

  // Gaussian elimination with partial pivoting
  const n = 8;
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxVal = Math.abs(A[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      const v = Math.abs(A[row][col]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = row;
      }
    }
    // Swap rows
    if (maxRow !== col) {
      [A[col], A[maxRow]] = [A[maxRow], A[col]];
    }

    const pivot = A[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Degenerate — return identity
      return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }

    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      const factor = A[row][col] / pivot;
      for (let j = col; j <= n; j++) {
        A[row][j] -= factor * A[col][j];
      }
    }
  }

  // Back-substitution
  const h = new Array<number>(8);
  for (let i = n - 1; i >= 0; i--) {
    let sum = A[i][n]; // RHS
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * h[j];
    }
    h[i] = sum / A[i][i];
  }

  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

// ── CSS conversion ───────────────────────────────────────────────────────────

/**
 * Convert a 3×3 homography (row-major, 9 elements) to a CSS matrix3d() string.
 *
 * Embedding into 4×4:
 *   | h0  h1  0  h2 |
 *   | h3  h4  0  h5 |
 *   |  0   0  1   0 |
 *   | h6  h7  0   1 |
 *
 * CSS matrix3d takes column-major order.
 */
export function homographyToCSS(H: number[]): string {
  const [h0, h1, h2, h3, h4, h5, h6, h7] = H;
  // Column-major: col0, col1, col2, col3
  return `matrix3d(${h0},${h3},0,${h6}, ${h1},${h4},0,${h7}, 0,0,1,0, ${h2},${h5},0,1)`;
}

// ── Batch pre-computation ────────────────────────────────────────────────────

/**
 * Pre-compute CSS matrix3d() strings for every frame.
 *
 * @param corners     Per-frame screen corners (normalized 0–1)
 * @param canvasW     Rendered width of the canvas element (CSS pixels)
 * @param canvasH     Rendered height of the canvas element (CSS pixels)
 * @param overlayW    Natural width of the overlay div (e.g. 320)
 * @param overlayH    Natural height of the overlay div (e.g. 650)
 */
export function precomputeMatrices(
  corners: CornerData,
  canvasW: number,
  canvasH: number,
  overlayW: number,
  overlayH: number,
): string[] {
  // Source corners: the overlay rectangle at its natural size
  const src: [Point2D, Point2D, Point2D, Point2D] = [
    { x: 0, y: 0 },
    { x: overlayW, y: 0 },
    { x: overlayW, y: overlayH },
    { x: 0, y: overlayH },
  ];

  return corners.map((frameCornersNorm) => {
    // Convert normalized (0-1) → pixel coordinates relative to canvas
    const dst: [Point2D, Point2D, Point2D, Point2D] = [
      { x: frameCornersNorm[0].x * canvasW, y: frameCornersNorm[0].y * canvasH },
      { x: frameCornersNorm[1].x * canvasW, y: frameCornersNorm[1].y * canvasH },
      { x: frameCornersNorm[2].x * canvasW, y: frameCornersNorm[2].y * canvasH },
      { x: frameCornersNorm[3].x * canvasW, y: frameCornersNorm[3].y * canvasH },
    ];

    const H = computeHomography(src, dst);
    return homographyToCSS(H);
  });
}
