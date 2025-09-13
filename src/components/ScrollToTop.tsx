"use client";

import React, { useState, useEffect } from "react";

import Styled from "styled-components";

const ScrollToTop: React.FC = () => {
  const [isvisible, setIsVisible] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const percentage = (scrollTop / scrollHeight) * 100;
    setScrollPercentage(Math.round(percentage));

    if (window.scrollY > 120) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollTopbtn = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Button>
      <div className="progress-bar" style={{ width: `${scrollPercentage}%` }} />
      {isvisible && (
        <div
          className={`fixed cursor-pointer bottom-8 right-4 w-12 h-13 bg-gradient-to-br flex items-center justify-center from-blue-500 to-indigo-600 text-white rounded-full shadow-lg border border-blue-400 hover:from-blue-600 hover:to-indigo-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.1] hover:focus:ring-offset-4 z-50 ${
            isvisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={scrollTopbtn}
          style={{ pointerEvents: isvisible ? "auto" : "none", zIndex: 1000 }} // Z-index 1000 set kiya
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </div>
      )}
    </Button>
  );
};

const Button = Styled.section`
   
    display: flex;
    justify-content: center;
    align-items: center;
    

.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 1.8px;
    background: linear-gradient(to right, #3b82f6, #6366f1);
    width: 0%;
    z-index: 99;
    transition: width 0.25s ease-out;
}

`;

export default ScrollToTop;
