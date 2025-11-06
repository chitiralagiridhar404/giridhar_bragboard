import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";

export const AdminButton = () => {
  const { isAdmin, loading } = useUserRole();
  const navigate = useNavigate();

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate("/admin")}
      size="lg"
      className="relative overflow-hidden group bg-gradient-to-r from-destructive via-primary to-accent hover:shadow-glow transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <Shield className="h-5 w-5 mr-2 animate-pulse" />
      <span className="font-bold">Admin Panel</span>
      <Sparkles className="h-4 w-4 ml-2" />
    </Button>
  );
};
