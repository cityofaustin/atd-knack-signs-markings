"use client";
import { useForm } from "react-hook-form";
import CalcWidthLengthComponent from "@/components/CalcWidthLengthComponent";
import { CalculationInputsType } from "@/types/calcs";
import { thermoplasticCalculations, paintCalculations } from "@/config/calcs";
import "./calc.css";

const defaultCalcValues = {
  thermo60Width: 0,
  thermo60LinearFeet: 0,
  thermo60Output: 0,
  thermo90Width: 0,
  thermo90LinearFeet: 0,
  thermo90Output: 0,
  beadsExtrudedWidth: 0,
  beadsExtrudedLinearFeet: 0,
  beadsExtrudedOutput: 0,
  primerWidth: 0,
  primerLinearFeet: 0,
  primerOutput: 0,
  paintGallonsWidth: 0,
  paintGallonsLinearFeet: 0,
  paintGallonsThickness: 0,
  paintGallonsOutput: 0,
  beadsPaintWidth: 0,
  beadsPaintLinearFeet: 0,
  beadsPaintOutput: 0,
  // adhesive: {
  //   inputRPMS: 0,
  //   output: 0,
  // },
};

export default function Calcs() {
  const { control, watch, setValue } = useForm<CalculationInputsType>({
    defaultValues: defaultCalcValues,
    mode: "onChange",
  });

  return (
    <div>
      <form>
        <h1 className="calc-header">Thermoplastic - extruded machine</h1>
        {thermoplasticCalculations.map((calculation) => (
          <CalcWidthLengthComponent
            key={calculation.calculationName}
            title={calculation.title}
            control={control}
            watch={watch}
            setValue={setValue}
            inputWidthName={calculation.inputWidthName}
            inputLengthName={calculation.inputLengthName}
            outputName={calculation.outputName}
            outputLabel={calculation.outputLabel}
            calculationName={calculation.calculationName}
          />
        ))}
        <h1 className="calc-header">Paint</h1>
        {paintCalculations.map((calculation) => (
          <CalcWidthLengthComponent
            key={calculation.calculationName}
            title={calculation.title}
            control={control}
            watch={watch}
            setValue={setValue}
            inputWidthName={calculation.inputWidthName}
            inputLengthName={calculation.inputLengthName}
            inputThicknessName={calculation.inputThicknessName}
            outputName={calculation.outputName}
            outputLabel={calculation.outputLabel}
            calculationName={calculation.calculationName}
          />
        ))}
      </form>
    </div>
  );
}
