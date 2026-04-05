import React, { useMemo } from 'react';
import * as THREE from 'three';
import { VERT_COORDS, EDGE_PAIRS, CUBE_FACES } from './geometry';
import { CubeEdge } from './CubeEdge';
import { CubeNode } from './CubeNode';
import { CubeFace } from './CubeFace';

export const CubeScene: React.FC<{
  rotationX: number;
  rotationY: number;
  glassOpacity?: number;
}> = ({ rotationX, rotationY, glassOpacity = 0.18 }) => {
  const verts = useMemo(
    () => VERT_COORDS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [],
  );

  return (
    <group rotation={[rotationX, rotationY, 0]}>
      {EDGE_PAIRS.map(([i, j], idx) => (
        <CubeEdge key={idx} a={verts[i]} b={verts[j]} />
      ))}
      {verts.map((v, i) => (
        <CubeNode key={i} pos={v} />
      ))}
      {glassOpacity > 0.005 &&
        CUBE_FACES.map((face, idx) => (
          <CubeFace
            key={idx}
            a={verts[face.verts[0]]}
            b={verts[face.verts[1]]}
            c={verts[face.verts[2]]}
            d={verts[face.verts[3]]}
            opacity={glassOpacity}
          />
        ))}
    </group>
  );
};
