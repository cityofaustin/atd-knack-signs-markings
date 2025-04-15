"use client";
import { useState, useEffect } from "react";
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

  const [thermo60Width, thermo60LinearFeet] = watch([
    "thermo60Width",
    "thermo60LinearFeet",
  ]);

  useCalculation({
    width: thermo60Width,
    length: thermo60LinearFeet,
    calculationName: "thermo60",
    setValue,
    outputFieldName: "thermo60Output",
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
              <Controller
                control={control}
                name={"thermo60Width"}
                render={({ field: { onChange, value } }) => (
                  <SliderAndNumberInput
                    value={value}
                    onChange={onChange}
                    valueMaximum={MAXWIDTH}
                    label="Width (inches):"
                  />
                )}
              />
              <Controller
                control={control}
                name="thermo60LinearFeet"
                render={({ field: { onChange, value } }) => (
                  <SliderAndNumberInput
                    value={value}
                    onChange={onChange}
                    valueMaximum={MAXFEET}
                    label="Linear feet"
                  />
                )}
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
      </form>
    </div>
  );
}
