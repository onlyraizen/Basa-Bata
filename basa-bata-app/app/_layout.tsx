import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* This hides the top header and completely ignores the bottom tabs */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}