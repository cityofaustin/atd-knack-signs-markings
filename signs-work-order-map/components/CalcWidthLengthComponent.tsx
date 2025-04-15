import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import { Controller } from "react-hook-form";
import SliderAndNumberInput from "@/components/SliderAndNumberInput";
import { MAXFEET, MAXWIDTH } from "@/config/calcs";

interface CalcWidthLengthComponentProps {
  title: string;
  control: any; // todo update
  inputWidthName: string;
  inputLengthName: string;
  outputName: string;
  outputLabel: string;
}

export default function CalcWidthLengthComponent({
  title,
  control,
  inputWidthName,
  inputLengthName,
  outputName,
  outputLabel,
}: CalcWidthLengthComponentProps) {
  return (
    <Container className="m-3 p-3">
      <Row>
        <h4>{title}</h4>
      </Row>
      <Row>
        <Col>
          <SliderAndNumberInput
            control={control}
            name={inputWidthName}
            valueMaximum={MAXWIDTH}
            label="Width (inches):"
          />
          <SliderAndNumberInput
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
