"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
}

export function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  const isTerms = type === "terms";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isTerms ? "Terms of Service" : "Privacy Policy"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 mt-4">
          <div className="h-full">
            {isTerms ? <TermsContent /> : <PrivacyContent />}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
        <p className="text-muted-foreground leading-relaxed">
          By accessing and using GITAURA ("the Service"), you agree to comply
          with and be bound by these Terms of Service. If you do not agree to
          these terms, please do not use the Service.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">
          2. Description of Service
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          GITAURA is a platform for tracking, visualizing, and sharing
          open-source contributions, developer achievements, and community
          engagement. The Service allows users to create profiles, view
          contribution statistics, earn badges, and participate in leaderboards.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">3. User Accounts</h3>
        <p className="text-muted-foreground leading-relaxed">
          You are responsible for maintaining the confidentiality of your
          account credentials. You agree to accept responsibility for all
          activities that occur under your account and to notify us immediately
          of any unauthorized use.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">4. User Content</h3>
        <p className="text-muted-foreground leading-relaxed">
          You retain ownership of the content you submit to GITAURA. By posting
          content, you grant GITAURA a non-exclusive, royalty-free license to
          use, display, and distribute your content within the platform. You are
          responsible for ensuring you have the rights to share any content you
          upload.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">5. Acceptable Use</h3>
        <p className="text-muted-foreground leading-relaxed">
          You agree not to use the Service for any unlawful, harmful, or abusive
          purpose. GITAURA reserves the right to remove content or suspend
          accounts that violate these terms or community guidelines.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">6. Intellectual Property</h3>
        <p className="text-muted-foreground leading-relaxed">
          All trademarks, logos, and platform content (excluding user
          submissions) are the property of GITAURA or its licensors. You may not
          use, reproduce, or distribute any platform materials without
          permission.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">7. Privacy</h3>
        <p className="text-muted-foreground leading-relaxed">
          Your use of the Service is also governed by our Privacy Policy. Please
          review it to understand how we collect, use, and protect your
          information.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">
          8. Limitation of Liability
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          GITAURA is provided "as is" without warranties of any kind. GITAURA
          shall not be liable for any indirect, incidental, or consequential
          damages arising from your use of the Service.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">9. Termination</h3>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to suspend or terminate your account at any time
          for violations of these terms or for any reason deemed necessary to
          protect the community.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">10. Changes to Terms</h3>
        <p className="text-muted-foreground leading-relaxed">
          GITAURA may update these Terms of Service at any time. Continued use
          of the Service after changes constitutes acceptance of the new terms.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">11. Contact Information</h3>
        <p className="text-muted-foreground leading-relaxed">
          For questions about these Terms of Service, contact us at support.
        </p>
      </section>
      <p className="text-xs text-muted-foreground mt-8">
        Last updated: August 26, 2025
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="text-lg font-semibold mb-3">
          1. Information We Collect
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          We collect information you provide directly to us, such as when you
          create a GITAURA account, connect your GitHub profile, or interact
          with the platform. This may include your name, email address, GitHub
          username, and public contribution data.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">2. Use of Information</h3>
        <p className="text-muted-foreground leading-relaxed">
          We use your information to operate, maintain, and improve GITAURA,
          personalize your experience, display contribution statistics, and
          communicate with you about updates or support.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
        <p className="text-muted-foreground leading-relaxed">
          We do not sell or rent your personal information. We may share
          information with service providers as necessary to operate the
          platform, or as required by law. Public profile and contribution data
          may be visible to other users.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
        <p className="text-muted-foreground leading-relaxed">
          We implement reasonable security measures to protect your information
          from unauthorized access, alteration, or disclosure. However, no
          method of transmission over the internet is 100% secure.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">5. Cookies and Analytics</h3>
        <p className="text-muted-foreground leading-relaxed">
          GITAURA may use cookies and analytics tools to understand usage
          patterns and improve the Service. You can control cookie preferences
          through your browser settings.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">6. Third-Party Services</h3>
        <p className="text-muted-foreground leading-relaxed">
          GITAURA may link to or integrate with third-party services (such as
          GitHub). We are not responsible for the privacy practices of these
          external services.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">7. Data Retention</h3>
        <p className="text-muted-foreground leading-relaxed">
          We retain your information as long as your account is active or as
          needed to provide the Service, comply with legal obligations, or
          resolve disputes.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">8. Your Rights</h3>
        <p className="text-muted-foreground leading-relaxed">
          You may access, update, or delete your personal information by
          contacting us or using account settings. Some information may be
          retained as required by law or for legitimate business purposes.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">9. Children's Privacy</h3>
        <p className="text-muted-foreground leading-relaxed">
          GITAURA is not intended for children under 13. We do not knowingly
          collect personal information from children under 13 years of age.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">
          10. Changes to Privacy Policy
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. Significant
          changes will be communicated via the platform or email.
        </p>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">11. Contact Us</h3>
        <p className="text-muted-foreground leading-relaxed">
          For questions about this Privacy Policy, contact us at
          ansh.tsx@gmail.com
        </p>
      </section>
      <p className="text-xs text-muted-foreground mt-8">
        Last updated: August 26, 2025
      </p>
    </div>
  );
}
