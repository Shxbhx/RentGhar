import express from 'express';
import User from '../models/userModel.js';
import Property from '../models/productModel.js';


export const idUser= async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('savedProperties'); // Populate saved properties
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const addUser = async(req, res) => {
    const {name, email, password, number, address} = req.body;
    try {
        // Validate required fields
        if (!name || !email || !password || !number || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate phone number
        if (!/^[0-9]{10}$/.test(number)) {
            return res.status(400).json({ message: "Please enter valid 10 digit number" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ 
            name, 
            email, 
            password,
            number,
            address
        });
        
        await newUser.save();
        
        res.status(201).json({ 
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                number: newUser.number,
                address: newUser.address
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration Failed" });
    }
}

export const getUser=async(req,res)=>{
    try{
        const users=await User.find();
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({error:error.message});
    }
}

export const editUser = async(req, res) => {
    const {id} = req.params;
    const {name, email, number, password, address} = req.body;
    try {
        // Validate phone number if provided
        if (number && !/^[0-9]{10}$/.test(number)) {
            return res.status(400).json({ message: "Please enter valid 10 digit number" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {name, email, number, password, address},
            {new: true}
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({error: error.message});
    }
}

export const deleteUser=async(req,res)=>{
    const {id}=req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({message:"User deleted successfully"});
}

// Save property (renamed from saveProperty to addSavedProperty)
export const addSavedProperty = async (req, res) => {
    const { userId, propertyId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.savedProperties.includes(propertyId)) {
            return res.status(400).json({ message: "Property already saved" });
        }

        user.savedProperties.push(propertyId);
        await user.save();
        res.status(200).json({ message: "Property saved successfully" });
    } catch (error) {
        console.error("Error saving property:", error);
        res.status(500).json({ message: "Failed to save property" });
    }
};

// Remove saved property
export const removeSavedProperty = async (req, res) => {
    const { userId, propertyId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.savedProperties = user.savedProperties.filter(
            id => id.toString() !== propertyId
        );
        await user.save();
        res.status(200).json({ message: "Property removed successfully" });
    } catch (error) {
        console.error("Error removing property:", error);
        res.status(500).json({ 
            message: "Failed to remove property", 
            error: error.message 
        });
    }
};

// Get saved properties
export const getSavedProperties = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate('savedProperties'); // Populate the saved properties
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.savedProperties);
    } catch (error) {
        console.error("Error getting saved properties:", error);
        res.status(500).json({ message: "Failed to get saved properties", error: error.message });
    }
};


const router = express.Router();

router.get('/:id', idUser);
router.post('/', addUser);
router.put('/:id', editUser);
router.delete('/:id', deleteUser);
router.post('/:userId/saved/:propertyId', addSavedProperty);
router.delete('/:userId/saved/:propertyId', removeSavedProperty);
router.get('/:userId/saved', getSavedProperties);

export default router;
