"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyModal({ open, onOpenChange }: PrivacyPolicyModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-card rounded-xl border border-border shadow-lg m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Information We Collect</h3>
              <p className="text-sm text-muted-foreground mb-2">
                When you sign in with GitHub, we collect:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Your GitHub username and profile information</li>
                <li>Your public repositories and contribution data</li>
                <li>Basic profile information (name, email, avatar)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">How We Use Your Information</h3>
              <p className="text-sm text-muted-foreground mb-2">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Provide and improve our services</li>
                <li>Calculate and display your GitAura score</li>
                <li>Show your coding activity and achievements</li>
                <li>Personalize your experience on the platform</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Data Storage</h3>
              <p className="text-sm text-muted-foreground">
                Your data is securely stored and processed. We do not sell your personal 
                information to third parties. We may share aggregated, non-personally 
                identifiable information for analytical purposes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Your Rights</h3>
              <p className="text-sm text-muted-foreground mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Access your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Update or correct your information</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Cookies and Tracking</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, 
                analyze usage, and provide personalized content. You can control 
                cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@gitaura.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
