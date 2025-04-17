import Form from "react-bootstrap/Form";
import { Controller } from "react-hook-form";

interface ControlledNumberInputProps {
  name: string;
  control: any; // update this
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
            type="number"
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
