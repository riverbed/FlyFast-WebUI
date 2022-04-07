import { useState } from "react";
import { Stepper, Grid, Title } from "@mantine/core";

import Cart from "../../components/Cart/Cart";
import Cost from "../../components/Breakdown/Cost";

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = (e) => {
    e.preventDefault();
    setActiveStep((current) => (current + 1));
  }

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="xs">
      <Stepper.Step label="Checkout" description="Confirm Items In Cart" allowStepSelect={activeStep > 0}>
        <Grid>
          <Grid.Col xs={12} md={8}>
            <Title order={3} my={8} p={16}>
              My Cart
            </Title>
            <Cart />
          </Grid.Col>
          <Grid.Col xs={12} md={4}>
            <Cost proceedButton={nextStep}/>
          </Grid.Col>
        </Grid>
      </Stepper.Step>
      <Stepper.Step label="Confirmation" description="Order Successfully Placed" allowStepSelect={activeStep > 1}>
        
      </Stepper.Step>
    </Stepper>
  );
}

export default Checkout;