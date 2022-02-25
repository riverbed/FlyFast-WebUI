import { ActionIcon, Group, Header, Text } from '@mantine/core';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

const ApplicationHeader = ({ toggleTheme, theme }) => {
  return (
    <Header padding="md">
      <Group position="apart">
        <Text>FlyFast</Text>
        <ActionIcon
          variant="outline"
          onClick={() => toggleTheme()}
        >
          {theme === 'light' &&
            <MdDarkMode />
          }
          {theme === 'dark' &&
            <MdLightMode />
          }
        </ActionIcon>
      </Group>
    </Header>
  )
}

export default ApplicationHeader;