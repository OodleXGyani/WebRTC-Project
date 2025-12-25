import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CallScreen from '../screens/CallScreen';

export type RootStackParamList = {
  Home: undefined;
  Call: {
    callerId: string;
    receiverId: string;
    isCaller: boolean;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
