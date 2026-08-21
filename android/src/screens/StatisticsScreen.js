import React, { use } from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import request from '../api/api';

const StatisticsScreen = () => {

const [players, setPlayers] = useState([]);
const [sortField, setSortField] = useState("totalPoints");
const [sortDirection, setSortDirection] = useState("desc");

// Sortiranje po polju
 const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    //const sortedPlayers = [...players].filter(p => p.appearances > 0).sort((a, b) => {
    const sortedPlayers = [...players].sort((a, b) => {
        if (sortDirection === "desc") return b[sortField] - a[sortField];
        return a[sortField] - b[sortField];
    });

    useEffect(() => {
        const fetchPlayers = async () => {
            try { 
              const res = await request('get', '/players');
              setPlayers(res);
            } catch (error) {
                console.error("Greska:", error);
            }
        };
        fetchPlayers();
    }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistika igrača</Text>
      <ScrollView horizontal>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { width: 30 }]}>#</Text>
            <Text style={[styles.headerCell, { width: 90 }]}>Nadimak</Text>
            <Text style={[styles.headerCell, { width: 130 }]}>Ime i Prezime</Text>
            <TouchableOpacity onPress={() => handleSort('appearances')}>
              <Text style={[styles.headerCell, { width: 50 }]}>Ut. {sortField === 'appearances' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('goals')}>
              <Text style={[styles.headerCell, { width: 50 }]}>Gol {sortField === 'goals' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('assists')}>
              <Text style={[styles.headerCell, { width: 50 }]}>Asi {sortField === 'assists' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('ownGoals')}>
              <Text style={[styles.headerCell, { width: 50 }]}>AG {sortField === 'ownGoals' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('wins')}>
              <Text style={[styles.headerCell, { width: 50 }]}>Pob {sortField === 'wins' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('draws')}>
              <Text style={[styles.headerCell, { width: 50 }]}>Rem {sortField === 'draws' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('losses')}>
              <Text style={[styles.headerCell, { width: 50 }]}>Por {sortField === 'losses' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('totalPoints')}>
              <Text style={[styles.headerCell, { width: 60 }]}>Poeni {sortField === 'totalPoints' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('averagePoints')}>
              <Text style={[styles.headerCell, { width: 65 }]}>Prosek {sortField === 'averagePoints' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</Text>
            </TouchableOpacity>
          </View>

          {/* Redovi */}
          <FlatList
            data={sortedPlayers}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <View style={styles.row}>
                <Text style={[styles.cell, { width: 30 }]}>{index + 1}</Text>
                <Text style={[styles.cell, { width: 90 }]}>{item.nickname}</Text>
                <Text style={[styles.cell, { width: 130 }]}>{item.firstName} {item.lastName}</Text>
                <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{item.appearances}</Text>
                <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{item.goals}</Text>
                <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{item.assists}</Text>
                <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{item.ownGoals}</Text>
                <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{item.wins}</Text>
                <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{item.draws}</Text>
                <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{item.losses}</Text>
                <Text style={[styles.cell, { width: 60, textAlign: 'center', fontWeight: 'bold', color: '#16a34a' }]}>{item.totalPoints}</Text>
                <Text style={[styles.cell, { width: 65, textAlign: 'center' }]}>
                  {item.appearances > 0 ? (item.totalPoints / item.appearances).toFixed(1) : '0.0'}
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  headerRow: { flexDirection: 'row', backgroundColor: '#16a34a', padding: 10, borderRadius: 8, marginBottom: 4 },
  headerCell: { color: 'white', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  row: { flexDirection: 'row', backgroundColor: 'white', padding: 10, marginBottom: 2, borderRadius: 6 },
  cell: { fontSize: 13, color: '#374151' },
});

export default StatisticsScreen;