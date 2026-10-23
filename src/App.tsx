/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Movie, MarkovRecommendation, UserPreferences, IndianLanguage } from './types/index.ts';
import { Navbar, NavTab } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { HorizontalCarousel } from './components/HorizontalCarousel.tsx';
import { MoviePosterCard } from './components/MoviePosterCard.tsx';
import { MovieDetailsModal } from './components/MovieDetailsModal.tsx';
import { MarkovLab } from './components/MarkovLab.tsx';
import { ModelEvaluation } from './components/ModelEvaluation.tsx';
import { PersonalizationProfile } from './components/PersonalizationProfile.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { LANGUAGES_LIST, GENRES_LIST } from './data/movies.ts';
import { Film, Network, ShieldCheck, Heart, Filter, ArrowUpDown, Sparkles, LayoutGrid, Rows } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState<boolean>(true);
  const [selectedMovieModal, setSelectedMovieModal] = useState<Movie | null>(null);
  const [selectedMovieLab, setSelectedMovieLab] = useState<Movie | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [heroRecommendation, setHeroRecommendation] = useState<MarkovRecommendation | null>(null);

  // Active filters on Browse Cinema page
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<'rating' | 'year' | 'title'>('rating');
  const [browseViewMode, setBrowseViewMode] = useState<'rows' | 'grid'>('rows');

  // User preferences & watchlist state
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredLanguages: ['Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam'],
    preferredGenres: ['Action', 'Thriller', 'Drama', 'Horror'],
    watchlist: ['kantara', 'vikram', 'tumbbad'],
    likedMovies: ['kgf-chapter-1', 'rrr', '3-idiots'],
    dislikedMovies: [],
    recentlyWatchedId: 'kantara'
  });

  // Markov recommendations based on user's recently watched anchor film
  const [recentMarkovRecs, setRecentMarkovRecs] = useState<Movie[]>([]);

  // Watchlist quick lookup set
  const watchlistSet = new Set(preferences.watchlist);

  // Load movies from backend catalogue
  useEffect(() => {
    let isMounted = true;
    fetch('/api/movies')
      .then(res => res.json())
      .then((data: Movie[]) => {
        if (!isMounted) return;
        setMovies(data);
        setLoadingMovies(false);
        if (data.length > 0) {
          setSelectedMovieLab(data[0]);
        }
      })
      .catch(err => {
        console.error('Failed to load movies:', err);
        if (isMounted) setLoadingMovies(false);
      });

    // Also fetch preferences from server
    fetch('/api/preferences')
      .then(res => res.json())
      .then((data: UserPreferences) => {
        if (isMounted && data) {
          setPreferences(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Failed to load preferences:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Markov recommendations departing from recently watched movie
  useEffect(() => {
    if (!preferences.recentlyWatchedId) return;
    let isMounted = true;

    fetch(`/api/markov/recommendations?movieId=${encodeURIComponent(preferences.recentlyWatchedId)}&k=8&alpha=0.1`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.recommendations) {
          setRecentMarkovRecs(data.recommendations.map((r: MarkovRecommendation) => r.movie));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [preferences.recentlyWatchedId]);

  // Update preferences helper
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPrefs)
    }).catch(err => console.error('Failed to sync preferences:', err));
  };

  // Toggle watchlist for a movie
  const handleToggleWatchlist = (movie: Movie) => {
    const isCurrentlyIn = preferences.watchlist.includes(movie.id);
    const updatedWatchlist = isCurrentlyIn
      ? preferences.watchlist.filter(id => id !== movie.id)
      : [...preferences.watchlist, movie.id];

    handleUpdatePreferences({
      ...preferences,
      watchlist: updatedWatchlist
    });
  };

  // Featured movies pool (IMDb 8.2+ or featured)
  const featuredMovies = movies.filter(m => m.featured || m.rating >= 8.3);
  const currentFeatured = featuredMovies[featuredIndex % (featuredMovies.length || 1)] || movies[0];

  // Fetch Hero recommendation for current featured movie
  useEffect(() => {
    if (!currentFeatured) return;
    let isMounted = true;

    fetch(`/api/markov/recommendations?movieId=${encodeURIComponent(currentFeatured.id)}&k=1&alpha=0`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.recommendations && data.recommendations.length > 0) {
          setHeroRecommendation(data.recommendations[0]);
        } else if (isMounted) {
          setHeroRecommendation(null);
        }
      })
      .catch(() => {
        if (isMounted) setHeroRecommendation(null);
      });

    return () => {
      isMounted = false;
    };
  }, [currentFeatured]);

  const handleNextFeatured = () => {
    setFeaturedIndex(prev => prev + 1);
  };

  // Open in Markov Lab
  const handleOpenInLab = (movie: Movie) => {
    setSelectedMovieLab(movie);
    setCurrentTab('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open movie details modal
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovieModal(movie);
  };

  if (loadingMovies) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight">CineMark Recommendation Engine</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Loading Indian cinema state transitions...
        </p>
      </div>
    );
  }

  // Filtered & sorted movies for Browse Cinema
  const filteredBrowseMovies = movies
    .filter(m => {
      const matchLang = selectedLanguage === 'All' || m.language === selectedLanguage;
      const matchGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre);
      return matchLang && matchGenre;
    })
    .sort((a, b) => {
      if (selectedSort === 'rating') return b.rating - a.rating;
      if (selectedSort === 'year') return b.year - a.year;
      return a.title.localeCompare(b.title);
    });

  // Language & Genre categorizations for carousel rows
  const kannadaMovies = movies.filter(m => m.language === 'Kannada');
  const teluguMovies = movies.filter(m => m.language === 'Telugu');
  const hindiMovies = movies.filter(m => m.language === 'Hindi');
  const tamilMovies = movies.filter(m => m.language === 'Tamil');
  const malayalamMovies = movies.filter(m => m.language === 'Malayalam');
  const popularTitles = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 12);
  const recentReleases = movies.filter(m => m.year >= 2021).sort((a, b) => b.year - a.year);
  const horrorMovies = movies.filter(
    m => m.genres.includes('Horror') || m.genres.includes('Mystery')
  );

  const anchorMovie = movies.find(m => m.id === preferences.recentlyWatchedId);

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Bar Contract Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        watchlistCount={preferences.watchlist.length}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <div>
            {/* Hero Section */}
            {currentFeatured && (
              <HeroBanner
                movie={currentFeatured}
                topRecommendation={heroRecommendation}
                onSelectMovie={handleSelectMovie}
                onOpenInLab={handleOpenInLab}
                isInWatchlist={watchlistSet.has(currentFeatured.id)}
                onToggleWatchlist={handleToggleWatchlist}
                onNextFeatured={handleNextFeatured}
              />
            )}

            {/* Quick Engine Status & Provenance Bar */}
            <div className="bg-neutral-950/90 border-y border-neutral-900 py-3 px-6">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-neutral-200 font-medium">First-Order Markov State Engine Active</span>
                  <span aria-hidden="true" className="text-neutral-700">·</span>
                  <span className="text-neutral-400">{movies.length} Verified Indian Films in Catalogue</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Rating-event proxy transitions</span>
                  <button
                    onClick={() => setCurrentTab('lab')}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>Launch Markov Lab</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Browse Filters Strip */}
            <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                {/* Language Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">
                    Language:
                  </span>
                  {LANGUAGES_LIST.map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        if (lang !== 'All') setBrowseViewMode('grid');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                        selectedLanguage === lang
                          ? 'bg-amber-500 text-neutral-950 shadow'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {/* Genre & Sort Controls */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400 font-medium">Genre:</span>
                    <select
                      value={selectedGenre}
                      onChange={(e) => {
                        setSelectedGenre(e.target.value);
                        if (e.target.value !== 'All') setBrowseViewMode('grid');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none"
                    >
                      {GENRES_LIST.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none"
                    >
                      <option value="rating">Top Rated (IMDb)</option>
                      <option value="year">Newest First</option>
                      <option value="title">Title (A-Z)</option>
                    </select>
                  </div>

                  {/* View Mode Toggle (Carousels vs Grid) */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    <button
                      onClick={() => setBrowseViewMode('rows')}
                      title="Row Carousel View"
                      className={`p-1.5 rounded ${
                        browseViewMode === 'rows'
                          ? 'bg-neutral-800 text-amber-400'
                          : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      <Rows className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setBrowseViewMode('grid')}
                      title="Exploration Grid View"
                      className={`p-1.5 rounded ${
                        browseViewMode === 'grid'
                          ? 'bg-neutral-800 text-amber-400'
                          : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filter Grid View OR Curated Streaming Carousels */}
            {browseViewMode === 'grid' || selectedLanguage !== 'All' || selectedGenre !== 'All' ? (
              <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedLanguage === 'All' ? 'All Indian Cinema' : `${selectedLanguage} Cinema`}
                      {selectedGenre !== 'All' ? ` · ${selectedGenre}` : ''}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Showing {filteredBrowseMovies.length} verified titles
                    </p>
                  </div>
                  {(selectedLanguage !== 'All' || selectedGenre !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedLanguage('All');
                        setSelectedGenre('All');
                        setBrowseViewMode('rows');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 underline"
                    >
                      Reset filters to Curated Rows
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredBrowseMovies.map(movie => (
                    <MoviePosterCard
                      key={movie.id}
                      movie={movie}
                      onSelectMovie={handleSelectMovie}
                      onOpenInLab={handleOpenInLab}
                      isInWatchlist={watchlistSet.has(movie.id)}
                      onToggleWatchlist={handleToggleWatchlist}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Curated Streaming Rows */
              <div className="space-y-6 pt-2">
                {/* Markov Transition Recommendations for You Row */}
                {recentMarkovRecs.length > 0 && anchorMovie && (
                  <HorizontalCarousel
                    title={`Markov Next-Movie Recommendations`}
                    subtitle={`Modeled from viewers transitioning after "${anchorMovie.title}" (${anchorMovie.language})`}
                    movies={recentMarkovRecs}
                    onSelectMovie={handleSelectMovie}
                    onOpenInLab={handleOpenInLab}
                    watchlistIds={watchlistSet}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                )}

                <HorizontalCarousel
                  title="Popular Titles"
                  subtitle="Highest rated Indian films according to verified IMDb scores"
                  movies={popularTitles}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <HorizontalCarousel
                  title="Recent Releases (2021 – 2024)"
                  subtitle="Modern landmark releases across Kannada, Telugu, Malayalam, Tamil & Hindi"
                  movies={recentReleases}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <HorizontalCarousel
                  title="Kannada Masterpieces"
                  subtitle="From Coastal Karnataka folklore to neo-noir classics & pan-India sagas"
                  movies={kannadaMovies}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <HorizontalCarousel
                  title="Telugu Blockbusters & Epics"
                  subtitle="High-concept mythologies, emotional sports narratives, and global sensations"
                  movies={teluguMovies}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <HorizontalCarousel
                  title="Malayalam New-Wave & Survival"
                  subtitle="Critically celebrated character studies, chamber thrillers, and survival dramas"
                  movies={malayalamMovies}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <HorizontalCarousel
                  title="Bollywood Classics & Social Dramas"
                  subtitle="Acclaimed social commentary, road journeys, and historic masterpieces"
                  movies={hindiMovies}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <HorizontalCarousel
                  title="Tamil Cinema & Gritty Neo-Noir"
                  subtitle="Lokesh Cinematic Universe, Vetrimaaran realism, and landmark crime sagas"
                  movies={tamilMovies}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                <HorizontalCarousel
                  title="Indian Folk Horror & Mythological Thrillers"
                  subtitle="Hastar folklore, monochrome black magic, and supernatural suspense"
                  movies={horrorMovies}
                  onSelectMovie={handleSelectMovie}
                  onOpenInLab={handleOpenInLab}
                  watchlistIds={watchlistSet}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              </div>
            )}
          </div>
        )}

        {currentTab === 'lab' && selectedMovieLab && (
          <MarkovLab
            allMovies={movies}
            selectedMovie={selectedMovieLab}
            onSelectMovieState={setSelectedMovieLab}
            onOpenMovieDetails={handleSelectMovie}
          />
        )}

        {currentTab === 'evaluation' && <ModelEvaluation />}

        {currentTab === 'profile' && (
          <PersonalizationProfile
            allMovies={movies}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onSelectMovie={handleSelectMovie}
            onOpenInLab={handleOpenInLab}
          />
        )}
      </main>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovieModal}
        onClose={() => setSelectedMovieModal(null)}
        onSelectMovie={handleSelectMovie}
        onOpenInLab={handleOpenInLab}
        isInWatchlist={selectedMovieModal ? watchlistSet.has(selectedMovieModal.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Global Search Modal */}
      <SearchModal
        allMovies={movies}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMovie={handleSelectMovie}
        onOpenInLab={handleOpenInLab}
      />

      {/* Quiet Production Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-10 px-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-neutral-300">CineMark Recommendation Lab</span>
              <span>· Indian Cinema Markov Chain Research System</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setCurrentTab('evaluation')}
                className="hover:text-neutral-300 transition-colors"
              >
                Evaluation & Metrics
              </button>
              <button
                onClick={() => setCurrentTab('lab')}
                className="hover:text-neutral-300 transition-colors"
              >
                Markov Research Lab
              </button>
              <button
                onClick={() => setCurrentTab('profile')}
                className="hover:text-neutral-300 transition-colors"
              >
                Personalization Profile
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>TMDB API Metadata & Poster Service Integrated (Verified Cache Active)</span>
            </div>
            <div className="text-center sm:text-right">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
