import { User, Settings, Home, Award, Target, MessageSquareHeart } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Profile {
  full_name: string | null;
  role: string;
  avatar_url: string | null;
}

interface AppSidebarProps {
  profile: Profile | null;
  userEmail: string | null;
}

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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail?.charAt(0).toUpperCase() || "U";
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

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarHeader className="border-b p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">
                {profile?.full_name || "User"}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">
                {getRoleDisplay(profile?.role || "employee")}
              </Badge>
            </div>
          </div>
        )}
        {isCollapsed && (
          <Avatar className="h-8 w-8 mx-auto">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
