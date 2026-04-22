import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Network } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthShell = ({ title, subtitle, children, footer }: Props) => (
  <div className="flex min-h-screen w-full items-center justify-center bg-gradient-mesh px-4 py-10">
    <div className="w-full max-w-md">
      <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
          <Network className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-lg font-bold tracking-tight">Synapse</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Knowledge Graph
          </span>
        </div>
      </Link>

      <Card className="border-border/60 p-6 shadow-elevated sm:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </Card>

      {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  </div>
);
