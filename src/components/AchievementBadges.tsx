import { useEffect, useState } from "react";
import { Award, Trophy, Star, Zap, Target, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    type: "first_shoutout",
    title: "First Steps",
    description: "Sent your first shout-out",
    icon: Star,
    color: "from-yellow-500 to-amber-500",
  },
  {
    type: "ten_shoutouts",
    title: "Getting Started",
    description: "Sent 10 shout-outs",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
  },
  {
    type: "super_contributor",
    title: "Super Contributor",
    description: "Sent 50+ shout-outs",
    icon: Trophy,
    color: "from-purple-500 to-pink-500",
  },
  {
    type: "popular",
    title: "Popular",
    description: "Received 25+ shout-outs",
    icon: Award,
    color: "from-green-500 to-emerald-500",
  },
  {
    type: "engaged",
    title: "Engaged",
    description: "100+ reactions given",
    icon: Target,
    color: "from-red-500 to-orange-500",
  },
  {
    type: "legend",
    title: "Legend",
    description: "Top contributor for 3 months",
    icon: Crown,
    color: "from-amber-500 to-yellow-500",
  },
];

export const AchievementBadges = ({ userId }: { userId?: string }) => {
  const [earned, setEarned] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      fetchAchievements();
      checkAndAwardAchievements();
    }
  }, [userId]);

  const fetchAchievements = async () => {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_type')
      .eq('user_id', userId);

    if (data) {
      setEarned(data.map(a => a.achievement_type));
    }
  };

  const checkAndAwardAchievements = async () => {
    // Check for first shout-out
    const { count: shoutOutCount } = await supabase
      .from('shout_outs')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId);

    if (shoutOutCount && shoutOutCount >= 1 && !earned.includes('first_shoutout')) {
      await awardAchievement('first_shoutout');
    }
    if (shoutOutCount && shoutOutCount >= 10 && !earned.includes('ten_shoutouts')) {
      await awardAchievement('ten_shoutouts');
    }
    if (shoutOutCount && shoutOutCount >= 50 && !earned.includes('super_contributor')) {
      await awardAchievement('super_contributor');
    }

    // Check for received shout-outs
    const { count: receivedCount } = await supabase
      .from('shout_out_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId);

    if (receivedCount && receivedCount >= 25 && !earned.includes('popular')) {
      await awardAchievement('popular');
    }

    // Check for reactions given
    const { count: reactionsCount } = await supabase
      .from('shout_out_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (reactionsCount && reactionsCount >= 100 && !earned.includes('engaged')) {
      await awardAchievement('engaged');
    }
  };

  const awardAchievement = async (type: string) => {
    await supabase
      .from('user_achievements')
      .insert({ user_id: userId, achievement_type: type });
    
    fetchAchievements();
  };

  if (!userId) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {ACHIEVEMENTS.map((achievement) => {
          const Icon = achievement.icon;
          const isEarned = earned.includes(achievement.type);

          return (
            <Tooltip key={achievement.type}>
              <TooltipTrigger>
                <div
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isEarned
                      ? `bg-gradient-to-r ${achievement.color} shadow-lg hover:scale-110`
                      : 'bg-muted opacity-40'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isEarned ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};
