import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department: string;
  shout_outs_sent: number;
  shout_outs_received: number;
  reactions_received: number;
  total_score: number;
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch all profiles
        const { data: profiles } = await supabase.from('profiles').select('*');
        if (!profiles) return;

        // Calculate scores for each user
        const userScores = await Promise.all(
          profiles.map(async (profile) => {
            // Count shout-outs sent
            const { count: sentCount } = await supabase
              .from('shout_outs')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', profile.user_id);

            // Count shout-outs received
            const { count: receivedCount } = await supabase
              .from('shout_out_recipients')
              .select('*', { count: 'exact', head: true })
              .eq('recipient_id', profile.user_id);

            // Count reactions received
            const { data: shoutOutIds } = await supabase
              .from('shout_outs')
              .select('id')
              .eq('sender_id', profile.user_id);

            let reactionsCount = 0;
            if (shoutOutIds && shoutOutIds.length > 0) {
              const { count: reactions } = await supabase
                .from('shout_out_reactions')
                .select('*', { count: 'exact', head: true })
                .in('shout_out_id', shoutOutIds.map(s => s.id));
              reactionsCount = reactions || 0;
            }

            // Calculate total score: 10 points for sent, 5 for received, 2 for reactions
            const totalScore = 
              (sentCount || 0) * 10 + 
              (receivedCount || 0) * 5 + 
              reactionsCount * 2;

            return {
              user_id: profile.user_id,
              full_name: profile.full_name || 'Unknown',
              avatar_url: profile.avatar_url,
              department: profile.department,
              shout_outs_sent: sentCount || 0,
              shout_outs_received: receivedCount || 0,
              reactions_received: reactionsCount,
              total_score: totalScore,
            };
          })
        );

        // Sort by total score
        const sorted = userScores
          .filter(u => u.total_score > 0)
          .sort((a, b) => b.total_score - a.total_score)
          .slice(0, 10);

        setLeaderboard(sorted);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return <div className="w-6 h-6 flex items-center justify-center font-bold">{index + 1}</div>;
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="bg-gradient-success bg-clip-text text-transparent">
            Appreciation Leaderboard
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top contributors earn points: 10 for posts sent • 5 for being tagged • 2 for reactions
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No activity yet</p>
        ) : (
          leaderboard.map((user, index) => (
            <div
              key={user.user_id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                index < 3
                  ? 'bg-gradient-to-r from-primary/10 to-transparent border-2 border-primary/30 shadow-glow'
                  : 'bg-background/50 hover:bg-background/70'
              }`}
            >
              <div className="flex items-center justify-center w-10">
                {getRankIcon(index)}
              </div>

              <Avatar className={`h-12 w-12 ${index < 3 ? 'border-3 border-primary shadow-glow' : 'border-2 border-border'}`}>
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                  {user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className={`font-bold ${index < 3 ? 'text-lg' : ''}`}>{user.full_name}</p>
                <Badge variant="outline" className="text-xs">
                  {user.department}
                </Badge>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{user.shout_outs_sent} sent</span>
                  <span>•</span>
                  <span>{user.shout_outs_received} received</span>
                  <span>•</span>
                  <span>{user.reactions_received} reactions</span>
                </div>
              </div>

              <div className="text-right">
                <Badge
                  className={
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-lg px-4 py-2'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white text-lg px-4 py-2'
                      : index === 2
                      ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-white text-lg px-4 py-2'
                      : 'bg-gradient-primary'
                  }
                >
                  {user.total_score} pts
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
