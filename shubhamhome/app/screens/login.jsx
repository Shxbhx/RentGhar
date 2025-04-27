import React, { useState } from "react";
import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../authContext";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Remove navigation from here as it's handled in authContext
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed", 
        "Please check your credentials and try again"
      );
    } finally {
      setIsLoading(false);
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
        <Text style={styles.title}>ApnaGhar</Text>
        <Text style={styles.subtitle}>Find Your Dream House</Text>
      </View>

      {/* Login Form */}
      <View style={styles.loginForm}>
        <Text style={styles.loginText}>Login</Text>
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/screens/register")}
          >
            <Text style={styles.registerLink}>Create now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1c1c1e",
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6e73",
  },
  loginForm: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loginText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1c1e",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  forgotText: {
    color: "#007aff",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#1c1c1e",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    marginVertical: 20,
    color: "#6e6e73",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  socialButtonText: {
    color: "#1c1c1e",
    fontSize: 16,
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6e6e73",
  },
  createNowText: {
    color: "#007aff",
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#666",
    fontSize: 16,
  },
  registerLink: {
    color: "#6A5AE0",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
