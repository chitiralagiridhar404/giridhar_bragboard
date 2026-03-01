import { motion } from "framer-motion";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 2,
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 10,
}));

export const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {particles.map((p) => (
      <motion.div
        key={p.id}
        className="absolute rounded-full bg-primary/20"
        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
        animate={{
          y: [0, -30, 0],
          x: [0, 15, -15, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);
