import { Stack } from "expo-router";
// import "../global.css"; // Temporarily disabled

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8fafc',
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Restaurant App' }} />
      <Stack.Screen name="restaurants" options={{ headerShown: false }} />
      <Stack.Screen name="restaurants-native" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant-details" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant-details-native" options={{ headerShown: false }} />
      <Stack.Screen name="test-geolocation" options={{ title: 'Test Geolocalización' }} />
      <Stack.Screen name="test-geolocation-simple" options={{ title: 'Test Geolocalización Simple' }} />
    </Stack>
  );
}
