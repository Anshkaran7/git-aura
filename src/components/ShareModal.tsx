"use client";
import React, { useState } from "react";
import { X, Twitter, Linkedin, Download } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#161b21] to-[#0d1117] rounded-xl border border-gray-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0d1117] p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Share Profile</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Custom Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Customize your message
            </label>
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Write your custom message..."
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 resize-none"
              rows={3}
              maxLength={280}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {customText.length}/280 characters
              </span>
              <button
                onClick={() => setCustomText(defaultText)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Reset to default
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleShare("twitter")}
              disabled={isGenerating || isSharing}
              className="w-full bg-[#000000] hover:bg-[#181818] active:bg-[#272727]"
            >
              {isSharing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sharing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <img src="./twitter.png" alt="x logo" className="w-4 h-4" />
                  <span>Share on X</span>
                </div>
              )}
            </Button>

            <Button
              onClick={() => handleShare("linkedin")}
              disabled={isGenerating || isSharing}
              className="w-full bg-[#0A66C2] hover:bg-[#094da1] active:bg-[#083d86]"
            >
              {isSharing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sharing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <Linkedin className="w-4 h-4" />
                  <span>Share on LinkedIn</span>
                </div>
              )}
            </Button>

            <Button
              onClick={onExportImage}
              disabled={isGenerating}
              // variant="outline"
              className="w-full bg-gray-950 hover:bg-gray-900 active:bg-blue-800"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <Download className="w-4 h-4 " />
                  <span>Download Image</span>
                </div>
              )}
            </Button>
          </div>

          {/* Preview */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
            <p className="text-sm text-gray-400">
              {customText || "Your message will appear here..."}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Shared profile: @{username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
