import Form from "react-bootstrap/Form";

interface SliderAndNumberInputProps {
  value: number;
  onChange: any; // update this
  valueMaximum: number;
  label: string;
}

export default function SliderAndNumberInput({
  // name,
  value,
  onChange,
  valueMaximum,
  label,
}: SliderAndNumberInputProps) {
  return (
    <div className="d-flex justify-content-between">
      <Form.Label>{label}</Form.Label>
      <Form.Range
        className="m-2"
        max={valueMaximum}
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
        min={0}
      />
      <Form.Control
        type="number"
        className="m-2"
        max={valueMaximum}
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
        min={0}
      />
    </div>
  );
}
