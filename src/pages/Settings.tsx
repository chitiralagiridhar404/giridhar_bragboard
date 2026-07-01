import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ArrowLeft, Save, User as UserIcon, Briefcase, Building, FileText, Lock, Bell, Palette, Shield } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Switch } from "@/components/ui/switch";

interface Profile {
  id: string; user_id: string; full_name: string | null; role: string;
  department: string; bio: string | null; avatar_url: string | null;
}

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: "", role: "employee", department: "general", bio: "" });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (error) throw error;
        setProfile(data);
        setFormData({ full_name: data.full_name || "", role: data.role, department: data.department, bio: data.bio || "" });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update(formData).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated successfully! ✨");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-strong rounded-3xl border-primary/20 shadow-elegant overflow-hidden">
            <div className="h-2 bg-gradient-rainbow w-full" />
            <CardHeader className="pt-8">
              <CardTitle className="text-3xl font-extrabold text-gradient-primary">Profile Settings</CardTitle>
              <CardDescription>Customize your BragBoard identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" /> Full Name
                </Label>
                <Input id="full_name" value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name" className="rounded-xl border-2 focus:border-primary h-12" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="rounded-xl border-2 h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="team_lead">Team Lead</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="fresher">Fresher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" /> Department
                  </Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger className="rounded-xl border-2 h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="human_resources">Human Resources</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Bio
                </Label>
                <Textarea id="bio" value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..." rows={4}
                  className="rounded-xl border-2 focus:border-primary resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}
                  className="flex-1 h-12 rounded-xl bg-gradient-primary hover:shadow-elegant transition-all duration-300 gap-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Save className="h-5 w-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} disabled={saving}
                  className="rounded-xl border-2 h-12">
                  Cancel
                </Button>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Security</h3>
                <Button variant="outline" onClick={() => navigate("/forgot-password")}
                  className="rounded-xl border-2 h-12 gap-2 w-full">
                  <Lock className="h-4 w-4" /> Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Settings;
