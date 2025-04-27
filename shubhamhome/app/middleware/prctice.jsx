// Admin.jsx on screens file
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
//import { launchImageLibrary } from "react-native-image-picker";
//import ImagePicker from "react-native-image-crop-picker";

const AdminPanel = () => {
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

  const toggleSelection = (item, selectedList, setSelectedList) => {
    setSelectedList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Submit Data
  const handleSubmit = async () => {
    if (!title || !price || !location || !category || !type) {
      Alert.alert("Error", "Please fill all fields ");
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
      };
      console.log(propertyData);

      let response = await axios.post(
        "http://192.168.154.67:3000/admin/add",
        propertyData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      setItems([...items, response.data]);
      Alert.alert("Success", "Property added successfully!");
      setTitle("");
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
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add property"
      );
    }
  };
  // const onGallery = () => {
  //   ImagePicker.openPicker({
  //     width: 300,
  //     height: 400,
  //     cropping: true,
  //   }).then((image) => {
  //     console.log(image);
  //     setImage(image.path);
  //   });
  // }

  // const uploadImage = async () => {
  //   if (!image) {
  //       Alert.alert('No image selected', 'Please select an image first.');
  //       return;
  //   }

  //   // Create a FormData object
  //   const formData = new FormData();
  //   formData.append('image', {
  //       uri: image,
  //       name: 'photo.jpg',
  //       type: 'image/jpeg',
  //   });

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

      {/* Image Upload // onPress={onGallery} //onPress={uploadImage}*/}
      {/* <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="Upload image" />   
        {image &&
          <Image
            source={{ uri: image }}
            style={{ width: 200, height: 200, marginTop: 20 }}
          />
        }
        <Button title="Upload Image"  />
      </View> */}

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
        placeholder="Write about the property..."
        value={keyFeatures}
        onChangeText={setKeyFeatures}
        multiline
      />

      {/* Specifications */}
      <Text style={styles.subtitle}>Specifications</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="List property specifications..."
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
});

export default AdminPanel;