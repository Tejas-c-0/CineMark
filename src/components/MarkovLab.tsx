import React, { useState, useEffect } from 'react';
import { Movie, MarkovRecommendation, MarkovGraphData, TransitionMatrixData } from '../types/index.ts';
import { D3ForceGraph } from './D3ForceGraph.tsx';
import {
  Network,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Info,
  Maximize2,
  RefreshCw,
  Sliders,
  ChevronDown,
  Film,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Table as TableIcon
} from 'lucide-react';

interface MarkovLabProps {
  allMovies: Movie[];
  selectedMovie: Movie;
  onSelectMovieState: (movie: Movie) => void;
  onOpenMovieDetails: (movie: Movie) => void;
}

export const MarkovLab: React.FC<MarkovLabProps> = ({
  allMovies,
  selectedMovie,
  onSelectMovieState,
  onOpenMovieDetails
}) => {
  const [kValue, setKValue] = useState<number>(5);
  const [alphaSmoothing, setAlphaSmoothing] = useState<number>(0);
  const [filterLanguage, setFilterLanguage] = useState<string>('All');
  const [filterGenre, setFilterGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<MarkovRecommendation[]>([]);
  const [graphData, setGraphData] = useState<MarkovGraphData | null>(null);
  const [matrixData, setMatrixData] = useState<TransitionMatrixData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'graph' | 'table' | 'matrix' | 'distribution'>('graph');
  const [showTeachingPanel, setShowTeachingPanel] = useState<boolean>(true);
  const [useFallbackWhenEmpty, setUseFallbackWhenEmpty] = useState<boolean>(false);

  // Available filters
  const languagesList = ['All', 'Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam'];
  const genresList = ['All', 'Action', 'Drama', 'Thriller', 'Comedy', 'Horror', 'Crime', 'Romance', 'Sci-Fi'];

  // Filter movies for selector dropdown
  const filteredSelectorMovies = allMovies.filter(
    m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch recommendations, graph data, and matrix data whenever movie, k, or alpha changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchAllData = async () => {
      try {
        // 1. Fetch recommendations (pass fallback flag if user requested)
        const recsRes = await fetch(
          `/api/markov/recommendations?movieId=${encodeURIComponent(selectedMovie.id)}&k=${kValue}&alpha=${alphaSmoothing}&fallback=${useFallbackWhenEmpty}`
        );
        const recsJson = await recsRes.json();

        // 2. Fetch graph data
        const graphRes = await fetch(
          `/api/markov/graph?movieId=${encodeURIComponent(selectedMovie.id)}&k=${kValue}`
        );
        const graphJson = await graphRes.json();

        // 3. Cluster for transition matrix (selected movie + its top recommendations)
        const clusterIds = [selectedMovie.id];
        if (recsJson.recommendations) {
          recsJson.recommendations.forEach((r: MarkovRecommendation) => {
            if (!clusterIds.includes(r.movie.id)) clusterIds.push(r.movie.id);
          });
        }
        const matrixRes = await fetch(
          `/api/markov/matrix?movieIds=${encodeURIComponent(clusterIds.slice(0, 6).join(','))}`
        );
        const matrixJson = await matrixRes.json();

        if (isMounted) {
          setRecommendations(recsJson.recommendations || []);
          setGraphData(graphJson);
          setMatrixData(matrixJson);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching Markov lab data:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [selectedMovie, kValue, alphaSmoothing, useFallbackWhenEmpty]);

  // Display filtering without altering the underlying transition probability values
  const displayedRecommendations = recommendations.filter(rec => {
    const matchLang = filterLanguage === 'All' || rec.movie.language === filterLanguage;
    const matchGenre = filterGenre === 'All' || rec.movie.genres.includes(filterGenre);
    return matchLang && matchGenre;
  });

  const totalOutgoingTransitions = recommendations.length > 0
    ? recommendations[0].totalOutgoingTransitions
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Lab Header & Provenance Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Network className="w-4 h-4" />
            <span className="uppercase tracking-widest">Discrete State-Space Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Markov Research Lab
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            <strong>Next-movie probability</strong> — estimated from observed interaction transitions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTeachingPanel(!showTeachingPanel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showTeachingPanel
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showTeachingPanel ? 'Hide Teaching Panel' : 'How This Works (APSP)'}</span>
          </button>

          <button
            onClick={() => onOpenMovieDetails(selectedMovie)}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Movie Details</span>
          </button>
        </div>
      </div>

      {/* APSP Teaching Panel ("How this works") */}
      {showTeachingPanel && (
        <div className="p-5 rounded-2xl bg-neutral-900/95 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <BookOpen className="w-4 h-4" />
              <span>APSP Research Brief: First-Order Markov Transition Model</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
              Discrete State Space
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs text-neutral-300">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-amber-400 block mb-1">1. State:</strong>
              A movie item in the catalogue. Each unique film is a discrete state in state space S.
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-amber-400 block mb-1">2. Transition:</strong>
              One movie directly followed by another in a user's chronological interaction sequence.
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-amber-400 block mb-1">3. Transition Count (C_ij):</strong>
              How many times the ordered pair (Current Movie i → Next Movie j) occurred in training sequences.
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-amber-400 block mb-1">4. Transition Probability:</strong>
              Transition count divided by all observed outgoing transitions departing from the current movie:
              <div className="font-mono text-neutral-200 mt-1">P(j | i) = C_ij / Σ_k C_ik</div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <strong className="text-amber-400 block mb-1">5. First-Order Assumption:</strong>
              Memoryless property: the next state is predicted exclusively using the immediate current movie state.
            </div>
          </div>

          {/* Clearly labelled illustrative calculation */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 text-neutral-200 font-semibold mb-1">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Illustrative Mathematical Walkthrough (Example Calculation):</span>
            </div>
            <p className="leading-relaxed">
              Suppose a current movie has <strong>10 total recorded outgoing transitions</strong>. If <strong>4</strong> viewers subsequently watched Movie A, <strong>3</strong> watched Movie B, and <strong>3</strong> watched Movie C:
              <span className="block font-mono text-amber-300 mt-1">
                P(Movie A | Current) = 4 / 10 = 40.0% &nbsp;|&nbsp; P(Movie B | Current) = 3 / 10 = 30.0% &nbsp;|&nbsp; P(Movie C | Current) = 3 / 10 = 30.0%
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1 italic">
                * Note: This calculation is a pedagogical illustrative example for APSP presentation, not a fabricated dataset result.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Control Strip: Current Movie Selector + K Selector + Smoothing */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl shadow-xl">
        {/* Current Movie Selector */}
        <div className="md:col-span-5 relative">
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
            Current Movie (Active State)
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-amber-500/60 text-white text-sm font-semibold transition-all text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-6 h-8 rounded bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center">
                  {selectedMovie.poster ? (
                    <img
                      src={selectedMovie.poster}
                      alt={selectedMovie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Film className="w-3 h-3 text-neutral-500" />
                  )}
                </div>
                <div className="truncate">
                  <span className="block truncate font-bold">{selectedMovie.title}</span>
                  <span className="block text-[11px] text-neutral-400 font-normal">
                    {selectedMovie.language} · {selectedMovie.year}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-2" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden max-h-72 flex flex-col">
                <div className="p-2 border-b border-neutral-800">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5" />
                    <input
                      type="text"
                      placeholder="Search title or language..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto divide-y divide-neutral-900">
                  {filteredSelectorMovies.map(movie => (
                    <button
                      key={movie.id}
                      onClick={() => {
                        onSelectMovieState(movie);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-900 transition-colors ${
                        movie.id === selectedMovie.id ? 'bg-amber-500/10 text-amber-400' : 'text-neutral-300'
                      }`}
                    >
                      <div className="w-5 h-7 rounded bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center">
                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-3 h-3 text-neutral-600" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate">{movie.title}</p>
                        <p className="text-[10px] text-neutral-500">{movie.language} · {movie.year}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top-K Selector */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
            Recommendations (K)
          </label>
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              onClick={() => setKValue(5)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                kValue === 5
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Top 5 States
            </button>
            <button
              onClick={() => setKValue(10)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                kValue === 10
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Top 10 States
            </button>
          </div>
        </div>

        {/* Smoothing Parameter */}
        <div className="md:col-span-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Smoothing (α)
            </label>
            <span className="text-[11px] font-mono text-amber-400">
              {alphaSmoothing === 0 ? 'α = 0 (Empirical MLE)' : `α = ${alphaSmoothing} (Laplace)`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={alphaSmoothing}
              onChange={(e) => setAlphaSmoothing(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            {alphaSmoothing === 0
              ? 'Raw empirical transitions: P(Next | Current) = C_ij / Σ C_ik'
              : 'Laplace additive smoothing: distributes small probability mass to unseen candidate pairs.'}
          </p>
        </div>
      </div>

      {/* Recommendation Display Filters Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Filter by Language:</span>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none"
            >
              {languagesList.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Filter by Genre:</span>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none"
            >
              {genresList.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useFallbackWhenEmpty}
              onChange={(e) => setUseFallbackWhenEmpty(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Enable popularity fallback for zero-transition states</span>
          </label>
        </div>
      </div>

      {/* Main Lab Visualization & Ranked Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Interactive Directed Transition Graph / Table / Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[560px]">
          {/* Sub-tab view toggles */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveView('graph')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === 'graph'
                    ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Directed Transition Graph
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === 'table'
                    ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Transition Table</span>
              </button>
              <button
                onClick={() => setActiveView('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === 'matrix'
                    ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Transition Sub-Matrix
              </button>
              <button
                onClick={() => setActiveView('distribution')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === 'distribution'
                    ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Probability Distribution
              </button>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {displayedRecommendations.length} Outgoing States
            </span>
          </div>

          {/* VIEW 1: Directed Transition Graph (D3 Force-Directed Network) */}
          {activeView === 'graph' && (
            <div className="flex-1 flex flex-col justify-center items-center">
              {recommendations.length === 0 ? (
                <div className="w-full py-20 px-6 text-center space-y-2 bg-neutral-950/80 rounded-2xl border border-neutral-800">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                    <Info className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-200">
                    No Outgoing Transitions Observed
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                    "{selectedMovie.title}" did not have any subsequent movie interactions recorded in our sequential dataset.
                    {useFallbackWhenEmpty
                      ? ' Popularity fallback is active.'
                      : ' To view general popular titles, toggle the fallback option above.'}
                  </p>
                </div>
              ) : (
                <D3ForceGraph
                  graphData={graphData}
                  selectedMovie={selectedMovie}
                  onSelectMovie={onSelectMovieState}
                  onOpenMovieDetails={onOpenMovieDetails}
                />
              )}
            </div>
          )}

          {/* VIEW 2: Transition Table (Table View Toggle) */}
          {activeView === 'table' && (
            <div className="flex-1 overflow-x-auto py-2">
              <div className="mb-3 text-xs text-neutral-400">
                Outgoing Transition Counts and Probabilities from <strong>{selectedMovie.title}</strong>:
              </div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Next Movie Title</th>
                    <th className="py-2.5 px-3">Language</th>
                    <th className="py-2.5 px-3 font-mono">Transition Count (C_ij)</th>
                    <th className="py-2.5 px-3 font-mono">Total Outgoing (Σ C_ik)</th>
                    <th className="py-2.5 px-3 font-mono text-amber-400 font-bold">Probability P(Next | Current)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 font-mono tabular-nums">
                  {displayedRecommendations.map((rec, i) => (
                    <tr key={`tbl-${rec.movie.id}`} className="hover:bg-neutral-800/40">
                      <td className="py-2.5 px-3 text-neutral-400 font-sans">#{i + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-white">
                        <button
                          onClick={() => onSelectMovieState(rec.movie)}
                          className="hover:text-amber-400 transition-colors text-left"
                        >
                          {rec.movie.title}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-neutral-400">{rec.movie.language}</td>
                      <td className="py-2.5 px-3 text-neutral-200">{rec.transitionCount}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{rec.totalOutgoingTransitions}</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{rec.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 3: Transition Sub-Matrix */}
          {activeView === 'matrix' && matrixData && (
            <div className="flex-1 flex flex-col justify-center overflow-x-auto py-2">
              <div className="mb-3 text-xs text-neutral-400">
                Transition Probability Matrix: P(Next Movie | Current Movie) for related Indian cinema cluster:
              </div>
              <div className="min-w-[480px]">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-left font-mono text-[10px] text-neutral-500 border-b border-neutral-800">
                        Current \ Next
                      </th>
                      {matrixData.movieTitles.map((title, i) => (
                        <th
                          key={`col-${i}`}
                          className="p-2 text-center font-semibold text-neutral-300 border-b border-neutral-800 max-w-[80px] truncate"
                          title={title}
                        >
                          {title.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.matrix.map((row, i) => (
                      <tr key={`row-${i}`} className="hover:bg-neutral-800/30">
                        <td className="p-2 font-medium text-neutral-300 border-r border-neutral-800 max-w-[120px] truncate" title={matrixData.movieTitles[i]}>
                          {matrixData.movieTitles[i]}
                        </td>
                        {row.map((prob, j) => {
                          const count = matrixData.counts[i][j];
                          const bgOpacity = prob > 0 ? Math.min(0.9, Math.max(0.15, prob * 2)) : 0;
                          return (
                            <td
                              key={`cell-${i}-${j}`}
                              className="p-2 text-center border border-neutral-800/50 font-mono text-[11px] tabular-nums"
                              style={{
                                backgroundColor: prob > 0 ? `rgba(245, 158, 11, ${bgOpacity})` : 'transparent',
                                color: prob > 0.3 ? '#000' : '#fff'
                              }}
                              title={`${matrixData.movieTitles[i]} -> ${matrixData.movieTitles[j]}: ${prob} (${count} transitions)`}
                            >
                              {prob > 0 ? prob.toFixed(2) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: Probability Distribution */}
          {activeView === 'distribution' && (
            <div className="flex-1 flex flex-col justify-center space-y-3 py-2">
              <div className="text-xs text-neutral-400 mb-2">
                Transition Probability Distribution departing from <strong>{selectedMovie.title}</strong>:
              </div>
              {displayedRecommendations.map(rec => (
                <div key={`dist-${rec.movie.id}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{rec.movie.title}</span>
                    <span className="font-mono text-amber-400 font-bold tabular-nums">
                      {rec.percentage} ({rec.transitionCount} / {rec.totalOutgoingTransitions} transitions)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, rec.probability * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mathematical formulation footnote */}
          <div className="mt-4 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p>
              <strong>First-Order Markov Property:</strong> P(Next Movie | Current Movie) = Transition Count (C_ij) / Total Outgoing Transitions (Σ_k C_ik).
            </p>
          </div>
        </div>

        {/* Right Side: Ranked Next-Movie Recommendations List (5 Cols) */}
        <div className="lg:col-span-5 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-base font-bold text-white tracking-tight">
              Ranked Next-Movie Recommendations
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              {displayedRecommendations.length} Candidates
            </span>
          </div>

          {loading && (
            <div className="py-12 text-center text-xs text-neutral-500">
              Calculating transition probabilities from interaction sequences...
            </div>
          )}

          {!loading && displayedRecommendations.length === 0 && (
            <div className="py-12 px-4 text-center space-y-2">
              <p className="text-sm font-semibold text-neutral-300">
                No matching transition candidates
              </p>
              <p className="text-xs text-neutral-400">
                {recommendations.length > 0
                  ? 'Active language/genre filters hid all candidates. Reset filters to view all.'
                  : `No recorded outgoing transitions for "${selectedMovie.title}".`}
              </p>
            </div>
          )}

          {!loading && displayedRecommendations.length > 0 && (
            <div className="space-y-3">
              {displayedRecommendations.map(rec => (
                <div
                  key={rec.movie.id}
                  className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/50 transition-all group flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        #{rec.rank}
                      </span>
                      <div className="w-8 h-10 rounded bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center">
                        {rec.movie.poster ? (
                          <img
                            src={rec.movie.poster}
                            alt={rec.movie.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-3.5 h-3.5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {rec.movie.title}
                        </h4>
                        <div className="text-[11px] text-neutral-400">
                          {rec.movie.language} · {rec.movie.year}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-mono font-extrabold text-amber-400 tabular-nums">
                        {rec.percentage}
                      </span>
                      <div className="text-[10px] text-neutral-400 tabular-nums font-mono">
                        Count = {rec.transitionCount} / {rec.totalOutgoingTransitions}
                      </div>
                    </div>
                  </div>

                  {/* Accurate Plain-English transition explanation */}
                  <p className="text-[11px] text-neutral-300 leading-relaxed bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/60">
                    {rec.explanation}
                  </p>

                  {/* Transition simulator button */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onOpenMovieDetails(rec.movie)}
                      className="text-[11px] font-medium text-neutral-400 hover:text-white px-2 py-1 rounded"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onSelectMovieState(rec.movie)}
                      className="text-[11px] font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span>Set as Current Movie</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
