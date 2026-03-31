import * as THREE from 'three';

// Map screen pixel to point on virtual unit sphere (arcball)
export function screenToSphere(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): THREE.Vector3 {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const r = Math.min(rect.width, rect.height) / 2;
  const nx = (clientX - cx) / r;
  const ny = -(clientY - cy) / r; // flip Y
  const len2 = nx * nx + ny * ny;

  if (len2 <= 1) {
    return new THREE.Vector3(nx, ny, Math.sqrt(1 - len2));
  }
  const len = Math.sqrt(len2);
  return new THREE.Vector3(nx / len, ny / len, 0);
}

// Compute incremental quaternion from two points on the arcball sphere
export function arcballDelta(from: THREE.Vector3, to: THREE.Vector3): THREE.Quaternion {
  const axis = new THREE.Vector3().crossVectors(from, to);
  const len = axis.length();
  if (len < 1e-8) return new THREE.Quaternion();
  axis.divideScalar(len);
  const angle = Math.acos(Math.max(-1, Math.min(1, from.dot(to))));
  return new THREE.Quaternion().setFromAxisAngle(axis, angle);
}
