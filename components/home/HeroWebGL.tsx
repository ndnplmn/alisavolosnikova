'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface HeroWebGLProps {
  imageUrl: string
  alt?: string
}

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = `
  uniform sampler2D u_texture;
  uniform float u_progress;
  uniform vec2 u_mouse;
  uniform float u_time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5, 0.5);

    // Aperture reveal: circular mask expanding from center
    float dist = distance(uv, center);
    float maxDist = distance(vec2(0.0, 0.0), center); // ~0.707
    float normalizedDist = dist / maxDist;
    float aperture = smoothstep(u_progress - 0.05, u_progress, 1.0 - normalizedDist);

    // Cursor distortion: subtle UV displacement toward mouse position
    vec2 mouseDir = u_mouse - uv;
    float influence = 0.018 * (1.0 - u_progress * 0.4);
    float falloff = 1.0 - smoothstep(0.0, 0.6, dist);
    vec2 distortedUv = uv + mouseDir * influence * falloff;

    vec4 color = texture2D(u_texture, distortedUv);
    gl_FragColor = vec4(color.rgb, color.a * aperture);
  }
`

export function HeroWebGL({ imageUrl, alt = '' }: HeroWebGLProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Load texture
    const loader = new THREE.TextureLoader()
    const texture = loader.load(imageUrl)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const uniforms = {
      u_texture: { value: texture },
      u_progress: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_time: { value: 0 },
    }

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
    })
    scene.add(new THREE.Mesh(geometry, material))

    // Aperture open animation on load
    gsap.to(uniforms.u_progress, {
      value: 1,
      duration: 1.4,
      ease: 'power2.out',
      delay: 0.1,
    })

    // Mouse tracking for cursor distortion
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      gsap.to(uniforms.u_mouse.value, {
        x,
        y,
        duration: 0.9,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
    mount.addEventListener('mousemove', onMouseMove)

    // Resize handler
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Render loop
    let rafId: number
    const animate = (t: number) => {
      uniforms.u_time.value = t * 0.001
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      mount.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      material.dispose()
      geometry.dispose()
      texture.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [imageUrl])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      aria-label={alt}
      role="img"
    />
  )
}
