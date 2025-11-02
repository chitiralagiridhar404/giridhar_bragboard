import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';

export const ExportReports = () => {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Fetch all shout-outs with related data
      const { data: shoutOuts, error } = await supabase
        .from('shout_outs')
        .select(`
          *,
          sender:profiles!shout_outs_sender_id_fkey(full_name, department),
          recipients:shout_out_recipients(
            recipient:profiles!shout_out_recipients_recipient_id_fkey(full_name)
          ),
          reactions:shout_out_reactions(reaction_type),
          comments:comments(content)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV format
      const csvRows = [
        ['Date', 'Sender', 'Department', 'Content', 'Recipients', 'Reactions', 'Comments'],
      ];

      shoutOuts?.forEach((shoutOut: any) => {
        const recipients = shoutOut.recipients
          ?.map((r: any) => r.recipient?.full_name)
          .filter(Boolean)
          .join('; ') || 'N/A';
        
        const reactions = shoutOut.reactions?.length || 0;
        const comments = shoutOut.comments?.length || 0;

        csvRows.push([
          new Date(shoutOut.created_at).toLocaleDateString(),
          shoutOut.sender?.full_name || 'Unknown',
          shoutOut.sender?.department || 'N/A',
          shoutOut.content.replace(/"/g, '""'), // Escape quotes
          recipients,
          reactions.toString(),
          comments.toString(),
        ]);
      });

      // Create CSV string
      const csvContent = csvRows
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `shoutouts-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const exportAnalytics = async () => {
    setExporting(true);
    try {
      // Fetch analytics data
      const [shoutOuts, profiles, reactions, comments] = await Promise.all([
        supabase.from('shout_outs').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*'),
        supabase.from('shout_out_reactions').select('*'),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
      ]);

      const analyticsData = {
        generated_at: new Date().toISOString(),
        summary: {
          total_shout_outs: shoutOuts.count,
          total_users: profiles.data?.length,
          total_reactions: reactions.data?.length,
          total_comments: comments.count,
        },
        reaction_breakdown: reactions.data?.reduce((acc: any, r: any) => {
          acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
          return acc;
        }, {}),
      };

      // Download JSON file
      const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast.success('Analytics exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          onClick={exportToCSV}
          disabled={exporting}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Table className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export CSV Report'}
        </Button>
        <Button
          onClick={exportAnalytics}
          disabled={exporting}
          variant="outline"
          className="border-primary/30"
        >
          <FileText className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Analytics (JSON)'}
        </Button>
      </CardContent>
    </Card>
  );
};
