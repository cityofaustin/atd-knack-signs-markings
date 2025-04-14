const objectProps = {
  thermo60: {
    type: "Width,LinearFeet",
    heading: "60 mils thick (maintenance)",
    label: "Pounds of alkyd material",
    inputWidth: 0,
    inputLinearFeet: 0,
    divisor: 17.5609756097561,
    output: 0,
  },
  thermo90: {
    type: "Width,LinearFeet",
    heading: "90 mils thick (maintenance)",
    label: "Pounds of alkyd material",
    inputWidth: 0,
    inputLinearFeet: 0,
    divisor: 12.1951219512195,
    output: 0,
  },
  beadsExtruded: {
    type: "Width,LinearFeet",
    heading: "Beads - for extruded machine",
    label: "Pounds of beads",
    inputWidth: 0,
    inputLinearFeet: 0,
    divisor: 120,
    output: 0,
  },
  primer: {
    type: "Width,LinearFeet",
    heading: "Thermoplastic: Primer (sealant) - for extruded machine",
    label: "Gallons of primer",
    inputWidth: 0,
    inputLinearFeet: 0,
    divisor: 3600,
    output: 0,
  },
  paintGallons: {
    type: "Width,LinearFeet,Thickness",
    heading: "Gallons Paint Used",
    label: "Gallons needed",
    inputWidth: 0,
    inputLinearFeet: 0,
    inputThickness: 0,
    divisor: 19250,
    output: 0,
  },
  beadsPaint: {
    type: "Width,LinearFeet",
    heading: "Beads (Pounds of beads)",
    label: "Pounds of beads",
    inputWidth: 0,
    inputLinearFeet: 0,
    divisor: 212.4,
    output: 0,
  },
  adhesive: {
    type: "RPMS",
    heading: '4" RPMS',
    label: "Pounds of bituminous adhesive",
    inputRPMS: 0,
    divisor: 3,
    output: 0,
  },
};

export const defaultDivisors = {
  thermo60: {
    divisor: 17.5609756097561,
  },
  thermo90: {
    divisor: 12.1951219512195,
  },
  beadsExtruded: {
    divisor: 120,
  },
  primer: {
    divisor: 3600,
  },
  paintGallons: {
    divisor: 19250,
  },
  beadsPaint: {
    divisor: 212.4,
  },
  adhesive: {
    divisor: 3,
  },
};
