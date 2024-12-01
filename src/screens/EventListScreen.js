import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc, deleteDoc, addDoc, query, where, getDocs, deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../database/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const EventListScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Event List' });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'events'),
      (querySnapshot) => {
        const eventList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          if (!data.creatorId) {
            throw new Error('Creator ID missing in event document');
          }
          return { id: doc.id, ...data };
        });
        setEvents(eventList);
        setLoading(false);
      },
      (error) => {
        Alert.alert('Error', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribeFavorites = onSnapshot(
      query(collection(db, 'favorites'), where('userId', '==', auth.currentUser.uid)),
      (querySnapshot) => {
        const favoriteIds = new Set(querySnapshot.docs.map((doc) => doc.data().eventId));
        setFavorites(favoriteIds);
      },
      (error) => {
        Alert.alert('Error', error.message);
      }
    );

    return () => unsubscribeFavorites();
  }, [auth.currentUser]);

  const handleDelete = async (eventId, creatorId) => {
    if (auth.currentUser?.uid !== creatorId) {
      Alert.alert('Error', 'You are not authorized to delete this event.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', eventId));
              Alert.alert('Success', 'Event deleted successfully!');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleFavorites = async (eventId) => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to add favorites.');
      return;
    }

    try {
      const favoriteRef = collection(db, 'favorites');
      const q = query(
        favoriteRef,
        where('userId', '==', auth.currentUser?.uid),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const favoriteDoc = querySnapshot.docs[0];
        await firestoreDeleteDoc(favoriteDoc.ref);
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          newFavorites.delete(eventId);
          return newFavorites;
        });
        Alert.alert('Success', 'Event removed from favorites!');
      } else {
        await addDoc(favoriteRef, {
          userId: auth.currentUser?.uid,
          eventId,
        });
        setFavorites((prev) => new Set(prev).add(eventId));
        Alert.alert('Success', 'Event added to favorites!');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.name}</Text>
      <Text style={styles.eventDetails}>{item.description || 'No description provided'}</Text>
      <Text style={styles.eventDetails}>Location: {item.location || 'Not provided'}</Text>
      <Text style={styles.eventDetails}>Date: {item.date || 'Not set'}</Text>
      <View style={styles.buttonsContainer}>
        {auth.currentUser?.uid === item.creatorId && (
          <>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditEvent', { event: item })}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.creatorId)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('EventDetails', { event: item })}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFavorites(item.id)}>
          <Icon
            name={favorites.has(item.id) ? 'heart' : 'heart-o'}
            size={30}
            color={favorites.has(item.id) ? 'red' : 'gray'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading events...</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No events found.</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoritesButton} onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.buttonText}>Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoritesButton} onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.buttonText}>Favorites</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
  eventCard: { marginBottom: 16, padding: 16, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  eventTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  eventDetails: { fontSize: 16, marginBottom: 4, color: '#666' },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4d94ff',
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
  },
  detailsButton: {
    backgroundColor: '#4d94ff',
    padding: 10,
    borderRadius: 5,
  },
  favoriteButton: {
    backgroundColor: '#ffcc00',
    padding: 10,
    borderRadius: 5,
  },
  favoriteButtonActive: {
    backgroundColor: '#ff9900',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    width: 150,
    height: 50,
  },
  favoritesButton: {
    backgroundColor: '#4d94ff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    width: 150,
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default EventListScreen;
