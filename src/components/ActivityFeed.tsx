import { motion } from "framer-motion";
import { Heart, MessageCircle, Award, UserPlus, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  { type: "reaction", user: "Alice", action: "liked your shout-out", icon: Heart, color: "text-destructive", time: "2m ago" },
  { type: "comment", user: "Bob", action: "commented on your post", icon: MessageCircle, color: "text-accent", time: "5m ago" },
  { type: "achievement", user: "You", action: "earned First Steps badge", icon: Award, color: "text-warning", time: "1h ago" },
  { type: "follow", user: "Carol", action: "tagged you in a shout-out", icon: UserPlus, color: "text-success", time: "2h ago" },
  { type: "star", user: "Dave", action: "starred your recognition", icon: Star, color: "text-primary", time: "3h ago" },
];

export const ActivityFeed = () => (
  <div className="space-y-1">
    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
      Recent Activity
    </h3>
    {activities.map((a, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.08 }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-muted text-sm font-bold">
            {a.user[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold">{a.user}</span>{" "}
            <span className="text-muted-foreground">{a.action}</span>
          </p>
          <p className="text-xs text-muted-foreground">{a.time}</p>
        </div>
        <a.icon className={`h-4 w-4 ${a.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
      </motion.div>
    ))}
  </div>
);
