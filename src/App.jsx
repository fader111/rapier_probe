import React, { useEffect, useState, Suspense } from 'react'
import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import * as THREE from 'three';

const Tooth = ({ meshData, transform }) => {
  const [crownGeometry, setCrownGeometry] = useState();
  const [rootGeometry, setRootGeometry] = useState();

  useEffect(() => {
    if (!meshData) return;
    function createGeometry(vertices, faces) {
      const geometry = new THREE.BufferGeometry();
      const verts = new Float32Array(vertices.flat());
      const indices = new Uint32Array(faces.flat());
      geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals();
      return geometry;
    }
    setCrownGeometry(createGeometry(meshData.crown.vertices, meshData.crown.faces));
    if (meshData.short_root && meshData.short_root.vertices.length)
      setRootGeometry(createGeometry(meshData.short_root.vertices, meshData.short_root.faces));
    else
      setRootGeometry(createGeometry(meshData.root.vertices, meshData.root.faces));
  }, [meshData]);

  let groupProps = {};
  if (transform) {
    const q = transform.rotation;
    const t = transform.translation;
    groupProps = {
      quaternion: new THREE.Quaternion(q.x, q.y, q.z, q.w),
      position: [t.x, t.y, t.z]
    };
  }

  return (
    <group {...groupProps}>
      {crownGeometry && (
        <mesh geometry={crownGeometry}>
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
        </mesh>
      )}
      {rootGeometry && (
        <mesh geometry={rootGeometry}>
          <meshStandardMaterial color="#eeeeee" metalness={0.1} roughness={0.118} />
        </mesh>
      )}
    </group>
  );
};

const App = () => {
  const [teethTransforms, setTeethTransforms] = useState({});
  const [teethMeshes, setTeethMeshes] = useState({});
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0);
  const useShortRoots = true;

  // Fetch all transforms for the current stage once
  useEffect(() => {
    async function fetchAllTransforms() {
      const trRes = await fetch("http://localhost:8000/get_stage_relative_transform/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage })
      });
      const trData = await trRes.json();
      setTeethTransforms(trData);
    }
    fetchAllTransforms();
  }, [stage]);

  // Fetch all meshes for all teeth in one request
  useEffect(() => {
    async function fetchAllMeshes() {
      if (!teethTransforms || Object.keys(teethTransforms).length === 0) return;
      const tooth_ids = Object.keys(teethTransforms);
      const meshRes = await fetch("http://localhost:8000/get_teeth_meshes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tooth_ids })
      });
      const meshData = await meshRes.json();
      setTeethMeshes(meshData);
      setLoading(false);
    }
    fetchAllMeshes();
  }, [teethTransforms]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <Canvas 
        camera={{ position: [-8, -45, 40], fov: 35 }}
        onCreated={({ camera }) => { camera.lookAt(-8, -45, 7.5); }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[-8, -35, 40]} intensity={3} />
        <axesHelper args={[5]} />
        <Suspense>
          {!loading && Object.keys(teethMeshes).map((toothID) => (
            <Tooth 
              key={toothID}
              meshData={teethMeshes[toothID]}
              transform={teethTransforms[toothID]}
            />
          ))}
        </Suspense>
        <TrackballControls rotateSpeed={2.5} />
      </Canvas>
      {loading && <div style={{position:'absolute',top:10,left:10,color:'white',background:'rgba(0,0,0,0.5)',padding:'8px',borderRadius:'4px'}}>Loading teeth...</div>}
    </div>
  );
};

export default App
