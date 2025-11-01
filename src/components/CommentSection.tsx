import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Trash2, Edit2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  shoutOutId: string;
  userId?: string;
}

export const CommentSection = ({ shoutOutId, userId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        user:profiles!comments_user_id_fkey(full_name, avatar_url)
      `)
      .eq("shout_out_id", shoutOutId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data.map(comment => ({
        ...comment,
        user: Array.isArray(comment.user) ? comment.user[0] : comment.user
      })));
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`comments-${shoutOutId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `shout_out_id=eq.${shoutOutId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shoutOutId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          shout_out_id: shoutOutId,
          user_id: userId,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
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

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({ content: editContent.trim() })
        .eq("id", commentId);

      if (error) throw error;

      setEditingId(null);
      setEditContent("");
      toast({
        title: "Comment updated!",
      });
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

  const handleDeleteComment = async (commentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Comment deleted!",
      });
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
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="gap-2 border-2 border-accent/30 hover:border-accent hover:bg-accent/10 transition-all"
      >
        <MessageCircle className="h-4 w-4" />
        {comments.length > 0 ? `${comments.length} Comments` : "Add Comment"}
      </Button>

      {showComments && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Add Comment */}
          <div className="flex gap-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[80px] border-2 focus:border-primary"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              size="icon"
              className="bg-gradient-accent h-[80px] w-12 hover:shadow-accent"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border-2 border-primary/10 hover:border-primary/20 transition-all"
              >
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={comment.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {comment.user.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {comment.user.full_name || "Unknown User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                        {comment.updated_at !== comment.created_at && " (edited)"}
                      </p>
                    </div>

                    {userId === comment.user_id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="flex gap-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editContent.trim() || loading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
