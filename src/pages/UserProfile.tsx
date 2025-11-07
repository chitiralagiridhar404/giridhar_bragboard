import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Briefcase } from "lucide-react";
import { StatsCards } from "@/components/StatsCards";
import { AchievementBadges } from "@/components/AchievementBadges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoutOutCard } from "@/components/ShoutOutCard";

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  department: string;
  role: string;
  bio?: string;
  user_id: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sentShoutOuts, setSentShoutOuts] = useState<any[]>([]);
  const [receivedShoutOuts, setReceivedShoutOuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchShoutOuts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const fetchShoutOuts = async () => {
    // Sent shout-outs
    const { data: sent } = await supabase
      .from('shout_outs')
      .select(`
        *,
        sender:profiles!shout_outs_sender_id_fkey(full_name, avatar_url, department)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    // Received shout-outs
    const { data: recipients } = await supabase
      .from('shout_out_recipients')
      .select('shout_out_id')
      .eq('recipient_id', userId);

    if (recipients) {
      const shoutOutIds = recipients.map(r => r.shout_out_id);
      const { data: received } = await supabase
        .from('shout_outs')
        .select(`
          *,
          sender:profiles!shout_outs_sender_id_fkey(full_name, avatar_url, department)
        `)
        .in('id', shoutOutIds)
        .order('created_at', { ascending: false });

      setReceivedShoutOuts(received || []);
    }

    setSentShoutOuts(sent || []);
    setLoading(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-4xl">{profile.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{profile.full_name}</h1>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {profile.department}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.role}
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
                <div className="mt-4">
                  <AchievementBadges userId={userId} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatsCards userId={userId} />

        {/* Shout-outs Tabs */}
        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent">Sent ({sentShoutOuts.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({receivedShoutOuts.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="sent" className="space-y-4 mt-6">
            {sentShoutOuts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No shout-outs sent yet
              </div>
            ) : (
              sentShoutOuts.map((shoutOut) => (
                <ShoutOutCard key={shoutOut.id} shoutOut={shoutOut} />
              ))
            )}
          </TabsContent>
          <TabsContent value="received" className="space-y-4 mt-6">
            {receivedShoutOuts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No shout-outs received yet
              </div>
            ) : (
              receivedShoutOuts.map((shoutOut) => (
                <ShoutOutCard key={shoutOut.id} shoutOut={shoutOut} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
