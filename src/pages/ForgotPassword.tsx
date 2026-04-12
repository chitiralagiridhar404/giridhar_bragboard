import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <FloatingParticles />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float-delayed" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Card className="glass-strong rounded-3xl border-primary/20 shadow-elegant overflow-hidden">
          <div className="h-2 bg-gradient-rainbow w-full" />
          <CardHeader className="space-y-3 pb-2 pt-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto p-4 rounded-2xl bg-gradient-primary shadow-elegant">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-3xl font-extrabold text-center text-gradient-primary">
              {sent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {sent ? "We've sent a password reset link to your email" : "Enter your email to receive a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {sent ? (
              <div className="space-y-4 text-center">
                <p className="text-muted-foreground">Didn't receive the email? Check your spam folder or try again.</p>
                <Button variant="outline" onClick={() => setSent(false)} className="rounded-xl">Try Again</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" /> Email
                  </Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="rounded-xl border-2 focus:border-primary h-12" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full h-12 text-lg rounded-xl bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
            <div className="mt-6 text-center">
              <button type="button" onClick={() => navigate("/auth")}
                className="text-primary hover:underline font-semibold flex items-center gap-1 mx-auto">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
