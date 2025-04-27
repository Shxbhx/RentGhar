import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, TextInput
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Add MaterialIcons

const Filter = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [bhkType, setBhkType] = useState(params.currentCategory || '');
  const [priceRange, setPriceRange] = useState({
    min: params.currentMinPrice || '',
    max: params.currentMaxPrice || ''
  });
  const [location, setLocation] = useState(params.currentLocation || '');

  const bhkTypes = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "More"];

  const handleApplyFilter = () => {
    const filters = {
      category: bhkType,
      location: location.trim(), // Trim any whitespace
      priceRange: {
        min: parseInt(priceRange.min) || 0,
        max: parseInt(priceRange.max) || Number.MAX_SAFE_INTEGER
      }
    };

    router.back();
    if (params.onApplyFilter) {
      const onApplyFilter = JSON.parse(params.onApplyFilter);
      onApplyFilter(filters);
    }
  };

  const icons = {
    back: <Ionicons name="arrow-back" size={24} color="#333" />,
    location: <Ionicons name="location-outline" size={24} color="#666" />,
    home: <Ionicons name="home-outline" size={24} color="#666" />,
    business: <MaterialIcons name="business" size={24} color="#666" />
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          {icons.back}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter Properties</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Location Filter - Now a TextInput */}
        <Text style={styles.sectionTitle}>Location</Text>
        <TextInput
          style={styles.locationInput}
          placeholder="Enter location (e.g., Mumbai, Andheri, etc.)"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#999"
        />

        {/* BHK Type Filter */}
        <Text style={styles.sectionTitle}>BHK Type</Text>
        <View style={styles.optionsContainer}>
          {bhkTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                bhkType === type && styles.selectedOption
              ]}
              onPress={() => setBhkType(type)}
            >
              <Text style={bhkType === type ? styles.selectedText : styles.optionText}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Range Filter */}
        <Text style={styles.sectionTitle}>Price Range</Text>
        <View style={styles.priceContainer}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min Price"
            keyboardType="numeric"
            value={priceRange.min.toString()}
            onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: text }))}
          />
          <Text style={styles.toText}>to</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max Price"
            keyboardType="numeric"
            value={priceRange.max.toString()}
            onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: text }))}
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16
  },
  content: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedOption: {
    backgroundColor: '#6A5AE0',
    borderColor: '#6A5AE0'
  },
  optionText: {
    color: '#666'
  },
  selectedText: {
    color: '#fff'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10
  },
  toText: {
    marginHorizontal: 10
  },
  applyButton: {
    backgroundColor: '#6A5AE0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16
  },
});

export default Filter;

