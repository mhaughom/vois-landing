import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  S, EDGE_PAIRS, CUBE_FACES, ISO_X, CUBE_ROT, NODE_SIZE,
  HEX_SPH, HEX_A, HEX_FACE_TRIS,
} from './geometry';
import { interpolate, Easing } from './interpolate';
import { CubeEdge } from './CubeEdge';
import { CubeNode } from './CubeNode';
import { CubeFace } from './CubeFace';
import { Hex3DScene } from './Hex3DScene';

const DOT_END = 1.0;
const HSPLIT_START = 1.0;
const HSPLIT_END = 2.2;
const VSPLIT_START = 1.8;
const VSPLIT_END = 4.0;
const CUBE_SPIN_END = 8.0;
const HEX_MORPH_END = 8.8;
// crossfade removed — hard cut like HABOS logo
const AUTO_ROTATE_SPEED = 0.15;
const FOCUS_LERP_SPEED = 4.0; // how fast the focus rotation interpolates

type Phase = 'dot' | 'split' | 'cube' | 'hex-morph' | 'idle';

function getPhase(t: number): Phase {
  if (t < HSPLIT_START) return 'dot';
  if (t < VSPLIT_END) return 'split';
  if (t < CUBE_SPIN_END) return 'cube';
  if (t < HEX_MORPH_END) return 'hex-morph';
  return 'idle';
}

// Compute the vertices of the cuboctahedron at morph=1
function getHexVerts(): THREE.Vector3[] {
  const a = 1 - 1 * (1 - HEX_A);
  const hr = (a * HEX_SPH) / 2;
  const w = (a * HEX_SPH * Math.sqrt(3)) / 2;
  const d = HEX_SPH * Math.sqrt(Math.max(0, 1 - a * a));
  const cd = 1 * HEX_SPH;
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
}

interface AnimationSceneProps {
  onIntroComplete?: () => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  dragDistRef: React.MutableRefObject<number>;
  dragDeltaQuat: React.MutableRefObject<THREE.Quaternion>;
  lastVelocityQuat: React.MutableRefObject<THREE.Quaternion>;
  focusedTri: number | null;
  onTriClick: (index: number | null) => void;
  onSnapToFace: (index: number) => void;
  onPreviewFace: (index: number) => void;
  onPhaseChange?: (phase: Phase) => void;
  facePointsRef?: React.MutableRefObject<{x: number; y: number}[] | null>;
  muted?: boolean;
}

