import { Stack } from 'expo-router';
import { AuthProvider } from './authContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack 
        initialRouteName="screens/login"
        screenOptions={{ 
          headerShown: false,
          animation: 'fade' 
        }}
      >
        <Stack.Screen 
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="screens/login" 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="screens/register" />
        <Stack.Screen name="middleware/DetailsPage" />
        <Stack.Screen name="middleware/Filter" />
        <Stack.Screen name="property/AddProperty" />
        <Stack.Screen name="property/EditProperty" />
      </Stack>
    </AuthProvider>
  );
}
