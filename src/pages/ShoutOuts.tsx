import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoutOutForm } from "@/components/ShoutOutForm";
import { ShoutOutCard } from "@/components/ShoutOutCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminButton } from "@/components/AdminButton";
import { useToast } from "@/hooks/use-toast";
import { Filter } from "lucide-react";

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
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role, avatar_url")
          .eq("user_id", user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const fetchShoutOuts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch shout-outs with sender profiles
      const { data: shoutOutsData, error: shoutOutsError } = await supabase
        .from("shout_outs")
        .select(`
          id,
          content,
          image_url,
          created_at,
          sender_id,
          sender:profiles!shout_outs_sender_id_fkey(full_name, role, department, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (shoutOutsError) throw shoutOutsError;

      // Fetch recipients and reactions for each shout-out
      const shoutOutsWithData = await Promise.all(
        (shoutOutsData || []).map(async (shoutOut) => {
          // Fetch recipients
          const { data: recipients } = await supabase
            .from("shout_out_recipients")
            .select(`
              recipient:profiles!shout_out_recipients_recipient_id_fkey(full_name, role)
            `)
            .eq("shout_out_id", shoutOut.id);

          // Fetch all reactions for this shout-out
          const { data: allReactions } = await supabase
            .from("shout_out_reactions")
            .select("reaction_type, user_id")
            .eq("shout_out_id", shoutOut.id);

          // Count reactions by type
          const reactionCounts = {
            like: allReactions?.filter(r => r.reaction_type === 'like').length || 0,
            clap: allReactions?.filter(r => r.reaction_type === 'clap').length || 0,
            star: allReactions?.filter(r => r.reaction_type === 'star').length || 0,
          };

          // Get current user's reactions
          const userReactions = user
            ? allReactions?.filter(r => r.user_id === user.id).map(r => r.reaction_type) || []
            : [];

          return {
            ...shoutOut,
            sender: Array.isArray(shoutOut.sender) ? shoutOut.sender[0] : shoutOut.sender,
            recipients: (recipients || []).map((r: any) => 
              Array.isArray(r.recipient) ? r.recipient[0] : r.recipient
            ),
            reactions: reactionCounts,
            userReactions,
          };
        })
      );

      setShoutOuts(shoutOutsWithData);
    } catch (error: any) {
      toast({
        title: "Error loading shout-outs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoutOuts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("shout-outs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shout_outs",
        },
        () => {
          fetchShoutOuts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter logic
  const filteredShoutOuts = shoutOuts.filter((shoutOut) => {
    // Department filter
    if (filterDepartment !== "all" && shoutOut.sender.department !== filterDepartment) {
      return false;
    }

    // Sender search
    if (searchSender && !shoutOut.sender.full_name?.toLowerCase().includes(searchSender.toLowerCase())) {
      return false;
    }

    // Date filter
    if (filterDate !== "all") {
      const shoutOutDate = new Date(shoutOut.created_at);
      const now = new Date();
      
      if (filterDate === "today") {
        return shoutOutDate.toDateString() === now.toDateString();
      } else if (filterDate === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return shoutOutDate >= weekAgo;
      } else if (filterDate === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return shoutOutDate >= monthAgo;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setFilterDepartment("all");
    setFilterDate("all");
    setSearchSender("");
  };

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} userEmail={userEmail} />
      <main className="flex-1 overflow-auto bg-gradient-mesh">
        <div className="container mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-rainbow bg-clip-text text-transparent">
                  Shout-outs
                </h1>
                <p className="text-muted-foreground mt-1">Celebrate achievements and spread positivity</p>
              </div>
            </div>
            <AdminButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-2xl opacity-20" />
            <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl p-1 shadow-glow">
              <ShoutOutForm onSuccess={fetchShoutOuts} />
            </div>
          </div>

          <div className="relative bg-card/60 backdrop-blur-lg p-6 rounded-2xl border-2 border-primary/20 shadow-elegant space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-accent">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-lg">Filter Your Feed</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by sender..."
                value={searchSender}
                onChange={(e) => setSearchSender(e.target.value)}
                className="border-primary/30 focus:border-primary bg-background/50"
              />

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="border-primary/30 focus:border-primary bg-background/50">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
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
                <SelectTrigger className="border-primary/30 focus:border-primary bg-background/50">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="border-2 border-secondary/50 hover:bg-gradient-secondary hover:text-white hover:border-secondary"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Feed ({filteredShoutOuts.length} shout-outs)
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground mt-4">Loading shout-outs...</p>
              </div>
            ) : filteredShoutOuts.length === 0 ? (
              <div className="text-center py-12 bg-card/60 backdrop-blur-lg rounded-2xl border-2 border-dashed border-primary/30">
                <p className="text-muted-foreground text-lg">
                  No shout-outs found. Be the first to share some recognition! 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredShoutOuts.map((shoutOut) => (
                  <ShoutOutCard 
                    key={shoutOut.id} 
                    shoutOut={shoutOut} 
                    onUpdate={fetchShoutOuts}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ShoutOuts;