"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Storyboard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const stories = [
    {
      text: "My Photos",
      subtext: "Capturing every moment of the journey",
      color: "from-blue-500 to-cyan-400",
      image: "https://lh3.googleusercontent.com/d/1tpp-0RjDf8A6w35d0XqMhS3W5Xh8x7d5"
    },
    {
      text: "Enjoyed Things",
      subtext: "The flavor of local street food and culture",
      color: "from-purple-500 to-pink-400",
      image: "https://lh3.googleusercontent.com/d/1WUY_HJQ1QKUcaDfu890n-xDq8wnHGRNp"
    },
    {
      text: "Hodi Ombath",
      subtext: "Let the story begin...",
      color: "from-orange-500 to-red-400",
      image: "https://lh3.googleusercontent.com/d/1HLnfAdf4PeMtNo2iThDwPppJgZjIOSma"
    },
  ];

  useEffect(() => {
    if (step < stories.length) {
      const timer = setTimeout(() => setStep(step + 1), 4000); // Slightly longer for photos
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [step, stories.length, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505] overflow-hidden flex-col">
      {/* Blurred Backdrop Glow */}
      <AnimatePresence mode="wait">
        {step < stories.length && (
          <motion.div
            key={`blur-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={stories[step].image}
              alt=""
              className="w-full h-full object-cover blur-[100px] scale-125"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step < stories.length && (
          <div className="relative z-10 flex flex-col items-center gap-12 px-6 w-full max-w-4xl">
            {/* Cinematic Image Card */}
            <motion.div
              key={`card-${step}`}
              initial={{ y: 60, opacity: 0, rotateX: 20 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -60, opacity: 0, rotateX: -20 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 bg-black/40 flex items-center justify-center"
            >
              <img
                src={stories[step].image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40"
              />
              <img
                src={stories[step].image}
                alt=""
                className="relative z-10 max-w-full max-h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(20px)" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center space-y-4"
            >
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white">
                {stories[step].text}
              </h2>
              <p className="text-lg md:text-xl text-white/40 font-light tracking-widest italic">
                {stories[step].subtext}
              </p>

              {/* Step Indicators */}
              <div className="flex justify-center gap-3 pt-8">
                {stories.map((_, i) => (
                  <div key={i} className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                    {i === step && (
                      <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                      />
                    )}
                    {i < step && <div className="h-full w-full bg-white/40" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Particle Field */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-px bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * 100 + "%"],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
}
