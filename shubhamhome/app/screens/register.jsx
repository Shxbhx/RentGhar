import React, { useState } from "react";
import { useRouter } from 'expo-router';
import axios from "axios";
import { Alert, Platform } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [number, setNumber] = useState("");
  const [address, setAddress] = useState("");

  const showAlert = (title, message) => {
    Alert.alert(title, message);
  };

  const handleRegister = async () => {
    // Check empty fields
    if (!name || !email || !password || !number || !address) {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      showAlert("Error", "Please enter a valid email address");
      return;
    }

    // Validate phone number
    if (!/^[0-9]{10}$/.test(number)) {
      showAlert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const userData = {
        name,
        email,
        password,
        number,
        address,
      };
      
      // Replace this with your actual IP address
      const API_URL = Platform.OS === 'android' 
        ? 'http://192.168.154.67:3000/users/add'  // Example IP - use your actual IP
        : 'http://localhost:3000/users/add';

      console.log('Attempting to connect to:', API_URL);
      
      const response = await axios.post(API_URL, userData);
      
      console.log('Response received:', response.data);
      showAlert(
        "Registration successful", 
        "You have been registered successfully"
      );
      
      // Clear form fields after successful registration
      setName("");
      setEmail("");
      setPassword("");
      setNumber("");
      setAddress("");
      
      // Navigate to login page
      router.replace('/screens/login');
    } catch (error) {
      console.error('Registration error:', error);
      showAlert(
        "Registration failed", 
        error.response?.data?.message || 
        "Network error. Please check your connection and try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("./../../assets/images/logoo.png")} // Replace with your logo URL
          style={styles.logo}
        />
        <Text style={styles.appName}>ApnaGhar</Text>
        <Text style={styles.tagline}>Find Your Dream House</Text>

      </View>

      {/* Registration Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Register</Text>

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
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextInput 
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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
        />

        <TouchableOpacity style={styles.registerButton} 
        onPress={handleRegister} 
        type="submit">
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        {/* Already have an account */}
          <Text style={styles.footerText}>
            Already have an account? <TouchableOpacity
            onPress={() => router.replace('/screens/login')}>
                  <Text style={styles.linkText}>Log In</Text> 
              </TouchableOpacity>
          </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#D6E4FF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  tagline: {
    fontSize: 14,
    color: "#666",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  registerButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 5,
  },
  socialButtonText: {
    fontWeight: "bold",
    color: "#666",
  },
  footerText: {
    textAlign: "center",
    color: "#666",
  },
  linkText: {
    color: "#6A5AE0",
    fontWeight: "bold",
  },
});
