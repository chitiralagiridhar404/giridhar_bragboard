import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, Hand, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShoutOut {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sender: {
    full_name: string | null;
    role: string;
    department: string;
    avatar_url: string | null;
  };
  recipients: {
    full_name: string | null;
    role: string;
  }[];
  reactions: {
    like: number;
    clap: number;
    star: number;
  };
  userReactions: {
    like: boolean;
    clap: boolean;
    star: boolean;
  };
}

export const ShoutOutCard = ({ shoutOut }: { shoutOut: ShoutOut }) => {
  const [reactions, setReactions] = useState(shoutOut.reactions);
  const [userReactions, setUserReactions] = useState(shoutOut.userReactions);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleReaction = async (reactionType: 'like' | 'clap' | 'star') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to react to shout-outs",
          variant: "destructive",
        });
        return;
      }

      const hasReacted = userReactions[reactionType];

      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from("shout_out_reactions")
          .delete()
          .eq("shout_out_id", shoutOut.id)
          .eq("user_id", user.id)
          .eq("reaction_type", reactionType);

        if (error) throw error;

        setReactions(prev => ({
          ...prev,
          [reactionType]: Math.max(0, prev[reactionType] - 1)
        }));
        setUserReactions(prev => ({
          ...prev,
          [reactionType]: false
        }));
      } else {
        // Add reaction
        const { error } = await supabase
          .from("shout_out_reactions")
          .insert({
            shout_out_id: shoutOut.id,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;

        setReactions(prev => ({
          ...prev,
          [reactionType]: prev[reactionType] + 1
        }));
        setUserReactions(prev => ({
          ...prev,
          [reactionType]: true
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={shoutOut.sender.avatar_url || undefined} />
          <AvatarFallback>
            {shoutOut.sender.full_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {shoutOut.sender.full_name || "Unknown User"}
            </h3>
            <Badge variant="outline" className="text-xs">
              {shoutOut.sender.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {shoutOut.sender.department} • {formatDistanceToNow(new Date(shoutOut.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <p className="text-foreground whitespace-pre-wrap">{shoutOut.content}</p>

      {shoutOut.image_url && (
        <div className="rounded-lg overflow-hidden border">
          <img
            src={shoutOut.image_url}
            alt="Shout-out attachment"
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      {shoutOut.recipients.length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Tagged:</span>
            {shoutOut.recipients.map((recipient, index) => (
              <Badge key={index} variant="secondary">
                {recipient.full_name || "Unknown"} • {recipient.role}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant={userReactions.like ? "default" : "outline"}
          size="sm"
          onClick={() => toggleReaction('like')}
          disabled={loading}
          className="gap-2"
        >
          <Heart className={`h-4 w-4 ${userReactions.like ? 'fill-current' : ''}`} />
          <span>{reactions.like}</span>
        </Button>
        <Button
          variant={userReactions.clap ? "default" : "outline"}
          size="sm"
          onClick={() => toggleReaction('clap')}
          disabled={loading}
          className="gap-2"
        >
          <Hand className={`h-4 w-4 ${userReactions.clap ? 'fill-current' : ''}`} />
          <span>{reactions.clap}</span>
        </Button>
        <Button
          variant={userReactions.star ? "default" : "outline"}
          size="sm"
          onClick={() => toggleReaction('star')}
          disabled={loading}
          className="gap-2"
        >
          <Star className={`h-4 w-4 ${userReactions.star ? 'fill-current' : ''}`} />
          <span>{reactions.star}</span>
        </Button>
      </div>
    </Card>
  );
};
