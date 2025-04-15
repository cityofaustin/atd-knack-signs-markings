import Form from "react-bootstrap/Form";
import { Controller } from "react-hook-form";

interface SliderAndNumberInputProps {
  name: string;
  control: any; // update this
  valueMaximum: number;
  label: string;
}

export default function SliderAndNumberInput({
  name,
  control,
  valueMaximum,
  label,
}: SliderAndNumberInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div className="d-flex justify-content-between">
          <Form.Label className="col-2">{label}</Form.Label>
          <Form.Range
            className="m-2"
            max={valueMaximum}
            min={0}
            value={value}
            onChange={onChange}
          />
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
