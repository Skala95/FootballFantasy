import React from "react";
import {useState, useEffect, useCallback} from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import request from "../api/api";

const medals = ['🥇', '🥈', '🥉'];

const HomeScreen = ({navigation}) => {
    const [userData, setUserData] = useState(null);
    const [nextMatch, setNextMatch] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [myTotalPoints, setMyTotalPoints] = useState(null);
    const [topPlayers, setTopPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
            let user = null;
            try {
                user = await request("get", "/auth/me");
                setUserData(user);
            } catch (err) {
                console.error("Greška pri dohvatanju korisničkih podataka:", err);
            }

            try {
                const matches = await request("get", "/matches");
                const openMatches = matches.filter(m => m.status === "open").sort((a, b) => new Date(a.date) - new Date(b.date));
                setNextMatch(openMatches[0] || null);
            } catch (err) {
                console.error("Greška pri dohvatanju utakmica:", err);
            }

            try {
                const leaderboard = await request("get", "/fantasy-teams/leaderboard");
                const idx = leaderboard.findIndex(u => String(u.userId) === String(user._id));
                if (idx !== -1) {
                    setMyRank(idx + 1);
                    setMyTotalPoints(leaderboard[idx].totalPoints);
                }
                else {
                    setMyRank(null);
                    setMyTotalPoints(0);
                }
            } catch (err) {
                console.error("Greška pri dohvatanju leaderboarda:", err);
            }
            try {
                const players = await request("get", "/players");
                const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
                setTopPlayers(sorted.slice(0, 3));
            } catch (err) {
                console.error("Greška pri dohvatanju igrača:", err);
            }
            setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Pozdrav */}
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>Dobrodošao, {userData?.firstName}! 👋</Text>
                    <Text style={styles.welcomeSub}>Dobro došao na Football Fantasy platformu.</Text>
                </View>

            {/* Sledeci mec */}
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('FantasyTeam')}>
                <Text style={styles.cardTitle}>⚽ Sledeći termin</Text>
                {nextMatch ? (
                <>
                    <Text style={styles.cardText}>📅 {new Date(nextMatch.date).toLocaleString('sr-Latn-RS')}</Text>
                    <Text style={styles.cardText}>⏰ Rok: {new Date(nextMatch.registrationDeadline).toLocaleString('sr-Latn-RS')}</Text>
                </>
                ) : (
                    <Text style={styles.cardEmpty}>Nema otvorenih utakmica trenutno.</Text>
                )}
            </TouchableOpacity>

            {/* Poeni i rang */}
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Leaderboard')}>
                <Text style={styles.cardTitle}>🏆 Tvoj rezultat u fantasy</Text>
                <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{myTotalPoints ?? '—'}</Text>
                    <Text style={styles.statLabel}>Ukupno poena</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{myRank !== null ? `#${myRank}` : '—'}</Text>
                    <Text style={styles.statLabel}>Rang na tabeli</Text>
                </View>
                </View>
            </TouchableOpacity>

            {/* Top 3 igraca */}
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Statistics')}>
                <Text style={styles.cardTitle}>🌟 Top 3 igrača</Text>
                {topPlayers.length === 0 ? (
                <Text style={styles.cardEmpty}>Nema podataka o igračima.</Text>
                ) : (
                topPlayers.map((player, idx) => (
                    <View key={player._id} style={styles.playerRow}>
                    <Text style={styles.medal}>{medals[idx]}</Text>
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerNick}>{player.nickname}</Text>
                        <Text style={styles.playerName}>{player.firstName} {player.lastName}</Text>
                    </View>
                    <View style={styles.playerStats}>
                        <Text style={styles.playerPoints}>{player.totalPoints} pts</Text>
                        <Text style={styles.playerApps}>{player.appearances} utakmica</Text>
                    </View>
                    </View>
                ))
                )}
            </TouchableOpacity>
        </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    welcomeCard: { backgroundColor: '#15803d', borderRadius: 16, padding: 24, marginBottom: 16 },
    welcomeTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    welcomeSub: { color: '#bbf7d0', fontSize: 14 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 12 },
    cardText: { color: '#6b7280', fontSize: 14, marginBottom: 4 },
    cardEmpty: { color: '#9ca3af', fontStyle: 'italic' },
    statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    statBox: { alignItems: 'center' },
    statNumber: { fontSize: 32, fontWeight: 'bold', color: '#16a34a' },
    statLabel: { color: '#6b7280', fontSize: 13, marginTop: 4 },
    divider: { width: 1, height: 60, backgroundColor: '#e5e7eb' },
    playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 8 },
    medal: { fontSize: 24, marginRight: 12 },
    playerInfo: { flex: 1 },
    playerNick: { fontWeight: 'bold', fontSize: 15, color: '#1f2937' },
    playerName: { color: '#9ca3af', fontSize: 13 },
    playerStats: { alignItems: 'flex-end' },
    playerPoints: { fontWeight: 'bold', fontSize: 16, color: '#16a34a' },
    playerApps: { color: '#9ca3af', fontSize: 12 },
    registerLink: { marginTop: 16, alignItems: 'center' },
    registerText: { color: '#6b7280', fontSize: 14 },
    registerBold: { color: '#2563eb', fontWeight: 'bold' },
});

export default HomeScreen;