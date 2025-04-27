import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../authContext";
import axios from "axios";
import AddProperty from "./../property/AddProperty";
import PropertyList from "./../property/PropertyList";

const App = () => {
  const router = useRouter();
  const { userId } = useAuth(); // Get userId from AuthContext
  const [screen, setScreen] = useState('Home'); // State to manage the current screen
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!userId) {
        router.replace('/screens/login');
        return;
      }

      try {
        const response = await axios.get(`http://192.168.154.67:3000/admin`);
        setProperties(response.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
        Alert.alert("Error", "Failed to fetch properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [userId]);

  // Function to handle navigation
  const navigate = (screenName) => {
    setScreen(screenName);
  };

  return (
    <View style={styles.appContainer}>
      {screen === 'AddProperty' ? (
        <AddProperty navigate={navigate} />
      ) : (
        <PropertyList navigate={navigate} />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Go to Add Property" onPress={() => navigate('AddProperty')} />
        <Button title="Go to Property List" onPress={() => navigate('PropertyList')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default App;