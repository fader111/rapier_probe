import React, { useEffect, useState, Suspense } from 'react'
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { TrackballControls } from "@react-three/drei";
import * as THREE from 'three';

const Tooth = ({ toothID, type = "static", position = [0,0,0], rotation = [0,0,0], filePath = "backend/oas/00000000.oas", stage = 0 }) => {
  const [crownGeometry, setCrownGeometry] = useState();
  const [rootGeometry, setRootGeometry] = useState();

  useEffect(() => {
    async function fetchMesh() {
      const res = await fetch("http://localhost:8000/get_tooth_mesh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ tooth_id: toothID, file_path: filePath, stage })
        body: JSON.stringify({ tooth_id: toothID })
      });
      const data = await res.json();
      // Helper to convert vertices/faces to BufferGeometry
      function createGeometry(vertices, faces) {
        const geometry = new THREE.BufferGeometry();
        const verts = new Float32Array(vertices.flat());
        const indices = new Uint32Array(faces.flat());
        geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.computeVertexNormals();
        return geometry;
      }
      if (data.crown) setCrownGeometry(createGeometry(data.crown.vertices, data.crown.faces));
      if (data.root) setRootGeometry(createGeometry(data.root.vertices, data.root.faces));
    }
    fetchMesh();
  // }, [toothID, filePath, stage]);
  }, [toothID]);

  return (
    <RigidBody colliders="trimesh" restitution={0.2} friction={0.8} type={type} position={position} rotation={rotation}>
      <group>
        {crownGeometry && (
          <mesh geometry={crownGeometry}>
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.91} />
          </mesh>
        )}
        {rootGeometry && (
          <mesh geometry={rootGeometry}>
            <meshStandardMaterial color="#eeeeee" metalness={0.1} roughness={0.118} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
};

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <Canvas camera={{ position: [0, 0, 60], fov: 35 }} shadows style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <Suspense>
          <Physics gravity={[0, 0, 0]}>
            <Tooth type={"static"} toothID="11" position={[-5, 0, 0]} rotation={[0, 0, 0]} />
            <Tooth type={"dynamic"} toothID="12" position={[2, 0, 0]} rotation={[0, 0, 0]} />
            <Tooth type={"dynamic"} toothID="13" position={[-9, 0, 0]} rotation={[0, 0, 0]} />
          </Physics>
        </Suspense>
        <TrackballControls rotateSpeed={2.5} />
      </Canvas>
    </div>
  );
};

export default App
