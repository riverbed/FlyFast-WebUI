import { Link } from 'react-router-dom';
import { ActionIcon, Group, Header, UnstyledButton } from '@mantine/core';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { BsFillCartFill } from 'react-icons/bs';

import Username from '../../components/Authentication/Username';

const ApplicationHeader = ({ toggleTheme, theme }) => {
  return (
    <Header p="md">
      <Group position="apart">
        <UnstyledButton component={Link} to="/">
          FlyFast
        </UnstyledButton>
        <Group>
          <Username />
          <ActionIcon
            variant="outline"
            onClick={() => toggleTheme()}
          >
            {theme === 'dark' ?
              <MdLightMode />
              :
              <MdDarkMode />
            }
          </ActionIcon>
          <ActionIcon
            variant="outline"
            component={Link}
            to="/checkout"
          >
            <BsFillCartFill />
          </ActionIcon>
        </Group>
      </Group>
    </Header>
  )
}

export default ApplicationHeader;