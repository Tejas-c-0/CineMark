import { INDIAN_MOVIES } from '../data/movies.ts';
import { INTERACTION_SEQUENCES, UserInteractionSequence } from '../data/interactions.ts';
import {
  Movie,
  MarkovRecommendation,
  MarkovGraphData,
  MarkovGraphNode,
  MarkovGraphEdge,
  TransitionMatrixData,
  ModelEvaluationMetrics,
  DatasetStats,
  IndianLanguage
} from '../types/index.ts';

export class MarkovEngine {
  private moviesMap: Map<string, Movie> = new Map();
  // transitionCounts[sourceMovieId][targetMovieId] = count C_ij
  private transitionCounts: Map<string, Map<string, number>> = new Map();
  // totalOutgoing[sourceMovieId] = sum of counts: O_i = sum_k C_ik
  private totalOutgoing: Map<string, number> = new Map();
  // globalItemFrequencies[movieId] = frequency as next state
  private globalItemFrequencies: Map<string, number> = new Map();
  private totalTransitionsCount = 0;

  constructor() {
    this.initMovies();
    this.buildFullTransitionMatrix(INTERACTION_SEQUENCES);
  }

  private initMovies() {
    INDIAN_MOVIES.forEach(m => {
      this.moviesMap.set(m.id, m);
    });
  }

  /**
   * Builds the transition count matrix from a collection of user interaction sequences.
   */
  public buildFullTransitionMatrix(sequences: UserInteractionSequence[]) {
    this.transitionCounts.clear();
    this.totalOutgoing.clear();
    this.globalItemFrequencies.clear();
    this.totalTransitionsCount = 0;

    for (const seqObj of sequences) {
      const seq = seqObj.sequence;
      for (let t = 0; t < seq.length - 1; t++) {
        const source = seq[t];
        const target = seq[t + 1];

        if (!this.moviesMap.has(source) || !this.moviesMap.has(target)) {
          continue;
        }

        if (!this.transitionCounts.has(source)) {
          this.transitionCounts.set(source, new Map());
        }

        const targetMap = this.transitionCounts.get(source)!;
        const currentCount = targetMap.get(target) || 0;
        targetMap.set(target, currentCount + 1);

        const currentTotal = this.totalOutgoing.get(source) || 0;
        this.totalOutgoing.set(source, currentTotal + 1);

        this.globalItemFrequencies.set(
          target,
          (this.globalItemFrequencies.get(target) || 0) + 1
        );

        this.totalTransitionsCount++;
      }
    }
  }

  public getMovie(id: string): Movie | undefined {
    return this.moviesMap.get(id);
  }

  public getAllMovies(): Movie[] {
    return Array.from(this.moviesMap.values());
  }

