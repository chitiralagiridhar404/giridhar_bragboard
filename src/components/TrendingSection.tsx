import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrendingPost {
  id: string;
  content: string;
  created_at: string;
  engagement_score: number;
  sender: {
    full_name: string;
    avatar_url?: string;
  };
  reactions_count: number;
  comments_count: number;
}

export const TrendingSection = () => {
  const [trending, setTrending] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    // Get shout-outs with their reaction and comment counts
    const { data: shoutOuts } = await supabase
      .from('shout_outs')
      .select(`
        id,
        content,
        created_at,
        sender:profiles!shout_outs_sender_id_fkey(full_name, avatar_url)
      `)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (shoutOuts) {
      // Calculate engagement for each post
      const postsWithEngagement = await Promise.all(
        shoutOuts.map(async (post) => {
          const { count: reactionsCount } = await supabase
            .from('shout_out_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('shout_out_id', post.id);

          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('shout_out_id', post.id);

          return {
            ...post,
            reactions_count: reactionsCount || 0,
            comments_count: commentsCount || 0,
            engagement_score: (reactionsCount || 0) * 2 + (commentsCount || 0) * 3,
          };
        })
      );

      const sorted = postsWithEngagement
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, 5);

      setTrending(sorted as any);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Trending This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : trending.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trending posts yet
            </div>
          ) : (
            <div className="space-y-4">
              {trending.map((post, index) => (
                <div
                  key={post.id}
                  className="p-4 rounded-lg bg-card border hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.sender.avatar_url} />
                      <AvatarFallback>{post.sender.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{post.sender.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.reactions_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.comments_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
