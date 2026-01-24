import { Building2, FolderGit2, Settings, BookOpen, HelpCircle, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const mainNavItems = [
  { title: 'Clients', url: '/clients', icon: Building2 },
  { title: 'Repositories', url: '/repositories', icon: FolderGit2 },
];

const adminNavItems = [
  { title: 'Admin Panel', url: '/admin', icon: Users },
  { title: 'Ops Guide', url: '/ops-guide', icon: BookOpen },
];

const settingsNavItems = [
  { title: 'Preferences', url: '/preferences', icon: Settings },
  { title: 'Help Center', url: '/help', icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { profile } = useProfile();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Determine what to show in the header
  const displayName = profile?.display_name || profile?.company_name || 'VibeOps';
  const logoUrl = profile?.logo_url;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <NavLink to="/clients" className="flex items-center gap-3 px-2 py-3">
          {logoUrl ? (
            <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
              <AvatarImage src={logoUrl} alt={displayName} className="object-cover" />
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-base truncate">{displayName}</span>
              {profile?.company_name && displayName !== profile.company_name && (
                <span className="text-xs text-muted-foreground truncate">{profile.company_name}</span>
              )}
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            Blueberry VibeOps v1.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
