import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  shoutOutId: string;
  userId?: string;
}

export const BookmarkButton = ({ shoutOutId, userId }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      checkBookmark();
    }
  }, [userId, shoutOutId]);

  const checkBookmark = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('shout_out_id', shoutOutId)
      .single();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('shout_out_id', shoutOutId);

      if (!error) {
        setIsBookmarked(false);
        toast({ title: "Bookmark removed" });
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: userId, shout_out_id: shoutOutId });

      if (!error) {
        setIsBookmarked(true);
        toast({ title: "Bookmarked!" });
      }
    }

    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleBookmark}
      disabled={loading}
      className={cn(
        "gap-2 transition-all duration-300",
        isBookmarked && "text-amber-500 hover:text-amber-600"
      )}
    >
      <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
      {isBookmarked ? "Saved" : "Save"}
    </Button>
  );
};
