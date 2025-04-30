import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import ControlledNumberInput from "@/components/ControlledNumberInput";
import { MAXRPMS } from "@/config/calcs";
import { CalcRPMSComponentProps } from "@/types/calcs";

export default function CalcRPMSComponent({
  title,
  control,
  watch,
  inputName,
  outputLabel,
  divisor,
}: CalcRPMSComponentProps) {
  const [rpmsField] = watch([inputName]);

  const result = rpmsField / divisor;

  return (
    <Container className="m-3 p-3">
      <Row>
        <h4>{title}</h4>
      </Row>
      <Row>
        <Col>
          <ControlledNumberInput
            control={control}
            name={inputName}
            valueMaximum={MAXRPMS}
            label="Width (inches):"
          />
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
    </Container>
  );
}
