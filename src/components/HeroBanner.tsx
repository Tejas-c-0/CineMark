import React from 'react';
import { Movie, MarkovRecommendation } from '../types/index.ts';
import { Play, Sparkles, Plus, Check, Star, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  movie: Movie;
  topRecommendation?: MarkovRecommendation | null;
  onSelectMovie: (movie: Movie) => void;
  onOpenInLab: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onNextFeatured?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  topRecommendation,
  onSelectMovie,
  onOpenInLab,
  isInWatchlist,
  onToggleWatchlist,
  onNextFeatured
}) => {
  return (
    <div className="relative w-full min-h-[520px] md:min-h-[580px] lg:h-[75vh] max-h-[700px] flex items-end pb-12 overflow-hidden bg-neutral-950">
      {/* Background Cinematic Visual with TMDB Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop || movie.poster || '/src/assets/images/cinemark_hero_banner_1792672810732.jpg'}
          alt={`${movie.title} Backdrop`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/cinemark_hero_banner_1792672810732.jpg';
          }}
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-all duration-1000"
        />
        {/* Measured Contrast Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-3xl">
          {/* Quiet Unboxed Kicker */}
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-2.5">
            <span className="uppercase tracking-widest font-bold">Featured Film</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-300">{movie.language} Cinema</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="tabular-nums text-neutral-300">{movie.year}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-3 text-balance">
            {movie.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300 mb-4">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{movie.rating.toFixed(1)}</span>
              <span className="text-xs text-neutral-400 font-normal">({movie.ratingSource})</span>
            </div>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="tabular-nums">{movie.runtime} min</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>Dir. {movie.director}</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="text-neutral-400">{movie.genres.join(', ')}</span>
          </div>

          {/* Synopsis */}
          <p className="text-base text-neutral-300 leading-relaxed mb-6 line-clamp-3 max-w-2xl">
            {movie.overview}
          </p>

          {/* Markov Next-State Prediction Callout */}
          {topRecommendation && (
            <div className="mb-6 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-sm max-w-xl shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next Movie Prediction:</span>
                </div>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  P({topRecommendation.movie.title} | {movie.title}) = {topRecommendation.percentage}
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-normal">
                {topRecommendation.explanation}
              </p>
            </div>
          )}

          {/* CTA Action Strip */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectMovie(movie)}
              className="px-6 py-2.5 rounded-lg bg-white text-neutral-950 font-semibold text-sm hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10 active:scale-95 whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-neutral-950" />
              <span>View Details & Recommendations</span>
            </button>

            <button
              onClick={() => onOpenInLab(movie)}
              className="px-5 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 hover:border-amber-400/80 text-white font-medium text-sm transition-all flex items-center gap-2 hover:bg-neutral-800 active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore in Markov Lab</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie)}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
                isInWatchlist
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
              title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            {onNextFeatured && (
              <button
                onClick={onNextFeatured}
                className="ml-auto text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1"
              >
                <span>Next Featured</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
