import { useEffect, useState } from "react";
import { Award, Trophy, Star, Zap, Target, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface Achievement { type: string; title: string; description: string; icon: any; color: string; }

const ACHIEVEMENTS: Achievement[] = [
  { type: "first_shoutout", title: "First Steps", description: "Sent your first shout-out", icon: Star, color: "from-warning to-secondary" },
  { type: "ten_shoutouts", title: "Getting Started", description: "Sent 10 shout-outs", icon: Zap, color: "from-accent to-success" },
  { type: "super_contributor", title: "Super Contributor", description: "Sent 50+ shout-outs", icon: Trophy, color: "from-secondary to-destructive" },
  { type: "popular", title: "Popular", description: "Received 25+ shout-outs", icon: Award, color: "from-success to-accent" },
  { type: "engaged", title: "Engaged", description: "100+ reactions given", icon: Target, color: "from-destructive to-warning" },
  { type: "legend", title: "Legend", description: "Top contributor for 3 months", icon: Crown, color: "from-warning to-primary" },
];

export const AchievementBadges = ({ userId }: { userId?: string }) => {
  const [earned, setEarned] = useState<string[]>([]);

  useEffect(() => {
    if (userId) { fetchAchievements(); checkAndAwardAchievements(); }
  }, [userId]);

  const fetchAchievements = async () => {
    const { data } = await supabase.from('user_achievements').select('achievement_type').eq('user_id', userId);
    if (data) setEarned(data.map(a => a.achievement_type));
  };

  const checkAndAwardAchievements = async () => {
    const { count: shoutOutCount } = await supabase.from('shout_outs').select('*', { count: 'exact', head: true }).eq('sender_id', userId);
    if (shoutOutCount && shoutOutCount >= 1 && !earned.includes('first_shoutout')) await awardAchievement('first_shoutout');
    if (shoutOutCount && shoutOutCount >= 10 && !earned.includes('ten_shoutouts')) await awardAchievement('ten_shoutouts');
    if (shoutOutCount && shoutOutCount >= 50 && !earned.includes('super_contributor')) await awardAchievement('super_contributor');
    const { count: receivedCount } = await supabase.from('shout_out_recipients').select('*', { count: 'exact', head: true }).eq('recipient_id', userId);
    if (receivedCount && receivedCount >= 25 && !earned.includes('popular')) await awardAchievement('popular');
    const { count: reactionsCount } = await supabase.from('shout_out_reactions').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    if (reactionsCount && reactionsCount >= 100 && !earned.includes('engaged')) await awardAchievement('engaged');
  };

  const awardAchievement = async (type: string) => {
    await supabase.from('user_achievements').insert({ user_id: userId, achievement_type: type });
    fetchAchievements();
  };

  if (!userId) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {ACHIEVEMENTS.map((achievement, i) => {
          const Icon = achievement.icon;
          const isEarned = earned.includes(achievement.type);
          return (
            <Tooltip key={achievement.type}>
              <TooltipTrigger>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: "spring" }}
                  whileHover={{ scale: 1.2 }}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${
                    isEarned
                      ? `bg-gradient-to-br ${achievement.color} shadow-lg cursor-pointer`
                      : 'bg-muted/50 opacity-30'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isEarned ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="rounded-xl">
                <p className="font-bold">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {!isEarned && <p className="text-xs text-warning mt-1">🔒 Not yet earned</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};
