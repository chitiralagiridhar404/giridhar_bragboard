import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Heart, MessageCircle, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

interface Stats {
  totalShoutOuts: number;
  totalReactions: number;
  totalComments: number;
  receivedShoutOuts: number;
}

export const StatsCards = ({ userId }: { userId?: string }) => {
  const [stats, setStats] = useState<Stats>({ totalShoutOuts: 0, totalReactions: 0, totalComments: 0, receivedShoutOuts: 0 });

  useEffect(() => {
    if (userId) fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const [sent, received, reactions, comments] = await Promise.all([
      supabase.from('shout_outs').select('*', { count: 'exact', head: true }).eq('sender_id', userId),
      supabase.from('shout_out_recipients').select('*', { count: 'exact', head: true }).eq('recipient_id', userId),
      supabase.from('shout_out_reactions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ]);
    setStats({
      totalShoutOuts: sent.count || 0,
      totalReactions: reactions.count || 0,
      totalComments: comments.count || 0,
      receivedShoutOuts: received.count || 0,
    });
  };

  const cards = [
    { title: "Sent", value: stats.totalShoutOuts, icon: TrendingUp, gradient: "from-primary to-primary-glow" },
    { title: "Received", value: stats.receivedShoutOuts, icon: Award, gradient: "from-secondary to-destructive" },
    { title: "Reactions", value: stats.totalReactions, icon: Heart, gradient: "from-warning to-secondary" },
    { title: "Comments", value: stats.totalComments, icon: MessageCircle, gradient: "from-accent to-success" },
  ];

  if (!userId) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass-card border-0 rounded-2xl hover-lift overflow-hidden group">
              <div className={`h-1 bg-gradient-to-r ${card.gradient} group-hover:h-1.5 transition-all`} />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-3xl font-extrabold">
                      <AnimatedCounter end={card.value} />
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
