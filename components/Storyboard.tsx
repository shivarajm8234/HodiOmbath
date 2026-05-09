"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Storyboard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const stories = [
    { text: "My Photos", subtext: "Capturing every moment of the journey", color: "from-blue-500 to-cyan-400" },
    { text: "Enjoyed Things", subtext: "The flavor of local street food and culture", color: "from-purple-500 to-pink-400" },
    { text: "Hodi Ombath", subtext: "Let the story begin...", color: "from-orange-500 to-red-400" },
  ];

  useEffect(() => {
    if (step < stories.length) {
      const timer = setTimeout(() => setStep(step + 1), 3000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [step, stories.length, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <AnimatePresence mode="wait">
        {step < stories.length && (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-4"
          >
            <motion.h2 
              className={`text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stories[step].color}`}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              {stories[step].text}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-400"
            >
              {stories[step].subtext}
            </motion.p>

            {/* Decorative Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 bg-white/20 rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%" 
                  }}
                  animate={{ 
                    y: ["-10%", "110%"],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: Math.random() * 5 + 5, 
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thread lines effect */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <motion.path
            d="M 0 50 Q 25 25 50 50 T 100 50"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.path
            d="M 0 70 Q 25 95 50 70 T 100 70"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 12, repeat: Infinity, delay: 1 }}
          />
        </svg>
      </div>
    </div>
  );
}
