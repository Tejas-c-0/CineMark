import React, { useState } from 'react';
import { Movie } from '../types/index.ts';
import { Film, Star, Plus, Check, ArrowRight, RotateCw } from 'lucide-react';

interface MoviePosterCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onOpenInLab?: (movie: Movie) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (movie: Movie) => void;
  badgeLabel?: string;
}

export const MoviePosterCard: React.FC<MoviePosterCardProps> = ({
  movie,
  onSelectMovie,
  onOpenInLab,
  isInWatchlist = false,
  onToggleWatchlist,
  badgeLabel
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  // Check if poster is legitimately provided and hasn't errored
  const hasValidPoster = Boolean(movie.poster && movie.poster.trim() !== '' && !imageError);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    setIsLoading(true);
    setRetryKey(k => k + 1);
  };

  // Language distinct subtle badge accents
  const langColorMap: Record<string, string> = {
    Kannada: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Hindi: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    Telugu: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    Tamil: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Malayalam: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
  };

  const langBadge = langColorMap[movie.language] || 'text-neutral-300 border-neutral-700 bg-neutral-800';

  return (
    <div className="group relative flex-shrink-0 w-44 md:w-52 flex flex-col bg-neutral-900/80 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1">
      {/* Poster Container with strict 2:3 aspect ratio */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950 cursor-pointer select-none"
        onClick={() => onSelectMovie(movie)}
      >
        {hasValidPoster ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
                <Film className="w-5 h-5 text-neutral-700" />
              </div>
            )}
            <img
              key={`${movie.poster}-${retryKey}`}
              src={movie.poster}
              alt={`${movie.title} poster`}
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          </>
        ) : (
          /* Guaranteed cinematic fallback thumbnail */
          <div className="relative w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-4 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 flex items-center justify-between">
              <Film className="w-5 h-5 text-amber-500" />
              <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded border ${langBadge}`}>
                {movie.language}
              </span>
            </div>

            <div className="relative z-10 py-4 text-center my-auto">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-2.5 text-amber-400 shadow-inner">
                <Film className="w-6 h-6" />
              </div>
              <p className="text-sm font-extrabold text-white line-clamp-2 leading-tight px-1">
                {movie.title}
              </p>
              {movie.originalTitle && (
                <p className="text-xs text-neutral-400 font-medium truncate mt-1">
                  {movie.originalTitle}
                </p>
              )}
            </div>

            <div className="relative z-10 text-[11px] text-neutral-400 tabular-nums flex items-center justify-between border-t border-neutral-800/80 pt-2">
              <span className="font-semibold text-amber-400">{movie.year}</span>
              <span>{movie.runtime} min</span>
            </div>
          </div>
        )}

        {/* Top Badge if provided */}
        {badgeLabel && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-amber-500 text-neutral-950 text-[10px] font-bold uppercase tracking-wider shadow-md">
            {badgeLabel}
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/20 opacity-70 group-hover:opacity-30 transition-opacity" />

        {/* Watchlist Quick Toggle Button */}
        {onToggleWatchlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movie);
            }}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-500 hover:text-black hover:border-amber-400"
          >
            {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent flex flex-col gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMovie(movie);
            }}
            className="w-full py-1.5 px-2 rounded-lg bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          {onOpenInLab && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenInLab(movie);
              }}
              className="w-full py-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[11px] font-medium transition-colors whitespace-nowrap"
            >
              Explore Recommendations
            </button>
          )}
        </div>
      </div>

      {/* Clean Unboxed Card Info */}
      <div className="p-3 flex flex-col flex-grow justify-between gap-1.5">
        <div>
          <h4 
            onClick={() => onSelectMovie(movie)}
            className="text-sm font-semibold text-white hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {movie.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
            <span className="font-medium text-neutral-300">{movie.language}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="tabular-nums">{movie.year}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="truncate max-w-[70px]">{movie.genres[0]}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-800/80 text-neutral-400">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-white tabular-nums">{movie.rating.toFixed(1)}</span>
            <span className="text-[10px] text-neutral-500 font-normal">IMDb</span>
          </div>
          <span className="text-[10px] text-neutral-400 tabular-nums">
            {movie.runtime}m
          </span>
        </div>
      </div>
    </div>
  );
};
