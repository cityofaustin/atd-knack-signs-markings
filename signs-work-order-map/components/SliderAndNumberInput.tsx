import Form from "react-bootstrap/Form";

export default function SliderAndNumberInput({
  name,
  value,
  onChange,
  valueMaximum,
  label,
}) {
  return (
    <div className="d-flex justify-content-between col-6">
      <Form.Label>{label}</Form.Label>
        <Form.Range
          max={valueMaximum}
          value={value}
          onChange={(evt) => onChange(evt.target.value)}
          min={0}
        />
        <Form.Control
          type="number"
          max={valueMaximum}
          value={value}
          onChange={(evt) => onChange(evt.target.value)}
          min={0}
        />
    </div>
  );
}
