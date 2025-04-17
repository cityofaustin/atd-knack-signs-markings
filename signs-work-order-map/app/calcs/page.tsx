"use client";
import { useForm } from "react-hook-form";
import CalcWidthLengthComponent from "@/components/CalcWidthLengthComponent";
import { CalculationInputsType } from "@/config/calcs";
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
  // paintGallons: {
  //   inputWidth: 0,
  //   inputLinearFeet: 0,
  //   inputThickness: 0,
  //   output: 0,
  // },
  // beadsPaint: {
  //   inputWidth: 0,
  //   inputLinearFeet: 0,
  //   output: 0,
  // },
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
        <CalcWidthLengthComponent
          title="60 mils thick (maintenance)"
          control={control}
          watch={watch}
          setValue={setValue}
          inputWidthName="thermo60Width"
          inputLengthName="thermo60LinearFeet"
          outputName="thermo60Output"
          outputLabel="Pounds of allkyd material:"
          calculationName="thermo60"
        />
        <CalcWidthLengthComponent
          title="90 mils thick (maintenance)"
          control={control}
          watch={watch}
          setValue={setValue}
          inputWidthName="thermo90Width"
          inputLengthName="thermo90LinearFeet"
          outputName="thermo90Output"
          outputLabel="Pounds of allkyd material:"
          calculationName="thermo90"
        />
        <CalcWidthLengthComponent
          title="Beads - for extruded machine"
          control={control}
          watch={watch}
          setValue={setValue}
          inputWidthName="beadsExtrudedWidth"
          inputLengthName="beadsExtrudedLinearFeet"
          outputName="beadsExtrudedOutput"
          outputLabel="Pounds of beads:"
          calculationName="beadsExtruded"
        />
        <CalcWidthLengthComponent
          title="Thermoplastic: Primer (sealant) - for extruded machine"
          control={control}
          watch={watch}
          setValue={setValue}
          inputWidthName="primerWidth"
          inputLengthName="primerLinearFeet"
          outputName="primerOutput"
          outputLabel="Gallons of primer:"
          calculationName="primer"
        />
        <h1 className="calc-header">Paint</h1>
      </form>
    </div>
  );
}
