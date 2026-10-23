import React, { useState, useEffect } from 'react';
import { Movie, IndianLanguage, UserPreferences, MarkovRecommendation } from '../types/index.ts';
import { GENRES_LIST, LANGUAGES_LIST } from '../data/movies.ts';
import {
  Bookmark,
  Heart,
  ThumbsDown,
  Sparkles,
  Sliders,
  Check,
  Trash2,
  ArrowRight,
  SlidersHorizontal,
  Info,
  Film
} from 'lucide-react';

interface PersonalizationProfileProps {
  allMovies: Movie[];
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  onSelectMovie: (movie: Movie) => void;
  onOpenInLab: (movie: Movie) => void;
}

export const PersonalizationProfile: React.FC<PersonalizationProfileProps> = ({
  allMovies,
  preferences,
  onUpdatePreferences,
  onSelectMovie,
  onOpenInLab
}) => {
  const [lambdaWeight, setLambdaWeight] = useState<number>(0.3); // 0 = Pure Markov, 1 = Pure Profile
  const [hybridResults, setHybridResults] = useState<{
    movie: Movie;
    markovProb: number;
    prefScore: number;
    hybridScore: number;
    transitionCount: number;
  }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const availableLanguages: IndianLanguage[] = ['Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam'];
  const availableGenres = GENRES_LIST.filter(g => g !== 'All');

  // Watchlist movies
  const watchlistMovies = allMovies.filter(m => preferences.watchlist.includes(m.id));

  // Toggle preferred language
  const handleToggleLanguage = (lang: IndianLanguage) => {
    const current = preferences.preferredLanguages;
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    onUpdatePreferences({ ...preferences, preferredLanguages: updated });
  };

  // Toggle preferred genre
  const handleToggleGenre = (genre: string) => {
    const current = preferences.preferredGenres;
    const updated = current.includes(genre)
      ? current.filter(g => g !== genre)
      : [...current, genre];
    onUpdatePreferences({ ...preferences, preferredGenres: updated });
  };

  // Remove from watchlist
  const handleRemoveFromWatchlist = (movieId: string) => {
    const updated = preferences.watchlist.filter(id => id !== movieId);
    onUpdatePreferences({ ...preferences, watchlist: updated });
  };

  // Set recently watched
  const handleSetRecentlyWatched = (movieId: string) => {
    onUpdatePreferences({ ...preferences, recentlyWatchedId: movieId });
  };

  // Compute Hybrid Recommendations based on recently watched movie + preferences
  useEffect(() => {
    const recentId = preferences.recentlyWatchedId || allMovies[0].id;
    let isMounted = true;
    setLoading(true);

    fetch(`/api/markov/recommendations?movieId=${encodeURIComponent(recentId)}&k=10&alpha=0.1`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const recs: MarkovRecommendation[] = data.recommendations || [];

        // Compute hybrid scores for candidate next movies
        const blended = recs.map(r => {
          const m = r.movie;
          // Language affinity component (0 or 1)
          const langMatch = preferences.preferredLanguages.includes(m.language) ? 1.0 : 0.0;
          // Genre overlap ratio
          const sharedGenres = m.genres.filter(g => preferences.preferredGenres.includes(g));
          const genreRatio = m.genres.length > 0 ? sharedGenres.length / m.genres.length : 0;
          const prefScore = Number((0.5 * langMatch + 0.5 * genreRatio).toFixed(3));

          // Hybrid formula: Score = (1 - lambda) * MarkovProb + lambda * PrefScore
          const hybridScore = Number(
            ((1 - lambdaWeight) * r.probability + lambdaWeight * prefScore).toFixed(4)
          );

          return {
            movie: m,
            markovProb: r.probability,
            prefScore,
            hybridScore,
            transitionCount: r.transitionCount
          };
        });

        // Rank by hybridScore descending
        blended.sort((a, b) => b.hybridScore - a.hybridScore);

        setHybridResults(blended);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error computing hybrid recommendations:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [preferences.recentlyWatchedId, preferences.preferredLanguages, preferences.preferredGenres, lambdaWeight, allMovies]);

  const recentMovie = allMovies.find(m => m.id === preferences.recentlyWatchedId) || allMovies[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
          <Bookmark className="w-4 h-4" />
          <span className="uppercase tracking-widest">Personalization & Hybrid Reranking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Demo Profile & Watchlist
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
          Customize your Indian cinema preferences and explore how pure Markov transition probabilities interact with user preference reranking.
        </p>
      </div>

      {/* Grid: Preferences Controls + Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Preferences Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Languages Selector */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Preferred Indian Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map(lang => {
                const isSelected = preferences.preferredLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => handleToggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genres Selector */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Preferred Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map(genre => {
                const isSelected = preferences.preferredGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => handleToggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recently Watched Movie Selector */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Recently Watched Movie
              </h3>
              <span className="text-[11px] text-amber-400 font-mono">
                Anchor Film
              </span>
            </div>
            <select
              value={preferences.recentlyWatchedId || ''}
              onChange={(e) => handleSetRecentlyWatched(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              {allMovies.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.language}, {m.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Watchlist Container (7 Cols) */}
        <div className="lg:col-span-7 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                My Cinema Watchlist
              </h3>
              <p className="text-xs text-neutral-400">
                {watchlistMovies.length} movies saved for viewing
              </p>
            </div>
          </div>

          {watchlistMovies.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Your watchlist is currently empty. Click the "+" button on any movie card to add it!
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {watchlistMovies.map(movie => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                >
                  <div 
                    onClick={() => onSelectMovie(movie)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <div className="w-9 h-12 rounded bg-neutral-900 shrink-0 overflow-hidden flex items-center justify-center border border-neutral-800">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
                        {movie.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {movie.language} · {movie.year} · {movie.rating.toFixed(1)} ★
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenInLab(movie)}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 transition-colors"
                    >
                      Markov State
                    </button>
                    <button
                      onClick={() => handleRemoveFromWatchlist(movie.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hybrid Reranking Section */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Hybrid Recommendation Engine</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Markov Transition Probability vs. Profile Affinity Reranking
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Departing from recently watched state: <strong className="text-white">{recentMovie.title}</strong>
            </p>
          </div>

          {/* Slider for Lambda Weight */}
          <div className="w-full md:w-72 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-neutral-400">Pure Markov (λ=0)</span>
              <span className="text-amber-400 font-bold">λ = {lambdaWeight}</span>
              <span className="text-neutral-400">Profile (λ=1)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={lambdaWeight}
              onChange={(e) => setLambdaWeight(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>
        </div>

        {/* Mathematical Formula Explanation Box */}
        <div className="p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 text-xs text-neutral-300 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Info className="w-4 h-4" />
            <span>Documented Hybrid Scoring Formula:</span>
          </div>
          <p className="font-mono text-[11px] text-neutral-200">
            Final Score = (1 - λ) × P(Next Movie | Current Movie) + λ × Profile Match
          </p>
          <p className="text-[11px] text-neutral-400">
            Where Profile Match computes language and genre preference overlap. When λ = 0, rankings strictly mirror observed empirical transition frequencies.
          </p>
        </div>

        {/* Side-by-side Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                <th className="py-2.5 px-3">Candidate Next Movie</th>
                <th className="py-2.5 px-3">Language & Genre</th>
                <th className="py-2.5 px-3 font-mono text-neutral-200">
                  P_Markov (Prob)
                </th>
                <th className="py-2.5 px-3 font-mono text-neutral-200">
                  Profile Match
                </th>
                <th className="py-2.5 px-3 font-mono text-amber-400 font-bold">
                  Final Blended Score
                </th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 font-mono tabular-nums">
              {hybridResults.map((item, idx) => (
                <tr key={item.movie.id} className="hover:bg-neutral-800/30">
                  <td className="py-3 px-3 font-sans font-semibold text-white">
                    <span className="text-neutral-500 mr-2 text-[11px]">#{idx + 1}</span>
                    {item.movie.title}
                  </td>
                  <td className="py-3 px-3 font-sans text-neutral-400">
                    {item.movie.language} · {item.movie.genres.slice(0, 2).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-neutral-200">
                    {(item.markovProb * 100).toFixed(1)}% ({item.transitionCount} hits)
                  </td>
                  <td className="py-3 px-3 text-sky-400">
                    {(item.prefScore * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-3 font-bold text-amber-400">
                    {(item.hybridScore * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => onSelectMovie(item.movie)}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-medium transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
