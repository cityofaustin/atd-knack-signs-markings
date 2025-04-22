import { useEffect } from "react";
import {
  useCalculationType,
  useSimpleCalculationType,
  CalcComponentTypeDef,
} from "@/types/calcs";

export const MAXWIDTH = 12;
export const MAXFEET = 1000;
export const MAXTHICKNESS = 15;
export const MAXRPMS = 100;

export const defaultDivisors: { [key: string]: number } = {
  thermo60: 17.5609756097561,
  thermo90: 12.1951219512195,
  beadsExtruded: 120,
  primer: 3600,
  paintGallons: 19250,
  beadsPaint: 212.4,
  adhesive: 3,
};

export const thermoplasticCalculations: Array<CalcComponentTypeDef> = [
  {
    title: "60 mils thick (maintenance)",
    inputWidthName: "thermo60Width",
    inputLengthName: "thermo60LinearFeet",
    outputName: "thermo60Output",
    outputLabel: "Pounds of allkyd material: ",
    calculationName: "thermo60",
  },
  {
    title: "90 mils thick (maintenance)",
    inputWidthName: "thermo90Width",
    inputLengthName: "thermo90LinearFeet",
    outputName: "thermo90Output",
    outputLabel: "Pounds of allkyd material: ",
    calculationName: "thermo90",
  },
  {
    title: "Beads - for extruded machine",
    inputWidthName: "beadsExtrudedWidth",
    inputLengthName: "beadsExtrudedLinearFeet",
    outputName: "beadsExtrudedOutput",
    outputLabel: "Pounds of beads: ",
    calculationName: "beadsExtruded",
  },
  {
    title: "Thermoplastic: Primer (sealant) - for extruded machine",
    inputWidthName: "primerWidth",
    inputLengthName: "primerLinearFeet",
    outputName: "primerOutput",
    outputLabel: "Gallons of primer: ",
    calculationName: "primer",
  },
];

export const paintCalculations: Array<CalcComponentTypeDef> = [
  {
    title: "Gallons Paint Used",
    inputWidthName: "paintGallonsWidth",
    inputLengthName: "paintGallonsLinearFeet",
    inputThicknessName: "paintGallonsThickness",
    outputName: "paintGallonsOutput",
    outputLabel: "Gallons needed: ",
    calculationName: "paintGallons",
  },
  {
    title: "Beads (Pounds of beads)",
    inputWidthName: "beadsPaintWidth",
    inputLengthName: "beadsPaintLinearFeet",
    outputName: "beadsPaintOutput",
    outputLabel: "Pounds of beads: ",
    calculationName: "beadsPaint",
  },
];

export const useCalculation = ({
  width,
  length,
  thickness,
  calculationName,
  setValue,
  outputFieldName,
}: useCalculationType) => {
  useEffect(() => {
    let valueToSet = 0;
    if (!!thickness) {
      valueToSet =
        (width * length * thickness) / defaultDivisors[calculationName];
    } else {
      valueToSet = width * (length / defaultDivisors[calculationName]);
    }

    setValue(outputFieldName, valueToSet);
  }, [width, length, thickness, setValue, calculationName]);
};

export const useSimpleCalculation = ({
  input,
  calculationName,
  setValue,
  outputFieldName,
}: useSimpleCalculationType) => {
  useEffect(() => {
    const valueToSet = input / defaultDivisors[calculationName];

    setValue(outputFieldName, valueToSet);
  }, [input, setValue, calculationName]);
};
