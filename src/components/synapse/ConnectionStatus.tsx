import { useHealth } from "@/lib/hooks";
import { Wifi, WifiOff } from "lucide-react";

export const ConnectionStatus = () => {
  const { data, isError, isLoading } = useHealth();
  const ok = !!data && !isError;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
        ok
          ? "border-primary/30 bg-primary-soft text-primary"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
      title={ok ? "Backend reachable" : "Backend unreachable — start with `cd backend && npm run dev`"}
    >
      {ok ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isLoading ? "Checking…" : ok ? "Backend online" : "Backend offline"}
    </div>
  );
};
