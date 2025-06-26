import { ReactElement, useState } from "react";
import {
  useControl,
  Marker,
  MarkerProps,
  ControlPosition,
} from "react-map-gl/mapbox";
import MapboxGeocoder, { GeocoderOptions } from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MAPBOX_TOKEN } from "@/config/map";
import { LatLon } from "@/types/map";
import { sendLatLonToParent } from "@/utils/iFrameMessenger";

type GeocoderControlProps = Omit<
  GeocoderOptions,
  "accessToken" | "mapboxgl" | "marker"
> & {
  marker?: boolean | Omit<MarkerProps, "longitude" | "latitude">;

  position: ControlPosition;

  onLoading?: (e: object) => void;
  onResults?: (e: object) => void;
  onResult?: (e: object) => void;
  onError?: (e: object) => void;
  setMapLatLon: (value: LatLon) => void;
};

const ATX_BOUNDING_BOX: [number, number, number, number] = [
  -98.182, 29.987, -97.304, 30.663,
];

/* eslint-disable complexity,max-statements */
export default function GeocoderControl(props: GeocoderControlProps) {
  const [marker, setMarker] = useState<ReactElement | null>(null);

  const geocoder = useControl<MapboxGeocoder>(
    () => {
      const ctrl = new MapboxGeocoder({
        ...props,
        marker: false,
        accessToken: MAPBOX_TOKEN || "",
        bbox: ATX_BOUNDING_BOX,
      });
      ctrl.on("result", (event) => {
        const { result } = event;
        const location =
          result &&
          (result.center ||
            (result.geometry?.type === "Point" && result.geometry.coordinates));
        if (result.center[0] && result.center[1]) {
          props.setMapLatLon({
            longitude: result.center[0],
            latitude: result.center[1],
          });
          sendLatLonToParent({
            longitude: result.center[0],
            latitude: result.center[1],
          })
        }
        if (location && props.marker) {
          const markerProps =
            typeof props.marker === "object" ? props.marker : {};
          setMarker(
            <Marker
              {...markerProps}
              longitude={location[0]}
              latitude={location[1]}
            />
          );
        } else {
          setMarker(null);
        }
        console.log(result["place_name"]);
      });
      return ctrl;
    },
    {
      position: props.position,
    }
  );

  // @ts-expect-error (TS2339) private member
  if (geocoder._map) {
    if (
      geocoder.getProximity() !== props.proximity &&
      props.proximity !== undefined
    ) {
      geocoder.setProximity(props.proximity);
    }
    if (
      geocoder.getRenderFunction() !== props.render &&
      props.render !== undefined
    ) {
      geocoder.setRenderFunction(props.render);
    }
    if (
      geocoder.getLanguage() !== props.language &&
      props.language !== undefined
    ) {
      geocoder.setLanguage(props.language);
    }
    if (geocoder.getZoom() !== props.zoom && props.zoom !== undefined) {
      geocoder.setZoom(props.zoom);
    }
    if (geocoder.getFlyTo() !== props.flyTo && props.flyTo !== undefined) {
      geocoder.setFlyTo(props.flyTo);
    }
    if (
      geocoder.getPlaceholder() !== props.placeholder &&
      props.placeholder !== undefined
    ) {
      geocoder.setPlaceholder(props.placeholder);
    }
    if (
      geocoder.getCountries() !== props.countries &&
      props.countries !== undefined
    ) {
      geocoder.setCountries(props.countries);
    }
    if (geocoder.getTypes() !== props.types && props.types !== undefined) {
      geocoder.setTypes(props.types);
    }
    if (
      geocoder.getMinLength() !== props.minLength &&
      props.minLength !== undefined
    ) {
      geocoder.setMinLength(props.minLength);
    }
    if (geocoder.getLimit() !== props.limit && props.limit !== undefined) {
      geocoder.setLimit(props.limit);
    }
    if (geocoder.getFilter() !== props.filter && props.filter !== undefined) {
      geocoder.setFilter(props.filter);
    }
    if (geocoder.getOrigin() !== props.origin && props.origin !== undefined) {
      geocoder.setOrigin(props.origin);
    }
  }
  return marker;
}
