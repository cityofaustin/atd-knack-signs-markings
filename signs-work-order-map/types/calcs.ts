import { UseFormWatch, Control } from "react-hook-form";

export type CalculationInputsType = {
  thermo60Width: number;
  thermo60LinearFeet: number;
  thermo90Width: number;
  thermo90LinearFeet: number;
  beadsExtrudedWidth: number;
  beadsExtrudedLinearFeet: number;
  primerWidth: number;
  primerLinearFeet: number;
  paintGallonsWidth: number;
  paintGallonsLinearFeet: number;
  paintGallonsThickness: number;
  beadsPaintWidth: number;
  beadsPaintLinearFeet: number;
  adhesiveInputRPMS: number;
};

export interface CalcComponentTypeDef {
  /** Title shown at top of calculation card */
  title: string;
  /** Name of the width field */
  inputWidthName: keyof CalculationInputsType;
  /** Name of the length field */
  inputLengthName: keyof CalculationInputsType;
  /** Name of thickness field, optional */
  inputThicknessName?: keyof CalculationInputsType;
  /** Label shown next to output */
  outputLabel: string;
  /** Name of calculation */
  calculationName: string;
  /** divisor used in the calculation */
  divisor: number;
}

export interface CalcWidthLengthComponentProps {
  title: string;
  control: Control<CalculationInputsType>;
  watch: UseFormWatch<CalculationInputsType>;
  inputWidthName: keyof CalculationInputsType;
  inputLengthName: keyof CalculationInputsType;
  inputThicknessName?: keyof CalculationInputsType;
  outputLabel: string;
  divisor: number;
}

export interface CalcRPMSComponentProps {
  title: string;
  control: Control<CalculationInputsType>;
  watch: UseFormWatch<CalculationInputsType>;
  inputName: keyof CalculationInputsType;
  outputLabel: string;
  divisor: number;
}
