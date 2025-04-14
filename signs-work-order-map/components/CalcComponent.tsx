import React from "react";
import { Row } from "react-bootstrap";
import { Card } from "react-bootstrap";

export default function CalcComponent({
    heading,
    // objectProps,
    // inputWidth,
    // inputLinearFeet,
    // inputThickness,
    // inputRPMS,
    // output,
    // getOutputWidth,
    // getOutputLinearFeet,
    // getOutputThickness,
    // getOutputRPMS,
  }) {
      return (
        <Row className="mx-3">
                            <h4>{heading}</h4>
          <Card className="mx-2">
            <Card.Body>
              <Card.Title>
                <h4>{heading}</h4>
              </Card.Title>
            </Card.Body>
          </Card>
        </Row>
      );
    };
