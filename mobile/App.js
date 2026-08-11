import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import ReceiptScannerScreen from './screens/ReceiptScannerScreen';
import BankSmsSyncScreen from './screens/BankSmsSyncScreen';
import AIChatScreen from './screens/AIChatScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ProfileScreen from './screens/ProfileScreen';

import { LayoutDashboard, Camera, Bot, BarChart3, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen} />
      <Stack.Screen name="BankSmsSync" component={BankSmsSyncScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ReceiptScannerScreen}
        options={{
          tabBarLabel: 'OCR Scan',
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AskAI"
        component={AIChatScreen}
        options={{
          tabBarLabel: 'SpendAI',
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isAuthenticated ? <MainTabNavigator /> : <AuthScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
