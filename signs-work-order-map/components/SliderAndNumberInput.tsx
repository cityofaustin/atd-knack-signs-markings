export default function SliderAndNumberInput({
    name,
  value,
  onChange,
  valueMaximum,
}) {
  return (
    <div>
                        <label htmlFor={name} className="calc-label-top">
                  Width (inches):
                </label>
      <input
        type="range"
        max={valueMaximum}
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
      />
      <input
        type="number"
        max={valueMaximum}
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
      />
    </div>
  );
}