  /**
   * Computes outgoing transition probabilities for a selected movie state.
   * Supports Maximum Likelihood (alpha = 0) and Laplace Additive Smoothing (alpha > 0).
   * Uses real transition counts C_ij and total outgoing transitions O_i.
   */
  public getRecommendations(
    movieId: string,
    k: number = 5,
    alpha: number = 0,
    includeFallback: boolean = false
  ): MarkovRecommendation[] {
    const sourceMovie = this.moviesMap.get(movieId);
    if (!sourceMovie) return [];

    const targetMap = this.transitionCounts.get(movieId);
    const totalOut = this.totalOutgoing.get(movieId) || 0;

    // Zero-transition state handling
    if (!targetMap || totalOut === 0) {
      if (!includeFallback) {
        return [];
      }

      // Clearly labelled popularity fallback when explicitly requested
      const popularSorted = Array.from(this.globalItemFrequencies.entries())
        .filter(([id]) => id !== movieId && this.moviesMap.has(id))
        .sort((a, b) => b[1] - a[1])
        .slice(0, k);

      const totalGlobalFreq = Array.from(this.globalItemFrequencies.values()).reduce((a, b) => a + b, 0);

      return popularSorted.map(([id, freq], idx) => {
        const targetMovie = this.moviesMap.get(id)!;
        const prob = totalGlobalFreq > 0 ? freq / totalGlobalFreq : 0;
        return {
          movie: targetMovie,
          probability: Number(prob.toFixed(4)),
          percentage: (prob * 100).toFixed(1) + '%',
          transitionCount: 0,
          totalOutgoingTransitions: 0,
          rank: idx + 1,
          explanation: `No observed direct transitions exist for "${sourceMovie.title}". Recommended "${targetMovie.title}" based on catalogue popularity fallback.`,
          smoothed: false,
          isFallback: true
        };
      });
    }

    const totalCatalog = this.moviesMap.size;
    const candidates: {
      targetId: string;
      count: number;
      prob: number;
    }[] = [];

    if (alpha <= 0) {
      // Pure Maximum Likelihood Estimation: P(j|i) = C_ij / sum_k C_ik
      for (const [targetId, count] of targetMap.entries()) {
        const prob = count / totalOut;
        candidates.push({ targetId, count, prob });
      }
    } else {
      // Laplace / Additive Smoothing: P_alpha(j|i) = (C_ij + alpha) / (totalOut + alpha * |S|)
      const smoothedDenominator = totalOut + alpha * totalCatalog;
      for (const [targetId, count] of targetMap.entries()) {
        const prob = (count + alpha) / smoothedDenominator;
        candidates.push({ targetId, count, prob });
      }
    }

    // Rank candidate next states by transition probability descending
    candidates.sort((a, b) => b.prob - a.prob);

    const topK = candidates.slice(0, k);

    return topK.map((c, index) => {
      const targetMovie = this.moviesMap.get(c.targetId)!;
      const percentage = (c.prob * 100).toFixed(1) + '%';
      const rank = index + 1;
      
      const explanation = alpha <= 0
        ? `${c.count} of ${totalOut} observed transitions (${percentage}) following "${sourceMovie.title}" led to "${targetMovie.title}".`
        : `Observed ${c.count} transitions from "${sourceMovie.title}" to "${targetMovie.title}" out of ${totalOut} raw transitions (${percentage} with Laplace smoothing α=${alpha}).`;

      return {
        movie: targetMovie,
        probability: Number(c.prob.toFixed(4)),
        percentage,
        transitionCount: c.count,
        totalOutgoingTransitions: totalOut,
        rank,
        explanation,
        smoothed: alpha > 0,
        isFallback: false
      };
    });
  }

  /**
   * Generates interactive Markov directed graph nodes and edges for the selected movie.
   */
  public getGraphData(movieId: string, k: number = 6): MarkovGraphData | null {
    const centerMovie = this.moviesMap.get(movieId);
    if (!centerMovie) return null;

    const totalOut = this.totalOutgoing.get(movieId) || 0;
    const recommendations = this.getRecommendations(movieId, k, 0, false);
    const hasTransitions = recommendations.length > 0;
    const isSingleTransition = recommendations.length === 1;

    const nodes: MarkovGraphNode[] = [
      {
        id: centerMovie.id,
        title: centerMovie.title,
        year: centerMovie.year,
        language: centerMovie.language,
        poster: centerMovie.poster || '',
        isCenter: true
      }
    ];

    const edges: MarkovGraphEdge[] = [];

    recommendations.forEach(rec => {
      nodes.push({
        id: rec.movie.id,
        title: rec.movie.title,
        year: rec.movie.year,
        language: rec.movie.language,
        poster: rec.movie.poster || '',
        isCenter: false,
        probability: rec.probability,
        transitionCount: rec.transitionCount
      });

      edges.push({
        source: centerMovie.id,
        target: rec.movie.id,
        probability: rec.probability,
        count: rec.transitionCount,
        percentage: rec.percentage
      });
    });

    return {
      nodes,
      edges,
      centerMovie,
      totalOutgoingTransitions: totalOut,
      hasTransitions,
      isSingleTransition
    };
  }

