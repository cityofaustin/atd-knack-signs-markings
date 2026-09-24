/**
 * MapStatusIndicator Component
 *
 * Displays loading or error messages overlaid on the map.
 * Used for showing AGOL data fetch status and other map-related messages.
 * Styles are defined in globals.scss (.map-status-indicator)
 */

import type { CSSProperties } from "react";

interface MapStatusIndicatorProps {
  /** Type of status message to display */
  type: "loading" | "error";
  /** Message text to show to the user */
  message: string;
  /** Optional position override (defaults to top-center) */
  position?: CSSProperties;
}

/** Icon mapping for each indicator type */
const typeIcons: Record<MapStatusIndicatorProps["type"], string> = {
  loading: "⏳",
  error: "⚠️",
};

/**
 * Reusable status indicator for map overlays
 * Provides consistent styling for loading and error states
 *
 * @example
 * ```tsx
 * {isLoading && (
 *   <MapStatusIndicator type="loading" message="Loading sign assets..." />
 * )}
 *
 * {error && (
 *   <MapStatusIndicator type="error" message={`Error: ${error}`} />
 * )}
 * ```
 */
export const MapStatusIndicator = ({
  type,
  message,
  position = { top: "10px", left: "50%", transform: "translateX(-50%)" },
}: MapStatusIndicatorProps) => {
  return (
    <div
      className={`map-status-indicator map-status-indicator--${type}`}
      style={position}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">{typeIcons[type]}</span>
      <span>{message}</span>
    </div>
  );
};
