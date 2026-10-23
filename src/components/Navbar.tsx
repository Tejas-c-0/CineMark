import React from 'react';
import { Sparkles, Network, BarChart3, Bookmark, Search, Film } from 'lucide-react';

export type NavTab = 'home' | 'lab' | 'evaluation' | 'profile' | 'search';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  watchlistCount: number;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  watchlistCount,
  onOpenSearch
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Zone */}
        <div 
          onClick={() => onSelectTab('home')}
          className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-rose-950/40">
            <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
              <Film className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              CineMark
            </span>
          </div>
        </div>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'home'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            Browse Cinema
          </button>

          <button
            onClick={() => onSelectTab('lab')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'lab'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Markov Research Lab</span>
          </button>

          <button
            onClick={() => onSelectTab('evaluation')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'evaluation'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Model Evaluation</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'profile'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watchlist & Profile</span>
            {watchlistCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[11px] font-semibold bg-neutral-800 text-amber-400 rounded-full tabular-nums">
                {watchlistCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
            title="Search Indian Cinema catalogue"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectTab('lab')}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-950/20 transition-all hover:shadow-amber-500/10 flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Transitions</span>
          </button>
        </div>
      </div>
    </header>
  );
};
