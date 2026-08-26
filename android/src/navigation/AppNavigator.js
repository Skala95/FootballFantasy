import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "../api/api";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import FantasyTeamScreen from "../screens/FantasyTeamScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ResultsScreen from "../screens/ResultsScreen";
import AdminScreen from "../screens/AdminScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <Text style={styles.drawerHeaderText}>⚽ Football Fantasy</Text>
            </View>
            <DrawerItemList {...props} />
            <View style={styles.drawerFooter}>
                <DrawerItem
                    label="Odjavi se"
                    icon={() => <Text style={{ fontSize: 18 }}>🚪</Text>}
                    labelStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                    onPress={async () => {
                        await AsyncStorage.removeItem('token');
                        props.navigation.getParent()?.replace('Login');
                    }}
                />
            </View>
        </DrawerContentScrollView>
    );
};

const DrawerNavigator = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const user = await request('get', '/auth/me');
                setIsAdmin(user.role === 'admin');
            } catch (e) {}
        };
        checkRole();
    }, []);

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: '#15803d' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: 'bold' },
                drawerActiveTintColor: '#16a34a',
                drawerActiveBackgroundColor: '#dcfce7',
                drawerInactiveTintColor: '#374151',
                headerRight: () => (
                    <TouchableOpacity
                        onPress={async () => {
                            await AsyncStorage.removeItem('token');
                            navigation.getParent()?.replace('Login');
                        }}
                        style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 8 }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Odjavi se</Text>
                    </TouchableOpacity>
                ),
            })}
        >
            <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Početna', drawerIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text> }} />
            <Drawer.Screen name="FantasyTeam" component={FantasyTeamScreen} options={{ title: 'Fantasy Tim', drawerIcon: () => <Text style={{ fontSize: 18 }}>👕</Text> }} />
            <Drawer.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Tabela Bodova', drawerIcon: () => <Text style={{ fontSize: 18 }}>🏆</Text> }} />
            <Drawer.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Statistika', drawerIcon: () => <Text style={{ fontSize: 18 }}>📊</Text> }} />
            <Drawer.Screen name="Results" component={ResultsScreen} options={{ title: 'Rezultati', drawerIcon: () => <Text style={{ fontSize: 18 }}>📋</Text> }} />
            {isAdmin && (
                <Drawer.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin', drawerIcon: () => <Text style={{ fontSize: 18 }}>⚙️</Text> }} />
            )}
        </Drawer.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    drawerContainer: { flex: 1 },
    drawerHeader: { backgroundColor: '#15803d', padding: 24, marginBottom: 8 },
    drawerHeaderText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    drawerFooter: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
});

export default AppNavigator;