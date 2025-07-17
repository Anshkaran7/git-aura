import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Join GitAura
          </h1>
          <p className="text-gray-300">
            Create your account to start tracking your coding aura and earn
            badges
          </p>
        </div>

        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          redirectUrl="/"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              socialButtonsBlockButton:
                "bg-[#21262d] border border-gray-700 text-white hover:bg-[#30363d]",
              card: "bg-[#161b22] border border-gray-800",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButtonText: "text-white",
              formFieldInput: "bg-[#0d1117] border-gray-700 text-white",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
            },
          }}
        />
      </div>
    </div>
  );
}
