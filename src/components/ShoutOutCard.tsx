import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ReactionButtons } from "@/features/reactions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

        <div className="pt-4 mt-4 border-t">
          <ReactionButtons shoutOutId={shoutOut.id} userId={userId} />
        </div>
      </CardContent>
    </Card>
  );
};