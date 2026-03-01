import { motion } from "framer-motion";
import { Award, Heart, MessageSquareHeart, TrendingUp, Users, Zap, Shield, Star, Bookmark, Bell, Search, BarChart3 } from "lucide-react";

const features = [
  { icon: MessageSquareHeart, title: "Shout-outs", desc: "Celebrate wins", color: "from-primary to-primary-glow" },
  { icon: Heart, title: "Reactions", desc: "Express feelings", color: "from-secondary to-destructive" },
  { icon: Award, title: "Achievements", desc: "Earn badges", color: "from-warning to-secondary" },
  { icon: TrendingUp, title: "Trending", desc: "What's hot", color: "from-accent to-success" },
  { icon: Users, title: "Profiles", desc: "Know your team", color: "from-primary to-accent" },
  { icon: Zap, title: "Real-time", desc: "Instant updates", color: "from-warning to-destructive" },
  { icon: Shield, title: "Admin Tools", desc: "Full control", color: "from-destructive to-secondary" },
  { icon: Star, title: "Leaderboard", desc: "Top performers", color: "from-success to-accent" },
  { icon: Bookmark, title: "Bookmarks", desc: "Save favorites", color: "from-warning to-primary" },
  { icon: Bell, title: "Notifications", desc: "Stay updated", color: "from-accent to-primary" },
  { icon: Search, title: "Search", desc: "Find anything", color: "from-secondary to-accent" },
  { icon: BarChart3, title: "Analytics", desc: "Insights", color: "from-success to-warning" },
];

export const FeatureShowcase = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {features.map((f, i) => (
      <motion.div
        key={f.title}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
        whileHover={{ scale: 1.05, y: -4 }}
        className="glass-card rounded-2xl p-5 text-center cursor-pointer group"
      >
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} mb-3 group-hover:shadow-glow transition-shadow duration-300`}>
          <f.icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="font-bold text-sm">{f.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
      </motion.div>
    ))}
  </div>
);
