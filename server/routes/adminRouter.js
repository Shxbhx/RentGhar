import PropertyModel from "../models/productModel.js";
import express from "express";
import bodyParser from 'body-parser';

const router = express.Router();

// Update router-specific body-parser configuration
router.use(bodyParser.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).send('Invalid JSON');
      throw new Error('Invalid JSON');
    }
  }
}));

router.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));

export const getProperty = async (req, res) => {
  try {
    const properties = await PropertyModel.find();
    res.json(properties); // Send the response once
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

export const addProperty = async (req, res) => {
  try {
    const {
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
      images 
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Process and validate images
    let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images.filter(img => img && img.base64).map(img => ({
        path: img.base64.startsWith('data:image') 
          ? img.base64 
          : `data:image/jpeg;base64,${img.base64}`,
        contentType: 'image/jpeg'
      }));

      if (processedImages.length === 0) {
        return res.status(400).json({ message: "At least one valid image is required" });
      }
    }

    // Create new property
    const property = new PropertyModel({
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
      images: processedImages
    });

    // Save the property
    const savedProperty = await property.save();
    console.log("Property saved with images:", savedProperty.images.length);
    
    res.status(201).json({ 
      message: "Property added successfully", 
      property: savedProperty 
    });

  } catch (error) {
    console.error("Error saving property:", error);
    res.status(500).json({ 
      message: "Error adding property", 
      error: error.message 
    });
  }
};

export const idProperty = async (req, res) => {
  try {
    const property = await PropertyModel.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a property by ID
export const editProperty = async (req, res) => {
   try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Received update data:', updateData);

    // Validate the property exists
    const property = await PropertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Handle image updates
    if (updateData.images && Array.isArray(updateData.images)) {
      // Process both existing images and new images
      const processedImages = updateData.images
        .filter(img => img && (img.path || img.base64)) // Filter out invalid images
        .map(img => {
          if (img.path && !img.base64) {
            // Existing image, keep as is
            return {
              path: img.path,
              contentType: img.contentType || 'image/jpeg'
            };
          } else {
            // New image with base64
            return {
              path: img.base64.startsWith('data:image') 
                ? img.base64 
                : `data:image/jpeg;base64,${img.base64}`,
              contentType: 'image/jpeg'
            };
          }
        });

      console.log(`Processing ${processedImages.length} images`);
      updateData.images = processedImages;
    }

    // Update the property
    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Updated property:', {
      id: updatedProperty._id,
      imageCount: updatedProperty.images?.length
    });

    res.status(200).json({
      message: 'Property updated successfully',
      property: updatedProperty
    });

  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      message: 'Failed to update property',
      error: error.message
    });
  }
};

// Delete a property by ID
export const deleteProperty = async (req, res) => {
  const { id } = req.params;
  await PropertyModel.findByIdAndDelete(id);
  res.status(200).json({ message: "Property deleted successfully" });
};

// Get properties by userId
export const getUserProperties = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const properties = await PropertyModel.find({ userId: userId });
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching user properties:", error);
    res.status(500).json({ 
      message: "Failed to fetch properties",
      error: error.message 
    });
  }
};

export const getProperties = async (req, res) => {
  try {
    const { type, category, minPrice, maxPrice, location } = req.query;
    const query = {};

    // Build query conditions
    if (type) query.type = type;
    if (category) query.category = category;
    
    // Dynamic location search - case insensitive and partial match
    if (location) {
      query.location = { 
        $regex: new RegExp(location.trim(), 'i') 
      };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Find properties with query
    const properties = await PropertyModel
      .find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    // Return appropriate response based on results
    if (properties.length === 0) {
      return res.status(200).json({
        message: 'No properties found for the given criteria',
        properties: [],
        total: 0
      });
    }

    res.status(200).json({
      message: 'Properties found successfully',
      properties,
      total: properties.length
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ 
      message: 'Failed to fetch properties',
      error: error.message 
    });
  }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await PropertyModel.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Define routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.get('/user/:userId', getUserProperties);
router.post('/add', addProperty);
router.put('/edit/:id', editProperty);
router.delete('/del/:id', deleteProperty);

export default router;
