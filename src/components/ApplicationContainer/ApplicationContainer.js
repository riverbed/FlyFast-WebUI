import { AppShell, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useHotkeys, useLocalStorageValue } from '@mantine/hooks';
import ApplicationHeader from './ApplicationHeader';

const ApplicationContainer = (props) => {
  const [theme, setTheme] = useLocalStorageValue({ key: 'mantine-theme', defaultValue: 'light' });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  useHotkeys([['mod+J', () => toggleTheme()]]);

  return (
    <ColorSchemeProvider colorScheme={theme} toggleColorScheme={toggleTheme}>
      <MantineProvider theme={{ colorScheme: theme }} withNormalizeCSS withGlobalStyles>
        <AppShell
          fixed
          header={<ApplicationHeader toggleTheme={toggleTheme} theme={theme} />}
        >
          {props.children}
        </AppShell>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

export default ApplicationContainer;