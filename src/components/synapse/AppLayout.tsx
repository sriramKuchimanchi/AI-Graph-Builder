import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/synapse/AppSidebar";
import { Bell, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const AppLayout = ({ title, eyebrow, description, actions, children }: Props) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
            <SidebarTrigger className="-ml-1" />
            <div className="hidden h-5 w-px bg-border md:block" />

            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Quick search…"
                className="h-8 border-border/60 bg-muted/40 pl-9 text-xs"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
              <Button size="sm" className="h-8 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="border-b border-border/60 bg-gradient-mesh">
              <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="min-w-0">
                    {eyebrow && (
                      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                        {eyebrow}
                      </div>
                    )}
                    <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                      {title}
                    </h1>
                    {description && (
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                        {description}
                      </p>
                    )}
                  </div>
                  {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
