import { CalcComponentTypeDef } from "@/types/calcs";

export const MAXWIDTH = 12;
export const MAXFEET = 1000;
export const MAXTHICKNESS = 15;
export const MAXRPMS = 100;

export const thermoplasticCalculations: Array<CalcComponentTypeDef> = [
  {
    title: "60 mils thick (maintenance)",
    inputWidthName: "thermo60Width",
    inputLengthName: "thermo60LinearFeet",
    outputLabel: "Pounds of allkyd material: ",
    calculationName: "thermo60",
    divisor: 17.5609756097561,
  },
  {
    title: "90 mils thick (maintenance)",
    inputWidthName: "thermo90Width",
    inputLengthName: "thermo90LinearFeet",
    outputLabel: "Pounds of allkyd material: ",
    calculationName: "thermo90",
    divisor: 12.1951219512195,
  },
  {
    title: "Beads - for extruded machine",
    inputWidthName: "beadsExtrudedWidth",
    inputLengthName: "beadsExtrudedLinearFeet",
    outputLabel: "Pounds of beads: ",
    calculationName: "beadsExtruded",
    divisor: 120,
  },
  {
    title: "Thermoplastic: Primer (sealant) - for extruded machine",
    inputWidthName: "primerWidth",
    inputLengthName: "primerLinearFeet",
    outputLabel: "Gallons of primer: ",
    calculationName: "primer",
    divisor: 3600,
  },
];

export const paintCalculations: Array<CalcComponentTypeDef> = [
  {
    title: "Gallons Paint Used",
    inputWidthName: "paintGallonsWidth",
    inputLengthName: "paintGallonsLinearFeet",
    inputThicknessName: "paintGallonsThickness",
    outputLabel: "Gallons needed: ",
    calculationName: "paintGallons",
    divisor: 19250,
  },
  {
    title: "Beads (Pounds of beads)",
    inputWidthName: "beadsPaintWidth",
    inputLengthName: "beadsPaintLinearFeet",
    outputLabel: "Pounds of beads: ",
    calculationName: "beadsPaint",
    divisor: 212.4,
  },
];
