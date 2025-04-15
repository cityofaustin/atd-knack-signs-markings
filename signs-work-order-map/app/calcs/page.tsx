"use client";
import { useForm, Controller } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import CalcWidthLengthComponent from "@/components/CalcWidthLengthComponent";
import { useCalculation } from "@/config/calcs";
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
  primer: {
    inputWidth: 0,
    inputLinearFeet: 0,
    output: 0,
  },
  paintGallons: {
    inputWidth: 0,
    inputLinearFeet: 0,
    inputThickness: 0,
    output: 0,
  },
  beadsPaint: {
    inputWidth: 0,
    inputLinearFeet: 0,
    output: 0,
  },
  adhesive: {
    inputRPMS: 0,
    output: 0,
  },
};

export default function Calcs() {
  const { control, watch, setValue } = useForm({
    defaultValues: defaultCalcValues,
    mode: "onChange",
  });

  const [
    thermo60Width,
    thermo60LinearFeet,
    thermo90Width,
    thermo90LinearFeet,
    beadsExtrudedWidth,
    beadsExtrudedLinearFeet,
  ] = watch([
    "thermo60Width",
    "thermo60LinearFeet",
    "thermo90Width",
    "thermo90LinearFeet",
    "beadsExtrudedWidth",
    "beadsExtrudedLinearFeet",
  ]);

  useCalculation({
    width: thermo60Width,
    length: thermo60LinearFeet,
    calculationName: "thermo60",
    setValue,
    outputFieldName: "thermo60Output",
  });

  useCalculation({
    width: thermo90Width,
    length: thermo90LinearFeet,
    calculationName: "thermo90",
    setValue,
    outputFieldName: "thermo90Output",
  });

  useCalculation({
    width: beadsExtrudedWidth,
    length: beadsExtrudedLinearFeet,
    calculationName: "beadsExtruded",
    setValue,
    outputFieldName: "beadsExtrudedOutput",
  });

  return (
    <div>
      <form>
        <h1 className="calc-header">Thermoplastic - extruded machine</h1>
        <CalcWidthLengthComponent
          title="60 mils thick (maintenance)"
          control={control}
          inputWidthName="thermo60Width"
          inputLengthName="thermo60LinearFeet"
          outputName="thermo60Output"
          outputLabel="Pounds of allkyd material:"
        />
        <CalcWidthLengthComponent
          title="90 mils thick (maintenance)"
          control={control}
          inputWidthName="thermo90Width"
          inputLengthName="thermo90LinearFeet"
          outputName="thermo90Output"
          outputLabel="Pounds of allkyd material:"
        />
        <CalcWidthLengthComponent
          title="Beads - for extruded machine"
          control={control}
          inputWidthName="beadsExtrudedWidth"
          inputLengthName="beadsExtrudedLinearFeet"
          outputName="beadsExtrudedOutput"
          outputLabel="Pounds of beads:"
        />
      </form>
    </div>
  );
}
