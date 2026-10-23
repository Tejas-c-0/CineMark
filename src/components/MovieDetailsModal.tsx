import React, { useEffect, useState } from 'react';
import { Movie, MarkovRecommendation } from '../types/index.ts';
import { X, Star, Sparkles, Plus, Check, ArrowRight, Network, Film } from 'lucide-react';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  onOpenInLab: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onSelectMovie,
  onOpenInLab,
  isInWatchlist,
  onToggleWatchlist
}) => {
  const [recommendations, setRecommendations] = useState<MarkovRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [posterError, setPosterError] = useState<boolean>(false);

  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    setLoadingRecs(true);
    setErrorMsg(null);
    setPosterError(false);

    // Fetch real recommendations from backend Markov engine
    fetch(`/api/markov/recommendations?movieId=${encodeURIComponent(movie.id)}&k=6&alpha=0`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setRecommendations(data.recommendations || []);
          setLoadingRecs(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error fetching Markov recommendations:', err);
          setErrorMsg('Could not load Markov recommendations from server.');
          setLoadingRecs(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto overflow-x-hidden p-6 md:p-8 space-y-8">
          {/* Top Section: Media + Key Details */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Poster with clean placeholder */}
            <div className="w-48 sm:w-56 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-xl relative mx-auto md:mx-0 flex flex-col items-center justify-center">
              {movie.poster && !posterError ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  onError={() => setPosterError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-4 flex flex-col justify-between items-center text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900">
                  <Film className="w-8 h-8 text-neutral-600 mt-6" />
                  <div>
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                      Poster unavailable
                    </span>
                    <p className="text-xs font-bold text-white mt-2 px-1 line-clamp-2">
                      {movie.title}
                    </p>
                    {posterError && (
                      <button
                        onClick={() => setPosterError(false)}
                        className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 underline"
                      >
                        Retry loading
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500 mb-2">
                    {movie.language} · {movie.year}
                  </span>
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-amber-400 text-[11px] font-semibold border border-amber-500/30">
                {movie.language}
              </div>
            </div>

            {/* Info Body */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1 font-medium">
                <span className="text-amber-400 uppercase tracking-wider font-semibold">Current Movie</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{movie.year}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{movie.runtime} min</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {movie.title}
              </h2>

              {movie.originalTitle && (
                <p className="text-sm font-medium text-neutral-400 mt-0.5">
                  {movie.originalTitle}
                </p>
              )}

              {/* Rating + Source */}
              <div className="flex items-center gap-3 mt-3 text-sm">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="tabular-nums">{movie.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-neutral-400">
                  Source: <strong className="text-neutral-200">{movie.ratingSource}</strong> ({movie.voteCount.toLocaleString()} votes)
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-300 mt-3">
                {movie.genres.map((g, idx) => (
                  <React.Fragment key={g}>
                    <span>{g}</span>
                    {idx < movie.genres.length - 1 && <span className="text-neutral-600">·</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Overview */}
              <p className="text-sm text-neutral-300 leading-relaxed mt-4">
                {movie.overview}
              </p>

              {/* Cast & Crew */}
              <div className="mt-5 pt-4 border-t border-neutral-800/80 text-xs space-y-1.5 text-neutral-400">
                <div>
                  <span className="text-neutral-500">Director: </span>
                  <span className="text-white font-medium">{movie.director}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Principal Cast: </span>
                  <span className="text-neutral-200">{movie.cast.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-2">
                <button
                  onClick={() => onOpenInLab(movie)}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center gap-2 shadow-md shadow-amber-950/30 transition-colors whitespace-nowrap"
                >
                  <Network className="w-4 h-4" />
                  <span>Open in Markov Research Lab</span>
                </button>

                <button
                  onClick={() => onToggleWatchlist(movie)}
                  className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isInWatchlist
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Markov Recommendations */}
          <div className="pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* Prominent Label mandated by prompt */}
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended using Markov Chain
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  Next Predicted Movies from "{movie.title}"
                </h3>
              </div>
              <span className="text-xs text-neutral-400 tabular-nums font-mono">
                P(Next Movie | Current Movie)
              </span>
            </div>

            {loadingRecs && (
              <div className="py-8 text-center text-xs text-neutral-500">
                Computing first-order Markov transition probabilities...
              </div>
            )}

            {errorMsg && (
              <div className="py-4 px-4 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {!loadingRecs && recommendations.length === 0 && !errorMsg && (
              <div className="py-8 px-6 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-center">
                <p className="text-sm font-semibold text-neutral-300">
                  No Outgoing Transitions Observed for this State
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                  In accordance with recommendation integrity guidelines, missing Markov transitions are not silently replaced with arbitrary items. No historical sequence has recorded a subsequent transition departing from this film yet.
                </p>
              </div>
            )}

            {!loadingRecs && recommendations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {recommendations.map(rec => (
                  <div
                    key={rec.movie.id}
                    onClick={() => {
                      // Clicking a recommended movie opens that movie's own details and recommendations
                      onSelectMovie(rec.movie);
                    }}
                    className="group p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between hover:bg-neutral-800/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        {rec.movie.poster ? (
                          <img
                            src={rec.movie.poster}
                            alt={rec.movie.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 p-1 text-center">
                            <Film className="w-4 h-4 text-neutral-600 mb-0.5" />
                            <span className="text-[8px] text-neutral-500 uppercase leading-none">
                              No Poster
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono text-neutral-400">
                            #{rec.rank}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-400 tabular-nums">
                            {rec.percentage}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {rec.movie.title}
                        </h4>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          <span>{rec.movie.language}</span>
                          <span className="mx-1">·</span>
                          <span className="tabular-nums">{rec.movie.year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Transition explanation mandated by prompt */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-800/70 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400 tabular-nums">
                        {rec.transitionCount} / {rec.totalOutgoingTransitions} transitions
                      </span>
                      <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                        <span>Transition</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* TMDB Attribution Requirement */}
            <div className="mt-8 pt-4 border-t border-neutral-900 text-[11px] text-neutral-500 text-center flex items-center justify-center gap-1.5">
              <span>Movie posters and metadata provided by</span>
              <span className="font-bold text-neutral-400">TMDB</span>
              <span>· This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
