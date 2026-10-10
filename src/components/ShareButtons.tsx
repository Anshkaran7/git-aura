"use client";
import React from "react";
import { Download, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  isGenerating: boolean;
  onExportImage: () => void;
  onShare: (platform: "twitter" | "linkedin") => void;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  isGenerating,
  onExportImage,
  onShare,
}) => {
  if (isGenerating) {
    return (
      <div className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-canvas-subtle px-3 text-sm text-muted-foreground">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        Generating...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={() => onShare("twitter")} title="Share on X">
        <Twitter />
        Share on X
      </Button>
      <Button variant="outline" onClick={() => onShare("linkedin")} title="Share on LinkedIn">
        <Linkedin />
        LinkedIn
      </Button>
      <Button variant="outline" onClick={onExportImage} title="Download as image">
        <Download />
        Export
      </Button>
    </div>
  );
};

export default ShareButtons;
