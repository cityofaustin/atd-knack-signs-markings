import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";

const objectProps = {
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

export type CalculationInputsType = {
  thermo60Width: number;
  thermo60LinearFeet: number;
  thermo60Output: number;
  thermo90Width: number;
  thermo90LinearFeet: number;
  thermo90Output: number;
  beadsExtrudedWidth: number;
  beadsExtrudedLinearFeet: number;
  beadsExtrudedOutput: number;
  primerWidth: number,
  primerLinearFeet: number,
  primerOutput: number,
  paintGallons: {
    inputWidth: 0;
    inputLinearFeet: 0;
    inputThickness: 0;
    output: 0;
  };
  beadsPaint: {
    inputWidth: 0;
    inputLinearFeet: 0;
    output: 0;
  };
  adhesive: {
    inputRPMS: 0;
    output: 0;
  };
};

interface useCalculationType {
  width: number;
  length: number;
  calculationName: string;
  setValue: UseFormSetValue<CalculationInputsType>;
  outputFieldName: keyof CalculationInputsType;
}

export const useCalculation = ({
  width,
  length,
  calculationName,
  setValue,
  outputFieldName,
}: useCalculationType) => {
  useEffect(() => {
    const valueToSet =
      Number(width) * (Number(length) / defaultDivisors[calculationName]);

    setValue(outputFieldName, valueToSet);
  }, [width, length, setValue, calculationName]);
};
