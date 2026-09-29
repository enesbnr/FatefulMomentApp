import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const content = <RootNavigator />;

  return (
    <SafeAreaProvider>
      {Platform.OS === 'android' ? (
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          {content}
        </KeyboardProvider>
      ) : (
        content
      )}
    </SafeAreaProvider>
  );
}
