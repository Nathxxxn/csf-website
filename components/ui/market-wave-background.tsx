'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Two symmetric wings with a clear center corridor.
// Left wing: X in [-14, -2], right wing: X in [+2, +14].
const WING_COLS = 40   // cols per side
const ROWS = 90
const COUNT = WING_COLS * 2 * ROWS  // 7 200 particles
const INNER_EDGE = 2    // X gap half-width (clear center)
const OUTER_EDGE = 14   // X outer extent

function WaveParticles({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const geoRef = useRef<THREE.BufferGeometry>(null)
  const groupRef = useRef<THREE.Group>(null)

  const { positions, phases, amplitudes } = useMemo(() => {
    const positions  = new Float32Array(COUNT * 3)
    const phases     = new Float32Array(COUNT)
    const amplitudes = new Float32Array(COUNT) // per-point wave height scale

    let i = 0
    for (let side = 0; side < 2; side++) {
      for (let col = 0; col < WING_COLS; col++) {
        // t: 0 = inner edge, 1 = outer edge
        const t = col / (WING_COLS - 1)
        const x = side === 0
          ? -(INNER_EDGE + t * (OUTER_EDGE - INNER_EDGE))  // left: -2 → -14
          :  (INNER_EDGE + t * (OUTER_EDGE - INNER_EDGE))  // right: +2 → +14

        // outer edge particles animate more dramatically
        const amp = 0.35 + t * 0.85

        for (let row = 0; row < ROWS; row++) {
          positions[i * 3]     = x + (Math.random() - 0.5) * 0.06
          positions[i * 3 + 1] = 0
          positions[i * 3 + 2] = (row - ROWS / 2) * 0.22 + (Math.random() - 0.5) * 0.04
          phases[i]     = Math.random() * Math.PI * 2
          amplitudes[i] = amp
          i++
        }
      }
    }

    return { positions, phases, amplitudes }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.4
    const scroll = scrollRef.current

    const posAttr = geoRef.current?.attributes.position
    if (posAttr) {
      for (let i = 0; i < COUNT; i++) {
        const col = Math.floor(i / ROWS) % WING_COLS
        const row = i % ROWS
        posAttr.setY(
          i,
          (Math.sin(col * 0.3 + t) * 0.55 +
           Math.cos(row * 0.2 + t * 0.8) * 0.35 +
           Math.sin(phases[i] + t * 0.5) * 0.2) * amplitudes[i],
        )
      }
      posAttr.needsUpdate = true
    }

    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      8 - scroll * 5,
      0.05,
    )
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -scroll * 0.45,
        0.05,
      )
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#d8d8d8"
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}

export function MarketWaveBackground() {
  const scrollRef = useRef(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ backgroundColor: '#050505', pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 2, 8], fov: 60 }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
      >
        <WaveParticles scrollRef={scrollRef} />
      </Canvas>
    </div>
  )
}
