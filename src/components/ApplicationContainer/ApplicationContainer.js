import { AppShell, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import ApplicationHeader from './ApplicationHeader';

const ApplicationContainer = (props) => {
  const [theme, setTheme] = useLocalStorage({
    key: 'mantine-theme',
    defaultValue: 'light',
    getInitialValueInEffect: true
  });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  useHotkeys([['mod+J', () => toggleTheme()]]);

  return (
    <ColorSchemeProvider colorScheme={theme} toggleColorScheme={toggleTheme}>
      <MantineProvider theme={{ colorScheme: theme }} withNormalizeCSS withGlobalStyles>
        <AppShell
          header={<ApplicationHeader toggleTheme={toggleTheme} theme={theme} />}
        >
          {props.children}
        </AppShell>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

export default ApplicationContainer;