"use client";
import { X, Github, Zap, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface RoastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoastModal({ open, onOpenChange }: RoastModalProps) {
  const [username, setUsername] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset state when modal closes
      setUsername("");
      setRoast("");
      setError("");
      setLoading(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleRoast = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    setError("");
    setRoast("");

    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roast');
      }

      setRoast(data.roast);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (roast) {
      await navigator.clipboard.writeText(roast);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && roast) {
      try {
        await navigator.share({
          title: 'My GitHub Roast',
          text: roast,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-xl border border-border shadow-lg m-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted border border-border">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">GitHub Roast Generator</h2>
              <p className="text-sm text-muted-foreground">
                Prepare to be roasted 🔥
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          {!roast && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  GitHub Username
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="octocat"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onKeyPress={(e) => e.key === 'Enter' && handleRoast()}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                onClick={handleRoast}
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Generating roast...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Get Roasted!
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Roast Result */}
          {roast && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-primary">
                    Your Roast is Ready 🔥
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {roast}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
                <button
                  onClick={() => {
                    setRoast("");
                    setUsername("");
                    setError("");
                  }}
                  className="py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                >
                  Roast Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
