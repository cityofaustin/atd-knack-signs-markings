"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Form from "react-bootstrap/Form";
import SliderAndNumberInput from "@/components/SliderAndNumberInput";
import { defaultDivisors } from "@/config/calcs";
import "./calc.css";

const defaultCalcValues = {
  unnested: 0,
  thermo60Width: 0,
  thermo60LinearFeet: 0,
  thermo60Output: 0,
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
  const { control, watch, setValue } = useForm({
    defaultValues: defaultCalcValues,
    mode: "onChange",
  });

  const [thermo60Width, thermo60LinearFeet] = watch([
    "thermo60Width",
    "thermo60LinearFeet",
  ]);

  useEffect(() => {
    const valueToSet =
      Number(thermo60Width) *
      (Number(thermo60LinearFeet) / defaultDivisors["thermo60"]);

    setValue("thermo60Output", valueToSet);
  }, [thermo60Width, thermo60LinearFeet, setValue]);

  return (
    <div>
      <form>
        <h1 className="calc-header">Thermoplastic - extruded machine</h1>
        <Controller
          control={control}
          name={"thermo60Width"}
          render={({ field: { onChange, value } }) => (
            <SliderAndNumberInput
              value={value}
              onChange={onChange}
              valueMaximum={MAXWIDTH}
              name="thermo60"
              label="Width (inches):"
            />
          )}
        />
        <Controller
          control={control}
          name="thermo60LinearFeet"
          render={({ field: { onChange, value } }) => (
            <SliderAndNumberInput
              value={value}
              onChange={onChange}
              valueMaximum={MAXFEET}
              name="thermo60"
              label="Linear feet"
            />
          )}
        />

        <Controller
          control={control}
          name="thermo60Output"
          render={({ field: { value } }) => (
            <>
              <Form.Label>Pounds of material</Form.Label>
              <Form.Label>{value}</Form.Label>
            </>
          )}
        />
      </form>
    </div>
  );
}
