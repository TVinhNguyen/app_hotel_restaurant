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
// @ts-ignore - RoomDetailsScreen exists
import RoomDetailsScreen from '../screens/RoomDetailsScreen';
import BookingRequestScreen from '../screens/BookingRequestScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AddNewCardScreen from '../screens/AddNewCardScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import TableBookingScreen from '../screens/TableBookingScreen';
import MyTableBookingsScreen from '../screens/MyTableBookingsScreen';
import ChatScreen from '../screens/ChatScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import PaymentCompleteScreen from '../screens/PaymentCompleteScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import AboutScreen from '../screens/AboutScreen';
import SupportScreen from '../screens/SupportScreen';
import SearchScreen from '../screens/SearchScreen';


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
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen
        name="MyBooking"
        component={MyBookingScreen}
        options={{ title: 'Đặt chỗ của tôi' }}
      />
      <Tab.Screen
        name="RestaurantMenu"
        component={RestaurantMenuScreen}
        options={{ title: 'Nhà hàng' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HotelDetail"
          component={HotelDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RoomDetails"
          component={RoomDetailsScreen}
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
        <Stack.Screen
          name="TableBooking"
          component={TableBookingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyTableBookings"
          component={MyTableBookingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentComplete"
          component={PaymentCompleteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookingDetail"
          component={BookingDetailScreen}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;