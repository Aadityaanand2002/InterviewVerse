import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { useRef } from "react";

function TechShape() {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[3, 0, -2]}>
        <icosahedronGeometry args={[2.5, 0]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.8} />
      </mesh>
    </Float>
  );
}

function TechShapeSecondary() {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = -state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.y = -state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[-4, -1, -5]}>
        <octahedronGeometry args={[2, 0]} />
        <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

export default function Welcome3DBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={1} />
        
        {/* Abstract Floating Tech Geometry */}
        <TechShape />
        <TechShapeSecondary />

        {/* Dynamic Starfield representing data particles */}
        <Stars 
          radius={50} 
          depth={50} 
          count={2500} 
          factor={6} 
          saturation={1} 
          fade 
          speed={2} 
        />
      </Canvas>
    </div>
  );
}
