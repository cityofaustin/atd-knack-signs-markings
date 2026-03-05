import { LocationMode } from "@/types/map";
import PinIcon from "./PinIcon";
import CrosshairIcon from "./CrosshairIcon";

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
        <PinIcon />
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
        <CrosshairIcon />
        <span>Select Existing</span>
      </button>
    </div>
  );
}
