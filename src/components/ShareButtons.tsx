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
      <div className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-500 rounded-lg text-white font-mona-sans w-full sm:w-auto">
        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
        <span className="text-sm sm:text-base">Generating...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <button
        onClick={() => onShare("twitter")}
        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[#1DA1F2] hover:bg-[#1a94e0] active:bg-[#1785cc] rounded-lg text-white transition-colors font-mona-sans text-sm sm:text-base touch-manipulation min-h-[44px] sm:min-h-0"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4 shrink-0" />
        <span className="truncate">Twitter</span>
      </button>
      <button
        onClick={() => onShare("linkedin")}
        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[#0A66C2] hover:bg-[#094da1] active:bg-[#083d86] rounded-lg text-white transition-colors font-mona-sans text-sm sm:text-base touch-manipulation min-h-[44px] sm:min-h-0"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4 shrink-0" />
        <span className="truncate">LinkedIn</span>
      </button>
      <button
        onClick={onExportImage}
        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg text-white transition-colors font-mona-sans text-sm sm:text-base touch-manipulation min-h-[44px] sm:min-h-0"
        title="Download as Image"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="truncate">Export</span>
      </button>
    </div>
  );
};

export default ShareButtons;
