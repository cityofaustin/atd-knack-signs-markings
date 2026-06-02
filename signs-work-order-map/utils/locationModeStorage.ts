import type { LocationMode } from "@/types/map";

const STORAGE_KEY = "atd-signs-work-order-map:location-mode";

function isLocationMode(value: string | null): value is LocationMode {
  return value === "create" || value === "select_existing";
}

/**
 * Persists Create Location vs Select Existing across iframe reloads (same tab / origin).
 */
export function getStoredLocationMode(): LocationMode {
  if (typeof window === "undefined") return "select_existing";
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (isLocationMode(raw)) return raw;
  } catch {
    // private mode / quota
  }
  return "select_existing";
}

export function setStoredLocationMode(mode: LocationMode): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}
