import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/synapse/AuthShell";
import { api } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDevToken(null);
    try {
      const r = await api.auth.forgotPassword(email);
      toast.success(r.message);
      if (r.devToken) setDevToken(r.devToken);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!devToken) return;
    navigator.clipboard.writeText(devToken);
    toast.success("Token copied");
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll generate a reset token."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/signin" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
          />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset token
        </Button>
      </form>

      {devToken && (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary-soft/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            Demo reset token
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            In production this would be emailed. Copy it and continue to reset.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-background px-2 py-1.5 font-mono text-xs">
              {devToken}
            </code>
            <Button type="button" size="icon" variant="outline" onClick={copy} className="h-8 w-8">
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Link
            to={`/reset-password?token=${encodeURIComponent(devToken)}`}
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
          >
            Continue to reset password →
          </Link>
        </div>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
