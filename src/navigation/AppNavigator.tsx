import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList, TabParamList } from '../types';
import { COLORS } from '../constants';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MyBookingScreen from '../screens/MyBookingScreen';
import RestaurantMenuScreen from '../screens/RestaurantMenuScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RoomDetailsScreen from '../screens/RoomDetailsScreen';
import AllFacilitiesScreen from '../screens/AllFacilitiesScreen';
import BookingRequestScreen from '../screens/BookingRequestScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AddNewCardScreen from '../screens/AddNewCardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyBooking') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'RestaurantMenu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="MyBooking" 
        component={MyBookingScreen}
        options={{ title: 'My Booking' }}
      />
      <Tab.Screen 
        name="RestaurantMenu" 
        component={RestaurantMenuScreen}
        options={{ title: 'Message' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="RoomDetails" 
          component={RoomDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AllFacilities" 
          component={AllFacilitiesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="BookingRequest" 
          component={BookingRequestScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddNewCard" 
          component={AddNewCardScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;