import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import request from '../api/api';

const PlayerAdminScreen = () => {
  const [players, setPlayers] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeletePlayer, setSelectedDeletePlayer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => { fetchPlayers(); }, []);

  // Dohvati igrace
  const fetchPlayers = async () => {
    try {
      const data = await request('get', '/players');
      setPlayers(data);
    } catch (err) { console.error(err); }
  };

  // Dodaj igraca
  const handleAddPlayer = async () => {
    if (!firstName.trim() || !lastName.trim() || !nickname.trim()) {
      setError('Molimo unesite ime, prezime i nadimak.');
      return;
    }
    try {
      await request('post', '/players', { firstName, lastName, nickname });
      setMessage('Igrac je uspesno dodat.');
      setError('');
      setFirstName(''); setLastName(''); setNickname('');
      fetchPlayers();
    } catch (err) { setError('Greška pri dodavanju igrača.'); }
  };

  // Obrisi igraca
  const handleDeletePlayer = () => {
    if (isDeleting || !selectedDeletePlayer) return;

    Alert.alert(
      'Potvrda Brisanja',
      `Da li ste sigurni da želite da obrišete igrača ${selectedDeletePlayer.nickname}?`,
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await request('delete', "/players/" + selectedDeletePlayer._id);
              setMessage('Igrač je uspešno obrisan.');
              setShowDeleteModal(false);
              setSelectedDeletePlayer(null);
              fetchPlayers();
            } catch (err) {
              setMessage('Greška pri brisanju igrača.');
              console.error('Greška pri brisanju igrača:', err);
              if (err.response) {
                // Backend je primio zahtev i vratio grešku (npr. 400, 404, 500)
                Alert.alert("Backend greška", JSON.stringify(err.response.data, null, 2) + "\nStatus kod: " + err.response.status);
              } else if (err.request) {
                // Zahtev je poslat, ali odgovor nije stigao (npr. pao server ili loš URL)
                Alert.alert("Greška", "Server nedostupan (Network Error)");
              } else {
                // Nešto drugo je izazvalo problem pri slanju zahteva
                Alert.alert("Greška", err.message);
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Izmeni igraca
  const handleEditPlayer = async () => {
    try {
      await request('put', "/players/" + editPlayer._id, { firstName: editFirstName, lastName: editLastName, nickname: editNickname });
      setMessage('Igrač je uspešno izmenjen.');
      setError('');
      setShowEditModal(false);
      setEditPlayer(null);
      fetchPlayers();
    } catch (err) { setError('Greška pri izmeni igrača.'); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dodaj igrača</Text>
        {message ? <Text style={styles.successText}>{message}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput style={styles.input} placeholder="Ime" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Prezime" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Nadimak" value={nickname} onChangeText={setNickname} />
        <TouchableOpacity style={styles.greenButton} onPress={handleAddPlayer}>
          <Text style={styles.buttonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Brisanje igrača</Text>
        <TouchableOpacity style={styles.redButton} onPress={() => { setShowDeleteModal(true); setSelectedDeletePlayer(null); }}>
          <Text style={styles.buttonText}>Obriši igrača</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ažuriranje igrača</Text>
        <TouchableOpacity style={styles.blueButton} onPress={() => { setShowEditModal(true); setEditPlayer(null); }}>
          <Text style={styles.buttonText}>Ažuriraj igrača</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Izaberi igrača za brisanje</Text>
            <ScrollView style={styles.playerList}>
              {players.map((player) => (
                <TouchableOpacity
                  key={player._id}
                  style={[styles.playerItem, selectedDeletePlayer?._id === player._id && styles.playerItemSelected]}
                  onPress={() => setSelectedDeletePlayer(player)}
                >
                  <Text style={styles.playerItemText}>{player.firstName} {player.lastName} ({player.nickname})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedDeletePlayer && <Text style={styles.confirmText}>Da li si siguran da želiš obrisati {selectedDeletePlayer.nickname}?</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.grayButton, {flex:1}]} onPress={() => { setShowDeleteModal(false); setSelectedDeletePlayer(null); }}>
                <Text style={styles.buttonText}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.redButton, {flex:1}, (!selectedDeletePlayer || isDeleting) && styles.disabledButton]}
                  onPress={handleDeletePlayer}
                  disabled={!selectedDeletePlayer || isDeleting}>
                  <Text style={styles.buttonText}>{isDeleting ? 'Brisanje...' : 'Obriši'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editPlayer ? 'Izmeni igrača' : 'Izaberi igrača za ažuriranje'}</Text>
            {!editPlayer ? (
              <ScrollView style={styles.playerList}>
                {players.map((player) => (
                  <TouchableOpacity
                    key={player._id}
                    style={styles.playerItem}
                    onPress={() => { setEditPlayer(player); setEditFirstName(player.firstName); setEditLastName(player.lastName); setEditNickname(player.nickname); }}
                  >
                    <Text style={styles.playerItemText}>{player.firstName} {player.lastName} ({player.nickname})</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View>
                <TextInput style={styles.input} value={editFirstName} onChangeText={setEditFirstName} placeholder="Ime" />
                <TextInput style={styles.input} value={editLastName} onChangeText={setEditLastName} placeholder="Prezime" />
                <TextInput style={styles.input} value={editNickname} onChangeText={setEditNickname} placeholder="Nadimak" />
                <TouchableOpacity style={styles.blueButton} onPress={handleEditPlayer}>
                  <Text style={styles.buttonText}>Sačuvaj</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={[styles.grayButton, {marginTop:8}]} onPress={() => { setShowEditModal(false); setEditPlayer(null); }}>
              <Text style={styles.buttonText}>Otkaži</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 10, fontSize: 14, backgroundColor: 'white', marginBottom: 10 },
  greenButton: { backgroundColor: '#16a34a', padding: 12, borderRadius: 6, alignItems: 'center' },
  redButton: { backgroundColor: '#ef4444', padding: 12, borderRadius: 6, alignItems: 'center' },
  blueButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 6, alignItems: 'center' },
  grayButton: { backgroundColor: '#9ca3af', padding: 12, borderRadius: 6, alignItems: 'center' },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  successText: { color: '#16a34a', marginBottom: 8, fontWeight: '600' },
  errorText: { color: '#ef4444', marginBottom: 8, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' },
  playerList: { maxHeight: 300, marginBottom: 12 },
  playerItem: { padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
  playerItemSelected: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  playerItemText: { fontSize: 14, color: '#374151' },
  confirmText: { color: '#ef4444', fontWeight: '600', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', gap: 10 },
});

export default PlayerAdminScreen;