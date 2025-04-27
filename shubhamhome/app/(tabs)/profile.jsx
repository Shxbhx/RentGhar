import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Share } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "../authContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../utils/alert';

const Profile = () => {
    const router = useRouter();
    const { userId, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const storedUserId = await AsyncStorage.getItem('userId');
                console.log("Fetching profile for user:", storedUserId);

                if (!storedUserId) {
                    router.replace('/screens/login');
                    return;
                }

                const response = await axios.get(`http://192.168.154.67:3000/users/${storedUserId}`);
                console.log("Profile data:", response.data);
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                Alert.alert("Error", "Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        showAlert(
            "Logout", 
            "Are you sure you want to logout?",
            [
                { 
                    text: "Cancel", 
                    style: "cancel" 
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('userId');
                            await AsyncStorage.removeItem('userToken');
                            logout();
                        } catch (error) {
                            console.error("Logout error:", error);
                            showAlert("Error", "Failed to logout");
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: 'Check out ApnaGhar - The best app to find your dream home! ' +
                    'Download now: https://apnaghar.com/download',
                title: 'Share ApnaGhar App'
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    // shared
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
                console.log('Share dismissed');
            }
        } catch (error) {
            showAlert('Error', 'Failed to share the app');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#6A5AE0" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>No profile data available</Text>
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
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <Image 
                    source={{ 
                        uri: user.profilePic 
                            ? `http://192.168.154.67:3000/uploads/${user.profilePic}`
                            : "https://cdn.pixabay.com/photo/2021/05/04/13/29/portrait-6228705_1280.jpg"
                    }} 
                    style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{user.name}</Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                    <Text style={styles.profilePhone}>{user.number}</Text>
                    <Text style={styles.profileLocation}>{user.address}</Text>
                </View>

                <TouchableOpacity style={styles.editButton} onPress={() => router.push('/middleware/EditProfile')}>
                    <FontAwesome name="edit" size={24} color="#6A5AE0" />
                </TouchableOpacity>
            </View>

            {/* Profile Options */}
            <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/(tabs)/saved')}>
                <Ionicons name="heart-outline" size={24} color="#6A5AE0" />
                <Text style={styles.optionText}>Saved Properties</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={() => console.log("Navigate to Bookings")}>
                <Ionicons name="calendar-outline" size={24} color="#6A5AE0" />
                <Text style={styles.optionText}>Bookings</Text>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            {/* Share & Logout Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.shareButton} 
                    onPress={handleShare}
                >
                    <Ionicons name="share-social-outline" size={24} color="white" />
                    <Text style={styles.shareText}>Share App</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="white" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f8f8", // Light background
        alignItems: "center", // Center content horizontally
    },
    centeredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    profileHeader: {
        marginTop: 90,
        flexDirection: "column", // Align items vertically
        alignItems: "center", // Center items horizontally
        marginBottom: 30,
        backgroundColor: "#fff", // White card background
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        width: "90%", // Adjust width as needed
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
    },
    profileInfo: {
        alignItems: "center", // Center text horizontally
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 16,
        color: "#777",
        marginBottom: 5,
    },
    profilePhone: {
        fontSize: 16,
        color: "#777",
        marginBottom: 5,
    },
    profileLocation: {
        fontSize: 16,
        color: "#777",
    },
    editButton: {
        padding: 10,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff", // White card background
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        width: "90%", // Adjust width as needed
    },
    optionText: {
        flex: 1,
        fontSize: 18,
        fontWeight: "500",
        color: "#333",
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        width: "90%", // Adjust width as needed
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#6A5AE0",
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
        justifyContent: "center",
        elevation: 3, // Add shadow for Android
        shadowColor: "#000", // Add shadow for iOS
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    shareText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF3B30",
        padding: 15,
        borderRadius: 10,
        flex: 1,
    },
    logoutText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    loginButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#6A5AE0",
        borderRadius: 5,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
    },
});

export default Profile;

