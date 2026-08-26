import React, {useState} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import request from "../api/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const data = await request('post', '/auth/login', { email, password });
            await AsyncStorage.setItem('token', data.token);
            Alert.alert("Uspešno ste se prijavili!");
            navigation.replace("Main");
        } catch (error) {
            Alert.alert("Greška pri prijavi", error.message || "Došlo je do greške");
            console.error('API request error:', error.response?.status, error.response?.data, error.message);
        }
    };  
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dobrodošli u Football Fantasy!</Text>
            <View style={styles.card}>
                <Text style={styles.subtitle}>Prijava</Text>
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
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Prijavi se</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
                    <Text style={styles.registerText}>Nemate nalog? <Text style={styles.registerBold}>Registrujte se ovde</Text></Text>
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
});
export default LoginScreen;