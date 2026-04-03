import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HEX_SPH, HEX_A, HEX3D_EDGES, HEX_FACE_TRIS, getTriGroup } from './geometry';
import { CubeEdge } from './CubeEdge';
import { CubeNode } from './CubeNode';

// ── Helpers: build face geometry once per morph change ──────────────────────

function buildFaceGeometry(
  verts: THREE.Vector3[],
  faceData: { centroid: THREE.Vector3; normal: THREE.Vector3; localUp: THREE.Vector3 }[],
  idx: number,
): THREE.BufferGeometry {
  const [ai, bi, ci] = HEX_FACE_TRIS[idx];
  const isQuad = idx === 16 || idx === 18;
  const partnerIdx = isQuad ? idx + 1 : -1;

  const { centroid, normal, localUp } = faceData[idx];
  const localRight = new THREE.Vector3().crossVectors(localUp, normal).normalize();

  const projectUV = (v: THREE.Vector3): [number, number] => {
    const d = new THREE.Vector3().subVectors(v, centroid);
    return [d.dot(localRight), d.dot(localUp)];
  };

  let positions: Float32Array;
  let rawUVs: [number, number][];
  if (isQuad) {
    const [ai2, bi2, ci2] = HEX_FACE_TRIS[partnerIdx];
    positions = new Float32Array([
      verts[ai].x, verts[ai].y, verts[ai].z,
      verts[bi].x, verts[bi].y, verts[bi].z,
      verts[ci].x, verts[ci].y, verts[ci].z,
      verts[ai2].x, verts[ai2].y, verts[ai2].z,
      verts[bi2].x, verts[bi2].y, verts[bi2].z,
      verts[ci2].x, verts[ci2].y, verts[ci2].z,
    ]);
    rawUVs = [
      projectUV(verts[ai]), projectUV(verts[bi]), projectUV(verts[ci]),
      projectUV(verts[ai2]), projectUV(verts[bi2]), projectUV(verts[ci2]),
    ];
  } else {
    const a = verts[ai], b = verts[bi], c = verts[ci];
    positions = new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z]);
    rawUVs = [projectUV(a), projectUV(b), projectUV(c)];
  }

  // Normalize UVs with "cover" crop (preserve 16:9 video aspect ratio)
  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
  for (const [u, v] of rawUVs) {
    minU = Math.min(minU, u); maxU = Math.max(maxU, u);
    minV = Math.min(minV, v); maxV = Math.max(maxV, v);
  }
  const rangeU = maxU - minU || 1;
  const rangeV = maxV - minV || 1;
  const VIDEO_AR = 16 / 9;
  const faceAR = rangeU / rangeV;
  const centerU = (minU + maxU) / 2;
  const centerV = (minV + maxV) / 2;
  let scaleU: number, scaleV: number;
  if (faceAR > VIDEO_AR) {
    scaleU = rangeU;
    scaleV = rangeU / VIDEO_AR;
  } else {
    scaleV = rangeV;
    scaleU = rangeV * VIDEO_AR;
  }
  const uvs = new Float32Array(rawUVs.length * 2);
  for (let i = 0; i < rawUVs.length; i++) {
    uvs[i * 2] = (rawUVs[i][0] - centerU) / scaleU + 0.5;
    uvs[i * 2 + 1] = (rawUVs[i][1] - centerV) / scaleV + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

// ── Component ──────────────────────────────────────────────────────────────

export const Hex3DScene: React.FC<{
  rotationX: number;
  rotationY: number;
  morph: number;
  glassOpacity?: number;
  focusedTri?: number | null;
  isDragging?: boolean;
  camDirTuple?: [number, number, number];
  onTriClick?: (index: number) => void;
  muted?: boolean;
}> = ({
  rotationX, rotationY, morph,
  glassOpacity = 0.18,
  focusedTri = null, isDragging = false, camDirTuple, onTriClick, muted = true,
}) => {
  const verts = useMemo(() => {
    const a = 1 - morph * (1 - HEX_A);
    const hr = (a * HEX_SPH) / 2;
    const w = (a * HEX_SPH * Math.sqrt(3)) / 2;
    const d = HEX_SPH * Math.sqrt(Math.max(0, 1 - a * a));
    const cd = morph * HEX_SPH;
    return [
      new THREE.Vector3(0, HEX_SPH, 0),
      new THREE.Vector3(0, -HEX_SPH, 0),
      new THREE.Vector3(w, hr, d),
      new THREE.Vector3(w, hr, -d),
      new THREE.Vector3(w, -hr, d),
      new THREE.Vector3(w, -hr, -d),
      new THREE.Vector3(-w, -hr, d),
      new THREE.Vector3(-w, -hr, -d),
      new THREE.Vector3(-w, hr, d),
      new THREE.Vector3(-w, hr, -d),
      new THREE.Vector3(0, 0, cd),
      new THREE.Vector3(0, 0, -cd),
    ];
  }, [morph]);

  // Compute focused group and vertex set from focusedTri
  const focusedTris = useMemo(() => {
    if (focusedTri === null) return null;
    return new Set(getTriGroup(focusedTri));
  }, [focusedTri]);

  const isFocusMode = focusedTri !== null;

  const focusedVertSet = useMemo(() => {
    if (!focusedTris) return null;
    const s = new Set<number>();
    focusedTris.forEach(ti => {
      const [ai, bi, ci] = HEX_FACE_TRIS[ti];
      s.add(ai); s.add(bi); s.add(ci);
    });
    return s;
  }, [focusedTris]);

  // Precompute per-face normals, centroids, and local "up" direction
  const faceData = useMemo(() => {
    return HEX_FACE_TRIS.map(([ai, bi, ci]) => {
      const a = verts[ai], b = verts[bi], c = verts[ci];
      const centroid = new THREE.Vector3(
        (a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3,
      );
      const e1 = new THREE.Vector3().subVectors(b, a);
      const e2 = new THREE.Vector3().subVectors(c, a);
      const normal = new THREE.Vector3().crossVectors(e1, e2).normalize();
      if (normal.dot(centroid) < 0) normal.negate();
      const viewQuat = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
      const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(viewQuat.clone().invert());
      return { centroid, normal, localUp };
    });
  }, [verts]);

  // ── Memoized face geometries — rebuilt only when morph changes ────────
  const faceGeometries = useMemo(() => {
    const geos: (THREE.BufferGeometry | null)[] = [];
    for (let i = 0; i < HEX_FACE_TRIS.length; i++) {
      // Skip second triangle of quad pairs — handled by the first
      if (i === 17 || i === 19) {
        geos.push(null);
      } else {
        geos.push(buildFaceGeometry(verts, faceData, i));
      }
    }
    return geos;
  }, [verts, faceData]);

  // Dispose old geometries when they're replaced
  const prevGeosRef = useRef<(THREE.BufferGeometry | null)[]>([]);
  useEffect(() => {
    const prev = prevGeosRef.current;
    // Dispose previous set if it's different
    if (prev.length && prev !== faceGeometries) {
      prev.forEach(g => g?.dispose());
    }
    prevGeosRef.current = faceGeometries;
    return () => {
      // Final cleanup on unmount
      faceGeometries.forEach(g => g?.dispose());
    };
  }, [faceGeometries]);

  // Per-face camera-facing score (0 = facing away, 1 = facing camera)
  const faceScores = useMemo(() => {
    if (!camDirTuple) return null;
    const [cx, cy, cz] = camDirTuple;
    return faceData.map(({ normal }) => Math.max(0, normal.x * cx + normal.y * cy + normal.z * cz));
  }, [faceData, camDirTuple]);

  // Best-facing face (normalized: quad partners 17→16, 19→18)
  const bestFaceIdx = useMemo(() => {
    if (!faceScores) return -1;
    let best = -1, bestScore = -1;
    faceScores.forEach((s, i) => { if (s > bestScore) { bestScore = s; best = i; } });
    if (best === 17) best = 16;
    if (best === 19) best = 18;
    return best;
  }, [faceScores]);

  // Smooth focus factor: 1.0 when settled on a face, lower during drag
  const smoothFocus = useRef(0);
  const focusTarget = isFocusMode && !isDragging ? 1 : 0;
  smoothFocus.current += (focusTarget - smoothFocus.current) * 0.045;
  const focus = smoothFocus.current;

  // Per-vertex score: blend between smooth (all faces) and focused (best face only)
  const vertScores = useMemo(() => {
    if (!faceScores || bestFaceIdx < 0) return null;
    const smooth = new Float32Array(verts.length);
    HEX_FACE_TRIS.forEach(([ai, bi, ci], idx) => {
      const s = faceScores[idx];
      smooth[ai] = Math.max(smooth[ai], s);
      smooth[bi] = Math.max(smooth[bi], s);
      smooth[ci] = Math.max(smooth[ci], s);
    });
    const focused = new Float32Array(verts.length);
    const bestTris = (bestFaceIdx === 16 || bestFaceIdx === 18)
      ? [bestFaceIdx, bestFaceIdx + 1]
      : [bestFaceIdx];
    bestTris.forEach(ti => {
      const [ai, bi, ci] = HEX_FACE_TRIS[ti];
      focused[ai] = 1;
      focused[bi] = 1;
      focused[ci] = 1;
    });
    const blended = new Float32Array(verts.length);
    for (let i = 0; i < verts.length; i++) {
      blended[i] = smooth[i] * (1 - focus * 0.6) + focused[i] * focus * 0.6;
    }
    return blended;
  }, [faceScores, bestFaceIdx, verts.length, focus]);

  // ── Per-face video textures (each face gets its own video at a staggered time) ──
  const faceVideosRef = useRef<Map<number, { video: HTMLVideoElement; texture: THREE.VideoTexture }>>(new Map());
  const smoothVideoOpacity = useRef(0);
  const smoothVolume = useRef(0);
  const perFaceOpacity = useRef(new Float32Array(HEX_FACE_TRIS.length));
  const lastFocusedFaceRef = useRef<number | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const src = isMobile ? '/videos/Situations-mobile.mp4' : '/videos/Situations-with-cards.mp4';
    const map = faceVideosRef.current;

    // Rendered face indices (skip 17, 19 — quad partners handled by 16, 18)
    const rendered = HEX_FACE_TRIS.map((_, i) => i).filter(i => i !== 17 && i !== 19);

    rendered.forEach((faceIdx, order) => {
      const v = document.createElement('video');
      v.src = src;
      v.crossOrigin = 'anonymous';
      v.loop = true;
      v.muted = true; // must be muted for autoplay
      v.playsInline = true;
      v.volume = 0;
      v.preload = 'auto';

      const tex = new THREE.VideoTexture(v);
      tex.colorSpace = THREE.SRGBColorSpace;
      map.set(faceIdx, { video: v, texture: tex });

      // Stagger start times so each face shows a different frame
      v.addEventListener('loadedmetadata', () => {
        if (v.duration && isFinite(v.duration)) {
          v.currentTime = (order / rendered.length) * v.duration;
        }
      }, { once: true });

      v.play().catch(() => {});
    });

    return () => {
      map.forEach(({ video, texture }) => {
        video.pause();
        video.removeAttribute('src');
        video.load();
        texture.dispose();
      });
      map.clear();
    };
  }, []);

  // Restart video when clicking a new face, continue if same face
  useEffect(() => {
    const normalizedFocus = focusedTri === 17 ? 16 : focusedTri === 19 ? 18 : focusedTri;
    const normalizedLast = lastFocusedFaceRef.current;

    if (normalizedFocus !== null && normalizedFocus !== normalizedLast) {
      const entry = faceVideosRef.current.get(normalizedFocus);
      if (entry) {
        entry.video.currentTime = 0;
        entry.video.play().catch(() => {});
      }
    }
    lastFocusedFaceRef.current = normalizedFocus;
  }, [focusedTri]);

  const bestScore = faceScores && bestFaceIdx >= 0 ? faceScores[bestFaceIdx] : 0;

  // Focus mode: single best face, tight threshold
  const targetVideoOpacity = Math.max(0, Math.min(1, (bestScore - 0.82) / 0.16));
  smoothVideoOpacity.current += (targetVideoOpacity - smoothVideoOpacity.current) * 0.12;
  const videoOpacity = smoothVideoOpacity.current;

  // Idle mode: per-face video opacity — lower threshold, slower fade, multiple visible
  if (faceScores) {
    const pf = perFaceOpacity.current;
    for (let i = 0; i < faceScores.length; i++) {
      const s = faceScores[i];
      const target = Math.max(0, Math.min(1, (s - 0.72) / 0.20));
      pf[i] += (target - pf[i]) * 0.04;
    }
  }

  // Audio fade — only on the focused face's video, mute all others
  const normalizedFocusFace = focusedTri === 17 ? 16 : focusedTri === 19 ? 18 : focusedTri;
  const targetVolume = (!muted && isFocusMode) ? Math.min(1, videoOpacity * 0.8) : 0;
  smoothVolume.current += (targetVolume - smoothVolume.current) * 0.03;
  faceVideosRef.current.forEach((entry, faceIdx) => {
    if (faceIdx === normalizedFocusFace && isFocusMode && !muted) {
      entry.video.muted = false;
      entry.video.volume = Math.max(0, Math.min(1, smoothVolume.current));
    } else {
      if (!entry.video.muted) entry.video.muted = true;
      entry.video.volume = 0;
    }
  });

  // Smooth per-edge and per-node opacities for eased transitions
  const smoothEdgeOpacities = useRef<Float32Array>(new Float32Array(HEX3D_EDGES.length).fill(1));
  const smoothNodeOpacities = useRef<Float32Array>(new Float32Array(verts.length).fill(1));
  const lerpRate = 0.04;

  HEX3D_EDGES.forEach(([i, j], idx) => {
    let target = 1;
    if (isFocusMode && vertScores) {
      const edgeScore = Math.min(vertScores[i], vertScores[j]);
      target = Math.max(0.03, edgeScore);
    }
    smoothEdgeOpacities.current[idx] += (target - smoothEdgeOpacities.current[idx]) * lerpRate;
  });

  verts.forEach((_, i) => {
    let target = 1;
    if (isFocusMode && vertScores) {
      target = Math.max(0.03, vertScores[i]);
    }
    smoothNodeOpacities.current[i] += (target - smoothNodeOpacities.current[i]) * lerpRate;
  });

  return (
    <group rotation={[rotationX, rotationY, 0]}>
      {/* Edges */}
      {HEX3D_EDGES.map(([i, j], idx) => {
        return <CubeEdge key={idx} a={verts[i]} b={verts[j]} opacity={smoothEdgeOpacities.current[idx]} />;
      })}

      {/* Nodes */}
      {verts.map((v, i) => {
        return <CubeNode key={i} pos={v} opacity={smoothNodeOpacities.current[i]} />;
      })}

      {/* Faces */}
      {faceGeometries.map((geo, idx) => {
        if (!geo) return null;

        const isQuad = idx === 16 || idx === 18;
        const partnerIdx = isQuad ? idx + 1 : -1;

        const score = faceScores
          ? (isQuad ? Math.max(faceScores[idx], faceScores[partnerIdx]) : faceScores[idx])
          : 0;

        const isBestFace = idx === bestFaceIdx || (isQuad && partnerIdx === bestFaceIdx);

        let faceOpacity = glassOpacity;
        if (isFocusMode) {
          const smoothOpacity = 0.03 + score * 0.27;
          const focusedOpacity = isBestFace ? 0 : 0.04;
          faceOpacity = smoothOpacity * (1 - focus * 0.7) + focusedOpacity * focus * 0.7;
        }

        const faceVideoOpacity = isFocusMode
          ? (isBestFace ? Math.min(1, videoOpacity / 0.8) : 0)
          : (isQuad
            ? Math.max(perFaceOpacity.current[idx], perFaceOpacity.current[partnerIdx])
            : perFaceOpacity.current[idx]);
        const faceEntry = faceVideosRef.current.get(idx);
        const showVideo = faceEntry?.texture && faceVideoOpacity > 0.01;

        return (
          <group key={idx}>
            <mesh
              geometry={geo}
              onClick={(e) => { e.stopPropagation(); onTriClick?.(idx); }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = ''; }}
            >
              <meshPhysicalMaterial
                color={isFocusMode && isBestFace ? '#a5b4fc' : '#b8c4d8'}
                transparent
                opacity={faceOpacity}
                roughness={0.4}
                metalness={0.1}
                clearcoat={0.8}
                clearcoatRoughness={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            {showVideo && (
              <>
                {/* Lit video — fades out as focus increases */}
                <mesh geometry={geo} renderOrder={1}>
                  <meshStandardMaterial
                    map={faceEntry!.texture}
                    transparent
                    opacity={faceVideoOpacity * (1 - (isBestFace ? focus : 0))}
                    side={THREE.DoubleSide}
                    roughness={0.3}
                    metalness={0.05}
                    depthWrite={false}
                    fog={false}
                  />
                </mesh>
                {/* True-color video — fades in as focus increases */}
                {isBestFace && focus > 0.01 && (
                  <mesh geometry={geo} renderOrder={2}>
                    <meshBasicMaterial
                      map={faceEntry!.texture}
                      transparent
                      opacity={faceVideoOpacity * focus}
                      side={THREE.DoubleSide}
                      depthWrite={false}
                      fog={false}
                      toneMapped={false}
                    />
                  </mesh>
                )}
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};
