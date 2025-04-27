import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const DEFAULT_IMAGE = "https://example.com/default-image.jpg";

const PropertyCard = ({ property }) => {
    const imageUri = property.images?.[0]?.uri || DEFAULT_IMAGE;

    return (
        <View style={styles.card}>
            <Image 
                source={{ uri: imageUri }}
                style={styles.propertyImage}
                resizeMode="cover"
            />
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.price}>{property.price}</Text>
            <Text style={styles.location}>{property.location}</Text>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 10 },
    propertyImage: { width: "100%", height: 150, borderRadius: 10 },
    title: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
    price: { fontSize: 14, color: "#6A5ACD", marginTop: 3 },
    location: { fontSize: 12, color: "gray", marginTop: 2 },
    button: { marginTop: 8, backgroundColor: "#6A5ACD", padding: 8, borderRadius: 5 },
    buttonText: { color: "white", textAlign: "center" },
});

export default PropertyCard;
