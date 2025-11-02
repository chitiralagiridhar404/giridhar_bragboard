import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Contributor {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department: string;
  count: number;
}

export const TopContributors = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const { data, error } = await supabase
          .from('shout_outs')
          .select(`
            sender_id,
            profiles!shout_outs_sender_id_fkey(user_id, full_name, avatar_url, department)
          `);

        if (error) throw error;

        // Count shout-outs per sender
        const counts = data.reduce((acc: any, item) => {
          const profile = item.profiles as any;
          if (!profile) return acc;
          
          const userId = profile.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              full_name: profile.full_name || 'Unknown',
              avatar_url: profile.avatar_url,
              department: profile.department,
              count: 0,
            };
          }
          acc[userId].count++;
          return acc;
        }, {});

        const sorted = Object.values(counts)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        setContributors(sorted as Contributor[]);
      } catch (error) {
        console.error('Error fetching top contributors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopContributors();
  }, []);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
        <CardHeader>
          <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributors.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No contributors yet</p>
        ) : (
          contributors.map((contributor, index) => (
            <div
              key={contributor.user_id}
              className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
                {index + 1}
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarImage src={contributor.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {contributor.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{contributor.full_name}</p>
                <Badge variant="outline" className="text-xs">
                  {contributor.department}
                </Badge>
              </div>
              <Badge className="bg-gradient-accent">{contributor.count} posts</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
