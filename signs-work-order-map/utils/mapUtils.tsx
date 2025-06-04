import { useMemo } from "react";
import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import { Sign } from "@/types/map";
import { LngLatBoundsLike } from "mapbox-gl";

/**
 *
 * @param signs
 * @returns
 */
export const formatBounds = (signs: Sign[]): undefined | LngLatBoundsLike =>
  useMemo(() => {
    if (signs.length === 0) {
      return undefined;
    }
    const signArray = signs.map((sign: Sign) => [sign.lng, sign.lat]);

    const lineStringFeature =
      signArray.length < 2
        ? lineString([signArray[0], [signArray[0][0], signArray[0][1]]])
        : lineString(signArray);

    const [minLng, minLat, maxLng, maxLat] = bbox(lineStringFeature);
    return [minLng, minLat, maxLng, maxLat];
  }, [signs]);
