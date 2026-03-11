/**
 * Purpose: This file (Context.tsx) supports the services area of the FlyFast booking workflow.
 * Enhanced: Cart and checkout operations are instrumented with child spans.
 */
import { createContext, type ReactNode } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { context, trace, type Attributes } from "@opentelemetry/api";

import { jsonSerialize, jsonDeserialize } from "@/services/Functions";
import type { FlightSegment } from "@/services/Flight";
import { getActiveTracer } from "@/services/Tracing";
import { currentRouteSpan } from "@/services/RouteTracing";
import { sanitizeAttributes, filterErrorObject } from "@/services/CustomTracing";

export interface CartContextValue {
  cart: FlightSegment[];
  pastCart: FlightSegment[];
  addToCart: (flights: FlightSegment[]) => void;
  removeFromCart: (index: number) => void;
  purchaseCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const getStorageConfig = (key: string) => ({
  key,
  serialize: jsonSerialize,
  deserialize: (value: string | undefined) =>
    jsonDeserialize<FlightSegment[]>(value ?? "[]") as FlightSegment[],
  defaultValue: [] as FlightSegment[],
  getInitialValueInEffect: true,
});

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useLocalStorage<FlightSegment[]>(getStorageConfig("cart"));

  const [pastCart, setPastCart] = useLocalStorage<FlightSegment[]>(
    getStorageConfig("pastCart")
  );

  // Appends selected flights to the active cart with instrumentation.
  const addToCart = (flights: FlightSegment[]) => {
    const tracer = getActiveTracer();
    const parentContext = currentRouteSpan ? trace.setSpan(context.active(), currentRouteSpan) : context.active();

    context.with(parentContext, () => {
      const span = tracer.startSpan('http.client.operation.add_to_cart', {
        attributes: sanitizeAttributes({
          'http.method': 'POST',
          'operation.type': 'add_to_cart',
          'cart.item_count': flights.length,
          'cart.total_items_after': (cart?.length ?? 0) + flights.length,
        }) as Attributes,
      });

      try {
        setCart([...cart, ...flights]);
        span.setStatus({ code: 0 });
      } catch (err) {
        const errorAttrs = filterErrorObject(err as Error);
        span.setAttributes(errorAttrs as Attributes);
        span.recordException(err as Error);
        span.setStatus({ code: 2 });
      } finally {
        span.end();
      }
    });
  };

  // Removes one flight segment by index from the active cart with instrumentation.
  const removeFromCart = (index: number) => {
    const tracer = getActiveTracer();
    const parentContext = currentRouteSpan ? trace.setSpan(context.active(), currentRouteSpan) : context.active();

    context.with(parentContext, () => {
      const span = tracer.startSpan('http.client.operation.remove_from_cart', {
        attributes: sanitizeAttributes({
          'http.method': 'DELETE',
          'operation.type': 'remove_from_cart',
          'cart.item_index': index,
          'cart.total_items_before': cart?.length ?? 0,
          'cart.total_items_after': (cart?.length ?? 1) - 1,
        }) as Attributes,
      });

      try {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        span.setStatus({ code: 0 });
      } catch (err) {
        const errorAttrs = filterErrorObject(err as Error);
        span.setAttributes(errorAttrs as Attributes);
        span.recordException(err as Error);
        span.setStatus({ code: 2 });
      } finally {
        span.end();
      }
    });
  };

  // Moves current cart into purchase history and clears the checkout cart with instrumentation.
  const purchaseCart = () => {
    const tracer = getActiveTracer();
    const parentContext = currentRouteSpan ? trace.setSpan(context.active(), currentRouteSpan) : context.active();

    context.with(parentContext, () => {
      const span = tracer.startSpan('http.client.operation.checkout', {
        attributes: sanitizeAttributes({
          'http.method': 'POST',
          'operation.type': 'checkout',
          'checkout.item_count': cart?.length ?? 0,
          'checkout.total_fare': cart?.reduce((sum, flight) => sum + flight.fare, 0) ?? 0,
        }) as Attributes,
      });

      try {
        setPastCart(cart);
        setCart([]);
        span.setStatus({ code: 0 });
      } catch (err) {
        const errorAttrs = filterErrorObject(err as Error);
        span.setAttributes(errorAttrs as Attributes);
        span.recordException(err as Error);
        span.setStatus({ code: 2 });
      } finally {
        span.end();
      }
    });
  };

  const value: CartContextValue = {
    cart,
    pastCart,
    addToCart,
    removeFromCart,
    purchaseCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
