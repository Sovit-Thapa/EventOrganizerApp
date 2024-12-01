import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth'; // Firebase auth state listener
import { auth } from '../database/firebase'; // Firebase auth instance
import EventListScreen from '../screens/EventListScreen';
import AddEventScreen from '../screens/AddEventScreen';
import SignInScreen from '../screens/SignInScreen';  // Import SignInScreen
import EventDetailsScreen from '../screens/EventDetailsScreen'; // Import EventDetailsScreen
import SignUpScreen from '../screens/SignUpScreen'; 
import EditEventScreen from '../screens/EditEventScreen'; // Import EditEventScreen
import FavoritesScreen from '../screens/FavoritesScreen'; // Import the new FavoritesScreen

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);  // Set true if user is authenticated
    });

    return () => unsubscribe();  // Clean up the listener on component unmount
  }, []);

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        // If authenticated, show EventList, AddEvent, EditEvent, EventDetails, and Favorites
        <>
          <Stack.Screen
            name="EventList"
            component={EventListScreen}
            options={({ navigation }) => ({
              headerRight: () => (
                <Button title="Add" onPress={() => navigation.navigate('AddEvent')} color="#6200ee" />
              ),
            })}
          />
          <Stack.Screen name="AddEvent" component={AddEventScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="EditEvent" component={EditEventScreen} />
          <Stack.Screen 
            name="Favorites" 
            component={FavoritesScreen} 
          
          />
        </>
      ) : (
        // If not authenticated, show SignIn and SignUp screens
        <>
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