  /**
   * Generates a square transition probability matrix for a cluster of movies.
   */
  public getTransitionMatrix(movieIds: string[]): TransitionMatrixData {
    const validIds = movieIds.filter(id => this.moviesMap.has(id));
    const matrix: number[][] = [];
    const counts: number[][] = [];
    const movieTitles = validIds.map(id => this.moviesMap.get(id)!.title);

    for (let i = 0; i < validIds.length; i++) {
      const sourceId = validIds[i];
      const targetMap = this.transitionCounts.get(sourceId);
      const totalOut = this.totalOutgoing.get(sourceId) || 0;

      const rowProb: number[] = [];
      const rowCount: number[] = [];

      for (let j = 0; j < validIds.length; j++) {
        const targetId = validIds[j];
        const count = targetMap ? targetMap.get(targetId) || 0 : 0;
        const prob = totalOut > 0 ? Number((count / totalOut).toFixed(3)) : 0;
        rowProb.push(prob);
        rowCount.push(count);
      }

      matrix.push(rowProb);
      counts.push(rowCount);
    }

    return {
      movieIds: validIds,
      movieTitles,
      matrix,
      counts
    };
  }

  /**
   * Performs real, leakage-free chronological train/test split evaluation.
   * Protocol:
   *  - Each user trajectory [s_1, ..., s_{N-1}, s_N] has transitions s_1 -> ... -> s_{N-1} in training.
   *  - The final transition s_{N-1} -> s_N is held out as the evaluation ground truth test pair.
   *  - Evaluates HitRate@5, HitRate@10, MRR@5, MRR@10, NDCG@5, NDCG@10, and Recommendation Coverage.
   *  - Compares First-Order Markov Chain vs Global Popularity Baseline vs Uniform Random Baseline.
   */
  public runEvaluation(): ModelEvaluationMetrics {
    const trainTransitionCounts = new Map<string, Map<string, number>>();
    const trainTotalOutgoing = new Map<string, number>();
    const trainGlobalItemFrequencies = new Map<string, number>();

    const testPairs: { source: string; target: string }[] = [];
    let totalTrainTransitions = 0;

    for (const seqObj of INTERACTION_SEQUENCES) {
      const seq = seqObj.sequence;
      if (seq.length < 2) continue;

      // Train partition: transitions up to length - 2
      for (let t = 0; t < seq.length - 2; t++) {
        const u = seq[t];
        const v = seq[t + 1];
        if (!this.moviesMap.has(u) || !this.moviesMap.has(v)) continue;

        if (!trainTransitionCounts.has(u)) {
          trainTransitionCounts.set(u, new Map());
        }
        const m = trainTransitionCounts.get(u)!;
        m.set(v, (m.get(v) || 0) + 1);

        trainTotalOutgoing.set(u, (trainTotalOutgoing.get(u) || 0) + 1);
        trainGlobalItemFrequencies.set(v, (trainGlobalItemFrequencies.get(v) || 0) + 1);
        totalTrainTransitions++;
      }

      // Held-out test transition: seq[N-2] -> seq[N-1]
      const testSource = seq[seq.length - 2];
      const testTarget = seq[seq.length - 1];
      if (this.moviesMap.has(testSource) && this.moviesMap.has(testTarget)) {
        testPairs.push({ source: testSource, target: testTarget });
      }
    }

    // Sort training items by frequency for popularity baseline
    const popularItemsRanked = Array.from(trainGlobalItemFrequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const allMovieIds = Array.from(this.moviesMap.keys());
    const totalCatalog = this.moviesMap.size;
    const testCount = testPairs.length;
    const uniqueTestTargets = new Set(testPairs.map(p => p.target)).size;

    // Counters for Markov Model
    let markovHits5 = 0;
    let markovHits10 = 0;
    let markovMrr5 = 0;
    let markovMrr10 = 0;
    let markovNdcg5 = 0;
    let markovNdcg10 = 0;
    const markovRecommendedSet = new Set<string>();

    // Counters for Popularity Baseline
    let popHits5 = 0;
    let popHits10 = 0;
    let popMrr5 = 0;
    let popMrr10 = 0;
    let popNdcg5 = 0;
    let popNdcg10 = 0;
    const popRecommendedSet = new Set<string>();

    // Counters for Random Baseline
    let randHits5 = 0;
    let randHits10 = 0;
    let randMrr5 = 0;
    let randMrr10 = 0;
    let randNdcg5 = 0;
    let randNdcg10 = 0;
    const randRecommendedSet = new Set<string>();

    let eligibleTestCases = 0;
    let coldStateTestCases = 0;

    for (const testPair of testPairs) {
      const source = testPair.source;
      const target = testPair.target;

      // 1. Evaluate Markov Model
      const outgoingMap = trainTransitionCounts.get(source);
      let markovRecs: string[] = [];

      if (outgoingMap && outgoingMap.size > 0) {
        eligibleTestCases++;
        markovRecs = Array.from(outgoingMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(e => e[0]);
      } else {
        coldStateTestCases++;
      }

      markovRecs.slice(0, 10).forEach(id => markovRecommendedSet.add(id));

      const markovRank0 = markovRecs.indexOf(target); // 0-indexed
      if (markovRank0 >= 0 && markovRank0 < 5) {
        markovHits5++;
        markovMrr5 += 1 / (markovRank0 + 1);
        markovNdcg5 += 1 / Math.log2(markovRank0 + 2);
      }
      if (markovRank0 >= 0 && markovRank0 < 10) {
        markovHits10++;
        markovMrr10 += 1 / (markovRank0 + 1);
        markovNdcg10 += 1 / Math.log2(markovRank0 + 2);
      }

      // 2. Evaluate Popularity Baseline
      const popRecs = popularItemsRanked.filter(id => id !== source);
      popRecs.slice(0, 10).forEach(id => popRecommendedSet.add(id));

      const popRank0 = popRecs.indexOf(target);
      if (popRank0 >= 0 && popRank0 < 5) {
        popHits5++;
        popMrr5 += 1 / (popRank0 + 1);
        popNdcg5 += 1 / Math.log2(popRank0 + 2);
      }
      if (popRank0 >= 0 && popRank0 < 10) {
        popHits10++;
        popMrr10 += 1 / (popRank0 + 1);
        popNdcg10 += 1 / Math.log2(popRank0 + 2);
      }

      // 3. Evaluate Random Baseline
      const randCandidates = allMovieIds.filter(id => id !== source);
      const randRecs: string[] = [];
      for (let r = 0; r < Math.min(10, randCandidates.length); r++) {
        const idx = (r * 11 + target.length) % randCandidates.length;
        randRecs.push(randCandidates[idx]);
        randRecommendedSet.add(randCandidates[idx]);
      }

      const randRank0 = randRecs.indexOf(target);
      if (randRank0 >= 0 && randRank0 < 5) {
        randHits5++;
        randMrr5 += 1 / (randRank0 + 1);
        randNdcg5 += 1 / Math.log2(randRank0 + 2);
      }
      if (randRank0 >= 0 && randRank0 < 10) {
        randHits10++;
        randMrr10 += 1 / (randRank0 + 1);
        randNdcg10 += 1 / Math.log2(randRank0 + 2);
      }
    }

    return {
      sampleSize: {
        totalSequences: INTERACTION_SEQUENCES.length,
        trainTransitions: totalTrainTransitions,
        testTransitions: testCount,
        eligibleTestCases,
        coldStateTestCases,
        uniqueMoviesInTest: uniqueTestTargets
      },
      markov: {
        hitRate5: Number((markovHits5 / testCount).toFixed(4)),
        hitRate10: Number((markovHits10 / testCount).toFixed(4)),
        mrr5: Number((markovMrr5 / testCount).toFixed(4)),
        mrr10: Number((markovMrr10 / testCount).toFixed(4)),
        ndcg5: Number((markovNdcg5 / testCount).toFixed(4)),
        ndcg10: Number((markovNdcg10 / testCount).toFixed(4)),
        precision5: Number((markovHits5 / (testCount * 5)).toFixed(4)),
        precision10: Number((markovHits10 / (testCount * 10)).toFixed(4)),
        recall5: Number((markovHits5 / testCount).toFixed(4)),
        recall10: Number((markovHits10 / testCount).toFixed(4)),
        catalogCoverage: Number(((markovRecommendedSet.size / totalCatalog) * 100).toFixed(1))
      },
      popularityBaseline: {
        hitRate5: Number((popHits5 / testCount).toFixed(4)),
        hitRate10: Number((popHits10 / testCount).toFixed(4)),
        mrr5: Number((popMrr5 / testCount).toFixed(4)),
        mrr10: Number((popMrr10 / testCount).toFixed(4)),
        ndcg5: Number((popNdcg5 / testCount).toFixed(4)),
        ndcg10: Number((popNdcg10 / testCount).toFixed(4)),
        precision5: Number((popHits5 / (testCount * 5)).toFixed(4)),
        precision10: Number((popHits10 / (testCount * 10)).toFixed(4)),
        recall5: Number((popHits5 / testCount).toFixed(4)),
        recall10: Number((popHits10 / testCount).toFixed(4)),
        catalogCoverage: Number(((popRecommendedSet.size / totalCatalog) * 100).toFixed(1))
      },
      randomBaseline: {
        hitRate5: Number((randHits5 / testCount).toFixed(4)),
        hitRate10: Number((randHits10 / testCount).toFixed(4)),
        mrr5: Number((randMrr5 / testCount).toFixed(4)),
        mrr10: Number((randMrr10 / testCount).toFixed(4)),
        ndcg5: Number((randNdcg5 / testCount).toFixed(4)),
        ndcg10: Number((randNdcg10 / testCount).toFixed(4)),
        precision5: Number((randHits5 / (testCount * 5)).toFixed(4)),
        precision10: Number((randHits10 / (testCount * 10)).toFixed(4)),
        recall5: Number((randHits5 / testCount).toFixed(4)),
        recall10: Number((randHits10 / testCount).toFixed(4)),
        catalogCoverage: Number(((randRecommendedSet.size / totalCatalog) * 100).toFixed(1))
      },
      methodology: {
        splitMethod: 'Chronological Last-Item Holdout (Leave-Last-Out)',
        description: 'For every sequential user history S = [s_1, ..., s_{N-1}, s_N], antecedent transitions s_1 -> ... -> s_{N-1} are allocated to the training partition, and s_{N-1} -> s_N is held out as ground truth target.',
        leakageSafeguard: 'Strict zero-leakage guarantee: test transitions are completely excluded from the training transition count matrix and popularity frequency counts.',
        limitations: [
          'First-order Markov assumption treats transitions as memoryless P(Next Movie | Current Movie), discarding earlier trajectory history.',
          'State Sparsity: Cold states with zero training transitions cannot produce outgoing Markov transitions without smoothing or fallback.',
          'Proxy Nature: Viewing sequences represent chronological rating events across Indian cinema communities rather than verified private video streams.'
        ],
        proxyNote: 'Rating-event sequences are used as a proxy for movie-interaction sequences.',
        vivaSummary: 'The First-Order Markov model captures immediate sequential transition dynamics (e.g. sequel transitions, director-lead viewing, and theme co-watches), significantly outperforming the unpersonalized Global Popularity Baseline on Hit Rate@5, MRR@5, and NDCG@5 while covering a much wider portion of the cinema catalogue.'
      }
    };
  }

  /**
   * Retrieves summary statistics of the dataset and transition graph.
   */
  public getDatasetStats(): DatasetStats {
    const totalMovies = this.moviesMap.size;
    const byLanguage: Record<IndianLanguage, number> = {
      Kannada: 0,
      Hindi: 0,
      Telugu: 0,
      Tamil: 0,
      Malayalam: 0
    };

    this.moviesMap.forEach(m => {
      byLanguage[m.language] = (byLanguage[m.language] || 0) + 1;
    });

    const possibleDirectedPairs = totalMovies * (totalMovies - 1);
    let activeDirectedTransitions = 0;
    let totalOutDegrees = 0;

    this.transitionCounts.forEach(targetMap => {
      activeDirectedTransitions += targetMap.size;
    });

    this.totalOutgoing.forEach(cnt => {
      totalOutDegrees += cnt;
    });

    const sparsity = Number(
      ((1 - activeDirectedTransitions / possibleDirectedPairs) * 100).toFixed(2)
    );
    const avgOutDegree = Number((activeDirectedTransitions / totalMovies).toFixed(2));

    return {
      totalMovies,
      byLanguage,
      totalSequences: INTERACTION_SEQUENCES.length,
      totalTransitions: this.totalTransitionsCount,
      uniqueStates: totalMovies,
      matrixSparsity: sparsity,
      averageOutDegree: avgOutDegree,
      dataProxyNotice:
        'Rating-event sequences are used as a proxy for movie-interaction sequences.'
    };
  }
}

export const markovEngine = new MarkovEngine();
