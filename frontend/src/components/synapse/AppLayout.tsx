import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/synapse/AppSidebar";
import { ConnectionStatus } from "@/components/synapse/ConnectionStatus";

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
            <div className="ml-auto">
              <ConnectionStatus />
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
