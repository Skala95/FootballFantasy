import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import request from '../api/api';

const FantasyTeamScreen = () => {

  const [matches, setMatches] = useState([]);
  const [closedMatches, setClosedMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [captain, setCaptain] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [myClosedTeams, setMyClosedTeams] = useState({});
  const [myOpenTeams, setMyOpenTeams] = useState({});
  const [openClosedId, setOpenClosedId] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [userData, setUserData] = useState(null);

  const fetchUser = async () => {
    try {
      const user = await request('get', '/auth/me');
      setUserData(user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await request('get', '/matches');
      const open = res.filter(m => m.status === 'open');
      setMatches(open);
      const closed = res.filter(m => m.status === 'closed' || m.status === 'finished');
      setClosedMatches(closed);

      // Dohvati timove za otvorene termine
      const openTeamsMap = {};
      for (const m of open) {
        try {
          const r = await request('get', `/fantasy-teams/${m._id}`);
          if (r) openTeamsMap[m._id] = r;
        } catch {}
      }
      setMyOpenTeams(openTeamsMap);

      // Dohvati timove za zatvorene termine
      const teamsMap = {};
      for (const m of closed) {
        try {
          const r = await request('get', `/fantasy-teams/${m._id}`);
          if (r) teamsMap[m._id] = r;
        } catch {}
      }
      setMyClosedTeams(teamsMap);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await request('get', '/players');
      setPlayers(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyTeam = async (matchId) => {
    try {
      const res = await request('get', `/fantasy-teams/${matchId}`);
      if (res) {
        setMyTeam(res);
        setSelectedPlayers(res.selectedPlayers.map(p => p._id));
        setCaptain(res.captain?._id || null);
      } else {
        setMyTeam(null);
        setSelectedPlayers([]);
        setCaptain(null);
      }
    } catch {
      setMyTeam(null);
      setSelectedPlayers([]);
      setCaptain(null);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchMatches();
    fetchPlayers();
  }, []);

  const handleSelectMatch = async (match, view = false) => {
    // Toggle - ako je isti match i isti mod, zatvori
    if (selectedMatch?._id === match._id && viewMode === view) {
      setSelectedMatch(null);
      return;
    }
    setViewMode(view);
    await fetchMyTeam(match._id);
    setSelectedMatch(match);
  };

  const handlePlayerSelect = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      if (captain === playerId) setCaptain(null);
    } else {
      if (selectedPlayers.length >= 6) {
        Alert.alert('Greška', 'Možete izabrati maksimalno 6 igrača');
        return;
      }
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length !== 6) {
      Alert.alert('Greška', 'Morate izabrati tačno 6 igrača');
      return;
    }
    if (!captain || !selectedPlayers.includes(captain)) {
      Alert.alert('Greška', 'Kapiten mora biti među izabranim igračima');
      return;
    }
      try {
      if (myTeam) {
        await request('put', `/fantasy-teams/${myTeam._id}`, { selectedPlayers, captain });
        Alert.alert('Uspjeh', 'Fantasy tim uspješno ažuriran!');
      } else {
        await request('post', '/fantasy-teams', { matchId: selectedMatch._id, selectedPlayers, captain });
        Alert.alert('Uspjeh', 'Fantasy tim uspješno kreiran!');
      }
      await fetchMatches();
      setSelectedMatch(null);
    } catch (err) {
      Alert.alert('Greška', err.message || 'Došlo je do greške');
    }
  };

  const isAdmin = userData?.role === 'admin';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Moj Fantasy Tim</Text>

      {isAdmin && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Kao administrator, ne možete kreirati fantasy timove.</Text>
        </View>
      )}

      {/* Otvoreni termini */}
      {!isAdmin && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Otvoreni termini</Text>
          {matches.length === 0 ? (
            <Text style={styles.emptyText}>Nema otvorenih termina</Text>
          ) : (
            matches.map(m => {
              const hasTeam = !!myOpenTeams[m._id];
              return (
                <View key={m._id} style={styles.matchRow}>
                  <Text style={styles.matchText}>Termin {m.matchNumber} — {new Date(m.date).toLocaleString('sr-Latn-RS')}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {hasTeam && (
                      <TouchableOpacity
                        style={[styles.btn, styles.btnGray]}
                        onPress={() => handleSelectMatch(m, true)}
                      >
                        <Text style={styles.btnText}>Pregled</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.btn, hasTeam ? styles.btnYellow : styles.btnGreen]}
                      onPress={() => handleSelectMatch(m, false)}
                    >
                      <Text style={styles.btnText}>{hasTeam ? 'Ažuriraj' : 'Prijavi'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Izbor igraca */}
      {!isAdmin && selectedMatch && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{viewMode ? 'Pregled tima' : `Izaberi igrače (${selectedPlayers.length}/6)`}</Text>
          {!viewMode && <Text style={styles.hint}>Klikni na igrača da ga dodaš. Klikni C za kapitena.</Text>}
          {players.map(p => {
            const isSelected = selectedPlayers.includes(p._id);
            const isCaptain = captain === p._id;
            return (
              <View key={p._id} style={[styles.playerRow, isSelected && styles.playerRowSelected]}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => !viewMode && handlePlayerSelect(p._id)} disabled={viewMode}>
                  <Text style={styles.playerNick}>{p.nickname}</Text>
                  <Text style={styles.playerName}>{p.firstName} {p.lastName}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!isSelected || viewMode}
                  onPress={() => setCaptain(p._id)}
                  style={[styles.captainBtn, isCaptain && styles.captainBtnActive]}
                >
                  <Text style={[styles.captainText, isCaptain && styles.captainTextActive]}>C</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {!viewMode && (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>{myTeam ? 'Ažuriraj tim' : 'Prijavi tim'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Zatvoreni termini */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Zatvoreni termini</Text>
        {closedMatches.length === 0 ? (
          <Text style={styles.emptyText}>Nema zatvorenih termina</Text>
        ) : (
          closedMatches.map(m => {
            const team = myClosedTeams[m._id];
            return (
              <View key={m._id} style={styles.closedCard}>
                <TouchableOpacity style={styles.closedHeader} onPress={() => setOpenClosedId(openClosedId === m._id ? null : m._id)}>
                  <Text style={styles.closedTitle}>Termin {m.matchNumber}</Text>
                  <Text style={styles.closedDate}>{new Date(m.date).toLocaleString('sr-Latn-RS')}</Text>
                  <Text>{openClosedId === m._id ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {openClosedId === m._id && (
                  <View style={styles.closedBody}>
                    {team ? (
                      <>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.th, { flex: 2 }]}>Igrač</Text>
                          <Text style={styles.th}>Gol</Text>
                          <Text style={styles.th}>Asi</Text>
                          <Text style={styles.th}>AG</Text>
                          <Text style={styles.th}>Pts</Text>
                        </View>
                        {team.selectedPlayers?.map(p => {
                          const pid = p._id.toString();
                          const isCap = team.captain?._id?.toString() === pid || team.captain?.toString() === pid;
                          const goals = m.stats?.filter(s => (s.player?._id || s.player).toString() === pid && s.stats === 'goal').length || 0;
                          const assists = m.stats?.filter(s => (s.player?._id || s.player).toString() === pid && s.stats === 'assist').length || 0;
                          const ownGoals = m.stats?.filter(s => (s.player?._id || s.player).toString() === pid && s.stats === 'ownGoal').length || 0;
                          const pp = team.playerPoints?.find(pp => pp.player?.toString() === pid);
                          const pts = pp?.points || 0;
                          return (
                            <View key={p._id} style={styles.tableRow}>
                              <Text style={[styles.td, { flex: 2 }]}>{p.nickname}{isCap ? ' (C)' : ''}</Text>
                              <Text style={styles.td}>{goals}</Text>
                              <Text style={styles.td}>{assists}</Text>
                              <Text style={styles.td}>{ownGoals}</Text>
                              <Text style={[styles.td, { fontWeight: 'bold' }]}>{m.status === 'finished' ? pts : '-'}</Text>
                            </View>
                          );
                        })}
                        <Text style={styles.totalPoints}>
                          Ukupno: {team.selectedPlayers?.reduce((sum, p) => {
                            const pid = p._id.toString();
                            const pp = team.playerPoints?.find(pp => pp.player?.toString() === pid);
                            return sum + (pp?.points || 0);
                          }, 0)} pts
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.noTeam}>Nisi prijavio tim za ovaj termin</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  infoBox: { backgroundColor: '#dbeafe', padding: 12, borderRadius: 8, marginBottom: 16 },
  infoText: { color: '#1d4ed8', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#374151' },
  emptyText: { color: '#9ca3af', fontStyle: 'italic' },
  matchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  matchText: { flex: 1, fontSize: 13, color: '#374151', marginRight: 8 },
  btn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnGreen: { backgroundColor: '#16a34a' },
  btnYellow: { backgroundColor: '#d97706' },
  btnGray: { backgroundColor: '#6b7280' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  hint: { color: '#9ca3af', fontSize: 12, marginBottom: 12 },
  playerRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 6, backgroundColor: '#f9fafb' },
  playerRowSelected: { backgroundColor: '#dcfce7' },
  playerNick: { fontWeight: 'bold', color: '#1f2937' },
  playerName: { color: '#9ca3af', fontSize: 12 },
  captainBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  captainBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  captainText: { fontWeight: 'bold', color: '#9ca3af' },
  captainTextActive: { color: '#2563eb' },
  submitBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  closedCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
  closedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  closedTitle: { fontWeight: 'bold', color: '#374151' },
  closedDate: { color: '#6b7280', fontSize: 12 },
  closedBody: { padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  tableHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 4 },
  th: { flex: 1, fontWeight: 'bold', fontSize: 12, color: '#6b7280', textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 4 },
  td: { flex: 1, fontSize: 13, color: '#374151', textAlign: 'center' },
  totalPoints: { textAlign: 'right', fontWeight: 'bold', color: '#16a34a', marginTop: 8 },
  noTeam: { color: '#ef4444', fontStyle: 'italic' },
});

export default FantasyTeamScreen;