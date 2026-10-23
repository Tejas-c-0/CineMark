export type IndianLanguage = 'Kannada' | 'Hindi' | 'Telugu' | 'Tamil' | 'Malayalam';

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  language: IndianLanguage;
  genres: string[];
  overview: string;
  director: string;
  cast: string[];
  runtime: number; // in minutes
  rating: number; // 0.0 - 10.0
  ratingSource: string; // e.g. "IMDb (Verified)"
  voteCount: number;
  poster: string;
  backdrop: string;
  tags?: string[];
  featured?: boolean;
}

export interface MarkovRecommendation {
  movie: Movie;
  probability: number; // 0.0 to 1.0
  percentage: string; // e.g. "28.4%"
  transitionCount: number; // C_ij
  totalOutgoingTransitions: number; // sum_k C_ik
  rank: number;
  explanation: string;
  smoothed?: boolean;
  isFallback?: boolean; // true if this item was supplied via popularity fallback
}

export interface MarkovGraphNode {
  id: string;
  title: string;
  year: number;
  language: IndianLanguage;
  poster: string;
  isCenter: boolean;
  probability?: number;
  transitionCount?: number;
}

export interface MarkovGraphEdge {
  source: string;
  target: string;
  probability: number;
  count: number;
  percentage: string;
}

export interface MarkovGraphData {
  nodes: MarkovGraphNode[];
  edges: MarkovGraphEdge[];
  centerMovie: Movie;
  totalOutgoingTransitions: number;
  isSingleTransition?: boolean;
  hasTransitions: boolean;
}

export interface TransitionMatrixData {
  movieIds: string[];
  movieTitles: string[];
  matrix: number[][]; // probabilities [i][j]
  counts: number[][]; // counts [i][j]
}

export interface ModelEvaluationMetrics {
  sampleSize: {
    totalSequences: number;
    trainTransitions: number;
    testTransitions: number;
    eligibleTestCases: number;
    coldStateTestCases: number;
    uniqueMoviesInTest: number;
  };
  markov: {
    hitRate5: number;
    hitRate10: number;
    mrr5: number;
    mrr10: number;
    ndcg5: number;
    ndcg10: number;
    precision5: number;
    precision10: number;
    recall5: number;
    recall10: number;
    catalogCoverage: number;
  };
  popularityBaseline: {
    hitRate5: number;
    hitRate10: number;
    mrr5: number;
    mrr10: number;
    ndcg5: number;
    ndcg10: number;
    precision5: number;
    precision10: number;
    recall5: number;
    recall10: number;
    catalogCoverage: number;
  };
  randomBaseline: {
    hitRate5: number;
    hitRate10: number;
    mrr5: number;
    mrr10: number;
    ndcg5: number;
    ndcg10: number;
    precision5: number;
    precision10: number;
    recall5: number;
    recall10: number;
    catalogCoverage: number;
  };
  methodology: {
    splitMethod: string;
    description: string;
    leakageSafeguard: string;
    limitations: string[];
    proxyNote: string;
    vivaSummary: string;
  };
}

export interface UserPreferences {
  preferredLanguages: IndianLanguage[];
  preferredGenres: string[];
  watchlist: string[]; // movie IDs
  likedMovies: string[]; // movie IDs
  dislikedMovies: string[]; // movie IDs
  recentlyWatchedId: string | null;
}

export interface DatasetStats {
  totalMovies: number;
  byLanguage: Record<IndianLanguage, number>;
  totalSequences: number;
  totalTransitions: number;
  uniqueStates: number;
  matrixSparsity: number; // percentage
  averageOutDegree: number;
  dataProxyNotice: string;
}

export interface TmdbMovieCacheEntry {
  movieId: string;
  tmdbId: number | null;
  imdbId?: string | null;
  title: string;
  originalTitle?: string;
  releaseYear: number;
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  verified: boolean;
  status: 'cached' | 'live_fetch' | 'not_found' | 'error';
  lastUpdated: string;
  error?: string;
}

export interface TmdbIntegrationStatus {
  apiKeyConfigured: boolean;
  authStatus: 'ok' | 'missing_key' | 'invalid_key' | 'rate_limited' | 'error';
  message: string;
  cachedCount: number;
  totalCatalogueCount: number;
  testedMovies: Array<{
    id: string;
    title: string;
    year: number;
    language: IndianLanguage;
    tmdbId: number | null;
    posterUrl: string | null;
    backdropUrl: string | null;
    verifiedMatch: boolean;
    status: string;
  }>;
  attribution: {
    notice: string;
    logoUrl?: string;
  };
}
