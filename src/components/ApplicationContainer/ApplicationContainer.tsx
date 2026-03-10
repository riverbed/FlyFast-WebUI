import {
  AppShell,
  MantineProvider,
  localStorageColorSchemeManager,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import type { ReactNode } from "react";

import ApplicationHeader from "./ApplicationHeader";
import { CartProvider } from "../../services/Context";

interface ApplicationContainerProps {
  children: ReactNode;
}

const colorSchemeManager = localStorageColorSchemeManager({ key: "mantine-theme" });

const ApplicationContainer = ({ children }: ApplicationContainerProps) => {
  return (
    <MantineProvider defaultColorScheme="light" colorSchemeManager={colorSchemeManager}>
      <ApplicationShell>{children}</ApplicationShell>
    </MantineProvider>
  );
};

const ApplicationShell = ({ children }: ApplicationContainerProps) => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const toggleTheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  useHotkeys([["mod+J", toggleTheme]]);

  return (
    <AppShell header={{ height: { base: 50, md: 70 } }}>
      <AppShell.Header>
        <ApplicationHeader toggleTheme={toggleTheme} colorScheme={computedColorScheme} />
      </AppShell.Header>
      <AppShell.Main>
        <CartProvider>{children}</CartProvider>
      </AppShell.Main>
    </AppShell>
  );
};

export default ApplicationContainer;
