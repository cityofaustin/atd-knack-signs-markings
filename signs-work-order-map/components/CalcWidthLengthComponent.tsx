import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import { Controller } from "react-hook-form";
import ControlledNumberInput from "@/components/ControlledNumberInput";
import {
  MAXFEET,
  MAXWIDTH,
  MAXTHICKNESS,
  useCalculation,
} from "@/config/calcs";
import { CalcWidthLengthComponentProps } from "@/types/calcs";

export default function CalcWidthLengthComponent({
  title,
  control,
  watch,
  setValue,
  inputWidthName,
  inputLengthName,
  inputThicknessName,
  outputName,
  outputLabel,
  calculationName,
}: CalcWidthLengthComponentProps) {
  const [widthField, lengthField] = watch([inputWidthName, inputLengthName]);

  let thicknessField = undefined;

  if (inputThicknessName) {
    [thicknessField] = watch([inputThicknessName]);
  }

  useCalculation({
    width: widthField,
    length: lengthField,
    thickness: thicknessField,
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
          {!!inputThicknessName && (
            <ControlledNumberInput
              control={control}
              name={inputThicknessName}
              valueMaximum={MAXTHICKNESS}
              label="Mil Thickness Desired:"
            />
          )}
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
