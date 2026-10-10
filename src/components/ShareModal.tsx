"use client";
import React, { useState } from "react";
import { X, Linkedin, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platform: "twitter" | "linkedin", customText: string) => void;
  onExportImage: () => void;
  isGenerating: boolean;
  username: string;
  defaultText: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShare,
  onExportImage,
  isGenerating,
  username,
  defaultText,
}) => {
  const [customText, setCustomText] = useState(defaultText);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (platform: "twitter" | "linkedin") => {
    setIsSharing(true);
    try {
      await onShare(platform, customText);
      onClose();
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  const spinner = (
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md border border-border bg-background gh-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3
            id="share-modal-title"
            className="text-sm font-semibold text-foreground"
          >
            Share profile
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="size-7 text-muted-foreground"
          >
            <X />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Custom Text Input */}
          <div>
            <label
              htmlFor="share-message"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Message
            </label>
            <Textarea
              id="share-message"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Write your custom message..."
              className="resize-none"
              rows={3}
              maxLength={280}
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs tabular-nums text-muted-foreground">
                {customText.length}/280
              </span>
              <button
                onClick={() => setCustomText(defaultText)}
                className="gh-link text-xs"
              >
                Reset to default
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-md border border-border bg-canvas-subtle px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Preview</p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">
              {customText || "Your message will appear here..."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Shared profile: @{username}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onExportImage}
            disabled={isGenerating}
          >
            {isGenerating ? spinner : <Download />}
            {isGenerating ? "Generating..." : "Download image"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShare("linkedin")}
            disabled={isGenerating || isSharing}
          >
            {isSharing ? spinner : <Linkedin className="text-link" />}
            LinkedIn
          </Button>
          <Button
            variant="dark"
            onClick={() => handleShare("twitter")}
            disabled={isGenerating || isSharing}
          >
            {isSharing ? (
              spinner
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            )}
            {isSharing ? "Sharing..." : "Share on X"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
