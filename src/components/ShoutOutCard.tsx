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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShoutOut {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sender_id: string;
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

  const totalReactions = (shoutOut.reactions?.like || 0) + 
    (shoutOut.reactions?.clap || 0) + 
    (shoutOut.reactions?.star || 0);

  const isOwner = userId === shoutOut.sender_id;
  const canModerate = isAdmin || isOwner;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("shout_outs")
        .delete()
        .eq("id", shoutOut.id);

      if (error) throw error;

      toast({
        title: "Shout-out deleted!",
        description: "Your shout-out has been removed.",
      });

      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden border-2 border-primary/20 hover:shadow-glow transition-all duration-500 bg-card/80 backdrop-blur-xl hover:scale-[1.01] group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-primary opacity-10 rounded-bl-[100px] group-hover:opacity-20 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-secondary opacity-10 rounded-tr-[100px] group-hover:opacity-20 transition-opacity" />
        
        <CardHeader className="space-y-4 relative">
          <div className="flex items-start gap-4">
            <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${shoutOut.sender_id}`)}>
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-50"></div>
              <Avatar className="h-16 w-16 border-3 border-white shadow-lg relative hover:scale-110 transition-transform">
                <AvatarImage src={shoutOut.sender.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white font-bold text-xl">
                  {shoutOut.sender.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                      {shoutOut.sender.full_name || "Unknown User"}
                    </h3>
                    {shoutOut.recipients.length > 0 && (
                      <>
                        <ArrowRight className="h-5 w-5 text-accent animate-pulse" />
                        <div className="flex items-center gap-2 flex-wrap">
                          {shoutOut.recipients.slice(0, 2).map((recipient, index) => (
                            <span key={index} className="font-bold text-lg bg-gradient-secondary bg-clip-text text-transparent">
                              {recipient.full_name || "Unknown"}
                            </span>
                          ))}
                          {shoutOut.recipients.length > 2 && (
                            <Badge className="rounded-full bg-gradient-accent text-white border-0 shadow-md">
                              +{shoutOut.recipients.length - 2}
                            </Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs bg-gradient-primary text-white border-0 shadow-md">
                      {shoutOut.sender.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(shoutOut.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {canModerate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => setEditDialogOpen(true)}
                        className="gap-2 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {!isOwner && <ReportShoutOutDialog shoutOutId={shoutOut.id} />}
              </div>
            </div>
          </div>
        </CardHeader>

      <CardContent className="space-y-5 relative">
        <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base font-medium">
          {shoutOut.content}
        </p>

        {shoutOut.image_url && (
          <div className="rounded-2xl overflow-hidden border-3 border-primary/20 shadow-elegant animate-in fade-in zoom-in-95 duration-500 group-hover:shadow-glow transition-shadow">
            <img
              src={shoutOut.image_url}
              alt="Shout-out attachment"
              className="w-full h-auto max-h-96 object-cover hover:scale-110 transition-transform duration-700"
            />
          </div>
        )}

        <div className="pt-5 space-y-4">
          <div className="flex items-center justify-between border-t-2 border-gradient-primary pt-4">
            <div className="flex items-center gap-3">
              <ReactionButtons 
                shoutOutId={shoutOut.id} 
                userId={userId}
                reactions={shoutOut.reactions}
                userReactions={(shoutOut.userReactions || []) as ('like' | 'clap' | 'star')[]}
              />
              <BookmarkButton shoutOutId={shoutOut.id} userId={userId} />
            </div>
            
            {totalReactions > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-accent rounded-full shadow-accent">
                <span className="text-base font-bold text-white">
                  {totalReactions}
                </span>
                <span className="text-sm text-white font-semibold">
                  {totalReactions === 1 ? 'reaction' : 'reactions'}
                </span>
              </div>
            )}
          </div>

          <CommentSection shoutOutId={shoutOut.id} userId={userId} />
        </div>
      </CardContent>
    </Card>

    <EditShoutOutDialog
      shoutOutId={shoutOut.id}
      currentContent={shoutOut.content}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      onSuccess={() => onUpdate?.()}
    />

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shout-out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this shout-out? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};