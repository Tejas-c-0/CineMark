/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Movie, MarkovGraphData } from '../types/index.ts';

interface D3ForceGraphProps {
  graphData: MarkovGraphData | null;
  selectedMovie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onOpenMovieDetails: (movie: Movie) => void;
}

export const D3ForceGraph: React.FC<D3ForceGraphProps> = ({
  graphData,
  selectedMovie,
  onSelectMovie,
  onOpenMovieDetails
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const width = 600;
    const height = 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Add zoom container group
    const g = svg.append('g');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Arrow marker definition
    svg.append('defs').append('marker')
      .attr('id', 'd3-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 32)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f59e0b');

    // Deep clone nodes and edges for D3 simulation
    const nodes = graphData.nodes.map(n => ({ ...n }));
    const edges = graphData.edges.map(e => ({
      source: typeof e.source === 'string' ? e.source : (e.source as any).id,
      target: typeof e.target === 'string' ? e.target : (e.target as any).id,
      ...e
    }));

    // Setup force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(160))
      .force('charge', d3.forceManyBody().strength(-550))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(55));

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#f59e0b')
      .attr('stroke-opacity', 0.65)
      .attr('stroke-width', (d: any) => Math.max(1.5, Math.min(6, (d.probability || 0.1) * 12)))
      .attr('marker-end', 'url(#d3-arrow)');

    // Link probability badges
    const edgeLabel = g.append('g')
      .selectAll('g')
      .data(edges)
      .enter()
      .append('g');

    edgeLabel.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', 44)
      .attr('height', 18)
      .attr('fill', '#0a0a0c')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    edgeLabel.append('text')
      .attr('fill', '#fbbf24')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', '12.5px')
      .text((d: any) => d.percentage || '0%');

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (!d.isCenter) {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    // Node outer circle / ring
    node.append('circle')
      .attr('r', (d: any) => d.isCenter ? 36 : 28)
      .attr('fill', '#0f0f13')
      .attr('stroke', (d: any) => d.isCenter ? '#f59e0b' : '#525252')
      .attr('stroke-width', (d: any) => d.isCenter ? 3.5 : 2);

    // Node image / clip path
    node.each(function(d: any) {
      const el = d3.select(this);
      const r = d.isCenter ? 33 : 25;
      
      const clipId = `clip-${d.id}`;
      el.append('clipPath')
        .attr('id', clipId)
        .append('circle')
        .attr('r', r);

      if (d.poster) {
        el.append('image')
          .attr('xlink:href', d.poster)
          .attr('x', -r)
          .attr('y', -r)
          .attr('width', r * 2)
          .attr('height', r * 2)
          .attr('clip-path', `url(#${clipId})`)
          .attr('preserveAspectRatio', 'xMidYMid slice');
      } else {
        el.append('foreignObject')
          .attr('x', -r)
          .attr('y', -r)
          .attr('width', r * 2)
          .attr('height', r * 2)
          .attr('clip-path', `url(#${clipId})`)
          .html(`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#171717;color:#a3a3a3;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m7 3 3 18M14 3l3 18M3 10h18M3 14h18"/></svg></div>`);
      }
    });

    // Node title label
    node.append('text')
      .attr('dy', (d: any) => d.isCenter ? 50 : 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text((d: any) => {
        const title = d.title || '';
        return title.length > 14 ? title.slice(0, 12) + '..' : title;
      });

    // Node role badge
    node.append('text')
      .attr('dy', (d: any) => d.isCenter ? 62 : 52)
      .attr('text-anchor', 'middle')
      .attr('fill', (d: any) => d.isCenter ? '#f59e0b' : '#a3a3a3')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .text((d: any) => d.isCenter ? 'CURRENT MOVIE' : `${(d.probability * 100).toFixed(1)}%`);

    // Click handler for nodes
    node.on('click', (event, d: any) => {
      event.stopPropagation();
      if (d.isCenter) {
        onOpenMovieDetails(selectedMovie);
      } else {
        const targetMovie = graphData.nodes.find(n => n.id === d.id);
        if (targetMovie) {
          const fullMovie: Movie = {
            id: targetMovie.id,
            title: targetMovie.title,
            originalTitle: targetMovie.originalTitle,
            year: targetMovie.year,
            language: targetMovie.language as any,
            genres: targetMovie.genres || ['Drama'],
            director: targetMovie.director || 'Unknown',
            cast: targetMovie.cast || [],
            runtime: targetMovie.runtime || 140,
            rating: targetMovie.rating || 8.0,
            ratingSource: targetMovie.ratingSource || 'IMDb',
            voteCount: targetMovie.voteCount || 10000,
            poster: targetMovie.poster,
            backdrop: targetMovie.backdrop,
            synopsis: targetMovie.synopsis || ''
          };
          onSelectMovie(fullMovie);
        }
      }
    });

    // Simulation tick update
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as any).x)
        .attr('y1', (d: any) => (d.source as any).y)
        .attr('x2', (d: any) => (d.target as any).x)
        .attr('y2', (d: any) => (d.target as any).y);

      edgeLabel.attr('transform', (d: any) => {
        const x = ((d.source as any).x + (d.target as any).x) / 2;
        const y = ((d.source as any).y + (d.target as any).y) / 2;
        return `translate(${x - 22}, ${y - 9})`;
      });

      node.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, selectedMovie, onSelectMovie, onOpenMovieDetails]);

  return (
    <div className="relative w-full h-[500px] bg-neutral-950/80 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 pointer-events-none shadow">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span>D3.js Force-Directed Probability Network · Drag nodes or click to switch state</span>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};
