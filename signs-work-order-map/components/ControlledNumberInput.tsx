import Form from "react-bootstrap/Form";
import { Controller, Control } from "react-hook-form";
import { CalculationInputsType } from "@/types/calcs";

interface ControlledNumberInputProps {
  name: keyof CalculationInputsType;
  control: Control<CalculationInputsType>;
  valueMaximum: number;
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
