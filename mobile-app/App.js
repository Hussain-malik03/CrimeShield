import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen'; // Import SplashScreen
import MapScreen from './screens/MapScreen'; // Import MapScreen
import RouteScreen from './screens/RouteScreen';
import NavigationScreen from './screens/NavigationScreen'; 
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="RouteScreen" component={RouteScreen} />
        <Stack.Screen name="NavigationScreen" component={NavigationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
