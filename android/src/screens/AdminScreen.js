import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PlayerAdminScreen from './PlayerAdminScreen';
import MatchAdminScreen from './MatchAdminScreen';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('players');

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'players' && styles.activeTab]}
          onPress={() => setActiveTab('players')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'players' && styles.activeTabText,
            ]}
          >
            Upravljanje Igračima
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'matches' && styles.activeTabText,
            ]}
          >
            Upravljanje Terminima
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'players' ? (
        <PlayerAdminScreen />
      ) : (
        <MatchAdminScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#16a34a',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#16a34a',
  },
});