export const AnimationScene: React.FC<AnimationSceneProps> = ({
  onIntroComplete,
  isDraggingRef,
  dragDistRef,
  dragDeltaQuat,
  lastVelocityQuat,
  focusedTri,
  onTriClick,
  onSnapToFace,
  onPreviewFace,
  onPhaseChange,
  facePointsRef,
  muted,
}) => {
  const elapsedRef = useRef(0);
  const introCompleteRef = useRef(false);
  const autoRotRef = useRef(0);
  const [morph, setMorph] = useState(0);
  const [phase, setPhase] = useState<Phase>('dot');
  const [dotScale, setDotScale] = useState(0);
  const [splitH, setSplitH] = useState(0);
  const [splitV, setSplitV] = useState(0);
  const [cubeRotX, setCubeRotX] = useState(0);
  const [cubeRotY, setCubeRotY] = useState(0);
  const hexGroupRef = useRef<THREE.Group>(null);
  const [dimAmount, setDimAmount] = useState(0);
  const { camera, scene } = useThree();
  const BASE_ZOOM = 160;
  const FOCUS_ZOOM = 220;
  const fogRef = useRef<THREE.Fog | null>(null);
  const localCamDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const [camDirTuple, setCamDirTuple] = useState<[number, number, number]>([0, 0, 1]);
  const wasDraggingRef = useRef(false);

  // Compute target rotation for focused triangle
  const targetQuat = useMemo(() => {
    if (focusedTri === null) return null;
    const verts = getHexVerts();
    const [ai, bi, ci] = HEX_FACE_TRIS[focusedTri];
    const a = verts[ai], b = verts[bi], c = verts[ci];
    const centroid = new THREE.Vector3(
      (a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3,
    );
    const e1 = new THREE.Vector3().subVectors(b, a);
    const e2 = new THREE.Vector3().subVectors(c, a);
    const normal = new THREE.Vector3().crossVectors(e1, e2).normalize();
    if (normal.dot(centroid) < 0) normal.negate();
    return new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
  }, [focusedTri]);

  // Current interpolated quaternion for the hex group
  const currentQuat = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const prevT = elapsedRef.current;
    const t = prevT + dt;
    elapsedRef.current = t;

    const currentPhase = getPhase(t);
    if (currentPhase !== getPhase(prevT) || prevT === 0) {
      setPhase(currentPhase);
      onPhaseChange?.(currentPhase);
    }

    if (currentPhase === 'dot') {
      const ds = interpolate(t, [0, DOT_END], [0, 1], {
        easing: Easing.out(Easing.back(2)),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      });
      setDotScale(ds);
    } else if (currentPhase === 'split') {
      setDotScale(1);
      setSplitH(interpolate(t, [HSPLIT_START, HSPLIT_END], [0, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }));
      setSplitV(interpolate(t, [VSPLIT_START, VSPLIT_END], [0, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }));
    } else if (currentPhase === 'cube') {
      setSplitH(1); setSplitV(1);
      setCubeRotY(interpolate(t, [VSPLIT_END, CUBE_SPIN_END], [0, CUBE_ROT], {
        easing: Easing.inOut(Easing.cubic),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }));
      setCubeRotX(interpolate(t, [VSPLIT_END, CUBE_SPIN_END], [0, ISO_X], {
        easing: Easing.inOut(Easing.cubic),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }));
    } else if (currentPhase === 'hex-morph') {
      setMorph(interpolate(t, [CUBE_SPIN_END, HEX_MORPH_END], [0, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }));
      // Rotate during morph so there's never a stall
      const morphRotSpeed = AUTO_ROTATE_SPEED * 1.5;
      const autoRotY = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), dt * morphRotSpeed,
      );
      const autoRotX = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0), dt * morphRotSpeed * 0.2,
      );
      currentQuat.current.premultiply(autoRotY);
      currentQuat.current.premultiply(autoRotX);
      currentQuat.current.normalize();
      if (hexGroupRef.current) {
        hexGroupRef.current.quaternion.copy(currentQuat.current);
      }
    } else {
      // IDLE
      if (!introCompleteRef.current) {
        introCompleteRef.current = true;
        setMorph(1);
        onIntroComplete?.();
      }

      const isFocused = focusedTri !== null;

      if (isDraggingRef.current) {
        // DRAGGING: apply arcball delta directly to current quaternion
        if (dragDeltaQuat.current.x !== 0 || dragDeltaQuat.current.y !== 0 ||
            dragDeltaQuat.current.z !== 0 || dragDeltaQuat.current.w !== 1) {
          currentQuat.current.premultiply(dragDeltaQuat.current);
          currentQuat.current.normalize();
          dragDeltaQuat.current.identity(); // consumed
        }
      } else if (isFocused && targetQuat) {
        // FOCUSED (not dragging): slerp to target face
        currentQuat.current.slerp(targetQuat, 1 - Math.exp(-FOCUS_LERP_SPEED * dt));
      } else {
        // IDLE: auto-rotate + inertia from last drag
        // Apply inertia (decaying velocity quaternion)
        lastVelocityQuat.current.slerp(new THREE.Quaternion(), 0.05); // decay
        if (Math.abs(1 - lastVelocityQuat.current.w) > 0.0001) {
          currentQuat.current.premultiply(lastVelocityQuat.current);
          currentQuat.current.normalize();
        }
        // Auto-rotate: mostly Y, a bit of X for variety
        const autoRotY = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), dt * AUTO_ROTATE_SPEED,
        );
        const autoRotX = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0), dt * AUTO_ROTATE_SPEED * 0.15,
        );
        currentQuat.current.premultiply(autoRotY);
        currentQuat.current.premultiply(autoRotX);
        currentQuat.current.normalize();
      }

      // Dim amount
      setDimAmount(isFocused
        ? Math.min(1, dimAmount + dt * 3)
        : Math.max(0, dimAmount - dt * 3));

      // Compute camera direction in local space (for per-face scoring)
      const invQuat = currentQuat.current.clone().invert();
      localCamDirRef.current.set(0, 0, 1).applyQuaternion(invQuat);
      const lcd = localCamDirRef.current;
      setCamDirTuple([lcd.x, lcd.y, lcd.z]);

      // Compute best-facing face for preview title + snap
      if (isFocused) {
        const verts = getHexVerts();
        let bestIdx = focusedTri!;
        let bestScore = -Infinity;
        for (let ti = 0; ti < HEX_FACE_TRIS.length; ti++) {
          const [ai, bi, ci] = HEX_FACE_TRIS[ti];
          const a = verts[ai], b = verts[bi], c = verts[ci];
          const cx2 = (a.x + b.x + c.x) / 3;
          const cy2 = (a.y + b.y + c.y) / 3;
          const cz2 = (a.z + b.z + c.z) / 3;
          const e1x = b.x - a.x, e1y = b.y - a.y, e1z = b.z - a.z;
          const e2x = c.x - a.x, e2y = c.y - a.y, e2z = c.z - a.z;
          let nx = e1y * e2z - e1z * e2y;
          let ny = e1z * e2x - e1x * e2z;
          let nz = e1x * e2y - e1y * e2x;
          const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          nx /= nl; ny /= nl; nz /= nl;
          if (nx * cx2 + ny * cy2 + nz * cz2 < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const sc = nx * lcd.x + ny * lcd.y + nz * lcd.z;
          if (sc > bestScore) { bestScore = sc; bestIdx = ti; }
        }
        // Normalize quad partner indices (17→16, 19→18) since those are skipped in render
        if (bestIdx === 17) bestIdx = 16;
        if (bestIdx === 19) bestIdx = 18;
        // Report best face for dynamic title
        onPreviewFace(bestIdx);
        // Snap on drag release (only if it was an actual drag, not a click)
        if (wasDraggingRef.current && !isDraggingRef.current && dragDistRef.current > 8) {
          onSnapToFace(bestIdx);
        }

        // Project face vertices to screen space for HTML panel positioning
        if (facePointsRef) {
          const isQuad = bestIdx === 16 || bestIdx === 18;
          const vertIdxs = isQuad
            ? [...new Set([...HEX_FACE_TRIS[bestIdx], ...HEX_FACE_TRIS[bestIdx + 1]])]
            : [...HEX_FACE_TRIS[bestIdx]];
          const projected = vertIdxs.map(vi => {
            const wp = verts[vi].clone().applyQuaternion(currentQuat.current);
            const ndc = wp.project(camera);
            // NDC → container-relative fraction (canvas has inset -20% -40%)
            return { x: 0.9 * ndc.x + 0.5, y: 0.5 - 0.7 * ndc.y };
          });
          // For quads, sort vertices by angle around centroid for proper polygon winding
          if (projected.length > 3) {
            const pcx = projected.reduce((s, p) => s + p.x, 0) / projected.length;
            const pcy = projected.reduce((s, p) => s + p.y, 0) / projected.length;
            projected.sort((a, b) =>
              Math.atan2(a.y - pcy, a.x - pcx) - Math.atan2(b.y - pcy, b.x - pcx)
            );
          }
          facePointsRef.current = projected;
        }
      } else if (facePointsRef) {
        facePointsRef.current = null;
      }
      wasDraggingRef.current = isDraggingRef.current;

      // Apply rotation
      if (hexGroupRef.current) {
        hexGroupRef.current.quaternion.copy(currentQuat.current);
      }

      // Animate camera zoom
      const targetZoom = focusedTri !== null ? FOCUS_ZOOM : BASE_ZOOM;
      const ortho = camera as THREE.OrthographicCamera;
      ortho.zoom += (targetZoom - ortho.zoom) * (1 - Math.exp(-3 * dt));
      ortho.updateProjectionMatrix();

      // Depth fog: stronger in focus, gentle in idle
      // Camera at z=10, shape radius ~2.3. Focused face ~z=12.3, back face ~z=7.7
      // Fog near must be > 10 (camera) to avoid fogging the focused face
      if (!fogRef.current) {
        fogRef.current = new THREE.Fog('#f8f9fa', 12, 16);
        scene.fog = fogRef.current;
      }
      if (focusedTri !== null) {
        // Focus: fog starts behind the focused face, fully fogs the back
        fogRef.current.near += (8.5 - fogRef.current.near) * (1 - Math.exp(-3 * dt));
        fogRef.current.far += (10.5 - fogRef.current.far) * (1 - Math.exp(-3 * dt));
      } else {
        // Idle: gentle fog — back faces fade slightly
        fogRef.current.near += (9.5 - fogRef.current.near) * (1 - Math.exp(-3 * dt));
        fogRef.current.far += (13 - fogRef.current.far) * (1 - Math.exp(-3 * dt));
      }
    }
  });

  // Cube vertices
  const leftX = interpolate(splitH, [0, 1], [0, -S], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rightX = interpolate(splitH, [0, 1], [0, S], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const topY = interpolate(splitV, [0, 1], [0, S], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bottomY = interpolate(splitV, [0, 1], [0, -S], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cubeVerts = useMemo(() => [
    new THREE.Vector3(leftX, bottomY, -S),
    new THREE.Vector3(leftX, bottomY, S),
    new THREE.Vector3(leftX, topY, -S),
    new THREE.Vector3(leftX, topY, S),
    new THREE.Vector3(rightX, bottomY, -S),
    new THREE.Vector3(rightX, bottomY, S),
    new THREE.Vector3(rightX, topY, -S),
    new THREE.Vector3(rightX, topY, S),
  ], [leftX, rightX, topY, bottomY]);

  const hasArea = splitV > 0.05;
  const showTwoDots = splitH > 0.01;

  // Click on empty space to unfocus
  const handleBackgroundClick = useCallback(() => {
    if (focusedTri !== null) onTriClick(null);
  }, [focusedTri, onTriClick]);

  // --- RENDER ---

  if (phase === 'dot' && !showTwoDots) {
    return (
      <mesh position={[0, 0, S]} scale={[dotScale, dotScale, dotScale]}>
        <sphereGeometry args={[NODE_SIZE, 24, 24]} />
        <meshStandardMaterial color="#1a2744" metalness={0.3} roughness={0.4} />
      </mesh>
    );
  }

  if (phase === 'dot' || phase === 'split' || phase === 'cube') {
    return (
      <group rotation={[cubeRotX, cubeRotY, 0]}>
        {EDGE_PAIRS.map(([i, j], idx) => (
          <CubeEdge key={idx} a={cubeVerts[i]} b={cubeVerts[j]} />
        ))}
        {cubeVerts.map((v, i) => (
          <CubeNode key={i} pos={v} />
        ))}
        {hasArea &&
          CUBE_FACES.map((face, idx) => (
            <CubeFace
              key={idx}
              a={cubeVerts[face.verts[0]]}
              b={cubeVerts[face.verts[1]]}
              c={cubeVerts[face.verts[2]]}
              d={cubeVerts[face.verts[3]]}
            />
          ))}
      </group>
    );
  }

  // hex-morph and idle both use the same hexGroupRef for continuous rotation
  const isHexPhase = phase === 'hex-morph' || phase === 'idle';
  if (isHexPhase) {
    return (
      <group ref={hexGroupRef}>
        <Hex3DScene
          rotationX={0}
          rotationY={0}
          morph={phase === 'idle' ? 1 : morph}
          focusedTri={phase === 'idle' ? focusedTri : null}
          isDragging={phase === 'idle' ? isDraggingRef.current : false}
          camDirTuple={phase === 'idle' ? camDirTuple : undefined}
          onTriClick={phase === 'idle' ? onTriClick : undefined}
          muted={muted}
        />
      </group>
    );
  }
};
