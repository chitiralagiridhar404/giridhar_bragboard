import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, Trophy, AlertTriangle, Users, MessageSquare, Settings } from 'lucide-react';
import { TopContributors } from '@/components/admin/TopContributors';
import { MostTagged } from '@/components/admin/MostTagged';
import { ReportedShoutOuts } from '@/components/admin/ReportedShoutOuts';
import { Leaderboard } from '@/components/admin/Leaderboard';
import { ExportReports } from '@/components/admin/ExportReports';
import { UserManagement } from '@/components/admin/UserManagement';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { motion } from 'framer-motion';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();
  const [stats, setStats] = useState({ totalShoutOuts: 0, totalUsers: 0, pendingReports: 0, totalComments: 0 });

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/shout-outs');
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [shoutOuts, users, reports, comments] = await Promise.all([
        supabase.from('shout_outs').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        totalShoutOuts: shoutOuts.count || 0,
        totalUsers: users.count || 0,
        pendingReports: reports.count || 0,
        totalComments: comments.count || 0,
      });
    };
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { title: "Total Shout-outs", value: stats.totalShoutOuts, gradient: "from-primary to-primary-glow", icon: "🎉" },
    { title: "Total Users", value: stats.totalUsers, gradient: "from-accent to-success", icon: "👥" },
    { title: "Pending Reports", value: stats.pendingReports, gradient: "from-destructive to-secondary", icon: "⚠️" },
    { title: "Total Comments", value: stats.totalComments, gradient: "from-secondary to-primary", icon: "💬" },
  ];

  return (
    <PageTransition className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-primary shadow-elegant">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gradient-rainbow">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Full control over your BragBoard community</p>
          </div>
        </motion.div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StaggerItem key={card.title}>
              <Card className="glass-card border-0 rounded-2xl hover-lift overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="text-lg">{card.icon}</span>{card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-extrabold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    <AnimatedCounter end={card.value} />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="glass-card border-0 rounded-xl h-12 p-1 flex-wrap">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-2 font-semibold">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-2 font-semibold">
              <MessageSquare className="h-4 w-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-2 font-semibold">
              <TrendingUp className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-gradient-secondary data-[state=active]:text-secondary-foreground gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Reports
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg data-[state=active]:bg-gradient-success data-[state=active]:text-success-foreground gap-2 font-semibold">
              <Trophy className="h-4 w-4" /> Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
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
    </PageTransition>
  );
};

export default Admin;
