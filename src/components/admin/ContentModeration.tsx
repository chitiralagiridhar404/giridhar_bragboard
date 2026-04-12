import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, MessageSquare, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  shout_out_id: string;
  profile: { full_name: string | null; avatar_url: string | null } | null;
  shout_out: { content: string } | null;
}

export const ContentModeration = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [shoutOuts, setShoutOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'comments' | 'posts'>('posts');

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [commentsRes, postsRes] = await Promise.all([
        supabase.functions.invoke('admin-actions', { body: { action: 'get_all_comments' } }),
        supabase.functions.invoke('admin-actions', { body: { action: 'get_all_shout_outs' } }),
      ]);
      setComments(commentsRes.data?.comments || []);
      setShoutOuts(postsRes.data?.shoutOuts || []);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-actions', {
        body: { action: 'delete_comment', commentId },
      });
      if (error) throw error;
      toast.success('Comment deleted');
      fetchContent();
    } catch { toast.error('Failed to delete comment'); }
  };

  const handleDeleteShoutOut = async (shoutOutId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-actions', {
        body: { action: 'delete_shout_out', shoutOutId },
      });
      if (error) throw error;
      toast.success('Post deleted');
      fetchContent();
    } catch { toast.error('Failed to delete post'); }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0 rounded-2xl">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 rounded-2xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-accent to-secondary" />
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="text-gradient-primary flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Content Moderation
        </CardTitle>
        <div className="flex gap-2">
          <Button variant={tab === 'posts' ? 'default' : 'outline'} size="sm" onClick={() => setTab('posts')} className="rounded-xl">
            Posts ({shoutOuts.length})
          </Button>
          <Button variant={tab === 'comments' ? 'default' : 'outline'} size="sm" onClick={() => setTab('comments')} className="rounded-xl">
            Comments ({comments.length})
          </Button>
          <Button variant="outline" size="icon" onClick={fetchContent} className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          {tab === 'posts' ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shoutOuts.map((post, i) => {
                  const sender = Array.isArray(post.sender) ? post.sender[0] : post.sender;
                  return (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{sender?.full_name || 'Unknown'}</TableCell>
                      <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{post.category || 'general'}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="rounded-lg h-8 gap-1">
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently remove the post.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteShoutOut(post.id)} className="bg-destructive">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>On Post</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment, i) => (
                  <motion.tr
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{comment.profile?.full_name || 'Unknown'}</TableCell>
                    <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{comment.shout_out?.content?.slice(0, 50) || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="rounded-lg h-8 gap-1">
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
