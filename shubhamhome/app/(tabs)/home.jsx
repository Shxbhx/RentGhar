import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useAuth } from '../authContext';

const DEFAULT_IMAGE = "https://via.placeholder.com/400x200"; // Define default image

const HomeScreen = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [user, setUser] = useState(null); // Initialize user to null
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    priceRange: {
      min: '',
      max: ''
    },
    bhk: ''  // Add BHK filter
  });
  const router = useRouter();
  const { userId } = useAuth(); // Get userId from AuthContext instead of params

  const fetchProperties = async (currentFilters = filters) => {
    try {
      setRefreshing(true);
      const queryParams = new URLSearchParams();
      
      // Only add parameters if they have actual values
      if (currentFilters.category) {
        queryParams.append('category', currentFilters.category);
      }
      
      if (currentFilters.location) {
        queryParams.append('location', currentFilters.location);
      }
      
      // Only add price filters if they have actual values
      if (currentFilters.priceRange?.min) {
        queryParams.append('minPrice', currentFilters.priceRange.min);
      }
      
      if (currentFilters.priceRange?.max) {
        queryParams.append('maxPrice', currentFilters.priceRange.max);
      }

      console.log("Fetching with params:", queryParams.toString());
      
      const response = await axios.get(
        `http://192.168.154.67:3000/admin?${queryParams}`
      );

      const formattedProperties = response.data.map(property => ({
        ...property,
        imageUri: property.images?.[0]?.path || DEFAULT_IMAGE
      }));

      setProperties(formattedProperties);
      applyFilters(formattedProperties); // Apply filters to new data
      
    } catch (error) {
      console.error("Error fetching properties:", error);
      Alert.alert("Error", "Failed to fetch properties");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://192.168.154.67:3000/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user data");
      setUser({ name: "User", address: "Unknown" }); // Fallback to default user
    }
  };

  useEffect(() => {
    fetchProperties();
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, filters]);

  const applyFilters = (propertiesToFilter = properties) => {
    let filtered = [...propertiesToFilter];

    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(property => 
        property.type === selectedCategory
      );
    }

    // Apply BHK filter
    if (filters.bhk) {
      filtered = filtered.filter(property => 
        property.category === filters.bhk
      );
    }

    // Apply price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      filtered = filtered.filter(property => {
        const propertyPrice = parseInt(property.price) || 0;
        const minPrice = parseInt(filters.priceRange.min) || 0;
        const maxPrice = parseInt(filters.priceRange.max) || Infinity;
        return propertyPrice >= minPrice && propertyPrice <= maxPrice;
      });
    }

    setFilteredProperties(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties(selectedCategory).then(() => setRefreshing(false));
  };

  const goToDetailsPage = (propertyId) => {
    if (userId) {
      router.push({
        pathname: '/middleware/DetailsPage',
        params: {
          id: propertyId,
          userId: userId,
        }
      });
    } else {
      Alert.alert("Error", "User ID not available");
    }
  };

  // Simplified filter handler
  const handleFilter = (newFilters) => {
    console.log("Received filters:", newFilters);
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  const openFilter = () => {
    router.push({
      pathname: "/middleware/Filter",
      params: {
        onApplyFilter: JSON.stringify(handleFilter),
        currentCategory: filters.category,
        currentLocation: filters.location,
        currentMinPrice: filters.priceRange?.min,
        currentMaxPrice: filters.priceRange?.max
      }
    });
  };

  const PropertyCard = ({ property, onPress }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <TouchableOpacity style={styles.propertyCard} onPress={onPress}>
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: !imageError ? property.images?.[0]?.path || DEFAULT_IMAGE : DEFAULT_IMAGE 
            }}
            style={styles.propertyImage}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
          <View style={styles.tagContainer}>
            <Text style={styles.typeTag}>{property.type}</Text>
            <View style={styles.imageCountContainer}>
              <Ionicons name="camera" size={12} color="white" />
              <Text style={styles.imageCount}> {property.images?.length || 0}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.propertyDetails}>
          <View style={styles.priceRow}>
            <Text style={styles.propertyPrice}>₹{property.price || '0'}</Text>
            <Text style={styles.category}>{property.category}</Text>
          </View>
          
          <Text numberOfLines={1} style={styles.propertyTitle}>
            {property.title || 'No Title'}
          </Text>
          
          <View style={styles.locationRow}>
            <MaterialIcons name="location-pin" size={14} color="#666" />
            <Text numberOfLines={1} style={styles.propertyLocation}>
              {property.location || 'No Location'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    applyFilters(properties); // Apply filters with new category
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user ? user.name : "User"}</Text>
          <Text style={styles.location}>
            <FontAwesome6 name="location-pin-lock" size={18} color="black" />{" "}
            {user ? user.address : "Unknown"}
          </Text>
        </View>
        <Image
          source={{
            uri:
              "https://cdn.pixabay.com/photo/2021/05/04/13/29/portrait-6228705_1280.jpg",
          }}
          style={styles.profileImage}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search properties..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            applyFilters();
          }}
        />
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={openFilter}
        >
          <Ionicons
            name="options"
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Property Types */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          { [
            { id: 'All', icon: 'home' },
            { id: 'Residential', icon: 'home-outline' },
            { id: 'Commercial', icon: 'business-outline' },
            { id: 'Mixed-Use Property', icon: 'apps-outline' } // Changed from 'building' to 'apps-outline'
          ].map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton,
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={24}
                color={selectedCategory === category.id ? "#fff" : "#666"}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Properties List */}
      {filteredProperties.length > 0 ? (
        filteredProperties.map((property, index) => (
          <PropertyCard
            key={property._id || index}
            property={property}
            onPress={() => goToDetailsPage(property._id)}
          />
        ))
      ) : (
        <View style={styles.noPropertiesContainer}>
          <Text style={styles.noPropertiesText}>No properties found</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#333" },
  location: { color: "#666", fontSize: 16, marginTop: 2 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filterButton: {
    backgroundColor: "#6f42c1",
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryContainer: { flexDirection: "row", marginBottom: 16 },
  categoryButton: {
    backgroundColor: "#e9ecef",
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: "#6f42c1",
  },
  categoryText: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#333" 
  },
  selectedCategoryText: {
    color: "#fff"  // White text for selected category
  },
  propertyCard: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    marginHorizontal: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    width: '100%',
  },
  
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160, // Reduced height
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  
  propertyImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0', // Placeholder color while loading
  },
  
  tagContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  typeTag: {
    backgroundColor: 'rgba(106, 90, 224, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  imageCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  imageCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  propertyDetails: {
    padding: 12,
  },
  
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A5AE0',
  },
  
  category: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  propertyLocation: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  noPropertiesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noPropertiesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 12,
  },
  categorySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    paddingHorizontal: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedCategoryButton: {
    backgroundColor: '#6A5AE0',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
});

export default HomeScreen;
