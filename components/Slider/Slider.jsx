import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { shaderMaterial, useTexture, Text } from '@react-three/drei'
import { projects } from '../../utils/content'
import { fragmentShader } from './shader/fragment'
import { vertexShader } from './shader/vertex'
import gsap from 'gsap'
import { SplitText } from 'gsap/dist/SplitText'
import styles from './Slider.module.css'

const SlideMaterial = shaderMaterial(
  {
    uTexture: null,
    uTextureBounds: [null, null],
    uPlaneScale: [null, null],
    uOpacity: null,
    uOffset: [null, null],
  },
  vertexShader,
  fragmentShader
)

extend({ SlideMaterial })

let isTouchDevice = false
let isWindows = false
function Slider() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(SplitText)
    isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    isWindows = navigator.platform.indexOf('Win') > -1
    setIsTouch(isTouchDevice)
    setTimeout(() => {
      const view = document.querySelector(`.${styles.view}`)
      view.textContent = "Things we've made."
      const splitTitle = new SplitText(view, {
        type: 'chars, words, lines',
        linesClass: 'line-parent',
      })
      gsap.from(splitTitle.chars, {
        duration: 0.75,
        x: 10,
        y: '100%',
        ease: 'power3.out',
        stagger: {
          amount: 0.5,
        },
        onComplete: () => {
          gsap.to(splitTitle.chars, {
            duration: 0.75,
            x: 10,
            y: '100%',
            ease: 'power3.out',
            delay: 0,
            stagger: {
              amount: 0.5,
            },
          })
        },
      })
    }, 1000)
  })
  return (
    <div className={styles.container}>
      <div className={styles.scrollProgress} />
      <Canvas
        resize={{ debounce: { resize: 250 } }}
        camera={{
          position: [0, 0, 2],
          fov: 50,
        }}
      >
        <Scene />
      </Canvas>
      <h1 className={styles.view}></h1>
    </div>
  )
}

let isScrolling = false
let meshes = []
let scrollTimeout = null
function Scene() {
  const { scene } = useThree()
  const groupRef = useRef()
  const margin = 1.1
  const wholeWidth = margin * projects.length
  const scrollSpeed = isWindows ? 3 : 1
  const scrollSmooth = isWindows ? 1.085 : 1
  const indicator = document.querySelector(`.${styles.scrollProgress}`)
  const startTouchYRef = useRef(0)
  const scrollRef = useRef(0)
  const scrollTargetRef = useRef(0)
  const currentScrollRef = useRef(0)
  const introAnimFinishedRef = useRef(false)

  function scrollingStarted() {
    isScrolling = true
    const view = document.querySelector(`.${styles.view}`)
    const splitTitle = new SplitText(view, {
      type: 'chars, words, lines',
      linesClass: 'line-parent',
    })
    gsap.to(splitTitle.chars, {
      delay: 0,
      duration: 1,
      x: 10,
      y: '100%',
      ease: 'power4.out',
      stagger: {
        amount: 0.25,
      },
    })
    meshes.forEach((mesh, i) => {
      gsap.to(mesh.children[0].material.uniforms.uOpacity, {
        value: 1.0,
        duration: 2,
        ease: 'power3.out',
      })
    })
  }

  function scrollingStopped() {
    isScrolling = false
  }

  useEffect(() => {
    gsap.registerPlugin(SplitText)
    scene.traverse((child) => {
      child.name === 'image' && meshes.push(child)
    })

    const handleMouseWheel = (e) => {
      if (introAnimFinishedRef.current) {
        if (scrollTimeout !== null) {
          clearTimeout(scrollTimeout)
        } else {
          scrollingStarted()
        }
        scrollTimeout = setTimeout(() => {
          scrollingStopped()
          // Clear the timeout
          scrollTimeout = null
        }, 100)
        scrollTargetRef.current += e.wheelDelta * 0.01 * scrollSpeed
      }
    }

    const handleTouchStart = (e) => {
      if (introAnimFinishedRef.current) {
        startTouchYRef.current = e.touches[0].clientX
        scrollingStarted()
      }
    }
    const handleTouchMove = (e) => {
      if (introAnimFinishedRef.current) {
        const delta =
          -(startTouchYRef.current - e.touches[0].clientX) * 0.25 * scrollSpeed
        scrollTargetRef.current += delta
        startTouchYRef.current = e.touches[0].clientX
        scrollTimeout = setTimeout(() => {
          scrollingStopped()
          scrollTimeout = null
        }, 100)
      }
    }
    const handleTouchEnd = (e) => {
      if (introAnimFinishedRef.current) {
        scrollingStopped()
      }
    }
    document.addEventListener('wheel', handleMouseWheel)
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    return () => {
      // document.removeEventListener('mousewheel', handleMouseWheel)
      document.removeEventListener('wheel', handleMouseWheel)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])
  useFrame(() => {
    scrollRef.current += (scrollTargetRef.current - scrollRef.current) * 0.1
    scrollRef.current *= 0.9
    scrollTargetRef.current *= 0.9 * scrollSmooth
    currentScrollRef.current += scrollRef.current * 0.01

    // Update meshes
    meshes.forEach((mesh, i) => {
      if (introAnimFinishedRef.current) {
        mesh.position.x =
          ((margin * i + currentScrollRef.current + 50000 * wholeWidth) %
            wholeWidth) -
          Math.floor(projects.length / 2) * margin
        mesh.scale.y = isWindows ? 1 : 1 + scrollTargetRef.current * 0.0015
        mesh.children[0].material.uniforms.uOffset.value[0] =
          scrollTargetRef.current * 0.005
      } else {
        setTimeout(() => {
          gsap.to(mesh.position, {
            x:
              ((margin * i + 0 * wholeWidth) % wholeWidth) -
              Math.floor(projects.length / 2) * margin,
            y: 0,
            z: 0,
            duration: 2.5,
            ease: 'power3.out',
            onComplete: () => {
              introAnimFinishedRef.current = true
            },
          })
          gsap.to(mesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.8,
            ease: 'power1.out',
          })
        }, 1750)
      }
    })

    // Update indicator
    const percentage = (
      ((Math.abs(currentScrollRef.current) / wholeWidth) * 100) %
      100
    ).toFixed(0)
    indicator.textContent = `${percentage}%`
  })
  return (
    <group ref={groupRef}>
      {projects.map((project, i) => {
        return (
          <Slide
            src={project.src}
            meshes={meshes}
            title={project.title}
            desc={project.desc}
            link={project.link}
            groupRef={groupRef}
            idx={i}
            key={i}
          />
        )
      })}
    </group>
  )
}

