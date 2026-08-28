import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

// ---------- Rideau (plan ondulé avec des "plis" via la géométrie) ----------
function CurtainPanel({ position, side }) {
  const meshRef = useRef()
  const geometry = useRef()

  // Génère un plan avec des plis verticaux (sinusoïde sur X)
  const segmentsX = 24
  const segmentsY = 1
  const width = 3.2
  const height = 8

  if (!geometry.current) {
    const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const fold = Math.sin((x / width) * Math.PI * 6) * 0.18
      pos.setZ(i, fold)
    }
    geo.computeVertexNormals()
    geometry.current = geo
  }

  return (
    <mesh ref={meshRef} position={position} rotation={[0, side === 'left' ? 0.08 : -0.08, 0]} castShadow>
      <primitive object={geometry.current} attach="geometry" />
      <meshStandardMaterial color="#7a1224" roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ---------- Bandeau supérieur du rideau (la "frise") ----------
function ValanceTop() {
  return (
    <mesh position={[0, 4.3, -1.5]} castShadow>
      <boxGeometry args={[9.5, 0.9, 0.4]} />
      <meshStandardMaterial color="#5c0d1a" roughness={0.8} />
    </mesh>
  )
}

// ---------- Plateau en bois ----------
function StageFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial color="#3b2a1d" roughness={0.75} metalness={0.05} />
    </mesh>
  )
}

// Lattes de bois du plateau (fines boîtes pour l'effet planches)
function FloorPlanks() {
  const planks = []
  const count = 18
  for (let i = 0; i < count; i++) {
    planks.push(
      <mesh key={i} position={[-7 + (i * 14) / count, -1.795, 0]} receiveShadow>
        <boxGeometry args={[14 / count - 0.03, 0.02, 10]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#4a3524' : '#40301f'} roughness={0.8} />
      </mesh>
    )
  }
  return <group>{planks}</group>
}

// ---------- Projecteur (spot animé, cône visible) ----------
function Spotlight({ position, target, color, phase }) {
  const lightRef = useRef()
  const coneRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase
    const swing = Math.sin(t * 0.4) * 1.4
    if (lightRef.current) {
      lightRef.current.target.position.set(swing, -1.5, 0)
      lightRef.current.target.updateMatrixWorld()
    }
    if (coneRef.current) {
      coneRef.current.rotation.z = Math.sin(t * 0.4) * 0.25
    }
  })

  return (
    <group position={position}>
      <spotLight
        ref={lightRef}
        color={color}
        intensity={45}
        angle={0.35}
        penumbra={0.6}
        distance={18}
        castShadow
      />
      <mesh ref={coneRef} position={[0, -0.3, 0]}>
        <coneGeometry args={[0.15, 0.5, 16, 1, true]} />
        <meshStandardMaterial color="#111" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ---------- Halo de lumière au sol sous chaque projecteur ----------
function LightPool({ color }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.78, 0]}>
      <circleGeometry args={[1.6, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} />
    </mesh>
  )
}

// ---------- Rangée de sièges suggérée en fond de salle (silhouettes simples) ----------
function AudienceHint() {
  const rows = []
  for (let r = 0; r < 3; r++) {
    for (let c = -4; c <= 4; c++) {
      rows.push(
        <mesh key={`${r}-${c}`} position={[c * 0.9, -1.4 + r * 0.15, 9 + r * 1.1]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#0b0c12" roughness={1} />
        </mesh>
      )
    }
  }
  return <group>{rows}</group>
}

export default function TheaterScene() {
  return (
    <Canvas shadows camera={{ position: [0, 1.5, 11], fov: 50 }}>
      <fog attach="fog" args={['#050308', 10, 26]} />
      <ambientLight intensity={0.18} color="#3a2030" />

      <StageFloor />
      <FloorPlanks />

      <ValanceTop />
      <CurtainPanel position={[-4.2, 0.3, -1.4]} side="left" />
      <CurtainPanel position={[4.2, 0.3, -1.4]} side="right" />

      <Spotlight position={[-3, 6, 3]} color="#ffdca8" phase={0} />
      <Spotlight position={[3, 6, 3]} color="#a8c8ff" phase={2.1} />
      <Spotlight position={[0, 6.5, 5]} color="#ffffff" phase={4.3} />

      <LightPool color="#ffdca8" />

      <AudienceHint />

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={5}
        maxDistance={18}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.55}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}