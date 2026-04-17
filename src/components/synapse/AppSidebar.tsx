import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Upload,
  ScanSearch,
  Network,
  Cpu,
  Search,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navMain = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Documents", url: "/documents", icon: Upload },
  { title: "Extraction", url: "/extraction", icon: ScanSearch },
  { title: "Graph", url: "/graph", icon: Network },
];

const navAI = [
  { title: "Orchestrator", url: "/orchestrator", icon: Cpu },
  { title: "Search", url: "/search", icon: Search },
];

const navMeta = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderItems = (items: typeof navMain) =>
    items.map((item) => {
      const isActive =
        item.url === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.url);
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild tooltip={item.title}>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="border-b border-border/60 p-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Network className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-display text-base font-bold tracking-tight">
                Synapse
              </span>
              <span className="truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Knowledge Graph
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navMain)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              AI
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navAI)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navMeta)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-border/60 p-3">
          <div className="rounded-lg border border-primary/30 bg-primary-soft/60 p-3">
            <div className="flex items-center gap-2">
              <span className="pulse-dot" />
              <span className="text-xs font-semibold text-primary">All systems online</span>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              4 LLMs · synthesizer v2.1
            </div>
            <Badge className="mt-2 bg-primary text-[10px] text-primary-foreground">
              Free plan
            </Badge>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};
