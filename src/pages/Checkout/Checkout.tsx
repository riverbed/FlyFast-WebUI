/**
 * Purpose: This file (Checkout.tsx) supports the Checkout area of the FlyFast booking workflow.
 */
import { useState, useContext } from "react";
import { Stepper, Grid, Title } from "@mantine/core";

import Cart from "@/components/Cart/Cart";
import Cost from "@/components/Breakdown/Cost";
import Confirmation from "@/components/Breakdown/Confirmation";

import { CartContext } from "@/services/Context";

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    return null;
  }

  const { purchaseCart } = cartContext;

  // Finalizes purchase and advances checkout to the confirmation step.
  const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    purchaseCart();
    setActiveStep((current) => current + 1);
  };

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep}>
      <Stepper.Step label="Checkout" description="Confirm Items In Cart" allowStepSelect={false}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Title order={3} my={8} p={16}>
              My Cart
            </Title>
            <Cart />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Cost proceedButton={nextStep} />
          </Grid.Col>
        </Grid>
      </Stepper.Step>
      <Stepper.Step label="Confirmation" description="Order Successfully Placed" allowStepSelect={false}>
        <Confirmation />
      </Stepper.Step>
    </Stepper>
  );
};

export default Checkout;
