import { StatusBar } from 'expo-status-bar';

import { HomeScreen } from './screens/HomeScreen';
import { useAppTheme } from './theme';

export default function App() {
  const { isDark } = useAppTheme();

  return (
    <>
      <HomeScreen />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
