import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const favoriteEventIds = userDoc.data()?.favorites || [];
      
      // Fetch the events based on favoriteEventIds
      const eventPromises = favoriteEventIds.map(async (eventId) => {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        return { id: eventDoc.id, ...eventDoc.data() };
      });

      const events = await Promise.all(eventPromises);
      setFavorites(events);
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  const renderFavoriteEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.name}</Text>
      <Text style={styles.eventDetails}>{item.description || 'No description provided'}</Text>
      <Text style={styles.eventDetails}>Location: {item.location || 'Not provided'}</Text>
      <Text style={styles.eventDetails}>Date: {item.date || 'Not set'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4d94ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteEvent}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
  eventCard: { marginBottom: 16, padding: 16, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  eventTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  eventDetails: { fontSize: 16, marginBottom: 4, color: '#666' },
});

export default FavoritesScreen;