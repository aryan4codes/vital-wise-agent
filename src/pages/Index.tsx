import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [navigate, loading, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signin" ? "Use your email and password." : "Create an account with email and password."}
        </p>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || submitting}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || submitting}
          />
          {mode === "signup" && (
            <Input
              type="text"
              placeholder="Full name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading || submitting}
            />
          )}
          <Button
            onClick={async () => {
              try {
                setSubmitting(true);
                if (mode === "signin") {
                  await signIn(email, password);
                } else {
                  await signUp(email, password, fullName);
                }
                navigate("/dashboard");
              } catch (err: any) {
                alert(err?.message || "Authentication failed.");
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={loading || submitting || !email || !password}
            className="w-full"
          >
            {submitting ? (mode === "signin" ? "Signing in..." : "Creating...") : (mode === "signin" ? "Sign in" : "Create account")}
          </Button>
          <button
            type="button"
            className="text-xs text-muted-foreground underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "No account? Create one" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
