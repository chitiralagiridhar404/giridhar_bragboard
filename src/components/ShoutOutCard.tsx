import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ReactionButtons } from "@/features/reactions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Edit2, Trash2, MoreVertical } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { EditShoutOutDialog } from "./EditShoutOutDialog";
import { ReportShoutOutDialog } from "./ReportShoutOutDialog";
import { BookmarkButton } from "./BookmarkButton";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ShoutOut {
  id: string; content: string; image_url: string | null; created_at: string; sender_id: string;
  sender: { full_name: string | null; role: string; department: string; avatar_url: string | null; };
  recipients: { full_name: string | null; role: string; }[];
  reactions?: { like: number; clap: number; star: number; };
  userReactions?: string[];
}

export const ShoutOutCard = ({ shoutOut, onUpdate }: { shoutOut: ShoutOut; onUpdate?: () => void }) => {
  const [userId, setUserId] = useState<string>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const totalReactions = (shoutOut.reactions?.like || 0) + (shoutOut.reactions?.clap || 0) + (shoutOut.reactions?.star || 0);
  const isOwner = userId === shoutOut.sender_id;
  const canModerate = isAdmin || isOwner;

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("shout_outs").delete().eq("id", shoutOut.id);
      if (error) throw error;
      toast({ title: "Shout-out deleted!" });
      onUpdate?.();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden glass-card border-0 rounded-2xl hover-lift group">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-rainbow opacity-60 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="space-y-3 relative pb-3">
          <div className="flex items-start gap-4">
            <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${shoutOut.sender_id}`)}>
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
              <Avatar className="h-14 w-14 border-2 border-card shadow-lg relative hover:scale-105 transition-transform">
                <AvatarImage src={shoutOut.sender.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-lg">
                  {shoutOut.sender.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-gradient-primary cursor-pointer hover:opacity-80"
                      onClick={() => navigate(`/profile/${shoutOut.sender_id}`)}>
                      {shoutOut.sender.full_name || "Unknown User"}
                    </h3>
                    {shoutOut.recipients.length > 0 && (
                      <>
                        <ArrowRight className="h-4 w-4 text-accent" />
                        <div className="flex items-center gap-1 flex-wrap">
                          {shoutOut.recipients.slice(0, 2).map((r, i) => (
                            <span key={i} className="font-bold text-gradient-secondary">{r.full_name || "Unknown"}</span>
                          ))}
                          {shoutOut.recipients.length > 2 && (
                            <Badge className="rounded-full bg-gradient-accent text-primary-foreground border-0 text-xs">+{shoutOut.recipients.length - 2}</Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[10px] bg-gradient-primary text-primary-foreground border-0 px-2 py-0.5">{shoutOut.sender.role}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(shoutOut.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {canModerate && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50 rounded-xl">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => setEditDialogOpen(true)} className="gap-2 rounded-lg"><Edit2 className="h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="gap-2 rounded-lg text-destructive focus:text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {!isOwner && <ReportShoutOutDialog shoutOutId={shoutOut.id} />}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative pt-0">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{shoutOut.content}</p>

          {shoutOut.image_url && (
            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-card">
              <img src={shoutOut.image_url} alt="Shout-out attachment" className="w-full h-auto max-h-80 object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          )}

          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex items-center gap-2">
                <ReactionButtons shoutOutId={shoutOut.id} userId={userId} reactions={shoutOut.reactions} userReactions={(shoutOut.userReactions || []) as ('like' | 'clap' | 'star')[]} />
                <BookmarkButton shoutOutId={shoutOut.id} userId={userId} />
              </div>
              {totalReactions > 0 && (
                <Badge variant="secondary" className="rounded-full gap-1 px-3">
                  {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
                </Badge>
              )}
            </div>
            <CommentSection shoutOutId={shoutOut.id} userId={userId} />
          </div>
        </CardContent>
      </Card>

      <EditShoutOutDialog shoutOutId={shoutOut.id} currentContent={shoutOut.content} open={editDialogOpen} onOpenChange={setEditDialogOpen} onSuccess={() => onUpdate?.()} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shout-out</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
