"use client";
import React from "react";
import { Download, Twitter, Linkedin } from "lucide-react";
import { Theme } from "./types";

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
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-500 rounded-lg text-white font-mona-sans">
        <span className="animate-pulse">Generating...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <button
        onClick={() => onShare("twitter")}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1DA1F2] hover:bg-[#1a94e0] rounded-lg text-white transition-colors font-mona-sans text-sm sm:text-base"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
        Twitter
      </button>
      <button
        onClick={() => onShare("linkedin")}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0A66C2] hover:bg-[#094da1] rounded-lg text-white transition-colors font-mona-sans text-sm sm:text-base"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
        LinkedIn
      </button>
      <button
        onClick={onExportImage}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors font-mona-sans text-sm sm:text-base"
        title="Download as Image"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );
};

export default ShareButtons;
