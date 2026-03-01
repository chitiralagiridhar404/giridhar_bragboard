import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminButton } from "@/components/AdminButton";
import { NotificationBell } from "@/components/NotificationBell";
import { SearchBar } from "@/components/SearchBar";
import { StatsCards } from "@/components/StatsCards";
import { TrendingSection } from "@/components/TrendingSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WelcomeHero } from "@/components/WelcomeHero";
import { QuickActions } from "@/components/QuickActions";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MoodSelector } from "@/components/MoodSelector";
import { ProgressRing } from "@/components/ProgressRing";
import { AchievementBadges } from "@/components/AchievementBadges";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { LogOut } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  department: string;
  avatar_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (!session) navigate("/auth");
        }
      );
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      return () => subscription.unsubscribe();
    };
    initAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      manager: "Manager", hr: "HR", team_lead: "Team Lead",
      employee: "Employee", learner: "Learner", fresher: "Fresher",
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar profile={profile} userEmail={user?.email || null} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b glass-strong">
            <div className="container mx-auto px-4 py-3 flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-xl font-extrabold text-gradient-primary flex-1">BragBoard</h1>
              <SearchBar />
              <ThemeToggle />
              <NotificationBell userId={user?.id} />
              <AdminButton />
              <Button onClick={handleLogout} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <PageTransition className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
              {/* Welcome */}
              <WelcomeHero
                name={profile?.full_name || user?.email?.split("@")[0] || "User"}
                role={getRoleDisplay(profile?.role || "employee")}
                avatarUrl={profile?.avatar_url}
                streak={7}
              />

              {/* Quick Actions */}
              <QuickActions />

              {/* Stats */}
              <StatsCards userId={user?.id} />

              {/* Main Grid */}
              <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <StaggerItem className="lg:col-span-2 space-y-6">
                  {/* Mood + Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MoodSelector />
                    <div className="glass-card rounded-2xl p-5 flex items-center justify-around">
                      <ProgressRing progress={72} size={100} label="Weekly Goal" sublabel="18/25 shout-outs" />
                      <ProgressRing progress={45} size={100} label="Monthly" sublabel="45/100 given" />
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Your Achievements</h3>
                    <AchievementBadges userId={user?.id} />
                  </div>

                  {/* Profile Card */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="glass-card border-0 rounded-2xl hover-lift">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Profile</CardTitle>
                        <CardDescription>Your information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="font-semibold">{profile?.full_name || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-semibold text-sm">{user?.email}</p>
                        </div>
                        <Badge className="bg-gradient-primary text-primary-foreground border-0">
                          {getRoleDisplay(profile?.role || "employee")}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-0 rounded-2xl hover-lift">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Account</CardTitle>
                        <CardDescription>Status & details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                          <span className="text-sm font-semibold">Active</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Member Since</p>
                          <p className="text-sm font-semibold">
                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </StaggerItem>

                {/* Right Column */}
                <StaggerItem className="space-y-6">
                  {/* Activity Feed */}
                  <div className="glass-card rounded-2xl p-5">
                    <ActivityFeed />
                  </div>

                  {/* Trending */}
                  <TrendingSection />
                </StaggerItem>
              </StaggerContainer>
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
