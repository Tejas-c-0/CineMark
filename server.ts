import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { markovEngine } from './src/server/markovEngine.ts';
import { tmdbService } from './src/server/tmdbService.ts';
import { IndianLanguage, UserPreferences } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// In-memory demo user profile store (with defaults)
let demoUserPreferences: UserPreferences = {
  preferredLanguages: ['Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam'],
  preferredGenres: ['Action', 'Thriller', 'Drama', 'Horror'],
  watchlist: ['kantara', 'vikram', 'tumbbad'],
  likedMovies: ['kgf-chapter-1', 'rrr', '3-idiots'],
  dislikedMovies: [],
  recentlyWatchedId: 'kantara'
};

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // Health and dataset status
  app.get('/api/health', (_req: Request, res: Response) => {
    const stats = markovEngine.getDatasetStats();
    const allMovies = markovEngine.getAllMovies();
    const tmdbStatus = tmdbService.getStatus(allMovies);
    res.json({
      status: 'healthy',
      engine: 'First-Order Markov Chain (Discrete State Space)',
      timestamp: new Date().toISOString(),
      stats,
      tmdb: {
        configured: tmdbStatus.apiKeyConfigured,
        authStatus: tmdbStatus.authStatus,
        cachedCount: tmdbStatus.cachedCount,
        message: tmdbStatus.message
      }
    });
  });

  // TMDB Integration Status & Health (Requirement 9 & 11)
  app.get('/api/tmdb/status', (_req: Request, res: Response) => {
    const allMovies = markovEngine.getAllMovies();
    const status = tmdbService.getStatus(allMovies);
    res.json(status);
  });

  // TMDB On-Demand Sync
  app.post('/api/tmdb/sync', async (req: Request, res: Response) => {
    const { movieId } = req.body || {};
    const allMovies = markovEngine.getAllMovies();

    if (movieId && typeof movieId === 'string') {
      const movie = markovEngine.getMovie(movieId);
      if (!movie) {
        return res.status(404).json({ error: `Movie with id "${movieId}" not found.` });
      }
      const cacheEntry = await tmdbService.getOrFetchMovie(movie);
      const enriched = tmdbService.enrichMovie(movie);
      return res.json({ success: true, movie: enriched, cacheEntry });
    }

    const syncResult = await tmdbService.syncCatalogue(allMovies);
    res.json({ success: true, ...syncResult });
  });

  // Dataset stats
  app.get('/api/stats', (_req: Request, res: Response) => {
    const stats = markovEngine.getDatasetStats();
    res.json(stats);
  });

  // Movie catalogue with search and filter
  app.get('/api/movies', (req: Request, res: Response) => {
    const { q, language, genre, tag } = req.query;
    let movies = markovEngine.getAllMovies();

    if (q && typeof q === 'string') {
      const query = q.toLowerCase().trim();
      movies = movies.filter(
        m =>
          m.title.toLowerCase().includes(query) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(query)) ||
          m.director.toLowerCase().includes(query) ||
          m.cast.some(actor => actor.toLowerCase().includes(query))
      );
    }

    if (language && typeof language === 'string' && language !== 'All') {
      movies = movies.filter(m => m.language === language);
    }

    if (genre && typeof genre === 'string' && genre !== 'All') {
      movies = movies.filter(m => m.genres.includes(genre));
    }

    if (tag && typeof tag === 'string') {
      movies = movies.filter(m => m.tags?.includes(tag));
    }

    // Return movies enriched with TMDB verified posters and backdrops
    res.json(tmdbService.enrichMovies(movies));
  });

  // Single movie details + Markov recommendations
  app.get('/api/movies/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const movie = markovEngine.getMovie(id);
    if (!movie) {
      return res.status(404).json({ error: `Movie with id "${id}" not found.` });
    }

    const enrichedMovie = tmdbService.enrichMovie(movie);
    const recommendations = markovEngine.getRecommendations(id, 6, 0).map(r => ({
      ...r,
      movie: tmdbService.enrichMovie(r.movie)
    }));

    res.json({
      movie: enrichedMovie,
      recommendations,
      recommendationEngine: 'First-Order Markov Chain Transition Modeling'
    });
  });

  // Recommendations for a selected movie
  app.get('/api/markov/recommendations', (req: Request, res: Response) => {
    const { movieId, k, alpha, fallback } = req.query;
    if (!movieId || typeof movieId !== 'string') {
      return res.status(400).json({ error: 'movieId query parameter is required.' });
    }

    const movie = markovEngine.getMovie(movieId);
    if (!movie) {
      return res.status(404).json({ error: `Movie with id "${movieId}" not found.` });
    }

    const kVal = k ? parseInt(k as string, 10) : 5;
    const alphaVal = alpha ? parseFloat(alpha as string) : 0;
    const fallbackVal = fallback === 'true';

    const rawRecommendations = markovEngine.getRecommendations(movieId, kVal, alphaVal, fallbackVal);
    const recommendations = rawRecommendations.map(r => ({
      ...r,
      movie: tmdbService.enrichMovie(r.movie)
    }));

    res.json({
      movieId,
      movieTitle: movie.title,
      k: kVal,
      alpha: alphaVal,
      recommendations,
      totalCount: recommendations.length,
      notice: 'Next-movie probability — estimated from observed interaction transitions.'
    });
  });

  // Graph data
  app.get('/api/markov/graph', (req: Request, res: Response) => {
    const { movieId, k } = req.query;
    if (!movieId || typeof movieId !== 'string') {
      return res.status(400).json({ error: 'movieId query parameter is required.' });
    }

    const kVal = k ? parseInt(k as string, 10) : 6;
    const graphData = markovEngine.getGraphData(movieId, kVal);
    if (!graphData) {
      return res.status(404).json({ error: `Movie with id "${movieId}" not found.` });
    }

    // Enrich graph nodes with TMDB poster
    graphData.nodes = graphData.nodes.map(n => {
      const orig = markovEngine.getMovie(n.id);
      if (orig) {
        const enriched = tmdbService.enrichMovie(orig);
        return {
          ...n,
          poster: enriched.poster || n.poster
        };
      }
      return n;
    });

    res.json(graphData);
  });

  // Transition sub-matrix
  app.get('/api/markov/matrix', (req: Request, res: Response) => {
    const { movieIds } = req.query;
    let ids: string[] = [];

    if (movieIds && typeof movieIds === 'string') {
      ids = movieIds.split(',').map(s => s.trim());
    } else {
      // Default representative cross-language cluster
      ids = ['kgf-chapter-1', 'kgf-chapter-2', 'kantara', 'rrr', 'vikram', 'tumbbad', '3-idiots'];
    }

    const matrixData = markovEngine.getTransitionMatrix(ids);
    res.json(matrixData);
  });

  // Model evaluation & research metrics
  app.get('/api/evaluation', (_req: Request, res: Response) => {
    const evaluation = markovEngine.runEvaluation();
    res.json(evaluation);
  });

  // User preferences & watchlist
  app.get('/api/preferences', (_req: Request, res: Response) => {
    res.json(demoUserPreferences);
  });

  app.post('/api/preferences', (req: Request, res: Response) => {
    demoUserPreferences = {
      ...demoUserPreferences,
      ...req.body
    };
    res.json({ success: true, preferences: demoUserPreferences });
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CineMark Full-Stack Server running on port ${PORT}`);
    // Sync catalogue with TMDB in background on startup
    tmdbService.syncCatalogue(markovEngine.getAllMovies()).then(res => {
      console.log(`TMDB startup sync completed: ${res.synced}/${res.total} movies synced.`);
    }).catch(err => {
      console.warn('TMDB startup sync failed:', err);
    });
  });
}

startServer().catch(err => {
  console.error('Failed to start CineMark server:', err);
  process.exit(1);
});
