import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ReactionButtons } from "@/features/reactions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

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
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const totalReactions = (shoutOut.reactions?.like || 0) + 
    (shoutOut.reactions?.clap || 0) + 
    (shoutOut.reactions?.star || 0);

  return (
    <Card className="relative overflow-hidden border-2 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 bg-gradient-to-br from-card to-card/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
      
      <CardHeader className="space-y-4 relative">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-primary/20 ring-2 ring-background">
              <AvatarImage src={shoutOut.sender.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold">
                {shoutOut.sender.full_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg">
                    {shoutOut.sender.full_name || "Unknown User"}
                  </h3>
                  {shoutOut.recipients.length > 0 && (
                    <>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2 flex-wrap">
                        {shoutOut.recipients.slice(0, 2).map((recipient, index) => (
                          <span key={index} className="font-semibold text-foreground">
                            {recipient.full_name || "Unknown"}
                          </span>
                        ))}
                        {shoutOut.recipients.length > 2 && (
                          <Badge variant="secondary" className="rounded-full">
                            +{shoutOut.recipients.length - 2}
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5">
                    {shoutOut.sender.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(shoutOut.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
          {shoutOut.content}
        </p>

        {shoutOut.image_url && (
          <div className="rounded-xl overflow-hidden border-2 border-primary/10 shadow-lg animate-in fade-in zoom-in-95 duration-300">
            <img
              src={shoutOut.image_url}
              alt="Shout-out attachment"
              className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="pt-4 flex items-center justify-between border-t-2 border-dashed border-border">
          <ReactionButtons 
            shoutOutId={shoutOut.id} 
            userId={userId}
            reactions={shoutOut.reactions}
            userReactions={(shoutOut.userReactions || []) as ('like' | 'clap' | 'star')[]}
          />
          
          {totalReactions > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/20">
              <span className="text-sm font-semibold text-primary">
                {totalReactions}
              </span>
              <span className="text-xs text-muted-foreground">
                {totalReactions === 1 ? 'reaction' : 'reactions'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};