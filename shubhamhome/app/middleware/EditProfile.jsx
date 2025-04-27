import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { showAlert } from '../../utils/alert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../authContext";

const EditProfile = () => {
  const router = useRouter();
  const { userId: authUserId } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Get userId from AsyncStorage
        const storedUserId = await AsyncStorage.getItem('userId');
        
        if (!storedUserId) {
          showAlert("Error", "User not logged in");
          router.replace('/screens/login');
          return;
        }

        const response = await axios.get(`http://192.168.154.67:3000/users/${storedUserId}`);
        const userData = response.data;
        
        if (!userData) {
          throw new Error('No user data found');
        }

        setName(userData.name || '');
        setEmail(userData.email || '');
        setNumber(userData.number || '');
        setAddress(userData.address || '');

      } catch (error) {
        console.error("Error fetching user data:", error);
        showAlert("Error", "Failed to fetch user data");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      
      if (!storedUserId) {
        showAlert("Error", "User not logged in");
        return;
      }

      // Validate inputs
      if (!name || !email || !number || !address) {
        showAlert("Error", "Please fill all fields");
        return;
      }

      // Validate phone number
      if (!/^[0-9]{10}$/.test(number)) {
        showAlert("Error", "Please enter a valid 10-digit number");
        return;
      }

      // Validate email
      if (!/\S+@\S+\.\S+/.test(email)) {
        showAlert("Error", "Please enter a valid email address");
        return;
      }

      const updatedData = {
        name,
        email,
        number,
        address
      };

      const response = await axios.put(
        `http://192.168.154.67:3000/users/${storedUserId}`, 
        updatedData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        showAlert("Success", "Profile updated successfully");
        router.back();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Error", error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>ApnaGhar</Text>
        <Text style={styles.tagline}>Edit Your Profile</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={number}
          onChangeText={setNumber}
          keyboardType="numeric"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#D6E4FF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#6A5AE0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditProfile;