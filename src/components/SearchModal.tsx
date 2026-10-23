import React, { useState } from 'react';
import { Movie } from '../types/index.ts';
import { Search, X, Star, ArrowRight, Film } from 'lucide-react';
import { LANGUAGES_LIST, GENRES_LIST } from '../data/movies.ts';

interface SearchModalProps {
  allMovies: Movie[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  onOpenInLab: (movie: Movie) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  allMovies,
  isOpen,
  onClose,
  onSelectMovie,
  onOpenInLab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');

  if (!isOpen) return null;

  const filteredMovies = allMovies.filter(movie => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.originalTitle && movie.originalTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLanguage = selectedLanguage === 'All' || movie.language === selectedLanguage;
    const matchesGenre = selectedGenre === 'All' || movie.genres.includes(selectedGenre);

    return matchesSearch && matchesLanguage && matchesGenre;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search Indian cinema by title, actor, or director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-base sm:text-lg text-white placeholder-neutral-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-neutral-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white ml-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-800"
          >
            Esc
          </button>
        </div>

        {/* Filter Strip */}
        <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-950/50 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-medium">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white focus:outline-none"
            >
              {LANGUAGES_LIST.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 font-medium">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white focus:outline-none"
            >
              {GENRES_LIST.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-neutral-500 tabular-nums">
            {filteredMovies.length} movies found
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-neutral-800/80 p-2 sm:p-4">
          {filteredMovies.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-500">
              No movies match your search criteria.
            </div>
          ) : (
            filteredMovies.map(movie => (
              <div
                key={movie.id}
                className="p-3 rounded-xl hover:bg-neutral-800/50 transition-colors flex items-center justify-between gap-4 group"
              >
                <div 
                  onClick={() => {
                    onSelectMovie(movie);
                    onClose();
                  }}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-10 h-14 rounded-lg bg-neutral-950 shrink-0 overflow-hidden border border-neutral-800 flex items-center justify-center">
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
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span>{movie.language}</span>
                      <span>·</span>
                      <span className="tabular-nums">{movie.year}</span>
                      <span>·</span>
                      <span>{movie.genres.slice(0, 2).join(', ')}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                      Dir. {movie.director} · Cast: {movie.cast.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold mr-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                  <button
                    onClick={() => {
                      onOpenInLab(movie);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Markov Lab</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
