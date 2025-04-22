import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import { Controller } from "react-hook-form";
import ControlledNumberInput from "@/components/ControlledNumberInput";
import { MAXRPMS, useSimpleCalculation } from "@/config/calcs";
import { CalcRPMSComponentProps } from "@/types/calcs";

export default function CalcRPMSComponent({
  title,
  control,
  watch,
  setValue,
  inputName,
  outputName,
  outputLabel,
  calculationName,
}: CalcRPMSComponentProps) {
  const [rpmsField] = watch([inputName]);

  useSimpleCalculation({
    input: rpmsField,
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
            name={inputName}
            valueMaximum={MAXRPMS}
            label="Width (inches):"
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
