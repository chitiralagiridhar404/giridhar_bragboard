import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquareHeart, Trophy, Users, Target, BarChart3, Bookmark } from "lucide-react";

const actions = [
  { icon: MessageSquareHeart, label: "New Shout-out", path: "/shout-outs", color: "from-primary to-primary-glow" },
  { icon: Trophy, label: "Leaderboard", path: "/achievements", color: "from-warning to-secondary" },
  { icon: Users, label: "Team", path: "/shout-outs", color: "from-accent to-success" },
  { icon: Target, label: "Goals", path: "/goals", color: "from-success to-accent" },
  { icon: BarChart3, label: "My Stats", path: "/dashboard", color: "from-secondary to-destructive" },
  { icon: Bookmark, label: "Saved", path: "/shout-outs", color: "from-warning to-primary" },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(action.path)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl glass-card hover-glow cursor-pointer group"
        >
          <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:shadow-lg transition-shadow`}>
            <action.icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
