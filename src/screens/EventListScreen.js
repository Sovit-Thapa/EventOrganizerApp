import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../database/firebase';

const EventListScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async (eventId, creatorId) => {
    if (auth.currentUser?.uid !== creatorId) {
      Alert.alert('Error', 'You are not authorized to delete this event.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'events', eventId));
      Alert.alert('Success', 'Event deleted successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      //navigation.replace('SignIn');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleFavorites = () => {
    navigation.navigate('Favorites');
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
          <TouchableOpacity style={styles.favoritesButton} onPress={handleFavorites}>
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
        <TouchableOpacity style={styles.favoritesButton} onPress={handleFavorites}>
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
