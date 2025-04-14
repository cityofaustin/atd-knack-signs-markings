"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import CalcComponent from "@/components/CalcComponent";
// import { objectProps } from "@/config/calc";
import SliderAndNumberInput from "@/components/SliderAndNumberInput";
import "./calc.css";

const defaultCalcValues = {
  unnested: 0,
  thermo60: {
    inputWidth: 0,
    inputLinearFeet: 0,
    output: 0,
  },
  thermo90: {
    inputWidth: 0,
    inputLinearFeet: 0,
    output: 0,
  },
  beadsExtruded: {
    inputWidth: 0,
    inputLinearFeet: 0,
    output: 0,
  },
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

const MAXWIDTH = 12;
const MAXFEET = 1000;
const MAXTHICKNESS = 15;
const MAXRPMS = 100;

export default function Calcs() {
  const [boring, setBoring] = useState(0);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    register,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: defaultCalcValues,
    mode: "onChange",
  });

  console.log(boring);

  return (
    <div>
      <form onChange={() => console.log(getValues())}>
        <h1 className="calc-header">Thermoplastic - extruded machine</h1>
        <SliderAndNumberInput
          value={boring}
          onChange={setBoring}
          valueMaximum={MAXWIDTH}
          name="thermo60"
          label="Width (inches):"
        />
        <SliderAndNumberInput
          value={boring}
          onChange={setBoring}
          valueMaximum={MAXFEET}
          name="thermo60"
          label="Linear feet"
        />
        <h1 className="calc-header">Paint</h1>
        <h1 className="calc-header">Bituminous adhesive</h1>
      </form>
    </div>
  );
}
