import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import request from '../api/api';

const ResultsScreen = () => {

  const [matches, setMatches] = useState([]);
  const [openMatchId, setOpenMatchId] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await request('get', '/matches');
        setMatches(res.filter(m => m.status === 'finished'));
      } catch (error) {
        console.error(error);
      }
    };

    fetchMatches();
  }, []);

  const handleToggle = (id) => {
    setOpenMatchId(openMatchId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rezultati</Text>
      {matches.map(match => {
        const goalsTeam1 = match.stats.filter(s => {
          const pid = (s.player?._id || s.player).toString();
          const inTeam1 = match.team1.some(p => p._id.toString() === pid);
          return (inTeam1 && s.stats === 'goal') || (!inTeam1 && s.stats === 'ownGoal' && match.team2.some(p => p._id.toString() === pid));
        }).length;
        const goalsTeam2 = match.stats.filter(s => {
          const pid = (s.player?._id || s.player).toString();
          const inTeam2 = match.team2.some(p => p._id.toString() === pid);
          return (inTeam2 && s.stats === 'goal') || (!inTeam2 && s.stats === 'ownGoal' && match.team1.some(p => p._id.toString() === pid));
        }).length;

        return (
          <View key={match._id} style={styles.card}>
            <TouchableOpacity style={styles.cardHeader} onPress={() => handleToggle(match._id)}>
              <Text style={styles.matchNumber}>Termin {match.matchNumber}</Text>
              <Text style={styles.matchDate}>{new Date(match.date).toLocaleString('sr-Latn-RS')}</Text>
              <Text>{openMatchId === match._id ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {openMatchId === match._id && (
              <View style={styles.cardBody}>
                <Text style={styles.score}>Tim 1  {goalsTeam1} : {goalsTeam2}  Tim 2</Text>
                <View style={styles.teamsRow}>
                  <View style={styles.team}>
                    <Text style={styles.teamTitle}>Tim 1</Text>
                    {match.team1.map(player => {
                      const goals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'goal').length;
                      const assists = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'assist').length;
                      const ownGoals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'ownGoal').length;
                      return (
                        <View key={player._id} style={styles.playerRow}>
                          <Text style={styles.playerNick}>{player.nickname}</Text>
                          <View style={{ flexDirection: 'row' }}>
                            {Array.from({ length: goals }).map((_, i) => (
                              <Text key={`g${i}`}>⚽</Text>
                            ))}
                            {Array.from({ length: assists }).map((_, i) => (
                              <Text key={`a${i}`}>👟</Text>
                            ))}
                            {Array.from({ length: ownGoals }).map((_, i) => (
                              <Text key={`og${i}`}>🔴</Text>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.team}>
                    <Text style={styles.teamTitle}>Tim 2</Text>
                    {match.team2.map(player => {
                      const goals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'goal').length;
                      const assists = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'assist').length;
                      const ownGoals = match.stats.filter(s => (s.player?._id || s.player).toString() === player._id.toString() && s.stats === 'ownGoal').length;
                      return (
                        <View key={player._id} style={styles.playerRow}>
                          <Text style={styles.playerNick}>{player.nickname}</Text>
                          <View style={{ flexDirection: 'row' }}>
                            {Array.from({ length: goals }).map((_, i) => (
                              <Text key={`g${i}`}>⚽</Text>
                            ))}
                            {Array.from({ length: assists }).map((_, i) => (
                              <Text key={`a${i}`}>👟</Text>
                            ))}
                            {Array.from({ length: ownGoals }).map((_, i) => (
                              <Text key={`og${i}`}>🔴</Text>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  matchNumber: { fontWeight: 'bold', fontSize: 15 },
  matchDate: { color: '#6b7280', fontSize: 13 },
  cardBody: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  score: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#374151' },
  teamsRow: { flexDirection: 'row' },
  team: { flex: 1 },
  teamTitle: { fontWeight: 'bold', color: '#6b7280', marginBottom: 8 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  playerNick: { fontWeight: '600', color: '#1f2937' },
  divider: { width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 8 },
});

export default ResultsScreen;