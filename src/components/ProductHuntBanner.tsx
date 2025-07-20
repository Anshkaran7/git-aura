"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ProductHuntBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 right-0 backdrop:blur-2xl z-50 bg-gradient-to-r from-orange-500/10 via-orange-500/60 to-orange-500/10 border-b border-orange-500/20"
      >
        <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
          <div className="pr-16 sm:px-16 sm:text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="hidden sm:flex items-center">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              </div>
              <p className="font-medium text-white truncate">
                <span className="md:hidden">🎉 Live on Product Hunt!</span>
                <span className="hidden md:inline">
                  🎉 Exciting news! We're trending on Product Hunt!
                </span>
                <a
                  href="https://www.producthunt.com/posts/gitaura"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-2 ml-1 inline-flex items-center gap-1 group"
                >
                  Support us with your upvote
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </p>
            </div>
          </div>
          {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-6">
            <button
              type="button"
              className="text-orange-400 hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black rounded-full p-0.5 transition-colors"
              onClick={() => setIsVisible(false)}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div> */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
