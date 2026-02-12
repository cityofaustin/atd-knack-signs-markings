/**
 * ONE-TIME / EXPERIMENTAL TOOLING PAGE.
 *
 * This `/benchmark` route is a developer-only tool for comparing
 * performance of individual markers vs a Mapbox circle layer when
 * rendering large numbers of AGOL sign points.
 *
 * It is **not** part of any Knack iframe flow or production UX.
 * Treat it as a throwaway experiment: safe to modify or delete once
 * we are satisfied with the performance decisions it informed.
 */

"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import MapGL, {
  MapRef,
  Marker,
  NavigationControl,
  Source,
  Layer,
  MapMouseEvent,
} from "react-map-gl/mapbox";
import type { CircleLayerSpecification } from "mapbox-gl";
import {
  generateMockSigns,
  generateMockGeoJSON,
  useMarkerPerformanceBenchmark,
  useLayerPerformanceBenchmark,
  setupBenchmarkConsoleUtils,
} from "@/toolbox/benchmark/benchmarkUtils";
import {
  DEFAULT_MAP_PARAMS,
  DEFAULT_MAP_PAN_ZOOM,
} from "@/config/map";

// Initialize console utils on load
if (typeof window !== "undefined") {
  setupBenchmarkConsoleUtils();
}

type RenderMode = "markers" | "layer";

const MARKER_COUNTS = [100, 500, 1000, 2000, 5000, 10000];

// Layer style for AGOL signs (matching current marker appearance)
const BENCHMARK_SOURCE_ID = "agol-signs";

const agolSignsLayerStyle: CircleLayerSpecification = {
  id: "agol-signs-layer",
  type: "circle",
  source: BENCHMARK_SOURCE_ID,
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 4, 18, 8],
    "circle-color": "#FFD700", // Gold/Yellow
    "circle-stroke-color": "#000000",
    "circle-stroke-width": 1,
  },
};

export default function BenchmarkPage() {
  const mapRef = useRef<MapRef>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>("markers");
  const [markerCount, setMarkerCount] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);

  // Generate mock data based on current count
  const mockSigns = useMemo(() => {
    if (renderMode === "markers" && currentCount > 0) {
      return generateMockSigns(currentCount);
    }
    return [];
  }, [currentCount, renderMode]);

  const mockGeoJSON = useMemo(() => {
    if (renderMode === "layer" && currentCount > 0) {
      return generateMockGeoJSON(currentCount);
    }
    return { type: "FeatureCollection" as const, features: [] };
  }, [currentCount, renderMode]);

  // Benchmarking hooks
  useMarkerPerformanceBenchmark(
    renderMode === "markers" ? mockSigns.length : 0,
    isRunning
  );

  useLayerPerformanceBenchmark(
    renderMode === "layer" ? mockGeoJSON.features.length : 0,
    "agol-signs-layer",
    isRunning
  );

  const runBenchmark = useCallback(() => {
    // Reset state
    setCurrentCount(0);
    setIsRunning(true);

    // Small delay to ensure reset, then set count
    setTimeout(() => {
      setCurrentCount(markerCount);
    }, 100);

    // Stop after benchmark completes
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  }, [markerCount]);

  const clearMarkers = useCallback(() => {
    setCurrentCount(0);
    setIsRunning(false);
  }, []);

  // Marker rendering
  const markers = useMemo(() => {
    if (renderMode !== "markers") return null;

    return mockSigns.map((sign) => (
      <Marker
        key={sign.id}
        longitude={sign.lng}
        latitude={sign.lat}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#FFD700",
            border: "1px solid #000000",
            cursor: "pointer",
            transform: "translate(-50%, -50%)",
          }}
        />
      </Marker>
    ));
  }, [mockSigns, renderMode]);

  const handleLayerClick = useCallback((e: MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      console.log("Clicked feature:", e.features[0].properties);
    }
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Controls */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ marginRight: "8px", fontWeight: "bold" }}>
            Render Mode:
          </label>
          <select
            value={renderMode}
            onChange={(e) => {
              setRenderMode(e.target.value as RenderMode);
              clearMarkers();
            }}
            style={{ padding: "4px 8px" }}
          >
            <option value="markers">Individual Markers (Current)</option>
            <option value="layer">GeoJSON Layer (Proposed)</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: "8px", fontWeight: "bold" }}>
            Marker Count:
          </label>
          <select
            value={markerCount}
            onChange={(e) => setMarkerCount(Number(e.target.value))}
            style={{ padding: "4px 8px" }}
          >
            {MARKER_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isRunning}
          style={{
            padding: "8px 16px",
            backgroundColor: isRunning ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isRunning ? "not-allowed" : "pointer",
          }}
        >
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>

        <button
          onClick={clearMarkers}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>

        <div
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            backgroundColor: "#fff",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <strong>Current:</strong> {currentCount.toLocaleString()}{" "}
          {renderMode === "markers" ? "markers" : "features"}
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#e7f3ff",
          borderBottom: "1px solid #b8daff",
          fontSize: "14px",
        }}
      >
        <strong>Instructions:</strong> Select render mode and marker count, then
        click "Run Benchmark". Open browser DevTools Console (F12) to see timing
        results. Use <code>window.getBenchmarkResults()</code> to retrieve all
        results, or <code>window.exportBenchmarkResults()</code> to export as
        JSON.
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapGL
          ref={mapRef}
          initialViewState={{
            latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
            longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
            zoom: 17,
          }}
          {...DEFAULT_MAP_PARAMS}
          interactiveLayerIds={renderMode === "layer" ? ["agol-signs-layer"] : []}
          onClick={renderMode === "layer" ? handleLayerClick : undefined}
        >
          {/* Individual Markers (current approach) */}
          {renderMode === "markers" && markers}

          {/* GeoJSON Layer (proposed approach) */}
          {renderMode === "layer" && currentCount > 0 && (
            <Source id={BENCHMARK_SOURCE_ID} type="geojson" data={mockGeoJSON}>
              <Layer {...agolSignsLayerStyle} />
            </Source>
          )}

          <NavigationControl position="bottom-right" showCompass={false} />
        </MapGL>
      </div>
    </div>
  );
}
