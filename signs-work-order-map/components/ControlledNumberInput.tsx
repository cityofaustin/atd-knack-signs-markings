import Form from "react-bootstrap/Form";
import { Controller, Control } from "react-hook-form";
import { CalculationInputsType } from "@/types/calcs";

interface ControlledNumberInputProps {
  /** name for the input, must match the field name in CalculationInputsType */
  name: keyof CalculationInputsType;
  /** Control from react-hook-form */
  control: Control<CalculationInputsType>;
  /** Input value should not exceed this maximum */
  valueMaximum: number;
  /** label to render in front of input */
  label: string;
}

export default function ControlledNumberInput({
  name,
  control,
  valueMaximum,
  label,
}: ControlledNumberInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div className="d-flex justify-content-between">
          <Form.Label className="col-3">{label}</Form.Label>
          <Form.Control
            type="numeric"
            className="m-2"
            max={valueMaximum}
            value={value}
            onChange={onChange}
            min={0}
          />
        </div>
      )}
    />
  );
}
