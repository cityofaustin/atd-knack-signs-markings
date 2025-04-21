import { UseFormSetValue, UseFormWatch, Control } from "react-hook-form";

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

export interface CalcComponentTypeDef {
  title: string;
  inputWidthName: keyof CalculationInputsType;
  inputLengthName: keyof CalculationInputsType;
  inputThicknessName?: keyof CalculationInputsType;
  outputName: keyof CalculationInputsType;
  outputLabel: string;
  calculationName: string;
}

export interface useCalculationType {
  width: number;
  length: number;
  thickness?: number;
  calculationName: string;
  setValue: UseFormSetValue<CalculationInputsType>;
  outputFieldName: keyof CalculationInputsType;
}

export interface CalcWidthLengthComponentProps {
  title: string;
  control: Control<CalculationInputsType>;
  watch: UseFormWatch<CalculationInputsType>;
  setValue: UseFormSetValue<CalculationInputsType>;
  inputWidthName: keyof CalculationInputsType;
  inputLengthName: keyof CalculationInputsType;
  inputThicknessName?: keyof CalculationInputsType;
  outputName: keyof CalculationInputsType;
  outputLabel: string;
  calculationName: string;
}
