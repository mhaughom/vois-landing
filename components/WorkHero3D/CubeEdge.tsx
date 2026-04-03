import React, { useMemo } from 'react';
import * as THREE from 'three';
import { NODE_SIZE } from './geometry';

// Bone-shaped edge: radius = NODE_SIZE at each endpoint, tapers to near-zero at center.
// The diameter where it meets the sphere matches the sphere exactly → seamless joint.
export const CubeEdge: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; opacity?: number }> = ({
  a,
  b,
  opacity = 1,
}) => {
  const { mid, quat, length } = useMemo(() => {
    const m = new THREE.Vector3().lerpVectors(a, b, 0.5);
    const dir = new THREE.Vector3().subVectors(b, a);
    const l = dir.length();
    dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir,
    );
    return { mid: m, quat: q, length: l };
  }, [a, b]);

  const geo = useMemo(() => {
    if (length < 0.001) return null;
    const nSegs = 16;
    const minR = 0.03;
    const maxR = NODE_SIZE * 0.6;
    const innerZone = 0.08;
    const power = 3.0;
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= nSegs; i++) {
      const t = i / nSegs;
      const dist = Math.abs(t - 0.5); // 0 at center, 0.5 at tips
      const zone = Math.max(0, (dist - innerZone) / (0.5 - innerZone)); // 0 in flat zone, 1 at tip
      const r = minR + (maxR - minR) * Math.pow(zone, power);
      points.push(new THREE.Vector2(r, (t - 0.5) * length));
    }
    return new THREE.LatheGeometry(points, 12);
  }, [length]);

  if (!geo) return null;

  return (
    <mesh position={mid} quaternion={quat} geometry={geo}>
      <meshStandardMaterial color="#1a2744" metalness={0.3} roughness={0.5} transparent opacity={opacity} />
    </mesh>
  );
};
