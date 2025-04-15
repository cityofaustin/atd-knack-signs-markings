"use client";
import { useForm, Controller } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import SliderAndNumberInput from "@/components/SliderAndNumberInput";
import { useCalculation } from "@/config/calcs";
import "./calc.css";

const defaultCalcValues = {
  thermo60Width: 0,
  thermo60LinearFeet: 0,
  thermo60Output: 0,
  thermo90Width: 0,
  thermo90LinearFeet: 0,
  thermo90Output: 0,
  beadsExtrudedWidth: 0,
  beadsExtrudedLinearFeet: 0,
  beadsExtrudedOutput: 0,
  primer: {
    inputWidth: 0,
    inputLinearFeet: 0,
    output: 0,
  },
  paintGallons: {
    inputWidth: 0,
    inputLinearFeet: 0,
    inputThickness: 0,
    output: 0,
  },
  beadsPaint: {
    inputWidth: 0,
    inputLinearFeet: 0,
    output: 0,
  },
  adhesive: {
    inputRPMS: 0,
    output: 0,
  },
};

const MAXWIDTH = 12;
const MAXFEET = 1000;
const MAXTHICKNESS = 15;
const MAXRPMS = 100;

export default function Calcs() {
  const { control, watch, setValue } = useForm({
    defaultValues: defaultCalcValues,
    mode: "onChange",
  });

  const [thermo60Width, thermo60LinearFeet, thermo90Width, thermo90LinearFeet] = watch([
    "thermo60Width",
    "thermo60LinearFeet",
    "thermo90Width",
    "thermo90LinearFeet"
  ]);

  useCalculation({
    width: thermo60Width,
    length: thermo60LinearFeet,
    calculationName: "thermo60",
    setValue,
    outputFieldName: "thermo60Output",
  });

  useCalculation({
    width: thermo90Width,
    length: thermo90LinearFeet,
    calculationName: "thermo90",
    setValue,
    outputFieldName: "thermo90Output",
  });

  return (
    <div>
      <form>
        <h1 className="calc-header">Thermoplastic - extruded machine</h1>
        <Container className="m-3 p-3">
          <Row>
            <h4>60 mils thick (maintenance)</h4>
          </Row>
          <Row>
            <Col>
              <SliderAndNumberInput
                control={control}
                name={"thermo60Width"}
                valueMaximum={MAXWIDTH}
                label="Width (inches):"
              />
              <SliderAndNumberInput
                control={control}
                name="thermo60LinearFeet"
                valueMaximum={MAXFEET}
                label="Linear feet"
              />
            </Col>
            <Col>
              <Controller
                control={control}
                name="thermo60Output"
                render={({ field: { value } }) => (
                  <Form.Group>
                    <Row>
                      <Form.Label>Pounds of allkyd material</Form.Label>
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
        <Container className="m-3 p-3">
          <Row>
            <h4>90 mils thick (maintenance)</h4>
          </Row>
          <Row>
            <Col>
              <SliderAndNumberInput
                control={control}
                name={"thermo90Width"}
                valueMaximum={MAXWIDTH}
                label="Width (inches):"
              />
              <SliderAndNumberInput
                control={control}
                name="thermo90LinearFeet"
                valueMaximum={MAXFEET}
                label="Linear feet"
              />
            </Col>
            <Col>
              <Controller
                control={control}
                name="thermo90Output"
                render={({ field: { value } }) => (
                  <Form.Group>
                    <Row>
                      <Form.Label>Pounds of allkyd material</Form.Label>
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
      </form>
    </div>
  );
}
