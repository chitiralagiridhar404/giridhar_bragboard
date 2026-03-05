import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface TrendingPost {
  id: string; content: string; created_at: string; engagement_score: number;
  sender: { full_name: string; avatar_url?: string; };
  reactions_count: number; comments_count: number;
}

export const TrendingSection = () => {
  const [trending, setTrending] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrending(); }, []);

  const fetchTrending = async () => {
    const { data: shoutOuts } = await supabase.from('shout_outs')
      .select(`id, content, created_at, sender:profiles!shout_outs_sender_id_fkey(full_name, avatar_url)`)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .order('created_at', { ascending: false });

    if (shoutOuts) {
      const postsWithEngagement = await Promise.all(
        shoutOuts.map(async (post) => {
          const { count: reactionsCount } = await supabase.from('shout_out_reactions').select('*', { count: 'exact', head: true }).eq('shout_out_id', post.id);
          const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('shout_out_id', post.id);
          return { ...post, reactions_count: reactionsCount || 0, comments_count: commentsCount || 0, engagement_score: (reactionsCount || 0) * 2 + (commentsCount || 0) * 3 };
        })
      );
      const normalized = postsWithEngagement.map(p => ({
        ...p,
        sender: Array.isArray(p.sender) ? p.sender[0] : p.sender,
      }));
      setTrending(normalized.sort((a, b) => b.engagement_score - a.engagement_score).slice(0, 5) as any);
    }
    setLoading(false);
  };

  return (
    <Card className="glass-card border-0 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-warning to-destructive">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          Trending This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">Loading...</div>
          ) : trending.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-3xl block mb-2">🔥</span>
              No trending posts yet
            </div>
          ) : (
            <div className="space-y-3">
              {trending.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-warning to-destructive text-primary-foreground font-bold text-xs">
                      #{index + 1}
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={post.sender.avatar_url} />
                      <AvatarFallback className="text-xs">{(post.sender?.full_name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate">{post.sender?.full_name || "Unknown"}</p>
                    </div>
                  </div>
                  <p className="text-xs mb-2 line-clamp-2 text-muted-foreground">{post.content}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.reactions_count}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments_count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
