"use client";
import { useForm } from "react-hook-form";
import CalcWidthLengthComponent from "@/components/CalcWidthLengthComponent";
import CalcRPMSComponent from "@/components/CalcRPMSComponent";
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
  adhesiveInputRPMS: 0,
  adhesiveOutput: 0,
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
            divisor={calculation.divisor}
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
            divisor={calculation.divisor}
          />
        ))}
        <h1 className="calc-header">Bituminous adhesive</h1>
        <CalcRPMSComponent
          title={'4" RPMS'}
          control={control}
          watch={watch}
          setValue={setValue}
          inputName={"adhesiveInputRPMS"}
          outputName={"adhesiveOutput"}
          outputLabel="Pounds of bituminous adhesive:"
          divisor={3}
        />
      </form>
    </div>
  );
}
