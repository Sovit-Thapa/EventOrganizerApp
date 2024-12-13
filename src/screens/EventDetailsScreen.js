import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebase';

const EventDetailsScreen = ({ route }) => {
  const { event } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Event Details',
    });
  }, [navigation]);

  const handleDelete = async () => {
    if (auth.currentUser.uid !== event.creatorId) {
      Alert.alert('Error', 'You are not authorized to delete this event.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', event.id));
              Alert.alert('Success', 'Event deleted successfully!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Error deleting event: ' + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Description:</Text>
        <Text style={styles.description}>{event.description || 'No description provided'}</Text>

        <Text style={styles.detailTitle}>Location:</Text>
        <Text style={styles.details}>{event.location || 'Not provided'}</Text>

        <Text style={styles.detailTitle}>Date:</Text>
        <Text style={styles.details}>{event.date || 'Not set'}</Text>

        <Text style={styles.detailTitle}>Created By:</Text>
        <Text style={styles.details}>{event.creatorEmail || 'No email provided'}</Text>
      </View>

      {auth.currentUser.uid === event.creatorId && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete Event</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#e0f7fa', 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#00796b', 
    textAlign: 'left', 
  },
  detailsContainer: {
    marginTop: 2,
    paddingBottom: 16,
    backgroundColor: '#ffffff', 
    borderRadius: 8,
    padding: 10,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d40', 
    marginTop: 12,
    textAlign: 'left', 
  },
  description: {
    fontSize: 16,
    color: '#00796b', 
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'left', 
  },
  details: {
    fontSize: 16,
    color: '#004d40', 
    textAlign: 'left', 
  },
  deleteButton: {
    backgroundColor: '#d32f2f', 
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
    width: 200,
    alignSelf: 'center', 
  },
  buttonText: {
    color: '#ffffff', 
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventDetailsScreen;