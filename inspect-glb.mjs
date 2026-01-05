import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { readFileSync } from 'fs';

const data = readFileSync('./public/3d_models/iphone_16_pro_max.glb');
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  console.log('=== iPhone Mesh Names ===');
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      console.log(`Mesh: "${child.name}" | Material: ${child.material?.name || 'unnamed'}`);
    }
  });
});
