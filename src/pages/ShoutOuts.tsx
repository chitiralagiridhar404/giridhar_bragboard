import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoutOutForm } from "@/components/ShoutOutForm";
import { ShoutOutCard } from "@/components/ShoutOutCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminButton } from "@/components/AdminButton";
import { NotificationBell } from "@/components/NotificationBell";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { Filter, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface ShoutOut {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sender_id: string;
  sender: { full_name: string | null; role: string; department: string; avatar_url: string | null; };
  recipients: { full_name: string | null; role: string; }[];
  reactions?: { like: number; clap: number; star: number; };
  userReactions?: string[];
}

const ShoutOuts = () => {
  const [shoutOuts, setShoutOuts] = useState<ShoutOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [searchSender, setSearchSender] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        const { data } = await supabase.from("profiles").select("full_name, role, avatar_url").eq("user_id", user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const fetchShoutOuts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: shoutOutsData, error } = await supabase
        .from("shout_outs")
        .select(`id, content, image_url, created_at, sender_id, sender:profiles!shout_outs_sender_id_fkey(full_name, role, department, avatar_url)`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const shoutOutsWithData = await Promise.all(
        (shoutOutsData || []).map(async (shoutOut) => {
          const { data: recipients } = await supabase
            .from("shout_out_recipients")
            .select(`recipient:profiles!shout_out_recipients_recipient_id_fkey(full_name, role)`)
            .eq("shout_out_id", shoutOut.id);

          const { data: allReactions } = await supabase
            .from("shout_out_reactions")
            .select("reaction_type, user_id")
            .eq("shout_out_id", shoutOut.id);

          const reactionCounts = {
            like: allReactions?.filter(r => r.reaction_type === 'like').length || 0,
            clap: allReactions?.filter(r => r.reaction_type === 'clap').length || 0,
            star: allReactions?.filter(r => r.reaction_type === 'star').length || 0,
          };
          const userReactions = user ? allReactions?.filter(r => r.user_id === user.id).map(r => r.reaction_type) || [] : [];

          return {
            ...shoutOut,
            sender: Array.isArray(shoutOut.sender) ? shoutOut.sender[0] : shoutOut.sender,
            recipients: (recipients || []).map((r: any) => Array.isArray(r.recipient) ? r.recipient[0] : r.recipient),
            reactions: reactionCounts,
            userReactions,
          };
        })
      );
      setShoutOuts(shoutOutsWithData);
    } catch (error: any) {
      toast({ title: "Error loading shout-outs", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoutOuts();
    const channel = supabase.channel("shout-outs-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "shout_outs" }, () => fetchShoutOuts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredShoutOuts = shoutOuts.filter((s) => {
    if (filterDepartment !== "all" && s.sender.department !== filterDepartment) return false;
    if (searchSender && !s.sender.full_name?.toLowerCase().includes(searchSender.toLowerCase())) return false;
    if (filterDate !== "all") {
      const d = new Date(s.created_at);
      const now = new Date();
      if (filterDate === "today") return d.toDateString() === now.toDateString();
      if (filterDate === "week") return d >= new Date(now.getTime() - 7 * 86400000);
      if (filterDate === "month") return d >= new Date(now.getTime() - 30 * 86400000);
    }
    return true;
  });

  const resetFilters = () => { setFilterDepartment("all"); setFilterDate("all"); setSearchSender(""); };

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} userEmail={userEmail} />
      <main className="flex-1 overflow-auto">
        <PageTransition className="container mx-auto p-6 space-y-6 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-extrabold text-gradient-rainbow">Shout-outs</h1>
                <p className="text-sm text-muted-foreground">Celebrate achievements and spread positivity ✨</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchBar />
              <ThemeToggle />
              <NotificationBell userId={profile?.user_id} />
              <AdminButton />
            </div>
          </div>

          {/* Create Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-1 hover-glow"
          >
            <ShoutOutForm onSuccess={fetchShoutOuts} />
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-accent">
                <Filter className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="font-bold">Filter Feed</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Search by sender..." value={searchSender} onChange={(e) => setSearchSender(e.target.value)}
                className="rounded-xl border-2 focus:border-primary" />
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="rounded-xl border-2"><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="human_resources">Human Resources</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="rounded-xl border-2"><SelectValue placeholder="All Time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters} className="rounded-xl border-2 gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </motion.div>

          {/* Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Feed
                <span className="text-sm font-normal text-muted-foreground">({filteredShoutOuts.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground mt-4">Loading shout-outs...</p>
              </div>
            ) : filteredShoutOuts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 glass-card rounded-2xl"
              >
                <span className="text-5xl mb-4 block">🎉</span>
                <p className="text-muted-foreground text-lg">No shout-outs found. Be the first!</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredShoutOuts.map((shoutOut, i) => (
                  <motion.div
                    key={shoutOut.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    layout
                  >
                    <ShoutOutCard shoutOut={shoutOut} onUpdate={fetchShoutOuts} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </PageTransition>
      </main>
    </SidebarProvider>
  );
};

export default ShoutOuts;
