import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Briefcase, MapPin, Calendar } from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { AchievementBadges } from "@/components/AchievementBadges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoutOutCard } from "@/components/ShoutOutCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";

interface Profile {
  id: string; full_name: string | null; avatar_url?: string | null; department: string;
  role: string; bio?: string | null; user_id: string; created_at?: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sentShoutOuts, setSentShoutOuts] = useState<any[]>([]);
  const [receivedShoutOuts, setReceivedShoutOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) { fetchProfile(); fetchShoutOuts(); }
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (data) setProfile(data);
  };

  const normalizeSender = (s: any) => {
    const sender = Array.isArray(s.sender) ? s.sender[0] : s.sender;
    return {
      ...s,
      sender: sender || { full_name: null, role: '', department: '', avatar_url: null },
      recipients: [],
    };
  };

  const fetchShoutOuts = async () => {
    const { data: sent } = await supabase.from('shout_outs')
      .select(`*, sender:profiles!shout_outs_sender_id_fkey(full_name, avatar_url, department, role)`)
      .eq('sender_id', userId).order('created_at', { ascending: false });

    const { data: recipients } = await supabase.from('shout_out_recipients').select('shout_out_id').eq('recipient_id', userId);
    if (recipients) {
      const ids = recipients.map(r => r.shout_out_id);
      if (ids.length > 0) {
        const { data: received } = await supabase.from('shout_outs')
          .select(`*, sender:profiles!shout_outs_sender_id_fkey(full_name, avatar_url, department, role)`)
          .in('id', ids).order('created_at', { ascending: false });
        setReceivedShoutOuts((received || []).map(normalizeSender));
      }
    }
    setSentShoutOuts((sent || []).map(normalizeSender));
    setLoading(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile.full_name || "Unknown User";

  return (
    <PageTransition className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl glass-strong p-8 mb-6"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-40" />
              <Avatar className="h-36 w-36 border-4 border-card shadow-elegant relative">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-5xl font-bold">
                  {displayName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <h1 className="text-4xl font-extrabold text-gradient-primary">{displayName}</h1>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Badge className="bg-gradient-primary text-primary-foreground border-0 gap-1 px-3 py-1">
                  <Briefcase className="h-3 w-3" /> {profile.role}
                </Badge>
                <Badge variant="outline" className="gap-1 px-3 py-1">
                  <MapPin className="h-3 w-3" /> {profile.department}
                </Badge>
                {profile.created_at && (
                  <Badge variant="outline" className="gap-1 px-3 py-1">
                    <Calendar className="h-3 w-3" /> Joined {new Date(profile.created_at).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              {profile.bio && <p className="text-muted-foreground max-w-lg">{profile.bio}</p>}
              <div className="pt-2">
                <AchievementBadges userId={userId} />
              </div>
            </div>
          </div>
        </motion.div>

        <StatsCards userId={userId} />

        {/* Shout-outs Tabs */}
        <Tabs defaultValue="sent" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 glass-card">
            <TabsTrigger value="sent" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground font-semibold">
              Sent ({sentShoutOuts.length})
            </TabsTrigger>
            <TabsTrigger value="received" className="rounded-lg data-[state=active]:bg-gradient-secondary data-[state=active]:text-secondary-foreground font-semibold">
              Received ({receivedShoutOuts.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sent" className="mt-6">
            <StaggerContainer className="space-y-4">
              {sentShoutOuts.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl">
                  <span className="text-4xl block mb-2">📤</span>
                  <p className="text-muted-foreground">No shout-outs sent yet</p>
                </div>
              ) : sentShoutOuts.map((s) => (
                <StaggerItem key={s.id}><ShoutOutCard shoutOut={s} /></StaggerItem>
              ))}
            </StaggerContainer>
          </TabsContent>
          <TabsContent value="received" className="mt-6">
            <StaggerContainer className="space-y-4">
              {receivedShoutOuts.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-2xl">
                  <span className="text-4xl block mb-2">📥</span>
                  <p className="text-muted-foreground">No shout-outs received yet</p>
                </div>
              ) : receivedShoutOuts.map((s) => (
                <StaggerItem key={s.id}><ShoutOutCard shoutOut={s} /></StaggerItem>
              ))}
            </StaggerContainer>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
