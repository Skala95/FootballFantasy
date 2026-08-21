import React from "react";
import {useState, useEffect} from "react";
import { View, Text,  TouchableOpacity, StyleSheet, FlatList} from "react-native";
import request from "../api/api";


const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
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

  const sortedUsers = [...leaderboard].sort((a, b) => {
    if (sortDirection === "desc") return b[sortField] - a[sortField];
    return a[sortField] - b[sortField];
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
        try {
            const res = await request('get', '/fantasy-teams/leaderboard');
            setLeaderboard(res);
        } catch (err) {
            console.error(err);
        }
    };
    fetchLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tabela Bodova</Text>

      {/*Header tabele*/}
      <View style={styles.headerRow}>
          <Text style={[styles.headerCell, { flex: 0.5 }]}>#</Text>
          <Text style={[styles.headerCell, { flex: 2, textAlign: 'left' }]}>Ime i Prezime</Text>
          <TouchableOpacity style={[styles.headerCell, { flex: 1 }]} onPress={() => handleSort("matchCount")}>
              <Text>Termini {sortField === "matchCount" ? (sortDirection === 'desc' ? '↓' : '↑') : ""}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerCell, { flex: 1 }]} onPress={() => handleSort("totalPoints")}>
              <Text>Bodovi {sortField === "totalPoints" ? (sortDirection === 'desc' ? '↓' : '↑') : ""}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerCell, { flex: 1 }]} onPress={() => handleSort("averagePoints")}>
              <Text>Prosek {sortField === "averagePoints" ? (sortDirection === 'desc' ? '↓' : '↑') : ""}</Text>
          </TouchableOpacity>
      </View>

      {/*Redovi tabele*/ }
      <FlatList
          data={sortedUsers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item, index }) => (
              <View style={styles.row}>
                  <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
                  <Text style={[styles.cell, { flex: 2, textAlign: 'left' }]}>{item.firstName} {item.lastName}</Text>
                  <Text style={[styles.cell, { flex: 1 }]}>{item.matchCount}</Text>
                  <Text style={[styles.cell, { flex: 1 }]}>{item.totalPoints}</Text>
                  <Text style={[styles.cell, { flex: 1 }]}>{item.averagePoints}</Text>
              </View>
          )}
      /> 
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" },
    headerRow: { flexDirection: "row", backgroundColor: "#16a34a", padding: 10, borderRadius: 8, marginBottom: 4 },
    headerCell: { color: "white", fontWeight: "bold", fontSize: 12, flex: 1, textAlign: "center" },
    row: { flexDirection: "row", backgroundColor: "white", padding: 10, marginBottom: 2, borderRadius: 6 },
    cell: { fontSize: 13, color: "#374151" },
});

export default LeaderboardScreen;