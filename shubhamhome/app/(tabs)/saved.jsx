import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useAuth } from "../authContext";
import { showAlert } from '../../utils/alert';

const DEFAULT_IMAGE = "https://via.placeholder.com/150";

const PropertyCard = ({ property }) => {
    const imageUri = property.images?.[0]?.uri || DEFAULT_IMAGE;
    
    return (
        <View style={styles.card}>
            <Image 
                source={{ uri: imageUri }}
                style={styles.propertyImage}
                resizeMode="cover"
            />
            {/* Rest of card content */}
        </View>
    );
};

export default function Saved() {
    const [savedHomes, setSavedHomes] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { userId } = useAuth();
    const router = useRouter();

    const fetchSavedHomes = async () => {
        if (!userId) return;
        
        try {
            console.log("Fetching saved homes for user:", userId);
            const response = await axios.get(`http://192.168.154.67:3000/users/${userId}/saved`);
            console.log("API Response Data:", response.data);

            const formattedData = response.data.map(item => ({
                _id: item._id,
                image: item.images?.[0]?.path || DEFAULT_IMAGE,
                title: item.title,
                price: item.price,
                location: item.location,
            }));
            
            setSavedHomes(formattedData);
        } catch (error) {
            console.error("Error fetching saved homes:", error);
            Alert.alert("Error", "Failed to fetch saved properties");
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchSavedHomes().finally(() => setRefreshing(false));
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            router.replace('/screens/login');
        } else {
            fetchSavedHomes();
        }
    }, [userId]);

    const removeSavedProperty = async (propertyId) => {
        showAlert(
            "Remove Property",
            "Are you sure you want to remove this property from saved?",
            [
              { 
                text: "Cancel", 
                style: "cancel" 
              },
              {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                  try {
                    await axios.delete(`http://192.168.154.67:3000/users/${userId}/saved/${propertyId}`);
                    fetchSavedHomes();
                    showAlert("Success", "Property removed successfully");
                  } catch (error) {
                    console.error('Error removing property:', error);
                    showAlert("Error", "Failed to remove property");
                  }
                }
              }
            ]
          );
    };

    if (!userId) {
        return (
            <View style={styles.container}>
                <Text style={styles.noSaved}>Please log in to view saved properties.</Text>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.replace('/screens/login')}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Saved Homes</Text>
            <FlatList
                data={savedHomes}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.card}
                        onPress={() => router.push({
                            pathname: '/middleware/DetailsPage',
                            params: { id: item._id, userId }
                        })}
                    >
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.price}>₹{item.price}</Text>
                            <Text style={styles.location}>{item.location}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => removeSavedProperty(item._id)} 
                            style={styles.unlikeButton}
                        >
                            <Ionicons name="heart-dislike-outline" size={24} color="red" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <Text style={styles.noSaved}>No saved properties yet.</Text>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20
    },
    noSaved: {
        textAlign: "center",
        fontSize: 16,
        color: "gray",
        marginTop: 20
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15
    },
    info: {
        flex: 1,
        marginRight: 10
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5
    },
    price: {
        fontSize: 15,
        color: "#6A5AE0",
        fontWeight: "600",
        marginBottom: 5
    },
    location: {
        fontSize: 14,
        color: "gray"
    },
    unlikeButton: {
        padding: 10
    },
    loginButton: {
        backgroundColor: "#6A5AE0",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20
    },
    loginButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600"
    }
});

