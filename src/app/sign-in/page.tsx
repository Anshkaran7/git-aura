import { GitHubSignIn } from "@/components/GitHubSignIn";
import { Zap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border border-border">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-muted border border-border">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to GitAura
          </h1>
          <p className="text-muted-foreground">
            Sign in with GitHub to start your journey
          </p>
        </div>

        <div className="space-y-4">
          <GitHubSignIn />

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
