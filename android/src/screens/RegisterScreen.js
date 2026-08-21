import React from "react";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import request from "../api/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
    
    const [userFirstName, setUserFirstName] = useState("");  
    const [userLastName, setUserLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await request('post', '/auth/register', {
                firstName: userFirstName,
                lastName: userLastName,
                email: email,
                password: password
            });
            navigation.replace("Login");
        } catch (error) {
            setError("Došlo je do greške prilikom registracije.");
        } 
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dobrodošli u Football Fantasy!</Text>
            <View style={styles.card}>
                <Text style={styles.subtitle}>Registracija</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ime"
                    value={userFirstName}
                    onChangeText={setUserFirstName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Prezime"
                    value={userLastName}
                    onChangeText={setUserLastName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Lozinka"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Učitavanje...' : 'Registruj se'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#16a34a" },
    title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 24, color: "#ffffff" },
    card: { width: "100%", backgroundColor: "#ffffff", borderRadius: 12, padding: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    subtitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 16, color: "#1a1a1a" },
    input: { width: "100%", height: 44, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingHorizontal: 12 },
    button: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 4 },
    buttonText: { color: "#ffffff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
    errorText: { color: "#ef4444", marginBottom: 8, textAlign: "center" },
});

export default RegisterScreen;

