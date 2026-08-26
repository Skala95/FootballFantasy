import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView} from 'react-native';
import request from '../api/api';

const MatchAdminScreen = () => {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [newMatch, setNewMatch] = useState({ season: '', day: '', month: '', year: '', time: '' });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'view'
  const [playerData, setPlayerData] = useState({});

  // Brisanje termina 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteMatch, setSelectedDeleteMatch] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Zatvaranje termina 
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedCloseMatch, setSelectedCloseMatch] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Otvaranje termina 
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [selectedOpenMatch, setSelectedOpenMatch] = useState(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await request('get', '/matches');
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const data = await request('get', '/players');
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Pravljenje meca
  const handleCreateMatch = async () => {
    if (!newMatch.season.trim() || !newMatch.day.trim() || !newMatch.month.trim() || !newMatch.year.trim() || !newMatch.time.trim()) {
      Alert.alert('Greška', 'Molimo popunite sva polja');
      return;
    }

    const day = newMatch.day.padStart(2, '0');
    const month = newMatch.month.padStart(2, '0');
    const dateStr = `${newMatch.year}-${month}-${day}`;

    try {
      const isoDate = new Date(`${dateStr}T${newMatch.time}`).toISOString();
      await request('post', '/matches', { season: newMatch.season, date: isoDate });
      Alert.alert('Uspeh', 'Termin je uspešno kreiran');
      setNewMatch({ season: '', day: '', month: '', year: '', time: '' });
      fetchMatches();
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće kreirati termin');
      console.error('Error creating match:', error);
    }
  };

  // Brisanje meca 
  const handleDeleteMatch = async () => {
    if (isDeleting) return; // sprečava dupli poziv
    setIsDeleting(true);
    try {
      await request('delete', `/matches/${selectedDeleteMatch._id}`);
      Alert.alert('Uspeh', 'Termin je uspešno obrisan');
      setShowDeleteModal(false);
      setSelectedDeleteMatch(null);
      fetchMatches();
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće obrisati termin');
      console.error('Error deleting match:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Zatvaranje meca - poziva se tek kad korisnik potvrdi u modalu
  const handleCloseMatch = async () => {
    if (isClosing) return; // sprečava dupli poziv
    setIsClosing(true);
    try {
      await request('put', `/matches/${selectedCloseMatch._id}/status`, { status: 'closed' });
      Alert.alert('Uspeh', 'Termin je uspešno zatvoren');
      setShowCloseModal(false);
      setSelectedCloseMatch(null);
      fetchMatches();
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće zatvoriti termin');
      console.error('Error closing match:', error);
    } finally {
      setIsClosing(false);
    }
  };

  // Otvaranje meca 
  const handleOpenMatch = async () => {
    if (isOpening) return; // sprečava dupli poziv
    setIsOpening(true);
    try {
      await request('put', `/matches/${selectedOpenMatch._id}/status`, { status: 'open' });
      Alert.alert('Uspeh', 'Termin je uspešno otvoren');
      setShowOpenModal(false);
      setSelectedOpenMatch(null);
      fetchMatches();
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće otvoriti termin');
      console.error('Error opening match:', error);
    } finally {
      setIsOpening(false);
    }
  };

  // Otvaranje modala za statistiku
  const openStatsModal = async (match, mode = 'edit') => {
    try {
      // Dohvati svezije podatke o igracima
      const freshPlayers = await request('get', '/players');
      setPlayers(freshPlayers);
      
      setSelectedMatch(match);
      setModalMode(mode);

      const initial = {};
      freshPlayers.forEach(p => {
        const id = p._id;
        
        // Proveri da li je igrac u timu1 ili timu2
        const inTeam1 = match.team1?.some(t => {
          const teamId = (t._id || t).toString();
          return teamId === id.toString();
        });
        const inTeam2 = match.team2?.some(t => {
          const teamId = (t._id || t).toString();
          return teamId === id.toString();
        });
        const team = inTeam1 ? 'team1' : inTeam2 ? 'team2' : null;

        // Prebroj golove
        const goals = match.stats?.filter(s => {
          const statPlayerId = (s.player?._id || s.player)?.toString();
          return statPlayerId === id.toString() && s.stats === 'goal';
        }).length || 0;

        // Prebroj asistencije
        const assists = match.stats?.filter(s => {
          const statPlayerId = (s.player?._id || s.player)?.toString();
          return statPlayerId === id.toString() && s.stats === 'assist';
        }).length || 0;

        // Prebroj autogolove
        const ownGoals = match.stats?.filter(s => {
          const statPlayerId = (s.player?._id || s.player)?.toString();
          return statPlayerId === id.toString() && s.stats === 'ownGoal';
        }).length || 0;

        initial[id] = { team, goals, assists, ownGoals };
      });

      setPlayerData(initial);
      setStatsModalVisible(true);
    } catch (error) {
      console.error('Error opening stats modal:', error);
      Alert.alert('Greška', 'Nije moguće učitati podatke');
    }
  };

  // Cuvanje statistike
  const handleSaveStats = async () => {
    const team1 = [];
    const team2 = [];
    const stats = [];

    Object.entries(playerData).forEach(([playerId, pd]) => {
      if (pd.team === 'team1') team1.push(playerId);
      else if (pd.team === 'team2') team2.push(playerId);

      if (pd.team !== null) {
        for (let i = 0; i < pd.goals; i++) {
          stats.push({ player: playerId, stats: 'goal' });
        }
        for (let i = 0; i < pd.assists; i++) {
          stats.push({ player: playerId, stats: 'assist' });
        }
        for (let i = 0; i < pd.ownGoals; i++) {
          stats.push({ player: playerId, stats: 'ownGoal' });
        }
      }
    });

    if (team1.length !== 6 || team2.length !== 6) {
      Alert.alert('Greška', 'Svaki tim mora imati tačno 6 igrača!');
      return;
    }

    try {
      await request('put', `/matches/${selectedMatch._id}`, {
        team1,
        team2,
        stats,
        status: 'finished'
      });
      Alert.alert('Uspeh', 'Termin je uspešno ažuriran!');
      setStatsModalVisible(false);
      fetchMatches();
    } catch (error) {
      Alert.alert('Greška', 'Greška prilikom ažuriranja termina.');
      console.error('Error saving stats:', error);
    }
  };

  // Racunanje rezultata meca na osnovu statistike
  const calculateScore = () => {
    if (!selectedMatch) return { team1: 0, team2: 0 };

    const goalsTeam1 = (selectedMatch.stats?.filter(s => {
      const playerId = (s.player?._id || s.player)?.toString();
      return selectedMatch.team1?.some(t => (t._id || t).toString() === playerId) && s.stats === 'goal';
    }).length || 0) + (selectedMatch.stats?.filter(s => {
      const playerId = (s.player?._id || s.player)?.toString();
      return selectedMatch.team2?.some(t => (t._id || t).toString() === playerId) && s.stats === 'ownGoal';
    }).length || 0);

    const goalsTeam2 = (selectedMatch.stats?.filter(s => {
      const playerId = (s.player?._id || s.player)?.toString();
      return selectedMatch.team2?.some(t => (t._id || t).toString() === playerId) && s.stats === 'goal';
    }).length || 0) + (selectedMatch.stats?.filter(s => {
      const playerId = (s.player?._id || s.player)?.toString();
      return selectedMatch.team1?.some(t => (t._id || t).toString() === playerId) && s.stats === 'ownGoal';
    }).length || 0);

    return { team1: goalsTeam1, team2: goalsTeam2 };
  };

  // Renderovanje pojedinacnog meca
  const renderMatchItem = ({ item }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchSeason}>Sezona: {item.season}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'open' ? styles.statusOpen :
          item.status === 'closed' ? styles.statusClosed :
          styles.statusFinished
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'open' ? 'Otvoren' :
             item.status === 'closed' ? 'Zatvoren' :
             'Završen'}
          </Text>
        </View>
      </View>
      <Text style={styles.matchDate}>
        Broj termina: {item.matchNumber}
      </Text>
      <Text style={styles.matchDate}>
        Datum: {new Date(item.date).toLocaleString('sr-Latn-RS', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}
      </Text>
      <Text style={styles.matchDate}>
        Rok za prijavu: {new Date(item.registrationDeadline).toLocaleString('sr-Latn-RS', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}
      </Text>
      <View style={styles.matchActions}>
        {item.status === 'open' && (
          <>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => { setSelectedCloseMatch(item); setShowCloseModal(true); }}
            >
              <Text style={styles.buttonText}>Zatvori</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => { setSelectedDeleteMatch(item); setShowDeleteModal(true); }}
            >
              <Text style={styles.buttonText}>Obriši</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'closed' && (
          <>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => { setSelectedOpenMatch(item); setShowOpenModal(true); }}
            >
              <Text style={styles.buttonText}>Otvori</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statsButton}
              onPress={() => openStatsModal(item, 'edit')}
            >
              <Text style={styles.buttonText}>Unesi statistiku</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => { setSelectedDeleteMatch(item); setShowDeleteModal(true); }}
            >
              <Text style={styles.buttonText}>Obriši</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'finished' && (
          <>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => openStatsModal(item, 'view')}
            >
              <Text style={styles.buttonText}>Pregledaj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => openStatsModal(item, 'edit')}
            >
              <Text style={styles.buttonText}>Ažuriraj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => { setSelectedDeleteMatch(item); setShowDeleteModal(true); }}
            >
              <Text style={styles.buttonText}>Obriši</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Create Match Section */}
      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>Kreiraj Novi Termin</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sezona (broj):</Text>
          <TextInput
            style={styles.input}
            value={newMatch.season}
            onChangeText={(text) => setNewMatch({ ...newMatch, season: text })}
            placeholder="npr. 2026"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.dateRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
            <Text style={styles.label}>Dan:</Text>
            <TextInput
              style={styles.input}
              value={newMatch.day}
              onChangeText={(text) => setNewMatch({ ...newMatch, day: text })}
              placeholder="16"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
            <Text style={styles.label}>Mesec:</Text>
            <TextInput
              style={styles.input}
              value={newMatch.month}
              onChangeText={(text) => setNewMatch({ ...newMatch, month: text })}
              placeholder="06"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={styles.label}>Godina:</Text>
            <TextInput
              style={styles.input}
              value={newMatch.year}
              onChangeText={(text) => setNewMatch({ ...newMatch, year: text })}
              placeholder="2026"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vreme (HH:MM):</Text>
          <TextInput
            style={styles.input}
            value={newMatch.time}
            onChangeText={(text) => setNewMatch({ ...newMatch, time: text })}
            placeholder="19:00"
          />
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateMatch}>
          <Text style={styles.createButtonText}>Kreiraj Termin</Text>
        </TouchableOpacity>
      </View>

      {/* Matches List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Lista Termina</Text>
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      </View>

      {/* Stats Modal */}
      <Modal
        visible={statsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'edit' ? 'Unesi statistiku' : 'Pregled termina'}
              </Text>
              <TouchableOpacity
                onPress={() => setStatsModalVisible(false)}
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Score Display for Finished Matches */}
              {selectedMatch?.status === 'finished' && (
                <View style={styles.scoreDisplay}>
                  <Text style={styles.scoreText}>
                    Tim 1 <Text style={styles.scoreNumber}>{calculateScore().team1}</Text> : <Text style={styles.scoreNumber}>{calculateScore().team2}</Text> Tim 2
                  </Text>
                </View>
              )}

              {/* Players Table */}
              <View style={styles.playersTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Ime</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Tim 1</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Tim 2</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>/</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Gol</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Asist</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>AG</Text>
                </View>

                {players.map(player => {
                  const pd = playerData[player._id] || { team: null, goals: 0, assists: 0, ownGoals: 0 };
                  const inTeam = pd.team !== null;
                  const isDisabled = modalMode === 'view';

                  return (
                    <View key={player._id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]}>{player.nickname}</Text>
                      
                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                        <TouchableOpacity
                          disabled={isDisabled}
                          onPress={() => {
                            if (!isDisabled) {
                              setPlayerData({
                                ...playerData,
                                [player._id]: { ...pd, team: 'team1' }
                              });
                            }
                          }}
                        >
                          <View style={[styles.radioButton, pd.team === 'team1' && styles.radioButtonSelected]} />
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                        <TouchableOpacity
                          disabled={isDisabled}
                          onPress={() => {
                            if (!isDisabled) {
                              setPlayerData({
                                ...playerData,
                                [player._id]: { ...pd, team: 'team2' }
                              });
                            }
                          }}
                        >
                          <View style={[styles.radioButton, pd.team === 'team2' && styles.radioButtonSelected]} />
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                        <TouchableOpacity
                          disabled={isDisabled}
                          onPress={() => {
                            if (!isDisabled) {
                              setPlayerData({
                                ...playerData,
                                [player._id]: { team: null, goals: 0, assists: 0, ownGoals: 0 }
                              });
                            }
                          }}
                        >
                          <View style={[styles.radioButton, pd.team === null && styles.radioButtonSelected]} />
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <TextInput
                          style={[styles.statInput, (!inTeam || isDisabled) && styles.disabledInput]}
                          keyboardType="numeric"
                          editable={inTeam && !isDisabled}
                          value={pd.goals.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 0;
                            setPlayerData({
                              ...playerData,
                              [player._id]: { ...pd, goals: num }
                            });
                          }}
                        />
                      </View>

                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <TextInput
                          style={[styles.statInput, (!inTeam || isDisabled) && styles.disabledInput]}
                          keyboardType="numeric"
                          editable={inTeam && !isDisabled}
                          value={pd.assists.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 0;
                            setPlayerData({
                              ...playerData,
                              [player._id]: { ...pd, assists: num }
                            });
                          }}
                        />
                      </View>

                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <TextInput
                          style={[styles.statInput, (!inTeam || isDisabled) && styles.disabledInput]}
                          keyboardType="numeric"
                          editable={inTeam && !isDisabled}
                          value={pd.ownGoals.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 0;
                            setPlayerData({
                              ...playerData,
                              [player._id]: { ...pd, ownGoals: num }
                            });
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Modal Actions */}
              {modalMode === 'edit' ? (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveStats}
                  >
                    <Text style={styles.buttonText}>Sačuvaj</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setStatsModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Zatvori</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowDeleteModal(false); setSelectedDeleteMatch(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContent}>
            <Text style={styles.modalTitle}>Potvrda brisanja</Text>
            {selectedDeleteMatch && (
              <Text style={{ marginVertical: 16, fontSize: 15, color: '#ef4444', fontWeight: '600' }}>
                Da li ste sigurni da želite da obrišete termin {selectedDeleteMatch.matchNumber} (sezona {selectedDeleteMatch.season})?
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setShowDeleteModal(false); setSelectedDeleteMatch(null); }}
              >
                <Text style={styles.buttonText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { flex: 0, paddingHorizontal: 24 }]}
                onPress={handleDeleteMatch}
                disabled={isDeleting}
              >
                <Text style={styles.buttonText}>{isDeleting ? 'Brisanje...' : 'Obriši'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Close Confirmation Modal */}
      <Modal
        visible={showCloseModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowCloseModal(false); setSelectedCloseMatch(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContent}>
            <Text style={styles.modalTitle}>Potvrda zatvaranja</Text>
            {selectedCloseMatch && (
              <Text style={{ marginVertical: 16, fontSize: 15, color: '#374151', fontWeight: '600' }}>
                Da li ste sigurni da želite da zatvorite termin {selectedCloseMatch.matchNumber} (sezona {selectedCloseMatch.season})?
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setShowCloseModal(false); setSelectedCloseMatch(null); }}
              >
                <Text style={styles.buttonText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, { flex: 0, paddingHorizontal: 24 }]}
                onPress={handleCloseMatch}
                disabled={isClosing}
              >
                <Text style={styles.buttonText}>{isClosing ? 'Zatvaranje...' : 'Zatvori'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Open Confirmation Modal */}
      <Modal
        visible={showOpenModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowOpenModal(false); setSelectedOpenMatch(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContent}>
            <Text style={styles.modalTitle}>Potvrda otvaranja</Text>
            {selectedOpenMatch && (
              <Text style={{ marginVertical: 16, fontSize: 15, color: '#374151', fontWeight: '600' }}>
                Da li ste sigurni da želite da otvorite termin {selectedOpenMatch.matchNumber} (sezona {selectedOpenMatch.season})?
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setShowOpenModal(false); setSelectedOpenMatch(null); }}
              >
                <Text style={styles.buttonText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.openButton, { flex: 0, paddingHorizontal: 24 }]}
                onPress={handleOpenMatch}
                disabled={isOpening}
              >
                <Text style={styles.buttonText}>{isOpening ? 'Otvaranje...' : 'Otvori'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  createSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  createButton: {
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchSeason: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: '#22c55e',
  },
  statusClosed: {
    backgroundColor: '#3b82f6',
  },
  statusFinished: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  matchDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  matchActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  openButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  statsButton: {
    backgroundColor: '#eab308',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#eab308',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  finishedText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeModalButton: {
    padding: 5,
  },
  closeModalText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  scoreDisplay: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  scoreNumber: {
    color: '#16a34a',
    fontSize: 24,
  },
  playersTable: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableCell: {
    justifyContent: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  radioButtonSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  statInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 6,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: 'white',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
});

export default MatchAdminScreen;