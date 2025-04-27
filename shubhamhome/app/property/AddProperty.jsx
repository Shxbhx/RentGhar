import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { useAuth } from "../authContext";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { showAlert } from '../../utils/alert';

const AddProperty = () => {
  const { userId } = useAuth();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [items, setItems] = useState([]);

  // Additional Property Fields
  const [bedroom, setBedroom] = useState("");
  const [bathroom, setBathroom] = useState("");
  const [kitchen, setKitchen] = useState("");
  const [floor, setFloor] = useState("");
  const [balcony, setBalcony] = useState("");
  const [sqft, setSqft] = useState("");

  // Category Selection
  const [category, setCategory] = useState("");
  const categoryOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "More..."];

  // Property Type Selection
  const [type, setType] = useState("");
  const propertyTypeOptions = [
    "Residential",
    "Commercial",
    "Mixed-Use Property",
  ];

  // Checkboxes
  const [amenities, setAmenities] = useState([]);
  const amenitiesList = [
    "Garden",
    "Power Backup",
    "Lift",
    "Play Area",
    "Gym",
    "Swimming Pool",
  ];

  const [nearby, setNearby] = useState([]);
  const nearbyList = [
    "Garden",
    "Temple",
    "School",
    "Market",
    "Station",
    "Hospital",
  ];

  const [images, setImages] = useState([]);

  const toggleSelection = (item, selectedList, setSelectedList) => {
    setSelectedList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const processImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 1024, height: 1024 } },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true
        }
      );
      return {
        uri: manipResult.uri,
        base64: manipResult.base64
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return null;
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsMultipleSelection: true,
        quality: 1, // Get full quality, we'll compress after
        selectionLimit: 5
      });

      if (!result.canceled) {
        const processedImages = await Promise.all(
          result.assets.map(asset => processImage(asset.uri))
        );
        setImages(processedImages.filter(img => img !== null));
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  // Submit Data
  const handleSubmit = async () => {
    if (!title || !price || !location || !category || !type || images.length === 0) {
      showAlert(
        "Error", 
        "Please fill all fields and add at least one image"
      );
      return;
    }

    if (!userId) {
      showAlert("Error", "User not authenticated");
      return;
    }

    try {
      const propertyData = {
        title,
        price,
        location,
        category,
        type,
        keyFeatures,
        specifications,
        bedroom,
        bathroom,
        kitchen,
        floor,
        balcony,
        sqft,
        amenities,
        nearby,
        userId,
        images: images.map(img => ({
          base64: img.base64
        }))
      };

      console.log("Submitting property with images:", images.length);

      const response = await axios.post(
        "http://192.168.154.67:3000/admin/add",
        propertyData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log("Response:", response.data);
      showAlert("Success", "Property added successfully!");
      // Reset form
      setTitle("");
      setImages([]);
      setKeyFeatures("");
      setPrice("");
      setLocation("");
      setCategory("");
      setType("");
      setBedroom("");
      setBathroom("");
      setKitchen("");
      setFloor("");
      setBalcony("");
      setSqft("");
      setSpecifications("");
      setAmenities([]);
      setNearby([]);
    } catch (error) {
      console.error("Error:", error);
      showAlert("Error", "Failed to add property");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Property Form</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (per month)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.subtitle}>Property Images</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
        <Text style={styles.uploadButtonText}>Add Images (Max 5)</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((img, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image source={{ uri: img.uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImages(images.filter((_, i) => i !== index))}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Category Selection */}
      <Text style={styles.subtitle}>Category</Text>
      <View style={styles.selectionContainer}>
        {categoryOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.selectionButton,
              category === item && styles.selected,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Property Type Selection */}
      <Text style={styles.subtitle}>Property Type</Text>
      <View style={styles.selectionContainer}>
        {propertyTypeOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.selectionButton, type === item && styles.selected]}
            onPress={() => setType(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Additional Property Fields */}
      <Text style={styles.subtitle}>Property Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Bedrooms"
        value={bedroom}
        onChangeText={setBedroom}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Bathrooms"
        value={bathroom}
        onChangeText={setBathroom}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Kitchen"
        value={kitchen}
        onChangeText={setKitchen}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Floor"
        value={floor}
        onChangeText={setFloor}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Balcony"
        value={balcony}
        onChangeText={setBalcony}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Area (Sqft)"
        value={sqft}
        onChangeText={setSqft}
        keyboardType="numeric"
      />

      {/* Description */}
      <Text style={styles.subtitle}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write about the property as much as possible..."
        value={keyFeatures}
        onChangeText={setKeyFeatures}
        multiline
      />

      {/* Specifications */}
      <Text style={styles.subtitle}>Specifications</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="List property specifications as much possible......"
        value={specifications}
        onChangeText={setSpecifications}
        multiline
      />

      {/* Amenities Checkboxes */}
      <Text style={styles.subtitle}>Amenities</Text>
      <View style={styles.checkboxContainer}>
        {amenitiesList.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.checkboxItem}
            onPress={() => toggleSelection(item, amenities, setAmenities)}
          >
            <View
              style={[
                styles.checkbox,
                amenities.includes(item) && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.checkboxLabel}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nearby Features Checkboxes */}
      <Text style={styles.subtitle}>Nearby Features</Text>
      <View style={styles.checkboxContainer}>
        {nearbyList.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.checkboxItem}
            onPress={() => toggleSelection(item, nearby, setNearby)}
          >
            <View
              style={[
                styles.checkbox,
                nearby.includes(item) && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.checkboxLabel}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginBottom: 30 }}>
        <Button
          style={styles.subtitle}
          title="ADD Property"
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: "top" },
  selectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  selectionButton: {
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  selected: { backgroundColor: "#add8e6" },
  checkboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#6A5AE0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AddProperty;