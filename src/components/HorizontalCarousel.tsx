import React, { useRef } from 'react';
import { Movie } from '../types/index.ts';
import { MoviePosterCard } from './MoviePosterCard.tsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenInLab?: (movie: Movie) => void;
  watchlistIds?: Set<string>;
  onToggleWatchlist?: (movie: Movie) => void;
}

export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({
  title,
  subtitle,
  movies,
  onSelectMovie,
  onOpenInLab,
  watchlistIds = new Set(),
  onToggleWatchlist
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative w-full py-4 my-2">
      <div className="max-w-7xl mx-auto px-6 mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors active:scale-90"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors active:scale-90"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 overflow-x-auto no-scrollbar px-6 max-w-7xl mx-auto pb-4 scroll-smooth"
        >
          {movies.map(movie => (
            <MoviePosterCard
              key={movie.id}
              movie={movie}
              onSelectMovie={onSelectMovie}
              onOpenInLab={onOpenInLab}
              isInWatchlist={watchlistIds.has(movie.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
