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
  thermo90Width: 0,
  thermo90LinearFeet: 0,
  beadsExtrudedWidth: 0,
  beadsExtrudedLinearFeet: 0,
  primerWidth: 0,
  primerLinearFeet: 0,
  paintGallonsWidth: 0,
  paintGallonsLinearFeet: 0,
  paintGallonsThickness: 0,
  beadsPaintWidth: 0,
  beadsPaintLinearFeet: 0,
  adhesiveInputRPMS: 0,
};

export default function Calcs() {
  const { control, watch } = useForm<CalculationInputsType>({
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
            inputWidthName={calculation.inputWidthName}
            inputLengthName={calculation.inputLengthName}
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
            inputWidthName={calculation.inputWidthName}
            inputLengthName={calculation.inputLengthName}
            inputThicknessName={calculation.inputThicknessName}
            outputLabel={calculation.outputLabel}
            divisor={calculation.divisor}
          />
        ))}
        <h1 className="calc-header">Bituminous adhesive</h1>
        <CalcRPMSComponent
          title={'4" RPMS'}
          control={control}
          watch={watch}
          inputName={"adhesiveInputRPMS"}
          outputLabel="Pounds of bituminous adhesive:"
          divisor={3}
        />
      </form>
    </div>
  );
}
