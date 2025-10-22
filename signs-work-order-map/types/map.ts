export interface LatLon {
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface MapProps {
  editLocation?: LatLon | null;
  messageType?: "KNACK_LOCATION_DETAILS" | "EDIT_LOCATION" | "WORK_ORDER_SIGNS";
  signs: Sign[];
}

export interface Sign {
  id: string;
  lng: number;
  lat: number;
  spatialId: number;
  workOrderId: string;
  /** if the sign id matches the location record id, the payload came from the location details page */
  isLocationDetailPage: boolean;
}

export interface KnackRecord {
  /** spatial id */
  field_3297: number;
  /** spatial id raw format */
  field_3297_raw: number;
  /** address in string form */
  field_3300: string | undefined;
  /** address raw format  */
  field_3300_raw: {
    city: string | undefined;
    country: string | undefined;
    full: string | undefined;
    latitude: number | undefined;
    longitude: number | undefined;
    state: string | undefined;
    street: string | undefined;
    street2: string | null;
    zip: string | undefined;
  };
  /** created date */
  field_3302?: string;
  /** created date raw format */
  field_3302_raw?: {
    am_pm?: "AM" | "PM";
    date?: string;
    date_formatted?: string;
    hours?: string;
    iso_timestamp?: string;
    minutes?: string;
    proper_iso_timestamp?: string;
    proper_unix_timestamp?: number;
    time?: number;
    timestamp?: string;
    unix_timestamp?: number;
  };
  /** photo */
  field_3378?: string;
  /** photo raw format */
  field_3378_raw?: string;
  /** count of assets  */
  field_3425?: number;
  /** count of assets raw format*/
  field_3425_raw?: number;
  /** knack record id */
  id: string;
}

export type KnackToIFrameMessage =
  | {
      message: "KNACK_LOCATION_DETAILS";
      payload: {
        records: KnackRecord[];
        location: {
          longitude: number | undefined;
          latitude: number | undefined;
        };
        workOrderId: string;
        locationRecordId: string;
      };
    }
  | {
      message: "WORK_ORDER_SIGNS";
      payload: {
        records: KnackRecord[];
        workOrderId: string;
      };
    }
  | {
      message: "EDIT_LOCATION";
      payload: {
        location: {
          longitude: number | undefined;
          latitude: number | undefined;
        };
      };
    };
