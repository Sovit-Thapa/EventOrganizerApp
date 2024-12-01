import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState(new Date(event.date)); // Convert date string to Date object
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set the navbar title to "Edit Event"
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Edit Event',
    });
  }, [navigation]);

  const handleSave = async () => {
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        name,
        description,
        location,
        date: formatDate(date), // Save as formatted string
      });
      Alert.alert('Success', 'Event updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Error updating event: ' + error.message);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Event</Text>

      {/* Event Name */}
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={name}
        onChangeText={setName}
      />

      {/* Event Description */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />

      {/* Event Location */}
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      {/* Date Picker */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>Event Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"  // Keeps it to just date (day, month, year)
            display="default"  // Default display for most devices
            onChange={onDateChange}
            style={styles.datePicker}
          />
        )}
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e0f7fa', // Light cyan background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#00796b', // Dark teal color
  },
  input: {
    height: 40,
    borderColor: '#00796b', // Dark teal border color
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: '#ffffff', // White background for input
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
  saveButton: {
    backgroundColor: '#00796b',
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

export default EditEventScreen;