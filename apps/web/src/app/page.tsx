'use client'

import { useState, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { H1, Text } from "@repo/ui/typography"
import { useConnect } from '@starknet-react/core'
import Button from "@repo/ui/button"

const Particle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      top: ['50%', `${Math.random() * 40 + 30}%`],
      left: ['50%', `${Math.random() * 100}%`],
    }}
    transition={{ duration: 2, delay, ease: "easeOut" }}
  />
)

export default function AnimatedLoginPage() {
  const [showForm, setShowForm] = useState(false)
  const controls = useAnimation()
  const backgroundControls = useAnimation()
  const { connect, connectors } = useConnect()

  useEffect(() => {
    const sequence = async () => {
      try {
        await controls.start("gather")
        await backgroundControls.start({ scale: 1.1, transition: { duration: 0.3 } })
        await new Promise(resolve => setTimeout(resolve, 200))
        await controls.start("explode")
        await backgroundControls.start({ scale: 1, transition: { duration: 0.3 } })
        setShowForm(true)
      } catch (error) {
        console.error("Animation sequence error:", error)
      }
    }
    void sequence()
  }, [controls, backgroundControls])

  const containerVariants = {
    initial: { backgroundColor: 'var(--surface-primary-default)' },
    exploded: { backgroundColor: 'var(--surface-primary-default)' }
  }

  const shapeVariants = {
    initial: { scale: 1, opacity: 1, x: '-50%', y: '-50%', rotate: 0 },
    gather: { 
      scale: 0.5, 
      opacity: 1, 
      x: '-50%', 
      y: '-50%', 
      rotate: 360,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    explode: (custom: { x: string, y: string, scale: number, rotate: number }) => ({
      scale: custom.scale,
      opacity: 1,
      x: custom.x,
      y: custom.y,
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 150, 
        damping: 10, 
        duration: 0.6,
        bounce: 0.4
      }
    })
  }

  const formContainerVariants = {
    initial: { height: 0 },
    visible: { height: '40%', transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] } }
  }

  const formContentVariants = {
    initial: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.1 } }
  }

  return (
    <div className="bg-surface-primary-default flex items-center justify-center min-h-screen overflow-hidden">
      <motion.div 
        className="w-[24.375rem] h-[52.75rem] bg-surface-primary-default relative overflow-hidden"
        variants={containerVariants}
        initial="initial"
        animate="exploded"
      >
        <motion.div
          className="absolute inset-0 bg-success-default"
          animate={backgroundControls}
        />

        {/* Particles */}
        <AnimatePresence>
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={`particle-${i}`} delay={i * 0.03} />
          ))}
        </AnimatePresence>

        {/* Exploding shapes */}
        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(-90% - 2rem)', y: 'calc(-280%)', scale: 1.2, rotate: -360 }}
        >
          <Image src="/images/splash/1.png" width={120} height={120} alt="Sun shape" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(90% + 2rem)', y: 'calc(-280%)', scale: 1.1, rotate: 360 }}
        >
          <Image src="/images/splash/2.png" width={80} height={80} alt="Circle shape" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(-80%)', y: 'calc(-180%)', scale: 1.3, rotate: -180 }}
        >
          <Image src="/images/splash/3.png" width={80} height={80} alt="Circle shape" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(80%)', y: 'calc(-180%)', scale: 1.2, rotate: 180 }}
        >
          <Image src="/images/splash/4.png" width={90} height={68} alt="Cup shape" />
        </motion.div>

        {/* White area for form */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-surface-inverse rounded-t-3xl overflow-hidden"
          variants={formContainerVariants}
          initial="initial"
          animate={showForm ? "visible" : "initial"}
        >
          <motion.div 
            className="p-6 space-y-6"
            variants={formContentVariants}
            initial="initial"
            animate={showForm ? "visible" : "initial"}
          >
            <div className="text-center">
              <Text className="text-content-title text-lg mt-2">Welcome to</Text>
              <H1 className="text-content-title">CofiBlocks</H1>
            </div>
            <div className="flex justify-center items-center">
              {connectors.map((connector) => (
                <Button key={connector.id} onClick={() => connect({ connector })} variant="secondary" size="lg" className="w-full max-w-[15rem] px-4 py-3 bg-surface-secondary-default text-content-title text-base font-medium font-inter rounded-lg border border-surface-secondary-default transition-all duration-300 hover:bg-surface-secondary-hover">
                  <div className="flex items-center space-x-2">
                    <span>Login</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <Link href="/sell" className="block text-center text-content-title text-base font-normal font-inter underline transition-colors duration-300 hover:text-content-title-hover">
              Sell My Coffee
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}