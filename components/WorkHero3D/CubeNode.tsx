import React from 'react';
import * as THREE from 'three';
import { NODE_SIZE } from './geometry';

export const CubeNode: React.FC<{ pos: THREE.Vector3; opacity?: number }> = ({ pos, opacity = 1 }) => (
  <mesh position={pos}>
    <sphereGeometry args={[NODE_SIZE, 24, 24]} />
    <meshStandardMaterial color="#1a2744" metalness={0.3} roughness={0.4} transparent opacity={opacity} />
  </mesh>
);
