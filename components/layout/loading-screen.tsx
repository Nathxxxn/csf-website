'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export const LOADING_DONE_EVENT = 'csf:loading-done'

export function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const dismiss = () => setVisible(false)

    video.addEventListener('ended', dismiss)
    const fallback = setTimeout(dismiss, 2000)

    return () => {
      video.removeEventListener('ended', dismiss)
      clearTimeout(fallback)
    }
  }, [])

  const handleExitComplete = () => {
    document.body.dataset.csfLoaded = '1'
    window.dispatchEvent(new Event(LOADING_DONE_EVENT))
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="loading-overlay"
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <video
            ref={videoRef}
            src="/CSF-animatedLogo.mov"
            autoPlay
            muted
            playsInline
            className="w-40 h-auto"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
