import React, { useMemo } from 'react';
import * as THREE from 'three';

export const CubeFace: React.FC<{
  a: THREE.Vector3;
  b: THREE.Vector3;
  c: THREE.Vector3;
  d: THREE.Vector3;
  opacity?: number;
}> = ({ a, b, c, d, opacity = 0.18 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array([
      a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z,
      a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.computeVertexNormals();
    return g;
  }, [a, b, c, d]);

  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial
        color="#b8c4d8"
        transparent
        opacity={opacity}
        roughness={0.4}
        metalness={0.1}
        clearcoat={0.8}
        clearcoatRoughness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
