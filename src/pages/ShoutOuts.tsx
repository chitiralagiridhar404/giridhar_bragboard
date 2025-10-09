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
import { useToast } from "@/hooks/use-toast";
import { Filter } from "lucide-react";

interface ShoutOut {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
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
      // Fetch shout-outs with sender profiles
      const { data: shoutOutsData, error: shoutOutsError } = await supabase
        .from("shout_outs")
        .select(`
          id,
          content,
          image_url,
          created_at,
          sender:profiles!shout_outs_sender_id_fkey(full_name, role, department, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (shoutOutsError) throw shoutOutsError;

      // Fetch recipients for each shout-out
      const shoutOutsWithRecipients = await Promise.all(
        (shoutOutsData || []).map(async (shoutOut) => {
          const { data: recipients } = await supabase
            .from("shout_out_recipients")
            .select(`
              recipient:profiles!shout_out_recipients_recipient_id_fkey(full_name, role)
            `)
            .eq("shout_out_id", shoutOut.id);

          return {
            ...shoutOut,
            sender: Array.isArray(shoutOut.sender) ? shoutOut.sender[0] : shoutOut.sender,
            recipients: (recipients || []).map((r: any) => 
              Array.isArray(r.recipient) ? r.recipient[0] : r.recipient
            ),
          };
        })
      );

      setShoutOuts(shoutOutsWithRecipients);
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
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-3xl font-bold">Shout-outs</h1>
            </div>
          </div>

          <ShoutOutForm onSuccess={fetchShoutOuts} />

          <div className="bg-card p-4 rounded-lg border space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h2 className="font-semibold">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by sender..."
                value={searchSender}
                onChange={(e) => setSearchSender(e.target.value)}
              />

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Feed ({filteredShoutOuts.length} shout-outs)
            </h2>
            
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading shout-outs...</p>
            ) : filteredShoutOuts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No shout-outs found. Be the first to share some recognition!
              </p>
            ) : (
              <div className="space-y-4">
                {filteredShoutOuts.map((shoutOut) => (
                  <ShoutOutCard key={shoutOut.id} shoutOut={shoutOut} />
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
