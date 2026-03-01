import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface WelcomeHeroProps {
  name: string;
  role: string;
  avatarUrl?: string | null;
  streak?: number;
}

export const WelcomeHero = ({ name, role, avatarUrl, streak = 0 }: WelcomeHeroProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 border border-primary/20 p-8"
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
    
    <div className="relative flex items-center gap-6 flex-wrap">
      <motion.div whileHover={{ scale: 1.1 }} className="relative">
        <div className="absolute inset-0 bg-gradient-primary rounded-full blur-lg opacity-40" />
        <Avatar className="h-20 w-20 border-4 border-card shadow-elegant relative">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">
            {name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </motion.div>
      
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <motion.span
            animate={{ rotate: [0, 20, -15, 0] }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-2xl"
          >
            👋
          </motion.span>
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome back, <span className="text-gradient-primary">{name}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Badge className="bg-gradient-primary text-primary-foreground border-0">{role}</Badge>
          {streak > 0 && (
            <Badge variant="outline" className="gap-1 border-warning text-warning">
              <Flame className="h-3 w-3" />
              {streak} day streak
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm rounded-2xl px-5 py-3 border border-border/50">
        <Sparkles className="h-5 w-5 text-warning" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Today's Recognition</p>
          <p className="text-2xl font-bold text-gradient-primary">
            <AnimatedCounter end={42} />
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);
