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

export const thermoplasticCalculations: Array<CalcComponentTypeDef> = [
  {
    title: "60 mils thick (maintenance)",
    inputWidthName: "thermo60Width",
    inputLengthName: "thermo60LinearFeet",
    outputName: "thermo60Output",
    outputLabel: "Pounds of allkyd material: ",
    calculationName: "thermo60",
    divisor: 17.5609756097561,
  },
  {
    title: "90 mils thick (maintenance)",
    inputWidthName: "thermo90Width",
    inputLengthName: "thermo90LinearFeet",
    outputName: "thermo90Output",
    outputLabel: "Pounds of allkyd material: ",
    calculationName: "thermo90",
    divisor: 12.1951219512195,
  },
  {
    title: "Beads - for extruded machine",
    inputWidthName: "beadsExtrudedWidth",
    inputLengthName: "beadsExtrudedLinearFeet",
    outputName: "beadsExtrudedOutput",
    outputLabel: "Pounds of beads: ",
    calculationName: "beadsExtruded",
    divisor: 120,
  },
  {
    title: "Thermoplastic: Primer (sealant) - for extruded machine",
    inputWidthName: "primerWidth",
    inputLengthName: "primerLinearFeet",
    outputName: "primerOutput",
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
    outputName: "paintGallonsOutput",
    outputLabel: "Gallons needed: ",
    calculationName: "paintGallons",
    divisor: 19250,
  },
  {
    title: "Beads (Pounds of beads)",
    inputWidthName: "beadsPaintWidth",
    inputLengthName: "beadsPaintLinearFeet",
    outputName: "beadsPaintOutput",
    outputLabel: "Pounds of beads: ",
    calculationName: "beadsPaint",
    divisor: 212.4,
  },
];

export const useCalculation = ({
  width,
  length,
  thickness,
  divisor,
  setValue,
  outputFieldName,
}: useCalculationType) => {
  useEffect(() => {
    let valueToSet = 0;
    if (!!thickness) {
      valueToSet = (width * length * thickness) / divisor;
    } else {
      valueToSet = width * (length / divisor);
    }

    setValue(outputFieldName, valueToSet);
  }, [width, length, thickness, setValue, divisor]);
};

export const useSimpleCalculation = ({
  input,
  divisor,
  setValue,
  outputFieldName,
}: useSimpleCalculationType) => {
  useEffect(() => {
    const valueToSet = input / divisor;

    setValue(outputFieldName, valueToSet);
  }, [input, setValue, divisor]);
};
