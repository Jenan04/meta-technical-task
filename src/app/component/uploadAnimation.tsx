// 'use client';

// import React, { useRef, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { Float, MeshDistortMaterial, OrbitControls, PerspectiveCamera, Center } from '@react-three/drei';
// import * as THREE from 'three';

// const CloudModel = () => {
//   const groupRef = useRef<THREE.Group>(null);
//   const arrowRef = useRef<THREE.Group>(null);
//   const [hovered, setHover] = useState(false);

//   useFrame((state) => {
//     const t = state.clock.getElapsedTime();
//     if (groupRef.current) {
//       groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;
//     }
//     if (arrowRef.current) {
//       // حركة صعود وهبوط واضحة وسريعة للسهم
//       arrowRef.current.position.y = Math.sin(t * 3) * 0.25;
//     }
//   });

//   return (
//     <group 
//       ref={groupRef} 
//       scale={hovered ? 1.05 : 1} 
//       onPointerOver={() => setHover(true)} 
//       onPointerOut={() => setHover(false)}
//     >
      
//       {/* 1. جسم الغيمة - طبقة سفلية بلون بيج معتم تماماً */}
//       <group>
//         <mesh position={[0, 0, 0]}>
//           <sphereGeometry args={[0.7, 32, 32]} />
//           <meshStandardMaterial color="#EBE5DD" roughness={1} />
//         </mesh>
//         <mesh position={[-0.5, -0.1, -0.1]}>
//           <sphereGeometry args={[0.5, 32, 32]} />
//           <meshStandardMaterial color="#EBE5DD" />
//         </mesh>
//         <mesh position={[0.5, -0.1, -0.1]}>
//           <sphereGeometry args={[0.5, 32, 32]} />
//           <meshStandardMaterial color="#EBE5DD" />
//         </mesh>
//         <mesh position={[0, 0.35, -0.2]}>
//           <sphereGeometry args={[0.55, 32, 32]} />
//           <meshStandardMaterial color="#EBE5DD" />
//         </mesh>
//       </group>

//       {/* 2. سهم الـ Upload - الطبقة العليا (Upper Layer) */}
//       {/* قمنا بزيادة Z إلى 0.8 لضمان أنه أمام الغيمة تماماً */}
//       <group ref={arrowRef} position={[0, 0, 0.8]}>
//         {/* رأس السهم */}
//         <mesh position={[0, 0.4, 0]} renderOrder={999}>
//           <coneGeometry args={[0.25, 0.5, 4]} />
//           <meshStandardMaterial 
//             color="#162B1E" 
//             metalness={0.8} 
//             roughness={0.2}
//             depthTest={false} // تجعله يظهر فوق أي شيء خلفه
//           />
//         </mesh>
//         {/* عمود السهم */}
//         <mesh position={[0, 0.05, 0]} renderOrder={999}>
//           <boxGeometry args={[0.12, 0.45, 0.12]} />
//           <meshStandardMaterial 
//             color="#162B1E" 
//             metalness={0.8} 
//             roughness={0.2}
//             depthTest={false}
//           />
//         </mesh>
//       </group>

//     </group>
//   );
// };
// export default function Hero3D() {
//   return (
//     <div className="w-full h-[500px] cursor-grab active:cursor-grabbing">
//       <Canvas shadows>
//         <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        
//         {/* إضاءة ناعمة ودافئة تتناسب مع الثيم البيج */}
//         <ambientLight intensity={0.7} />
//         <pointLight position={[5, 5, 5]} intensity={1.5} color="#fff" />
//         <spotLight position={[-5, 5, 5]} angle={0.2} penumbra={1} intensity={1} color="#D6B2B2" />

//         <Center>
//           <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
//             <CloudModel />
//           </Float>
//         </Center>

//         {/* عناصر عائمة في الخلفية لتعزيز شكل الـ Space */}
//         <Float speed={4} rotationIntensity={1} floatIntensity={2}>
//           <mesh position={[-2, 1.5, -2]}>
//             <sphereGeometry args={[0.15, 32, 32]} />
//             <MeshDistortMaterial color="#576238" speed={3} distort={0.5} />
//           </mesh>
//         </Float>

//         <OrbitControls enableZoom={false} makeDefault />
//       </Canvas>
//     </div>
//   );
// }

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
      // حركة السهم للأعلى والأسفل
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
      
      {/* 1. جسم الغيمة - اللون الجديد المكتوم #CCC6C0 */}
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          {/* تأكدي من قيمة اللون هان */}
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

      {/* 2. سهم الـ Upload - اللون الأخضر الغامق جداً #162B1E */}
      {/* renderOrder و depthTest لضمان أنه الأبرز (Upper Layer) */}
      <group ref={arrowRef} position={[0, 0, 0.8]}>
        <mesh position={[0, 0.4, 0]} renderOrder={999}>
          <coneGeometry args={[0.25, 0.5, 4]} />
          <meshStandardMaterial 
            color="#162B1E" 
            metalness={0}  /* خليته مطفي عشان يبين لونه الغامق بوضوح */
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
        
        {/* إضاءة محايدة لضمان ظهور الألوان كما هي */}
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