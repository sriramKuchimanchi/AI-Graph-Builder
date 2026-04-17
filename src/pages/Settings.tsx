import { AppLayout } from "@/components/synapse/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const Settings = () => (
  <AppLayout
    eyebrow="Account"
    title="Settings"
    description="Manage your workspace, defaults, and integrations."
  >
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="mb-4 font-display text-base font-semibold">Workspace</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Workspace name</Label>
            <Input defaultValue="Synapse Research" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-xs">Default project</Label>
            <Input defaultValue="AI Industry Map 2025" className="mt-1.5" />
          </div>
          <Button size="sm" className="mt-2">Save changes</Button>
        </div>
      </Card>

      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="mb-4 font-display text-base font-semibold">Preferences</h3>
        <div className="space-y-4">
          {[
            ["Auto-extract on upload", "Run extraction immediately after ingest", true],
            ["Live graph updates", "Stream new nodes into the visualization", true],
            ["Email digests", "Weekly summary of new entities & relations", false],
            ["Telemetry", "Anonymous usage data to improve Synapse", true],
          ].map(([title, desc, on]) => (
            <div key={title as string} className="flex items-start justify-between gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="text-[11px] text-muted-foreground">{desc}</div>
              </div>
              <Switch defaultChecked={on as boolean} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </AppLayout>
);

export default Settings;
