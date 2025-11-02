import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, TrendingUp, Trophy, AlertTriangle } from 'lucide-react';
import { TopContributors } from '@/components/admin/TopContributors';
import { MostTagged } from '@/components/admin/MostTagged';
import { ReportedShoutOuts } from '@/components/admin/ReportedShoutOuts';
import { Leaderboard } from '@/components/admin/Leaderboard';
import { ExportReports } from '@/components/admin/ExportReports';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();
  const [stats, setStats] = useState({
    totalShoutOuts: 0,
    totalUsers: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/shout-outs');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [shoutOuts, users, reports] = await Promise.all([
        supabase.from('shout_outs').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalShoutOuts: shoutOuts.count || 0,
        totalUsers: users.count || 0,
        pendingReports: reports.count || 0,
      });
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-rainbow bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Shout-outs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats.totalShoutOuts}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border-2 border-secondary/20 shadow-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border-2 border-destructive/20 shadow-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {stats.pendingReports}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="bg-card/60 backdrop-blur-lg border-2 border-primary/20 shadow-elegant">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-primary">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-accent">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-success">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopContributors />
              <MostTagged />
            </div>
            <ExportReports />
          </TabsContent>

          <TabsContent value="reports">
            <ReportedShoutOuts />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
