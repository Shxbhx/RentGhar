import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, number, address } = req.body;

        // Validate required fields
        if (!name || !email || !password || !number || !address) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate phone number
        if (!/^[0-9]{10}$/.test(number)) {
            return res.status(400).json({ message: 'Please enter valid 10 digit number' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with phone number
        const user = new User({
            name,
            email,
            password: hashedPassword,
            number,  // Add phone number
            address,
            isadmin: 0
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            'your_jwt_secret',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                number: user.number, // Include number in response
                address: user.address
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login handler
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            'your_jwt_secret',
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

// Logout handler
const logoutUser = async (req, res) => {
    try {
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
};

// Routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace with actual secret
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Export both the router and the handlers
export { loginUser, logoutUser };
export default router;


