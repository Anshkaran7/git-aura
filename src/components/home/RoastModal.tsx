"use client";
import { X, Github, Zap, Copy, Share2, Sparkles } from "lucide-react";
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
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // Format roast text into paragraphs
  const formatRoast = (text: string) => {
    return text
      .split(/\n\s*\n|\. {2,}/) // Split on double newlines or multiple spaces after period
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => paragraph.trim())
      .join('\n\n'); // Join with double newlines for proper spacing
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                GitHub Roast Generator
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Prepare to be roasted 🔥
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Input Section */}
          {!roast && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (e.g., octocat)"
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                    onKeyPress={(e) => e.key === 'Enter' && handleRoast()}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleRoast}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Cooking up your roast...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Get Roasted! 🔥
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Roast Result */}
          {roast && (
            <div className="space-y-6">
              {/* Roast Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-lg font-bold text-primary">
                    Your Roast is Ready! 🔥
                  </span>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Served fresh from our AI comedy kitchen
                </p>
              </div>

              {/* Roast Content */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl" />
                <div className="relative p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <div className="prose prose-sm max-w-none">
                    {formatRoast(roast).split('\n\n').map((paragraph, index) => (
                      <p 
                        key={index} 
                        className="text-foreground/90 leading-relaxed mb-4 last:mb-0"
                        style={{ 
                          fontSize: '15px',
                          lineHeight: '1.6'
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 px-4 bg-muted/60 hover:bg-muted/80 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? '✅ Copied!' : 'Copy Roast'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 px-4 bg-muted/60 hover:bg-muted/80 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Share2 className="w-4 h-4" />
                  Share the Burn
                </button>
                <button
                  onClick={() => {
                    setRoast("");
                    setUsername("");
                    setError("");
                  }}
                  className="py-3 px-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                >
                  🔥 Roast Another
                </button>
              </div>

              {/* Fun Stats */}
              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  🎯 Roast delivered in under 30 seconds • Powered by AI comedy
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
