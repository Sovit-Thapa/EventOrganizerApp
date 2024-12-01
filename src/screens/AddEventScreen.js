import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../database/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddEventScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add Event',
    });
  }, [navigation]);

  const handleAddEvent = async () => {
    if (!name || !description || !location || !date) {
      Alert.alert('Validation Error', 'All fields are required. Please fill out every field.');
      return;
    }
  
    const formattedDate = date.toISOString().split('T')[0];
  
    try {
      await addDoc(collection(db, 'events'), {
        name,
        description,
        location,
        date: formattedDate,
        creatorId: auth.currentUser?.uid,
        creatorEmail: auth.currentUser?.email,
      });
      Alert.alert('Success', 'Event added successfully!');
      navigation.goBack();
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to add an event.';
      } else if (error.message.includes('auth.currentUser')) {
        errorMessage = 'You must be signed in to add an event.';
      } else {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>Event Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            style={styles.datePicker}
          />
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
        <Text style={styles.buttonText}>Add Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  dateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  datePicker: {
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddEventScreen;