function Slide({ src, title, desc, link, groupRef, meshes, idx }) {
  const router = useRouter()
  const texture = useTexture(src)
  const width = 1
  const height = 1.25
  return (
    <group
      name='image'
      scale={[0, 0, 0]}
      position={[0, -2 + 2 * -idx, 0]}
      key={idx}
    >
      <mesh
        onPointerOver={(e) => {
          if (!isScrolling && !isTouchDevice) {
            document.body.style.cursor = 'pointer'
            const view = document.querySelector(`.${styles.view}`)
            view.textContent = title
            view.style.opacity = 1
            const splitTitle = new SplitText(view, {
              type: 'chars, words, lines',
              linesClass: 'line-parent',
            })
            gsap.from(splitTitle.chars, {
              delay: 0,
              duration: 1,
              x: 10,
              y: '100%',
              ease: 'power4.out',
              stagger: {
                amount: 0.25,
              },
            })
            gsap.to(e.eventObject.rotation, {
              x: -Math.PI / 64,
              ease: 'power3.out',
              duration: 1,
            })
            gsap.to(e.eventObject.position, {
              z: -0.05,
              ease: 'power3.out',
              duration: 1,
            })
            meshes.forEach((mesh, i) => {
              gsap.to(mesh.children[0].material.uniforms.uOpacity, {
                value: 0.1,
                duration: 2,
                ease: 'power3.out',
              })
            })
          }
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'auto'
          const view = document.querySelector(`.${styles.view}`)
          const splitTitle = new SplitText(view, {
            type: 'chars, words, lines',
            linesClass: 'line-parent',
          })
          gsap.to(splitTitle.chars, {
            delay: 0,
            duration: 1,
            x: 10,
            y: '100%',
            ease: 'power4.out',
            stagger: {
              amount: 0.25,
            },
          })
          gsap.to(e.eventObject.rotation, {
            x: 0,
            ease: 'power3.out',
            duration: 1,
          })
          gsap.to(e.eventObject.position, {
            z: 0,
            ease: 'power3.out',
            duration: 1,
          })
          meshes.forEach((mesh, i) => {
            gsap.to(mesh.children[0].material.uniforms.uOpacity, {
              value: 1.0,
              duration: 2,
              ease: 'power3.out',
            })
          })
        }}
      >
        <planeGeometry args={[width, height, 32, 32]} />
        <slideMaterial
          uTexture={texture}
          uTextureBounds={[texture.image.width, texture.image.height]}
          uPlaneScale={[width, height]}
          uOpacity={1.0}
          uOffset={[0, 0]}
          toneMapped={false}
          transparent
        />
      </mesh>
      <Text
        fontSize={0.04}
        font='/fonts/DMSans-SemiBold.ttf'
        color='black'
        position={[-width / 2, -height / 2 - 0.025, 0]}
        anchorX='left'
        anchorY='top'
      >
        {title}
      </Text>
      <Text
        fontSize={0.03}
        font='/fonts/DMSans-Regular.ttf'
        color='black'
        position={[-width / 2, -height / 2 - 0.075, 0]}
        anchorX='left'
        anchorY='top'
      >
        {desc}
      </Text>
    </group>
  )
}

export default Slider
