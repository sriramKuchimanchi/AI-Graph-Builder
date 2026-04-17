import { Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Network className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold tracking-tight">Synapse</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Knowledge Graph
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#workspace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Workspace
          </a>
          <a href="#graph" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Graph
          </a>
          <a href="#orchestrator" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Orchestrator
          </a>
          <a href="#search" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Search
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Docs
          </Button>
          <Button size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            New Project
          </Button>
        </div>
      </div>
    </header>
  );
};
