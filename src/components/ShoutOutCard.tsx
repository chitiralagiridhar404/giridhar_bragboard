import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, Sparkles, Star } from "lucide-react";
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
  reactions?: {
    like: number;
    clap: number;
    star: number;
  };
  userReactions?: string[];
}

export const ShoutOutCard = ({ shoutOut }: { shoutOut: ShoutOut }) => {
  const [reactions, setReactions] = useState(shoutOut.reactions || { like: 0, clap: 0, star: 0 });
  const [userReactions, setUserReactions] = useState<string[]>(shoutOut.userReactions || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReaction = async (reactionType: 'like' | 'clap' | 'star') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to react to posts",
          variant: "destructive",
        });
        return;
      }

      const hasReacted = userReactions.includes(reactionType);

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
        setUserReactions(prev => prev.filter(r => r !== reactionType));
      } else {
        // Add reaction
        const { error } = await supabase
          .from("shout_out_reactions")
          .insert({
            shout_out_id: shoutOut.id,
            user_id: user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;

        setReactions(prev => ({
          ...prev,
          [reactionType]: prev[reactionType] + 1
        }));
        setUserReactions(prev => [...prev, reactionType]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
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
      </CardHeader>

      <CardContent className="space-y-4">
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

        <div className="flex items-center gap-2 pt-4 mt-4 border-t">
          <Button
            variant={userReactions.includes('like') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleReaction('like')}
            disabled={isLoading}
            className="gap-1"
          >
            <Heart className={`h-4 w-4 ${userReactions.includes('like') ? 'fill-current' : ''}`} />
            <span>{reactions.like || 0}</span>
          </Button>
          
          <Button
            variant={userReactions.includes('clap') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleReaction('clap')}
            disabled={isLoading}
            className="gap-1"
          >
            <Sparkles className={`h-4 w-4 ${userReactions.includes('clap') ? 'fill-current' : ''}`} />
            <span>{reactions.clap || 0}</span>
          </Button>
          
          <Button
            variant={userReactions.includes('star') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleReaction('star')}
            disabled={isLoading}
            className="gap-1"
          >
            <Star className={`h-4 w-4 ${userReactions.includes('star') ? 'fill-current' : ''}`} />
            <span>{reactions.star || 0}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};