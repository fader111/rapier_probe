import React, { useRef, useState, useEffect, useMemo, useCallback, Suspense} from 'react'
import { Box, Torus, TrackballControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { useLoader } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import * as THREE from 'three';
import { TextureLoader } from 'three';

const Tooth = (props) => {
  const { toothID, type, position = [0,0,0], rotation = [0,0,0] } = props;
  // STL loading with error handling
  const crown = useLoader(STLLoader, `/crowns/${toothID}.stl`);
  const root = useLoader(STLLoader, `/shortRoots/${toothID}.stl`);
  const texture = useLoader(TextureLoader, `/textures/teeth.png`);

  const combinedGeometries = useMemo(() => {
    if (!crown?.attributes?.position || !crown?.attributes?.normal ||
        !root?.attributes?.position || !root?.attributes?.normal) {
      return { crownGeometry: null, rootGeometry: null };
    }
    const crownGeometry = new THREE.BufferGeometry();
    const rootGeometry = new THREE.BufferGeometry();
    crownGeometry.setAttribute('position', new THREE.BufferAttribute(crown.attributes.position.array, 3));
    crownGeometry.setAttribute('normal', new THREE.BufferAttribute(crown.attributes.normal.array, 3));
    crownGeometry.computeVertexNormals(); // Ensure normals are computed for lighting
    rootGeometry.setAttribute('position', new THREE.BufferAttribute(root.attributes.position.array, 3));
    rootGeometry.setAttribute('normal', new THREE.BufferAttribute(root.attributes.normal.array, 3));
    rootGeometry.computeVertexNormals(); // Ensure normals are computed for lighting
    return { crownGeometry, rootGeometry };
  }, [crown, root]);
  console.log("Tooth ID:", toothID, "Type:", type);
  return (
    // colliders - hull for dynamic, trimesh for static objects
    // <RigidBody colliders="trimesh" position={position} rotation={rotation}>
    // <RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={0.8} position={position} rotation={rotation}>
    // <RigidBody colliders="hull" restitution={0.2} friction={0.8} type={type} position={position} rotation={rotation}>
    <RigidBody colliders="trimesh" restitution={0.2} friction={0.8} type={type} position={position} rotation={rotation}>
      <group>
        {combinedGeometries.crownGeometry && (
          <mesh geometry={combinedGeometries.crownGeometry}>
            {/* <meshStandardMaterial map={texture} color="#cccccc" metalness={0.2} roughness={0.7} /> */}
            <meshStandardMaterial map={texture} color="#ffffff" metalness={0.1} roughness={0.91} />
          </mesh>
        )}
        {combinedGeometries.rootGeometry && (
          <mesh geometry={combinedGeometries.rootGeometry}>
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
            {/* площадка под зубами*/}
            {/* <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} /> */} 
            <Tooth type={"static"} toothID="11" position={[-5, 0, 0]} rotation={[0, 0, 0]} />
            <Tooth type={"dynamic"} toothID="12" position={[2, 0, 0]} rotation={[0, 0, 0]} />
            <Tooth type={"dynamic"} toothID="13" position={[-9, 0, 0]} rotation={[0, 0, 0]} />
            {/* <Tooth type={"dynamic"} toothID="14" position={[-9, 0, 0]} rotation={[0, 0, 0]} /> */}
            {/* <Tooth type={"dynamic"} toothID="15" position={[-9, 0, 0]} rotation={[0, 0, 0]} /> */}
            {/* <Tooth type={"dynamic"} toothID="16" position={[-9, 0, 0]} rotation={[0, 0, 0]} /> */}
            {/* <Tooth type={"dynamic"} toothID="17" position={[-9, 0, 0]} rotation={[0, 0, 0]} /> */}
            {/* <Tooth toothID="21" position={[0, 0, 0]} rotation={[0, 0, 0]} /> */}
          </Physics>
        </Suspense>
        <TrackballControls rotateSpeed={2.5} />
      </Canvas>
    </div>
  );
};

export default App
