import { Network } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-muted/20">
    <div className="container flex flex-col items-center justify-between gap-3 py-6 md:flex-row">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
          <Network className="h-3 w-3 text-primary-foreground" />
        </div>
        <span>Synapse Knowledge Graph · © 2025</span>
      </div>
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground">Docs</a>
        <a href="#" className="hover:text-foreground">API</a>
        <a href="#" className="hover:text-foreground">Privacy</a>
        <span className="font-mono">v0.9.2</span>
      </div>
    </div>
  </footer>
);
