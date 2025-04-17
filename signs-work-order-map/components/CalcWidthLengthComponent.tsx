import Form from "react-bootstrap/Form";
import { UseFormSetValue, UseFormWatch, Control } from "react-hook-form";
import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import { Controller } from "react-hook-form";
import ControlledNumberInput from "@/components/ControlledNumberInput";
import {
  MAXFEET,
  MAXWIDTH,
  useCalculation,
  CalculationInputsType,
} from "@/config/calcs";

interface CalcWidthLengthComponentProps {
  title: string;
  control: Control<CalculationInputsType>;
  watch: UseFormWatch<CalculationInputsType>;
  setValue: UseFormSetValue<CalculationInputsType>;
  inputWidthName: keyof CalculationInputsType;
  inputLengthName: keyof CalculationInputsType;
  outputName: keyof CalculationInputsType;
  outputLabel: string;
  calculationName: string;
}

export default function CalcWidthLengthComponent({
  title,
  control,
  watch,
  setValue,
  inputWidthName,
  inputLengthName,
  outputName,
  outputLabel,
  calculationName,
}: CalcWidthLengthComponentProps) {
  const [widthField, lengthField] = watch([inputWidthName, inputLengthName]);

  useCalculation({
    width: widthField,
    length: lengthField,
    calculationName: calculationName,
    setValue,
    outputFieldName: outputName,
  });

  return (
    <Container className="m-3 p-3">
      <Row>
        <h4>{title}</h4>
      </Row>
      <Row>
        <Col>
          <ControlledNumberInput
            control={control}
            name={inputWidthName}
            valueMaximum={MAXWIDTH}
            label="Width (inches):"
          />
          <ControlledNumberInput
            control={control}
            name={inputLengthName}
            valueMaximum={MAXFEET}
            label="Linear feet"
          />
        </Col>
        <Col>
          <Controller
            control={control}
            name={outputName}
            render={({ field: { value } }) => (
              <Form.Group>
                <Row>
                  <Form.Label>{outputLabel}</Form.Label>
                </Row>
                <Row>
                  <Form.Label>{value}</Form.Label>
                </Row>
              </Form.Group>
            )}
          />
        </Col>
      </Row>
    </Container>
  );
}
