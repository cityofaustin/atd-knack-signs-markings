import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";

const objectProps = {
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
  primerWidth: number;
  primerLinearFeet: number;
  primerOutput: number;
  paintGallonsWidth: number;
  paintGallonsLinearFeet: number;
  paintGallonsThickness: number;
  paintGallonsOutput: number;
  beadsPaintWidth: number;
  beadsPaintLinearFeet: number;
  beadsPaintOutput: number;
  // adhesive: {
  //   inputRPMS: 0;
  //   output: 0;
  // };
};

interface useCalculationType {
  width: number;
  length: number;
  thickness?: number;
  calculationName: string;
  setValue: UseFormSetValue<CalculationInputsType>;
  outputFieldName: keyof CalculationInputsType;
}

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
      valueToSet = (width * length * thickness) / defaultDivisors[calculationName]
    } else {
      valueToSet = width * (length / defaultDivisors[calculationName]);
    }

    setValue(outputFieldName, valueToSet);
  }, [width, length, thickness, setValue, calculationName]);
};
