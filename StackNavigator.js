// StackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App'; // Import your App.js
import OnlyButton4 from './onlyButton4'; // Import your onlyButton4.js


const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="App" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={App} />
      <Stack.Screen name="OnlyButton4" component={OnlyButton4} />
      
    </Stack.Navigator>
  );
};

export default StackNavigator;
