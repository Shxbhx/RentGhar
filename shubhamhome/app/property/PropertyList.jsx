import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { useAuth } from "../authContext";
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_IMAGE = "https://via.placeholder.com/400x200";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    fetchProperties();
  }, [userId]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Use the actual userId from useAuth
      if (!userId) {
        console.log('No userId found, returning early');
        setLoading(false);
        return;
      }

      console.log("Fetching properties for userId:", userId);

      const response = await axios.get(`http://192.168.154.67:3000/admin/user/${userId}`);
      console.log("Raw API Response:", response.data);

      if (Array.isArray(response.data)) {
        setProperties(response.data);
        console.log(`Found ${response.data.length} properties`);
      } else {
        console.error("Invalid data format received:", response.data);
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error?.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  }, []);

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      // For web browsers
      if (window.confirm('Are you sure you want to delete this property?')) {
        deleteProperty(id);
      }
    } else {
      // For mobile devices
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this property?",
        [
          { 
            text: "Cancel", 
            style: "cancel" 
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteProperty(id)
          }
        ]
      );
    }
  };

  const deleteProperty = async (id) => {
    try {
      await axios.delete(`http://192.168.154.67:3000/admin/del/${id}`);
      
      if (Platform.OS === 'web') {
        window.alert('Property deleted successfully');
      } else {
        Alert.alert('Success', 'Property deleted successfully');
      }
      
      fetchProperties(); // Refresh the list
    } catch (error) {
      console.error("Error deleting property:", error);
      if (Platform.OS === 'web') {
        window.alert('Failed to delete property');
      } else {
        Alert.alert('Error', 'Failed to delete property');
      }
    }
  };

  const handleEdit = (id) => {
    router.push({
      pathname: "/property/EditProperty",
      params: { id }
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: item.images?.[0]?.path || DEFAULT_IMAGE
        }}
        style={styles.image}
      />
      <View style={styles.propertyDetails}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEdit(item._id)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No properties found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
      </View>
      <FlatList
        data={properties}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6A5AE0"]}
            tintColor="#6A5AE0"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500'
  },
  listContainer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    width: '100%'
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 2, // Added horizontal margin
    shadowColor: "#000",
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    width: '98%', // Added specific width
    alignSelf: 'center' // Center the card
  },
  image: {
    width: '100%',
    height: 200, // Slightly reduced height
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover'
  },
  propertyDetails: {
    padding: 16,
    width: '100%' // Ensure full width
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: '#212529',
    letterSpacing: 0.3
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: "#6A5AE0",
    marginBottom: 8,
    letterSpacing: 0.5
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Changed to space-between
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5",
    marginTop: 6,
    width: '100%' // Ensure full width
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25, // Increased horizontal padding
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120, // Increased minimum width
    flex: 0.48 // Take up almost half the space each
  },
  editButton: {
    backgroundColor: "#6A5AE0",
    shadowColor: "#6A5AE0",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    shadowColor: "#dc3545",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  propertyInfoText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 4
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f5',
    marginVertical: 12
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529'
  }
});

export default PropertyList;