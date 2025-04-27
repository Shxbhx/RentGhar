import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { loginUser, logoutUser } from "./routes/authRouter.js";
import multer from "multer";
import Property from "./models/productModel.js";

import { getUser, addUser, editUser, deleteUser, idUser, addSavedProperty, removeSavedProperty, getSavedProperties } from "./routes/UserRouter.js";
import userRouter from './routes/UserRouter.js';
import { getProperty, addProperty, editProperty, deleteProperty, idProperty, getUserProperties } from "./routes/adminRouter.js";
import authRouter from './routes/authRouter.js';

const app = express();

// Increase payload size limits
app.use(bodyParser.json({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).send('Invalid JSON');
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(bodyParser.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 100000
}));

app.use("/uploads", express.static("uploads"));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(cookieParser());
app.use(express.static("public"));
dotenv.config();
connectDB();

const PORT = process.env.PORT || 3001;

// Create a new auth router
const adminRouter = express.Router();

// Mount the auth router
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/admin", adminRouter);

// Define auth routes
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get('/getUser',getUser);

// Route to fetch all users
userRouter.get('/', getUser);
userRouter.post('/add', addUser);
userRouter.put('/edit/:id', editUser);
userRouter.delete('/del/:id', deleteUser);
userRouter.get('/:id', idUser);

// Add saved property routes
userRouter.post('/:userId/saved/:propertyId', addSavedProperty);
userRouter.delete('/:userId/saved/:propertyId', removeSavedProperty);
userRouter.get('/:userId/saved', getSavedProperties);

// Configure diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Custom filename
  },
});

const upload = multer({ storage: storage });
// Route to fetch all admin products
adminRouter.post('/add', addProperty);
adminRouter.get('/', getProperty);
adminRouter.put('/edit/:id', editProperty);
adminRouter.delete('/del/:id', deleteProperty);
adminRouter.get('/:id', idProperty);

// Get all properties for a specific user
userRouter.get('/:userId/property', async (req, res) => {
  try {
      const { userId } = req.params;
      const properties = await Property.find({ userId }).populate('userId', 'name email address number');
      res.status(200).json(properties);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

// Add this route
app.get('/admin/user/:userId', getUserProperties);

app.get('/', function (req, res) {
  res.send("hello world")
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// User routes
app.get('/users/:id', idUser);
app.post('/users', addUser);
app.put('/users/:id', editUser);
app.delete('/users/:id', deleteUser);

// Saved properties routes
app.post('/users/:userId/saved/:propertyId', addSavedProperty);
app.delete('/users/:userId/saved/:propertyId', removeSavedProperty);
app.get('/users/:userId/saved', getSavedProperties);

export default app;

