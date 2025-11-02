import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface TaggedUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department: string;
  count: number;
}

export const MostTagged = () => {
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostTagged = async () => {
      try {
        const { data, error } = await supabase
          .from('shout_out_recipients')
          .select(`
            recipient_id,
            profiles!shout_out_recipients_recipient_id_fkey(user_id, full_name, avatar_url, department)
          `);

        if (error) throw error;

        // Count tags per recipient
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

        setTaggedUsers(sorted as TaggedUser[]);
      } catch (error) {
        console.error('Error fetching most tagged:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostTagged();
  }, []);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl border-2 border-secondary/20 shadow-glow">
        <CardHeader>
          <CardTitle className="bg-gradient-secondary bg-clip-text text-transparent">
            Most Tagged Users
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-2 border-secondary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="bg-gradient-secondary bg-clip-text text-transparent">
          Most Tagged Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {taggedUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No tagged users yet</p>
        ) : (
          taggedUsers.map((user, index) => (
            <div
              key={user.user_id}
              className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-secondary text-secondary-foreground font-bold text-sm">
                {index + 1}
              </div>
              <Avatar className="h-10 w-10 border-2 border-secondary/30">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                  {user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.full_name}</p>
                <Badge variant="outline" className="text-xs">
                  {user.department}
                </Badge>
              </div>
              <Badge className="bg-gradient-success">{user.count} tags</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
