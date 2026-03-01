import { User, Settings, Home, Award, Target, MessageSquareHeart, Shield, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Profile { full_name: string | null; role: string; avatar_url: string | null; }
interface AppSidebarProps { profile: Profile | null; userEmail: string | null; }

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Shout-outs", url: "/shout-outs", icon: MessageSquareHeart },
  { title: "Achievements", url: "/achievements", icon: Award },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ profile, userEmail }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { isAdmin } = useUserRole();

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return userEmail?.charAt(0).toUpperCase() || "U";
  };

  const getRoleDisplay = (role: string) => {
    const m: Record<string, string> = { manager: "Manager", hr: "HR", team_lead: "Team Lead", employee: "Employee", learner: "Learner", fresher: "Fresher" };
    return m[role] || role;
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarHeader className="border-b p-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-40" />
              <Avatar className="h-12 w-12 relative border-2 border-card">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">{getInitials()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{profile?.full_name || "User"}</p>
              <Badge variant="secondary" className="text-[10px] mt-1">{getRoleDisplay(profile?.role || "employee")}</Badge>
            </div>
          </div>
        ) : (
          <Avatar className="h-8 w-8 mx-auto">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-bold">{getInitials()}</AvatarFallback>
          </Avatar>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `rounded-xl transition-all duration-200 ${isActive
                          ? "bg-gradient-primary text-primary-foreground font-semibold shadow-elegant"
                          : "hover:bg-muted/70"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `rounded-xl transition-all duration-200 ${isActive
                          ? "bg-gradient-to-r from-destructive to-secondary text-primary-foreground font-semibold shadow-lg"
                          : "hover:bg-muted/70"
                        }`
                      }
                    >
                      <Shield className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="flex items-center gap-1">
                          Admin
                          <Sparkles className="h-3 w-3 text-warning" />
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
