'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls, PerspectiveCamera, Center } from '@react-three/drei';
import * as THREE from 'three';

const CloudModel = () => {
  const groupRef = useRef<THREE.Group>(null);
  const arrowRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;
    }
    if (arrowRef.current) {
      arrowRef.current.position.y = Math.sin(t * 3) * 0.25;
    }
  });

  return (
    <group 
      ref={groupRef} 
      scale={hovered ? 1.05 : 1} 
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
    >
      
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#CCC6C0" roughness={1} />
        </mesh>
        <mesh position={[-0.5, -0.1, -0.1]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#CCC6C0" />
        </mesh>
        <mesh position={[0.5, -0.1, -0.1]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#CCC6C0" />
        </mesh>
        <mesh position={[0, 0.35, -0.2]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#CCC6C0" />
        </mesh>
      </group>

      <group ref={arrowRef} position={[0, 0, 0.8]}>
        <mesh position={[0, 0.4, 0]} renderOrder={999}>
          <coneGeometry args={[0.25, 0.5, 4]} />
          <meshStandardMaterial 
            color="#162B1E" 
            metalness={0} 
            roughness={1}
            depthTest={false} 
          />
        </mesh>
        <mesh position={[0, 0.05, 0]} renderOrder={999}>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial 
            color="#162B1E" 
            metalness={0}
            roughness={1}
            depthTest={false}
          />
        </mesh>
      </group>

    </group>
  );
};

export default function Hero3D() {
  return (
    <div className="w-full h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        
        <ambientLight intensity={1} /> 
        <pointLight position={[5, 5, 5]} intensity={1} />

        <Center>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <CloudModel />
          </Float>
        </Center>

        <OrbitControls enableZoom={false} makeDefault />
      </Canvas>
    </div>
  );
}