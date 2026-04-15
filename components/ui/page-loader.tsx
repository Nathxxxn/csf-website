"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import AnimatedGradient from "@/components/ui/animated-gradient";

const DISPLAY_DURATION = 900; // ms avant que le loader se retire

export function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Gradient WebGL background */}
          <div className="absolute inset-0">
            <AnimatedGradient
              config={{
                preset: "custom",
                color1: "#060606",
                color2: "#ffffff",
                color3: "#111111",
                rotation: -50,
                proportion: 1,
                scale: 0.01,
                speed: 150,
                distortion: 0,
                swirl: 50,
                swirlIterations: 16,
                softness: 47,
                offset: -299,
                shape: "Checks",
                shapeSize: 45,
              }}
              style={{ position: "absolute", zIndex: 0 }}
            />
            {/* Subtle white glow in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-64 w-64 rounded-full bg-white/[0.03] blur-[80px]" />
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
