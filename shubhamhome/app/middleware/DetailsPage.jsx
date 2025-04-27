import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Share,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";

const DEFAULT_IMAGE = "https://via.placeholder.com/400x200";

export default function DetailsScreen() {
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // Track saved state
  const { id, userId } = useLocalSearchParams(); // Get both id and userId
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const images = propertyData?.images || [];
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch property details
        const response = await axios.get(
          `http://192.168.154.67:3000/admin/${id}`
        );
        
        // Get owner details using the property's userId
        const ownerResponse = await axios.get(
          `http://192.168.154.67:3000/users/${response.data.userId}`
        );

        // Combine property and owner data
        setPropertyData({
          ...response.data,
          ownerPhone: ownerResponse.data.number, // Changed from phone to number
          ownerName: ownerResponse.data.name
        });

        // Check saved status
        const savedResponse = await axios.get(
          `http://192.168.154.67:3000/users/${userId}/saved`
        );
        const savedPropertyIds = savedResponse.data.map(property => property._id);
        setIsSaved(savedPropertyIds.includes(id));
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId]);

  const handleBookToken = () => {
    Alert.alert(
      "Book Token",
      "Property Book Successfully .",
      [{ text: "OK" }]
    );
  };

  const handleWhatsApp = () => {
    if (!propertyData?.ownerPhone) {
      Alert.alert("Error", "Owner contact not available");
      return;
    }
  
    const message = encodeURIComponent(
      `Hi ${propertyData.ownerName},\n\n` +
      `I am interested in your property:\n` +
      `🏠 ${propertyData.title}\n` +
      `📍 ${propertyData.location}\n` +
      `💰 Rs. ${propertyData.price}\n\n` +
      `I would like to view and discuss the property details.\n` +
      `Looking forward to your response.\n\n` +
      `Thank you!`
    );
  
    const phoneNumber = propertyData.ownerPhone.replace(/[^\d]/g, '');
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
  
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (!supported) {
          Alert.alert("Error", "WhatsApp is not installed");
          return;
        }
        return Linking.openURL(whatsappUrl);
      })
      .catch(error => {
        console.error("WhatsApp error:", error);
        Alert.alert("Error", "Failed to open WhatsApp");
      });
  };

  const handleShare = async () => {
    try {
      const shareMessage = `
🏠 ${propertyData?.title}
💰 Rs. ${propertyData?.price}
📍 ${propertyData?.location}

🛏 ${propertyData?.bedroom} Bedrooms
🚽 ${propertyData?.bathroom} Bathrooms
📐 ${propertyData?.sqft} Sq Ft

Key Features:
${propertyData?.keyFeatures?.join('\n')}

Interested? Contact us for more details!
    `;

      await Share.share({
        message: shareMessage,
        title: 'Property Details',
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share property.");
    }
  };

  const handleSave = async () => {
    try {
      // Toggle the saved state
      setIsSaved(!isSaved);

      if (!isSaved) {
        // Save to backend
        console.log("Saving property to backend...");
        await axios.post(`http://192.168.154.67:3000/users/${userId}/saved/${id}`);
      } else {
        // Remove from backend
        console.log("Removing property from backend...");
        await axios.delete(`http://192.168.154.67:3000/users/${userId}/saved/${id}`);
      }
    } catch (error) {
      console.error("Error saving/unsaving property:", error);
      Alert.alert("Error", "Failed to save/unsave property.");
      setIsSaved(!isSaved); // Revert state on error
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!propertyData) {
    return (
      <View style={styles.centeredContainer}>
        <Text>No property data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Details</Text>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={handleSave} style={styles.headerIcon}>
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color={isSaved ? "red" : "#000"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerIcon}>
              <Ionicons
                name="share-social-outline"
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Property Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: !imageError 
                ? propertyData?.images?.[currentImageIndex]?.path || DEFAULT_IMAGE 
                : DEFAULT_IMAGE
            }}
            style={styles.propertyImage}
            onError={() => setImageError(true)}
            resizeMode="contain"
          />
          
          {propertyData?.images?.length > 1 && (
            <>
              <TouchableOpacity 
                style={[styles.navButton, styles.leftButton]}
                onPress={() => setCurrentImageIndex(prev => 
                  prev === 0 ? propertyData.images.length - 1 : prev - 1
                )}
              >
                <Ionicons name="chevron-back" size={28} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, styles.rightButton]}
                onPress={() => setCurrentImageIndex(prev => 
                  prev === propertyData.images.length - 1 ? 0 : prev + 1
                )}
              >
                <Ionicons name="chevron-forward" size={28} color="white" />
              </TouchableOpacity>

              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {propertyData.images.length}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Property Info Card */}
        <View style={styles.card}>
          <Text style={styles.tag}>{propertyData.type}</Text>
          <Text style={styles.dateText}>{propertyData.category}</Text>
          <Text style={styles.title}>{propertyData.title}</Text>
          <Text style={styles.price}>Rs. {propertyData.price}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={18} color="#6A5AE0" />
            {propertyData.location}
          </Text>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            {[
              { icon: "bed-outline", label: `${propertyData.bedroom} Bedroom` },
              {
                icon: "water-outline",
                label: `${propertyData.bathroom} Bathroom`,
              },
              {
                icon: "kitchen",
                label: `${propertyData.kitchen} Kitchen`,
                iconSet: MaterialIcons,
              },
              { icon: "layers-outline", label: `${propertyData.floor} Floor` },
              {
                icon: "home-outline",
                label: `${propertyData.balcony} Balcony`,
              },
              { icon: "expand-outline", label: `${propertyData.sqft} Sq Ft` },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                {feature.iconSet ? (
                  <feature.iconSet
                    name={feature.icon}
                    size={22}
                    color="#6A5AE0"
                  />
                ) : (
                  <Ionicons name={feature.icon} size={22} color="#6A5AE0" />
                )}
                <Text style={styles.featureText}>{feature.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Specification Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <Text style={styles.aboutText}>{propertyData.specifications}</Text>
        </View>

        {/* Key Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          {propertyData.keyFeatures?.map((feature, index) => (
            <Text key={index} style={styles.listItem}>
              • {feature}
            </Text>
          ))}
        </View>

        {/* Amenities Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          {propertyData.amenities?.map((amenity, index) => (
            <Text key={index} style={styles.listItem}>
              • {amenity}
            </Text>
          ))}
        </View>

        {/* Nearby Places Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nearby Places</Text>
          {propertyData.nearby?.map((place, index) => (
            <Text key={index} style={styles.listItem}>
              • {place}
            </Text>
          ))}
        </View>

        {/* Owner Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Owner Details</Text>
          <View style={styles.ownerInfo}>
            <Ionicons name="person-circle-outline" size={24} color="#6A5AE0" />
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>{propertyData.ownerName}</Text>
              <Text style={styles.ownerContact}>{propertyData.ownerPhone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookToken}>
          <MaterialIcons name="token" size={24} color="yellow" />
          <Text style={styles.buttonText}>Book Token</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  scrollContainer: { paddingBottom: 100 },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconRow: { flexDirection: "row" },
  imageContainer: { position: "relative", width: '100%', height: 250, backgroundColor: '#fff' },
  propertyImage: { width: "100%", height: "100%", resizeMode: 'cover' },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#6A5AE0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  badgeText: { color: "#fff", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  tag: { fontSize: 14, color: "#6A5AE0", fontWeight: "bold" },
  dateText: { fontSize: 12, color: "#999", marginTop: 5 },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  price: { fontSize: 20, color: "#6A5AE0", fontWeight: "bold" },
  location: { fontSize: 14, color: "#555", marginVertical: 10 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  featureItem: { flexDirection: "row", alignItems: "center", width: "48%", marginBottom: 15 },
  featureText: { marginLeft: 10, fontSize: 14, color: "#555" },
  sectionContainer: { padding: 20, backgroundColor: "#fff", margin: 10, borderRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  aboutText: { fontSize: 14, color: "#555" },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 20,
  },
  bookButton: {
    flex: 1,
    backgroundColor: "#6A5AE0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    marginLeft: 8, 
    fontSize: 16 
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: { left: 10 },
  rightButton: { right: 10 },
  navButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 15,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 14,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ownerDetails: {
    marginLeft: 10,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ownerContact: {
    fontSize: 14,
    color: '#555',
  },
});
