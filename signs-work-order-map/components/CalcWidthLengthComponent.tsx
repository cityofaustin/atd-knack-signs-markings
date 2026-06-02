import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import { Col, Row } from "react-bootstrap";
import ControlledNumberInput from "@/components/ControlledNumberInput";
import { MAXFEET, MAXWIDTH, MAXTHICKNESS } from "@/config/calcs";
import { CalcWidthLengthComponentProps } from "@/types/calcs";

export default function CalcWidthLengthComponent({
  title,
  control,
  watch,
  inputWidthName,
  inputLengthName,
  inputThicknessName,
  outputLabel,
  divisor,
}: CalcWidthLengthComponentProps) {
  const [widthField, lengthField] = watch([inputWidthName, inputLengthName]);

  let thicknessField = undefined;

  if (inputThicknessName) {
    [thicknessField] = watch([inputThicknessName]);
  }

  const result = !!thicknessField
    ? (widthField * lengthField * thicknessField) / divisor
    : widthField * (lengthField / divisor);

  return (
    <Container className="m-3 p-3">
      <Card>
        <Card.Header>
          <h4>{title}</h4>
        </Card.Header>
        <Card.Body>
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
              <Form.Group>
                <Row>
                  <Form.Label>{outputLabel}</Form.Label>
                </Row>
                <Row>
                  <Form.Label>{result}</Form.Label>
                </Row>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
