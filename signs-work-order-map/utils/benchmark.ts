/**
 * Performance benchmarking utilities for map marker vs layer rendering.
 *
 * Usage: Import useMarkerPerformanceBenchmark / useLayerPerformanceBenchmark
 * in Map or the benchmark page; open DevTools Console to see results.
 * Use window.getBenchmarkResults() or window.exportBenchmarkResults() to export.
 */

import { useEffect, useRef } from "react";

export interface BenchmarkResult {
  signCount: number;
  initialRenderMs: number;
  memoryUsageMB: number | null;
  domElementCount: number;
  timestamp: string;
}

export const generateMockSigns = (
  count: number,
  centerLat = 30.28,
  centerLng = -97.7506
): Array<{
  id: string;
  lat: number;
  lng: number;
  spatialId: number;
  workOrderId: string;
  isLocationDetailPage: boolean;
  source: "agol";
  attributes: Record<string, unknown>;
}> => {
  const signs = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 0.0002;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const lat = centerLat + (row - gridSize / 2) * spacing;
    const lng = centerLng + (col - gridSize / 2) * spacing;
    signs.push({
      id: `mock-agol-${i}`,
      lat,
      lng,
      spatialId: 100000 + i,
      workOrderId: "",
      isLocationDetailPage: false,
      source: "agol" as const,
      attributes: { OBJECTID_1: 100000 + i, ASSET_LOC_ID: `MOCK-${i}` },
    });
  }
  return signs;
};

export const generateMockGeoJSON = (
  count: number,
  centerLat = 30.28,
  centerLng = -97.7506
): GeoJSON.FeatureCollection<GeoJSON.Point> => {
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 0.0002;
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const lat = centerLat + (row - gridSize / 2) * spacing;
    const lng = centerLng + (col - gridSize / 2) * spacing;
    features.push({
      type: "Feature",
      properties: { OBJECTID_1: 100000 + i, ASSET_LOC_ID: `MOCK-${i}` },
      geometry: { type: "Point", coordinates: [lng, lat] },
    });
  }
  return { type: "FeatureCollection", features };
};

export const useMarkerPerformanceBenchmark = (
  signCount: number,
  enabled: boolean = false
) => {
  const startTimeRef = useRef<number | null>(null);
  const hasLoggedRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || signCount === 0) return;
    if (startTimeRef.current === null) startTimeRef.current = performance.now();
  }, [signCount, enabled]);

  useEffect(() => {
    if (!enabled || signCount === 0 || signCount === hasLoggedRef.current)
      return;
    const rafId = requestAnimationFrame(() => {
      setTimeout(() => {
        const endTime = performance.now();
        const renderTime = startTimeRef.current
          ? endTime - startTimeRef.current
          : 0;
        const markerEls = document.querySelectorAll(".agol-marker").length;
        const mapboxMarkers = document.querySelectorAll(".mapboxgl-marker").length;
        let memoryMB: number | null = null;
        if ("memory" in performance) {
          memoryMB =
            (performance as unknown as { memory: { usedJSHeapSize: number } })
              .memory.usedJSHeapSize /
            (1024 * 1024);
        }
        const result: BenchmarkResult = {
          signCount,
          initialRenderMs: Math.round(renderTime * 100) / 100,
          memoryUsageMB: memoryMB ? Math.round(memoryMB * 100) / 100 : null,
          domElementCount: markerEls + mapboxMarkers,
          timestamp: new Date().toISOString(),
        };
        console.log("📊 MARKER BENCHMARK", result);
        (window as unknown as { __lastBenchmark?: BenchmarkResult }).__lastBenchmark = result;
        (window as unknown as { __benchmarkHistory?: BenchmarkResult[] }).__benchmarkHistory =
          (window as unknown as { __benchmarkHistory?: BenchmarkResult[] }).__benchmarkHistory || [];
        (window as unknown as { __benchmarkHistory: BenchmarkResult[] }).__benchmarkHistory.push(result);
        hasLoggedRef.current = signCount;
        startTimeRef.current = null;
      }, 100);
    });
    return () => cancelAnimationFrame(rafId);
  }, [signCount, enabled]);
};

export const useLayerPerformanceBenchmark = (
  featureCount: number,
  _layerId: string,
  enabled: boolean = false
) => {
  const startTimeRef = useRef<number | null>(null);
  const hasLoggedRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || featureCount === 0) return;
    if (startTimeRef.current === null) startTimeRef.current = performance.now();
  }, [featureCount, enabled]);

  useEffect(() => {
    if (!enabled || featureCount === 0 || featureCount === hasLoggedRef.current)
      return;
    const rafId = requestAnimationFrame(() => {
      setTimeout(() => {
        const endTime = performance.now();
        const renderTime = startTimeRef.current
          ? endTime - startTimeRef.current
          : 0;
        const markerEls = document.querySelectorAll(".agol-marker").length;
        let memoryMB: number | null = null;
        if ("memory" in performance) {
          memoryMB =
            (performance as unknown as { memory: { usedJSHeapSize: number } })
              .memory.usedJSHeapSize /
            (1024 * 1024);
        }
        const result: BenchmarkResult = {
          signCount: featureCount,
          initialRenderMs: Math.round(renderTime * 100) / 100,
          memoryUsageMB: memoryMB ? Math.round(memoryMB * 100) / 100 : null,
          domElementCount: markerEls,
          timestamp: new Date().toISOString(),
        };
        console.log("📊 LAYER BENCHMARK", result);
        (window as unknown as { __lastLayerBenchmark?: BenchmarkResult }).__lastLayerBenchmark = result;
        (window as unknown as { __layerBenchmarkHistory?: BenchmarkResult[] }).__layerBenchmarkHistory =
          (window as unknown as { __layerBenchmarkHistory?: BenchmarkResult[] }).__layerBenchmarkHistory || [];
        (window as unknown as { __layerBenchmarkHistory: BenchmarkResult[] }).__layerBenchmarkHistory.push(result);
        hasLoggedRef.current = featureCount;
        startTimeRef.current = null;
      }, 100);
    });
    return () => cancelAnimationFrame(rafId);
  }, [featureCount, _layerId, enabled]);
};

export const setupBenchmarkConsoleUtils = () => {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    getBenchmarkResults?: () => { marker: BenchmarkResult[]; layer: BenchmarkResult[] };
    clearBenchmarkHistory?: () => void;
    exportBenchmarkResults?: () => string;
    __benchmarkHistory?: BenchmarkResult[];
    __layerBenchmarkHistory?: BenchmarkResult[];
  };
  w.getBenchmarkResults = () => ({
    marker: w.__benchmarkHistory || [],
    layer: w.__layerBenchmarkHistory || [],
  });
  w.clearBenchmarkHistory = () => {
    w.__benchmarkHistory = [];
    w.__layerBenchmarkHistory = [];
    console.log("Benchmark history cleared");
  };
  w.exportBenchmarkResults = () => {
    const json = JSON.stringify(w.getBenchmarkResults?.() ?? {}, null, 2);
    console.log(json);
    return json;
  };
};
