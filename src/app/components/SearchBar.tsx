"use client";
import React from "react";
import { Search } from "lucide-react";
import { Theme } from "./types";

interface SearchBarProps {
  username: string;
  setUsername: (username: string) => void;
  searchedUsername: string;
  loading: boolean;
  selectedTheme: Theme;
  onSearch: (e: React.FormEvent) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  username,
  setUsername,
  searchedUsername,
  loading,
  selectedTheme,
  onSearch,
}) => {
  return (
    <form onSubmit={onSearch} className="mb-4">
      <div className="relative">
        <Search
          className={`absolute left-3 top-3 h-5 w-5 ${
            selectedTheme.name === "Light"
              ? "text-gray-400"
              : "text-gray-400/80"
          }`}
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username and press Enter"
          className={`w-full pl-10 pr-24 py-2.5 sm:py-3 ${
            selectedTheme.cardBackground
          } ${
            selectedTheme.name === "Light"
              ? "text-gray-700 placeholder-gray-400 border-gray-300"
              : "text-gray-100 placeholder-gray-500 border-gray-700"
          } rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mona-sans shadow-sm text-sm sm:text-base`}
        />
        <button
          type="submit"
          disabled={
            !username.trim() || username === searchedUsername || loading
          }
          className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm font-mona-sans text-sm sm:text-base"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
