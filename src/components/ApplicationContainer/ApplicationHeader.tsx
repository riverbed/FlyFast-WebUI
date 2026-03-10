import { Link } from "react-router-dom";
import { ActionIcon, Group, UnstyledButton } from "@mantine/core";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { BsFillCartFill } from "react-icons/bs";

import Username from "../../components/Authentication/Username";

interface ApplicationHeaderProps {
  toggleTheme: () => void;
  colorScheme: "light" | "dark";
}

const ApplicationHeader = ({ toggleTheme, colorScheme }: ApplicationHeaderProps) => {
  return (
    <Group justify="space-between" px="md" h="100%">
      <UnstyledButton component={Link} to="/" data-testid="header-home-link">
        FlyFast
      </UnstyledButton>
      <Group>
        <Username />
        <ActionIcon
          variant="outline"
          onClick={toggleTheme}
          data-testid="header-toggle-theme-button"
        >
          {colorScheme === "dark" ? <MdLightMode /> : <MdDarkMode />}
        </ActionIcon>
        <ActionIcon
          variant="outline"
          component={Link}
          to="/checkout"
          data-testid="header-checkout-link"
        >
          <BsFillCartFill />
        </ActionIcon>
      </Group>
    </Group>
  );
};

export default ApplicationHeader;
