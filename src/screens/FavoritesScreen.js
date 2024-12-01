import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';

const FavoritesScreen = () => {
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      Alert.alert('Error', 'You must be logged in to view your favorites.');
      return;
    }

    const unsubscribeFavorites = onSnapshot(
      query(collection(db, 'favorites'), where('userId', '==', auth.currentUser.uid)),
      async (querySnapshot) => {
        const favoriteEventIds = querySnapshot.docs.map((doc) => doc.data().eventId);

        if (favoriteEventIds.length === 0) {
          setFavoriteEvents([]);
          setLoading(false);
        } else {
          try {
            const events = [];
            for (const eventId of favoriteEventIds) {
              const eventDocRef = doc(db, 'events', eventId);
              const eventDoc = await getDoc(eventDocRef);
              
              if (eventDoc.exists()) {
                events.push({ id: eventDoc.id, ...eventDoc.data() });
              }
            }

            setFavoriteEvents(events);
            setLoading(false);
          } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message);
          }
        }
      },
      (error) => {
        setLoading(false);
        Alert.alert('Error', error.message);
      }
    );

    return () => unsubscribeFavorites();
  }, [auth.currentUser]);

  const confirmRemoveFavorite = (eventId) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this event from your favorites?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => removeFavorite(eventId),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const removeFavorite = async (eventId) => {
    try {
      const favoriteDoc = await getDocs(
        query(collection(db, 'favorites'), where('userId', '==', auth.currentUser.uid), where('eventId', '==', eventId))
      );

      favoriteDoc.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setFavoriteEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading your favorite events...</Text>
      </View>
    );
  }

  if (favoriteEvents.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No favorite events found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteEvents}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.name}</Text>
            <Text style={styles.eventDetails}>{item.description || 'No description provided'}</Text>
            <Text style={styles.eventDetails}>Location: {item.location || 'Not provided'}</Text>
            <Text style={styles.eventDetails}>Date: {item.date || 'Not set'}</Text>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate('EventDetails', { event: item })}
            >
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => confirmRemoveFavorite(item.id)}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
  eventCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  eventDetails: { fontSize: 16, marginBottom: 4, color: '#666' },
  detailsButton: {
    backgroundColor: '#4d94ff',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FavoritesScreen;