import { MapPin, Pointer } from "lucide-react";
import { LocationMode } from "@/types/map";

const TOGGLE_ICON_PROPS = {
  size: 14,
  strokeWidth: 2.5,
  "aria-hidden": true as const,
};

interface LocationModeToggleProps {
  mode: LocationMode;
  onModeChange: (mode: LocationMode) => void;
}

export default function LocationModeToggle({
  mode,
  onModeChange,
}: LocationModeToggleProps) {
  return (
    <div className="location-mode-toggle">
      <button
        className={`location-mode-toggle__btn ${
          mode === "create" ? "location-mode-toggle__btn--active" : ""
        }`}
        onClick={() => onModeChange("create")}
        title="Create a new location by positioning the pin"
      >
        <MapPin {...TOGGLE_ICON_PROPS} />
        <span>Create Location</span>
      </button>
      <button
        className={`location-mode-toggle__btn ${
          mode === "select_existing"
            ? "location-mode-toggle__btn--active"
            : ""
        }`}
        onClick={() => onModeChange("select_existing")}
        title="Select an existing AGOL asset location"
      >
        <Pointer {...TOGGLE_ICON_PROPS} />
        <span>Select Existing</span>
      </button>
    </div>
  );
}
