import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { THEME } from '../theme/colors';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens (to be implemented)
import HomeScreen from '../screens/main/HomeScreen';
import ChatScreen from '../screens/main/ChatScreen';
import UserListScreen from '../screens/main/UserListScreen';
import CreateGroupScreen from '../screens/main/CreateGroupScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const RootStack = createStackNavigator();

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.background.primary,
    card: THEME.background.surface,
    text: THEME.text.heading,
    border: THEME.border.default,
  },
};

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // Return a splash screen or loading indicator here for a real app
    return null;
  }

  return (
    <NavigationContainer theme={NavigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Main Stack
          <>
            <RootStack.Screen name="Home" component={HomeScreen} />
            <RootStack.Screen name="Chat" component={ChatScreen} />
            <RootStack.Screen name="UserList" component={UserListScreen} />
            <RootStack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <RootStack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          // Auth Stack
          <>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
