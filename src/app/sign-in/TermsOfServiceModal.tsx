"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

interface TermsOfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsOfServiceModal({ open, onOpenChange }: TermsOfServiceModalProps) {
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
            <h2 className="text-xl font-semibold">Terms of Service</h2>
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
              <h3 className="text-lg font-semibold mb-2">Acceptance of Terms</h3>
              <p className="text-sm text-muted-foreground">
                By accessing and using GitAura, you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to 
                abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Description of Service</h3>
              <p className="text-sm text-muted-foreground">
                GitAura is a platform that analyzes your GitHub activity and provides 
                insights into your coding journey. We calculate scores based on your 
                repositories, contributions, and coding patterns.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">User Accounts</h3>
              <p className="text-sm text-muted-foreground mb-2">
                To use GitAura, you must:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Have a valid GitHub account</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Acceptable Use</h3>
              <p className="text-sm text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Use the service for any unlawful purposes</li>
                <li>Attempt to reverse engineer or hack the platform</li>
                <li>Spam or abuse the service</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with the service's operation</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Data and Privacy</h3>
              <p className="text-sm text-muted-foreground">
                We respect your privacy and handle your data according to our Privacy Policy. 
                By using GitAura, you consent to the collection and use of your GitHub 
                data as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Intellectual Property</h3>
              <p className="text-sm text-muted-foreground">
                GitAura and its original content, features, and functionality are owned 
                by us and are protected by international copyright, trademark, patent, 
                trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground">
                GitAura is provided "as is" without warranties of any kind. We shall not 
                be liable for any damages arising from the use of this service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Changes to Terms</h3>
              <p className="text-sm text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be 
                effective immediately upon posting to the website.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                For questions about these Terms of Service, contact us at:
                <br />
                Email: legal@gitaura.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
