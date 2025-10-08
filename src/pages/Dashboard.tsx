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

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  department: string;
  avatar_url: string | null;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (!session) {
            navigate("/auth");
          }
        }
      );

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [profileRes, articlesRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).single(),
          supabase.from("articles").select("*").order("created_at", { ascending: false }),
        ]);

        if (profileRes.error) throw profileRes.error;
        setProfile(profileRes.data);

        if (articlesRes.error) throw articlesRes.error;
        setArticles(articlesRes.data || []);
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
      manager: "Manager",
      hr: "HR",
      team_lead: "Team Lead",
      employee: "Employee",
      learner: "Learner",
      fresher: "Fresher",
    };
    return roleMap[role] || role;
  };

  const getDepartmentDisplay = (dept: string) => {
    const deptMap: Record<string, string> = {
      engineering: "Engineering",
      human_resources: "Human Resources",
      marketing: "Marketing",
      sales: "Sales",
      operations: "Operations",
      general: "General",
    };
    return deptMap[dept] || dept;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar profile={profile} userEmail={user?.email || null} />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent flex-1">
                BragBoard
              </h1>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container mx-auto px-4 py-8 space-y-8">
              {/* Welcome Section */}
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
                <CardContent className="py-6">
                  <h2 className="text-2xl font-bold mb-2">
                    Hey {profile?.full_name || user?.email?.split("@")[0]} ({getRoleDisplay(profile?.role || "employee")}), you were last working on
                  </h2>
                  <p className="text-muted-foreground">
                    Welcome back to BragBoard! Continue sharing your achievements.
                  </p>
                </CardContent>
              </Card>

              {/* Articles Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Latest Updates</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {articles.map((article) => (
                    <Card key={article.id} className="shadow-lg hover:shadow-xl transition-shadow hover-scale">
                      <CardHeader>
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-md mb-4 flex items-center justify-center">
                          <span className="text-4xl">🎯</span>
                        </div>
                        <CardTitle>{article.title}</CardTitle>
                        <CardDescription>{article.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Profile Stats */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Your information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-lg font-semibold">{profile?.full_name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-lg font-semibold">{user?.email}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>Role & Department</CardTitle>
                    <CardDescription>Your organizational details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Employee Type</p>
                      <Badge className="bg-gradient-to-r from-primary to-primary-glow">
                        {getRoleDisplay(profile?.role || "employee")}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Department</p>
                      <Badge variant="secondary">
                        {getDepartmentDisplay(profile?.department || "general")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="text-sm">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
