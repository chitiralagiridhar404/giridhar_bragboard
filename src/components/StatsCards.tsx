import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Heart, MessageCircle, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalShoutOuts: number;
  totalReactions: number;
  totalComments: number;
  receivedShoutOuts: number;
}

export const StatsCards = ({ userId }: { userId?: string }) => {
  const [stats, setStats] = useState<Stats>({
    totalShoutOuts: 0,
    totalReactions: 0,
    totalComments: 0,
    receivedShoutOuts: 0,
  });

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId]);

  const fetchStats = async () => {
    // Sent shout-outs
    const { count: sentCount } = await supabase
      .from('shout_outs')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId);

    // Received shout-outs
    const { count: receivedCount } = await supabase
      .from('shout_out_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId);

    // Reactions given
    const { count: reactionsCount } = await supabase
      .from('shout_out_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Comments made
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    setStats({
      totalShoutOuts: sentCount || 0,
      totalReactions: reactionsCount || 0,
      totalComments: commentsCount || 0,
      receivedShoutOuts: receivedCount || 0,
    });
  };

  const cards = [
    {
      title: "Shout-outs Sent",
      value: stats.totalShoutOuts,
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      title: "Received",
      value: stats.receivedShoutOuts,
      icon: Award,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      title: "Reactions Given",
      value: stats.totalReactions,
      icon: Heart,
      gradient: "from-red-500 to-orange-500",
      bgGradient: "from-red-500/10 to-orange-500/10",
    },
    {
      title: "Comments",
      value: stats.totalComments,
      icon: MessageCircle,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
    },
  ];

  if (!userId) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`bg-gradient-to-br ${card.bgGradient} border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${card.gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
