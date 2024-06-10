import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen'; // Correct default import
import SessionScreen from '../screens/SessionScreen'; // Correct default import

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Session: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Session" component={SessionScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
