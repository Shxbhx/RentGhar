import mongoose from "mongoose";

// Property Schema
const PropertySchema = new mongoose.Schema({
    type: String,   // Apartment, Commercial, Residential
    title: String,
    price: String, // Price per month
    location: String,
    data: String, // Store base64 image as a string
    contentType: String, // Store image type (e.g., image/jpeg)
    category: String,
    images: [{
        path: {
            type: String,
            required: true
        },
        contentType: {
            type: String,
            default: 'image/jpeg'
        }
    }],
    kitchen: String,
    balcony: String,
    floor: String,
    bedroom: String,
    bathroom: String,
    sqft: String,
    keyFeatures: [String],  // List of key features
    specifications: String,
    amenities: [String],  // Garden, Power-Backup, Lift, Play area child
    nearby: [String] , // Garden, Temple, School, Market, Station
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',
        required: true,
        index: true // Add index for better query performance
    },
    created: { type: Date, default: Date.now }
}, {
    timestamps: true
});


const PropertyModel = mongoose.model('property', PropertySchema);

export default PropertyModel;