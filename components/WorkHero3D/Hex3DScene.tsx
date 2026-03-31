import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HEX_SPH, HEX_A, HEX3D_EDGES, HEX_FACE_TRIS, getTriGroup } from './geometry';
import { CubeEdge } from './CubeEdge';
import { CubeNode } from './CubeNode';

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
      // Local up: the direction on the face that maps to screen-up when viewed head-on
      // viewQuat rotates normal → (0,0,1); inverse maps screen-up (0,1,0) back to face space
      const viewQuat = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
      const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(viewQuat.clone().invert());
      return { centroid, normal, localUp };
    });
  }, [verts]);

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
  smoothFocus.current += (focusTarget - smoothFocus.current) * 0.08;
  const focus = smoothFocus.current; // 0 = smooth/dragging, 1 = focused/settled

  // Per-vertex score: blend between smooth (all faces) and focused (best face only)
  const vertScores = useMemo(() => {
    if (!faceScores || bestFaceIdx < 0) return null;
    // Smooth scores: max face score per vertex (original approach)
    const smooth = new Float32Array(verts.length);
    HEX_FACE_TRIS.forEach(([ai, bi, ci], idx) => {
      const s = faceScores[idx];
      smooth[ai] = Math.max(smooth[ai], s);
      smooth[bi] = Math.max(smooth[bi], s);
      smooth[ci] = Math.max(smooth[ci], s);
    });
    // Focused scores: only best face vertices = 1
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
    // Blend: during drag use smooth, settled use midpoint of smooth & focused
    const blended = new Float32Array(verts.length);
    for (let i = 0; i < verts.length; i++) {
      blended[i] = smooth[i] * (1 - focus * 0.6) + focused[i] * focus * 0.6;
    }
    return blended;
  }, [faceScores, bestFaceIdx, verts.length, focus]);

  // Video texture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTexRef = useRef<THREE.VideoTexture | null>(null);
  const smoothVideoOpacity = useRef(0); // global (focus mode)
  const smoothVolume = useRef(0); // separate slower fade for audio
  const perFaceOpacity = useRef(new Float32Array(HEX_FACE_TRIS.length)); // per-face (idle)

  useEffect(() => {
    const v = document.createElement('video');
    v.src = '/videos/Situations-with-cards.mp4';
    v.crossOrigin = 'anonymous';
    v.loop = true;
    v.muted = false;
    v.playsInline = true;
    v.volume = 0;
    videoRef.current = v;
    const tex = new THREE.VideoTexture(v);
    tex.colorSpace = THREE.SRGBColorSpace;
    videoTexRef.current = tex;
    return () => { v.pause(); v.src = ''; };
  }, []);

  // Always play video (shows on best-facing face in both idle and focus mode)
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

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
      // Starts at 0.72, full at 0.92
      const target = Math.max(0, Math.min(1, (s - 0.72) / 0.20));
      // Slower smoothing for gentle ease in/out
      pf[i] += (target - pf[i]) * 0.04;
    }
  }

  // Audio fade — slower than video fade, respects mute
  const targetVolume = (!muted && isFocusMode) ? Math.min(1, videoOpacity * 0.8) : 0;
  smoothVolume.current += (targetVolume - smoothVolume.current) * 0.03;
  if (videoRef.current) {
    videoRef.current.volume = Math.max(0, Math.min(1, smoothVolume.current));
  }

  return (
    <group rotation={[rotationX, rotationY, 0]}>
      {/* Edges */}
      {HEX3D_EDGES.map(([i, j], idx) => {
        let opacity = 1;
        if (isFocusMode && vertScores) {
          const edgeScore = Math.min(vertScores[i], vertScores[j]);
          opacity = Math.max(0.03, edgeScore);
        }
        return <CubeEdge key={idx} a={verts[i]} b={verts[j]} opacity={opacity} />;
      })}

      {/* Nodes */}
      {verts.map((v, i) => {
        let opacity = 1;
        if (isFocusMode && vertScores) {
          opacity = Math.max(0.03, vertScores[i]);
        }
        return <CubeNode key={i} pos={v} opacity={opacity} />;
      })}

      {/* Faces — quad pairs (16+17, 18+19) rendered as rectangles, rest as triangles */}
      {HEX_FACE_TRIS.map(([ai, bi, ci], idx) => {
        // Skip second triangle of quad pairs — handled by the first
        if (idx === 17 || idx === 19) return null;

        const isQuad = idx === 16 || idx === 18;
        const partnerIdx = isQuad ? idx + 1 : -1;
        const group = getTriGroup(idx);

        const { centroid, normal, localUp } = faceData[idx];
        // Local coordinate system for UV projection (aligns video "up" with localUp)
        const localRight = new THREE.Vector3().crossVectors(localUp, normal).normalize();

        // Helper: project a vertex onto face-local UV space
        const projectUV = (v: THREE.Vector3): [number, number] => {
          const d = new THREE.Vector3().subVectors(v, centroid);
          return [d.dot(localRight), d.dot(localUp)];
        };

        // Build geometry: quad (2 tris) or single tri
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
          positions = new Float32Array([
            a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z,
          ]);
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
        // Scale so video covers face without stretching
        let scaleU: number, scaleV: number;
        if (faceAR > VIDEO_AR) {
          // Face wider than video → fit width, crop height
          scaleU = rangeU;
          scaleV = rangeU / VIDEO_AR;
        } else {
          // Face taller than video → fit height, crop width
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
        // For quads, average the scores of both triangles
        const score = faceScores
          ? (isQuad ? Math.max(faceScores[idx], faceScores[partnerIdx]) : faceScores[idx])
          : 0;

        // Is this the single best-facing face (or its quad partner)?
        const isBestFace = idx === bestFaceIdx || (isQuad && partnerIdx === bestFaceIdx);

        // Blend face opacity: smooth during drag, more focused when settled
        // Smooth: all faces visible proportional to score
        // Focused: best face bright, others dim (but not invisible)
        let faceOpacity = glassOpacity;
        if (isFocusMode) {
          const smoothOpacity = 0.03 + score * 0.27;
          const focusedOpacity = isBestFace ? 0.22 + score * 0.08 : 0.04;
          faceOpacity = smoothOpacity * (1 - focus * 0.7) + focusedOpacity * focus * 0.7;
        }

        // labelPos/textQuat/textOpacity removed — no face labels

        // Video: in focus mode only on best face, in idle on any face with enough score
        const faceVideoOpacity = isFocusMode
          ? (isBestFace ? videoOpacity : 0)
          : (isQuad
            ? Math.max(perFaceOpacity.current[idx], perFaceOpacity.current[partnerIdx])
            : perFaceOpacity.current[idx]);
        const showVideo = videoTexRef.current && faceVideoOpacity > 0.01;

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
            {/* Video overlay */}
            {showVideo && (
              <mesh geometry={geo} position={[0, 0, 0]} renderOrder={1}>
                <meshStandardMaterial
                  map={videoTexRef.current}
                  transparent
                  opacity={faceVideoOpacity}
                  side={THREE.DoubleSide}
                  roughness={0.3}
                  metalness={0.05}
                  depthWrite={false}
                />
              </mesh>
            )}


          </group>
        );
      })}
    </group>
  );
};
