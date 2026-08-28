import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

function FloatingShape({ geometry, color, position }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [currentColor, setCurrentColor] = useState(color)
  const bobOffset = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    meshRef.current.position.y = position[1] + Math.sin(t * 1.2 + bobOffset.current) * 0.25
    meshRef.current.rotation.x += 0.004
    meshRef.current.rotation.y += 0.006
    const targetScale = hovered ? 1.15 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)
  })

  const handleClick = (e) => {
    e.stopPropagation()
    setCurrentColor(new THREE.Color().setHSL(Math.random(), 0.65, 0.55))
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
      castShadow
    >
      {geometry}
      <meshStandardMaterial
        color={currentColor}
        metalness={0.3}
        roughness={0.25}
        emissive={currentColor}
        emissiveIntensity={0.08}
      />
    </mesh>
  )
}

const shapeDefs = [
  { name: 'Icosaèdre', geometry: <icosahedronGeometry args={[1, 0]} />, color: '#4fd1c5' },
  { name: 'Cube', geometry: <boxGeometry args={[1.3, 1.3, 1.3]} />, color: '#9f7aea' },
  { name: 'Cône', geometry: <coneGeometry args={[0.9, 1.6, 32]} />, color: '#f6ad55' },
  { name: 'Sphère', geometry: <sphereGeometry args={[0.95, 32, 32]} />, color: '#63b3ed' },
  { name: 'Octaèdre', geometry: <octahedronGeometry args={[1.05, 0]} />, color: '#f687b3' },
]

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
      <circleGeometry args={[12, 64]} />
      <meshStandardMaterial color="#0a0c14" metalness={0.6} roughness={0.35} />
    </mesh>
  )
}

export default function Scene() {
  const radius = 4.2

  return (
    <Canvas shadows camera={{ position: [6, 4, 9], fov: 55 }}>
      <fog attach="fog" args={['#05060a', 8, 22]} />
      <ambientLight intensity={1.2} color="#404060" />
      <pointLight position={[5, 8, 5]} intensity={2.2} color="#8fb4ff" castShadow />
      <pointLight position={[-6, 3, -4]} intensity={1.4} color="#ff7ab8" />

      <Floor />

      {shapeDefs.map((def, i) => {
        const angle = (i / shapeDefs.length) * Math.PI * 2
        return (
          <FloatingShape
            key={def.name}
            geometry={def.geometry}
            color={def.color}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
          />
        )
      })}

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={4}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.85}
      />
    </Canvas>
  )
}