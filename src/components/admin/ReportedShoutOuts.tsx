import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  shout_out_id: string;
  reported_by: string;
  shout_out: {
    content: string;
    sender: {
      full_name: string;
    };
  };
  reporter: {
    full_name: string;
  };
}

export const ReportedShoutOuts = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          shout_out:shout_outs!reports_shout_out_id_fkey(
            content,
            sender:profiles!shout_outs_sender_id_fkey(full_name)
          ),
          reporter:profiles!reports_reported_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data as any);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId: string, action: 'approved' | 'dismissed') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reports')
        .update({
          status: action,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Report ${action}`);
      fetchReports();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to resolve report');
    }
  };

  const handleDeleteShoutOut = async (reportId: string, shoutOutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete the shout-out
      const { error: deleteError } = await supabase
        .from('shout_outs')
        .delete()
        .eq('id', shoutOutId);

      if (deleteError) throw deleteError;

      // Mark report as resolved
      await supabase
        .from('reports')
        .update({
          status: 'approved',
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      toast.success('Shout-out deleted and report resolved');
      fetchReports();
    } catch (error) {
      console.error('Error deleting shout-out:', error);
      toast.error('Failed to delete shout-out');
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="bg-gradient-accent bg-clip-text text-transparent">
          Reported Shout-outs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reports to review</p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-lg bg-background/50 border border-border space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-muted-foreground">
                    Reported by: <span className="font-medium text-foreground">{report.reporter?.full_name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From: <span className="font-medium text-foreground">{report.shout_out?.sender?.full_name}</span>
                  </p>
                  <p className="text-sm font-medium mt-2">Content:</p>
                  <p className="text-sm">{report.shout_out?.content}</p>
                  <p className="text-sm font-medium mt-2">Reason:</p>
                  <p className="text-sm text-destructive">{report.reason}</p>
                </div>
                <Badge
                  variant={report.status === 'pending' ? 'default' : 'secondary'}
                  className={
                    report.status === 'pending'
                      ? 'bg-gradient-warning'
                      : report.status === 'approved'
                      ? 'bg-gradient-success'
                      : 'bg-muted'
                  }
                >
                  {report.status}
                </Badge>
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this shout-out?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The shout-out will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteShoutOut(report.id, report.shout_out_id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(report.id, 'dismissed')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Dismiss Report
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
