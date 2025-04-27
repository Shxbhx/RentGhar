# RentGhar - Property Rental Application

RentGhar is a comprehensive mobile application built with React Native and Expo, designed to help users find and list rental properties. The application features an intuitive interface, advanced filtering capabilities, and real-time property updates.

## Features

- **Property Search**: Advanced search with multiple filters
  - Location-based search
  - Property type filtering (Residential, Commercial, Mixed-Use)
  - BHK type filtering
  - Price range filtering

- **User Authentication**
  - Secure login and registration
  - Profile management
  - Authentication state persistence

- **Property Management**
  - Property listing with multiple images
  - Detailed property information
  - Real-time property updates
  - Property status tracking

- **Interactive UI**
  - Modern and responsive design
  - Pull-to-refresh functionality
  - Loading states and error handling
  - Image carousel for property photos

## Tech Stack

- **Frontend**
  - React Native
  - Expo Router
  - Axios for API calls
  - AsyncStorage for local storage
  - React Navigation

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose ODM

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Shxbhx/RentGhar.git
```

2. Install dependencies for the frontend:
```bash
cd shubhamhome
npm install
```

3. Install dependencies for the backend:
```bash
cd ../server
npm install
```

4. Set up environment variables:
Create `.env` file in the server directory with:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000
```

5. Start the development servers:

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd shubhamhome
npx expo start
```
