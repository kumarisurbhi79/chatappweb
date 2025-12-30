# SETUP INSTRUCTIONS - Chat App

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm या yarn

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Setup
Backend में `.env` file है, इसमें MongoDB connection string update करें:
```
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_here_change_this
PORT=5000
NODE_ENV=development
```

### 4. Start MongoDB
Local MongoDB start करें या MongoDB Atlas connection string use करें।

### 5. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
# या development के लिए: npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```

## Application URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features Available:
✅ User Registration/Login
✅ JWT Authentication
✅ Profile Picture Upload
✅ Real-time Chat with Socket.io
✅ Online/Offline Status
✅ Typing Indicators
✅ Responsive Design
✅ User Logout

## How to Use:
1. Open http://localhost:3000
2. Register नया account या login existing account से
3. Profile setup करें और photo upload करें
4. Chat page पर जाकर users list से किसी को select करें
5. Real-time messaging start करें!

## Troubleshooting:
- MongoDB connection error: MongoDB running check करें
- Port error: Port 3000 और 5000 available check करें
- Socket error: Backend running check करें

आपका complete MERN stack chat app ready है! 🎉