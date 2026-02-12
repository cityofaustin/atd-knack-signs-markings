"use client";

import { useCallback, useRef } from "react";
import { useControl } from "react-map-gl/mapbox";
import type { ControlPosition } from "react-map-gl/mapbox";

interface FullscreenControlProps {
  /** Position for the control. Default: bottom-right (stacks with zoom controls) */
  position?: ControlPosition;
}

/**
 * Custom fullscreen control that always displays (for testing).
 * Mapbox's built-in FullscreenControl hides itself when the browser
 * doesn't support requestFullscreen (e.g. in some iframe contexts).
 * Uses useControl so it renders in the Mapbox control container.
 */
export default function FullscreenControl({
  position = "bottom-right",
}: FullscreenControlProps) {
  const cleanupRef = useRef<(() => void) | null>(null);

  const getFullscreenElement = useCallback(() => {
    return (
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
    );
  }, []);

  const updateIcon = useCallback(
    (container: Element) => {
      const btn = container.querySelector("button");
      if (!btn) return;
      const isFullscreen = !!getFullscreenElement();
      btn.classList.toggle("mapboxgl-ctrl-fullscreen", !isFullscreen);
      btn.classList.toggle("mapboxgl-ctrl-shrink", isFullscreen);
      btn.setAttribute("title", isFullscreen ? "Exit fullscreen" : "Toggle fullscreen");
      btn.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Toggle fullscreen");
    },
    [getFullscreenElement]
  );

  useControl(
    () => ({
      onAdd(map) {
        const container = document.createElement("div");
        container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mapboxgl-ctrl-fullscreen";
        button.setAttribute("title", "Toggle fullscreen");
        button.setAttribute("aria-label", "Toggle fullscreen");
        button.innerHTML = '<span class="mapboxgl-ctrl-icon"></span>';

        const mapContainer = map.getContainer();

        const exitFullscreen = () => {
          if (document.exitFullscreen) document.exitFullscreen();
          else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen)
            (document as Document & { webkitExitFullscreen: () => void }).webkitExitFullscreen();
          else if ((document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen)
            (document as Document & { mozCancelFullScreen: () => void }).mozCancelFullScreen();
          else if ((document as Document & { msExitFullscreen?: () => void }).msExitFullscreen)
            (document as Document & { msExitFullscreen: () => void }).msExitFullscreen();
        };

        const requestFullscreen = (el: Element) => {
          if (el.requestFullscreen) el.requestFullscreen();
          else if ((el as Element & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen)
            (el as Element & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
          else if ((el as Element & { mozRequestFullScreen?: () => void }).mozRequestFullScreen)
            (el as Element & { mozRequestFullScreen: () => void }).mozRequestFullScreen();
          else if ((el as Element & { msRequestFullscreen?: () => void }).msRequestFullscreen)
            (el as Element & { msRequestFullscreen: () => void }).msRequestFullscreen();
        };

        const onFullscreenChange = () => updateIcon(container);

        button.addEventListener("click", () => {
          if (getFullscreenElement()) exitFullscreen();
          else requestFullscreen(mapContainer);
        });

        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);
        document.addEventListener("mozfullscreenchange", onFullscreenChange);
        document.addEventListener("MSFullscreenChange", onFullscreenChange);

        cleanupRef.current = () => {
          document.removeEventListener("fullscreenchange", onFullscreenChange);
          document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
          document.removeEventListener("mozfullscreenchange", onFullscreenChange);
          document.removeEventListener("MSFullscreenChange", onFullscreenChange);
        };

        container.appendChild(button);
        return container;
      },
      onRemove() {
        cleanupRef.current?.();
        cleanupRef.current = null;
      },
    }),
    { position }
  );

  return null;
}
