"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, MessageCircle, Heart, Zap } from "lucide-react";
import { FaLinkedin ,FaSquareXTwitter, FaSquareInstagram ,FaTelegram,FaSquareYoutube } from "react-icons/fa6";
import { BsShieldCheck } from "react-icons/bs";
import { MdVisibility } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
 interface HeroStats {
  totalDevelopers: number;
  totalAuraPoints: number;
  totalBadges: number;
  monthlyActive: number;
  totalMonthlyContributions: number;
  averageAuraPerUser: number;
  averageBadgesPerUser: number;
  fallback?: boolean;
}

export const Footer = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [stats, setStats] = useState<HeroStats | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats/hero");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback stats if API fails
        setStats({
          totalDevelopers: 10000,
          totalAuraPoints: 50000000,
          totalBadges: 0,
          monthlyActive: 0,
          totalMonthlyContributions: 0,
          averageAuraPerUser: 0,
          averageBadgesPerUser: 0,
          fallback: true,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback stats
      setStats({
        totalDevelopers: 10000,
        totalAuraPoints: 50000000,
        totalBadges: 0,
        monthlyActive: 0,
        totalMonthlyContributions: 0,
        averageAuraPerUser: 0,
        averageBadgesPerUser: 0,
        fallback: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleStartJourney = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden py-8 sm:py-12">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-muted/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Brand Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="text-start w-full lg:w-auto">
            <div className="flex items-center justify-start gap-2 mb-4">
              <div className=" bg-muted border-[1px] border-border rounded-lg">
                <Image
                  src="/logo.png"
                  alt="Git Aura"
                  width={1000}
                  height={1000}
                  loading="lazy"
                  className="w-12 h-12 rounded-lg text-primary"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-primary">
                  Git Aura
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md text-start">
              Stop being a commit ghost and start building your developer street
              cred. Turn your green squares into actual flexing rights.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs border-border animate-pulse whitespace-nowrap"
                  >
                    Loading...
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-border animate-pulse whitespace-nowrap"
                  >
                    Loading...
                  </Badge>
                </>
              ) : stats ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    {formatNumber(stats.totalDevelopers)}+ Developers
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    {formatNumber(stats.totalAuraPoints)}+ Aura Points
                  </Badge>
                </>
              ) : (
                <>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    10K+ Developers
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-border whitespace-nowrap"
                  >
                    50M+ Aura Points
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="text-start lg:text-center w-full lg:w-auto p-4 sm:p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
              Ready to Stop Being Mid?
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
              Join hundreds of developers who've already discovered their true
              Git Aura. Warning: Results may cause excessive confidence in code
              reviews.
            </p>
            <Button
              variant="default"
              size="default"
              className="w-full sm:w-auto px-4 sm:px-8 py-2"
              onClick={handleStartJourney}
            >
              <Github className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              Start Your Git Aura Journey
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-6 border-t border-border">
        <div>
          <div className="flex items-center gap-1 text-xl sm:text-sm text-muted-foreground mb-4 sm:mb-0 text-center sm:text-left">
            <span>Made with</span>
            <Heart className="w-3 sm:w-4 h-3 sm:h-4 text-red-500 fill-current animate-pulse transition-transform duration-300 ease-in-out" />
            <span>by Karan, for developers who want to flex</span>
            
          </div>
          {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center bg-stone-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-700/50 text-xs">
                <BsShieldCheck className="text-amber-400 mr-1 text-2xl py-0.5" />
                <span>Secure and Trustworthy</span>
              </div>
              <div className="flex items-center bg-stone-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-700/50 text-xs">
                <MdVisibility className="text-orange-400 mr-1 text-2xl py-0.5" />
                <span>24/7 Availability</span>
              </div>
            </div>
            </div>
          
          {/* Quick Links */}
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-lg font-semibold mb-4 relative inline-block pb-2">
              Quick Links
              
            </h2>

            <ul className="space-y-3 text-center md:text-left">
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
                { name: "Feature", path: "/feature" },
              
              ].map((link, idx) => (
                <li key={idx} className="group">
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-orange-400 transition-all duration-300 flex items-center group-hover:translate-x-1"
                  >
                    <span className="absolute bottom-0 left-0 w-full inline-block h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span> 
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="text-lg font-semibold mb-4 relative inline-block pb-2">
              </div>
             <br />
             <ul className="space-y-3 text-center md:text-left">
              {[
                { name: "Leaderboard", path: "/leaderboard" },
                { name: "How It Works", path: "/how-it-works" },
                { name: "Contributors", path: "/contribute" },
                { name: "Monthly Winners", path: "/batle" },
              
              ].map((link, idx) => (
                <li key={idx} className="group">
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-orange-400 transition-all duration-300 flex items-center group-hover:translate-x-1"
                  >
                    <span className="absolute bottom-0 left-0 w-full inline-block h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span> 
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </div>
          </div>
</div>
        {/* Social Media Icons */}
    <div className="container mx-auto px-4  flex justify-start items-center ">
          <div className="w-fill bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-700/60 text-xs text-muted-foreground ">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer transform hover:scale-[1.3] transition-transform duration-300 ease-in-out "
              onClick={() =>
                router.push("https://github.com/anshkaran7/git-aura")
              }
            >
              <Github className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer transform hover:scale-[1.4] transition-transform duration-300 ease-in-out "
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <FaSquareXTwitter className="w-4 h-4" />
            </Button>
             <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer transform hover:scale-[1.4] transition-transform duration-300 ease-in-out hover:text-blue-400"
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <FaLinkedin className="w-4 h-4" />
            </Button>
             <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer  transform hover:scale-[1.4] transition-transform duration-300 ease-in-out  hover:text-pink-500 hover:from-pink-500 hover:to-yellow-500"
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <FaSquareInstagram className="w-4 h-4" />
            </Button>
             {/* <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer  transform hover:scale-[1.4] transition-transform duration-300 ease-in-out"
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <MessageCircle className="w-4 h-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer  transform hover:scale-[1.4] transition-transform duration-300 ease-in-out"
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <Zap className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer  transform hover:scale-[1.5] transition-transform duration-300 ease-in-out hover:text-sky-400"
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <FaTelegram className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer  transform hover:scale-[1.4] transition-transform duration-300 ease-in-out hover:text-red-400"
              onClick={() => router.push("https://x.com/itsmeekaran")}
            >
              <FaSquareYoutube className="w-4 h-4" />
            </Button>
          </div>
      </div>
</div>
        {/* Copyright */}
        <div className="pb-4 mt-6 text-center text-xs text-muted-foreground ">
          Powered by GitHub | Open-Source Project
        </div>
        <div className="  border-t border-stone-600/50 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 relative ">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2  -translate-y-1/2 p-1 opacity-100 px-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-2xl   text-accent-foreground">
                   &copy; {new Date().getFullYear()} <b className="font-extrabold font-serif">Git-Aura.</b> All rights reserved.
                   </div>
                   <div className="container flex justify-between items-center-safe mx-auto px-4 ">
                    
                  <p className="text-gray-500 text-center">  Happy Coding!🥰 <br/> Developer by <b className="font-extrabold font-serif   hover:text-orange-400 transition-colors hover:scale-105">Ansh Karan</b></p>
        
                  
                   
                    <div className="flex justify-end items-center gap-4 py-3 font-bold">
                    <span className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"onClick={() => router.push("#")}>
                      Privacy
                    </span>
                     <span className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"onClick={() => router.push("#")}>
                      Terms
                    </span>
                     <span className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"onClick={() => router.push("#")}>
                      Policy
                    </span>
                     <span className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"onClick={() => router.push("#")}>
                      Sitemap
                    </span>
                    
                  </div>
                 </div>
              </div>
      
    </footer>
  );
};
