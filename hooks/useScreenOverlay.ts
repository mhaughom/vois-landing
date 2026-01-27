import { useState, useEffect, useRef, useCallback } from 'react';
import { loadScreenCorners } from '../lib/screenCorners';
import { precomputeMatrices } from '../lib/homography';
import type { CornerData } from '../lib/homography';

interface UseScreenOverlayOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  overlayWidth: number;  // natural size of overlay div (e.g. 320)
  overlayHeight: number; // natural size of overlay div (e.g. 650)
  cornersPath?: string;  // URL to screen-corners.json (defaults to phone)
}

interface UseScreenOverlayResult {
  /** true once corner data is loaded and matrices are computed */
  ready: boolean;
  /** CSS matrix3d() string for a given frame index */
  getTransform: (frameIndex: number) => string;
  /** Rendered dimensions of the canvas element (CSS pixels) */
  canvasBounds: { width: number; height: number } | null;
}

export function useScreenOverlay({
  canvasRef,
  overlayWidth,
  overlayHeight,
  cornersPath,
}: UseScreenOverlayOptions): UseScreenOverlayResult {
  const [ready, setReady] = useState(false);
  const [canvasBounds, setCanvasBounds] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const cornersRef = useRef<CornerData | null>(null);
  const matricesRef = useRef<string[]>([]);

  // Recompute all 60 matrices from current canvas size
  const recompute = useCallback(() => {
    const canvas = canvasRef.current;
    const corners = cornersRef.current;
    if (!canvas || !corners) return;

    // Use offsetWidth/Height (CSS layout size) instead of getBoundingClientRect
    // to avoid double-scaling when an ancestor has a CSS transform (e.g. scale).
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w === 0 || h === 0) return;

    setCanvasBounds({ width: w, height: h });
    matricesRef.current = precomputeMatrices(
      corners,
      w,
      h,
      overlayWidth,
      overlayHeight,
    );
    setReady(true);
  }, [canvasRef, overlayWidth, overlayHeight]);

  // Load corner data once
  useEffect(() => {
    loadScreenCorners(cornersPath)
      .then((corners) => {
        cornersRef.current = corners;
        recompute();
      })
      .catch((err) => {
        console.warn('Screen overlay disabled — could not load corner data:', err);
      });
  }, [recompute, cornersPath]);

  // Re-compute on canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => recompute());
    observer.observe(canvas);
    recompute(); // initial

    return () => observer.disconnect();
  }, [canvasRef, recompute]);

  const getTransform = useCallback(
    (frameIndex: number): string => {
      if (matricesRef.current.length === 0) return 'none';
      const idx = Math.max(0, Math.min(matricesRef.current.length - 1, frameIndex));
      return matricesRef.current[idx];
    },
    [],
  );

  return { ready, getTransform, canvasBounds };
}
