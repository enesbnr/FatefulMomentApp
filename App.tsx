import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigator from './src/navigation/RootNavigator';
import { ScenarioProgressProvider } from './src/app/providers/ScenarioProgressProvider';

export default function App() {
  const content = (
    <ScenarioProgressProvider>
      <RootNavigator />
    </ScenarioProgressProvider>
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {Platform.OS === 'android' ? (
          <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
            {content}
          </KeyboardProvider>
        ) : (
          content
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
