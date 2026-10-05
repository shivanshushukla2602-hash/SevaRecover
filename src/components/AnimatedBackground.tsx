import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#22C55E]/10 rounded-full blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
      {/* Dynamic Cursor-Responsive Ambient Meshes */}
      <motion.div
        animate={{
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="absolute -top-[10%] left-[15%] w-[600px] h-[600px] bg-radial from-[#22C55E]/20 via-[#22C55E]/5 to-transparent rounded-full blur-[140px]"
      />
      <motion.div
        animate={{
          x: -mousePos.x * 1.5,
          y: -mousePos.y * 1.5,
        }}
        transition={{ type: 'spring', stiffness: 40, damping: 25 }}
        className="absolute top-[60%] -right-[5%] w-[550px] h-[550px] bg-radial from-[#F4D785]/15 via-[#22C55E]/5 to-transparent rounded-full blur-[130px]"
      />

      {/* Floating Gold Dust Particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#22C55E]/40 shadow-[0_0_8px_#22C55E]"
            style={{
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
