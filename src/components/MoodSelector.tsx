import { motion } from "framer-motion";
import { useState } from "react";

const moods = [
  { emoji: "😊", label: "Happy", color: "from-success to-accent" },
  { emoji: "🔥", label: "Fired Up", color: "from-destructive to-warning" },
  { emoji: "🎯", label: "Focused", color: "from-primary to-accent" },
  { emoji: "🌟", label: "Inspired", color: "from-warning to-secondary" },
  { emoji: "💪", label: "Strong", color: "from-secondary to-primary" },
];

export const MoodSelector = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-bold text-sm mb-3 text-muted-foreground">How are you feeling today?</h3>
      <div className="flex gap-2 justify-between">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelected(mood.label)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              selected === mood.label
                ? `bg-gradient-to-br ${mood.color} shadow-lg`
                : "hover:bg-muted/50"
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className={`text-[10px] font-semibold ${selected === mood.label ? "text-primary-foreground" : "text-muted-foreground"}`}>
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
