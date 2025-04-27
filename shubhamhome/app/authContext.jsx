import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const storedUserId = await AsyncStorage.getItem('userId');
            
            if (!token || !storedUserId) {
                setIsLoading(false);
                return;
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUserId(storedUserId);
            console.log("Auth restored:", { userId: storedUserId });
            
            // Delay navigation to ensure layout is mounted
            setTimeout(() => {
                router.replace('/(tabs)/home');
            }, 0);
        } catch (error) {
            console.error("Auth check error:", error);
            setUserId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setIsLoading(true);
            const response = await axios.post('http://192.168.154.67:3000/auth/login', {
                email,
                password
            });

            if (response.data?.token && response.data?.user?._id) {
                await AsyncStorage.setItem('userToken', response.data.token);
                await AsyncStorage.setItem('userId', response.data.user._id.toString());
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                setUserId(response.data.user._id);
                
                // Delay navigation to ensure layout is mounted
                setTimeout(() => {
                    router.replace('/(tabs)/home');
                }, 0);
            }
        } catch (error) {
            console.error("Login error:", error);
            Alert.alert("Login Failed", "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['userToken', 'userId']);
            delete axios.defaults.headers.common['Authorization'];
            setUserId(null);
            router.replace('/screens/login');
        } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
        }
    };

    const value = {
        userId,
        isLoading,
        login,
        logout,
        isAuthenticated: !!userId
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthProvider;