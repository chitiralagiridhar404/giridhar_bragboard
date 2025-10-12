import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ReactionType = 'like' | 'clap' | 'star';

export interface Reactions {
  like: number;
  clap: number;
  star: number;
}

export const useReactions = (shoutOutId: string, userId?: string) => {
  const [reactions, setReactions] = useState<Reactions>({ like: 0, clap: 0, star: 0 });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchReactions();
    }
  }, [shoutOutId, userId]);

  const fetchReactions = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('shout_out_reactions')
      .select('reaction_type, user_id')
      .eq('shout_out_id', shoutOutId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    const counts: Reactions = { like: 0, clap: 0, star: 0 };
    const userReacted: ReactionType[] = [];

    data?.forEach((reaction) => {
      counts[reaction.reaction_type as ReactionType]++;
      if (reaction.user_id === userId) {
        userReacted.push(reaction.reaction_type as ReactionType);
      }
    });

    setReactions(counts);
    setUserReactions(userReacted);
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to react to posts",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const hasReacted = userReactions.includes(reactionType);

    try {
      if (hasReacted) {
        const { error } = await supabase
          .from('shout_out_reactions')
          .delete()
          .eq('shout_out_id', shoutOutId)
          .eq('user_id', userId)
          .eq('reaction_type', reactionType);

        if (error) throw error;

        setReactions(prev => ({ ...prev, [reactionType]: Math.max(0, prev[reactionType] - 1) }));
        setUserReactions(prev => prev.filter(r => r !== reactionType));
      } else {
        const { error } = await supabase
          .from('shout_out_reactions')
          .insert({
            shout_out_id: shoutOutId,
            user_id: userId,
            reaction_type: reactionType,
          });

        if (error) throw error;

        setReactions(prev => ({ ...prev, [reactionType]: prev[reactionType] + 1 }));
        setUserReactions(prev => [...prev, reactionType]);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reactions,
    userReactions,
    isLoading,
    handleReaction,
  };
};
