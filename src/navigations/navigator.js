import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from '../database/firebase'; 
import EventListScreen from '../screens/EventListScreen';
import AddEventScreen from '../screens/AddEventScreen';
import SignInScreen from '../screens/SignInScreen';  
import EventDetailsScreen from '../screens/EventDetailsScreen'; 
import SignUpScreen from '../screens/SignUpScreen'; 
import EditEventScreen from '../screens/EditEventScreen'; 
import FavoritesScreen from '../screens/FavoritesScreen'; 

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);  
    });

    return () => unsubscribe();  
  }, []);

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
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
