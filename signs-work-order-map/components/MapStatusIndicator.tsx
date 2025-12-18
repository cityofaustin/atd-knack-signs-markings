/**
 * MapStatusIndicator Component
 *
 * Displays loading or error messages overlaid on the map.
 * Used for showing AGOL data fetch status and other map-related messages.
 */

interface MapStatusIndicatorProps {
  /** Type of status message to display */
  type: "loading" | "error";
  /** Message text to show to the user */
  message: string;
  /** Optional position override (defaults to top-right) */
  position?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

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
  position = { top: "10px", right: "10px" },
}: MapStatusIndicatorProps) => {
  // Define styles based on indicator type
  const typeStyles = {
    loading: {
      background: "rgba(255, 255, 255, 0.9)",
      color: "#000000",
      icon: "⏳",
    },
    error: {
      background: "rgba(255, 0, 0, 0.9)",
      color: "#ffffff",
      icon: "⚠️",
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <div
      style={{
        position: "absolute",
        ...position,
        background: currentStyle.background,
        color: currentStyle.color,
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "14px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">{currentStyle.icon}</span>
      <span>{message}</span>
    </div>
  );
};
