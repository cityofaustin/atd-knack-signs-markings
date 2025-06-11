export interface LatLon {
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface MapProps {
  // update the location
  location: {
    longitude: number | undefined;
    latitude: number | undefined;
  };
  signs: any;
  messageType: string | undefined; // refine this more to only be one of the specific messages?
}

export interface Sign {
  id: string;
  lng: number;
  lat: number;
  spatialId: number;
  workOrderId: string;
}

export interface KnackRecord {
  field_3297: number;
  field_3297_raw: number;
  /** address */
  field_3300: string;
  field_3300_raw: {
    city: string;
    country: string;
    full: string;
    latitude: number;
    longitude: number;
    state: string;
    street: string;
    street2: string | null;
    zip: string;
  };
  //   field_3301: string
  //   field_3301_raw: [
  //     { id: string, identifier: string },
  //   ],
  //   field_3302: "08/01/2019",
  //   field_3302_raw: {
  //     am_pm: "AM",
  //     date: "08/01/2019",
  //     date_formatted: "08/01/2019",
  //     hours: "12",
  //     iso_timestamp: "2019-08-01T00:00:00.000Z",
  //     minutes: "00",
  //     proper_iso_timestamp: "2019-08-01T05:00:00.000Z",
  //     proper_unix_timestamp: 1564635600000,
  //     time: 0,
  //     timestamp: "08/01/2019 12:00 am",
  //     unix_timestamp: 1564617600000,
  //   },
  //   field_3378: "",
  //   field_3378_raw: "",
  //   field_3425: 1,
  //   field_3425_raw: 1,
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
    }
  | {
      message: "KNACK_GEOLOCATION";
      payload: {
        geolocation: {
          latitude: number | undefined; // maybe not undefined?
          longitude: number | undefined;
        };
      };
    };
