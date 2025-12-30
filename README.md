# 🚀 Real-time Chat Application - MERN Stack

A complete real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring Socket.IO for instant messaging.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Profile management with avatar upload
- Secure logout functionality
- Protected routes and API endpoints

### 💬 Real-time Chat Features
- **⚡ Instant Messaging** - Real-time message delivery using Socket.IO
- **🟢 Online Status** - Live online/offline user indicators
- **⌨️ Typing Indicators** - See when users are typing
- **📝 Message History** - Persistent chat history storage
- **📱 Recent Conversations** - Smart ordering with most recent chats on top
- **👥 Multi-user Support** - Handle multiple simultaneous conversations

### 🎨 Modern UI/UX
- Responsive design for all devices
- Clean and intuitive chat interface
- Message bubbles with sender identification
- Real-time connection status
- Search functionality for users
- 📱 Responsive Design

## Tech Stack

**Frontend:**
- React.js
- Socket.io-client
- CSS3

**Backend:**
- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT Authentication
- Multer (File Upload)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd chat-app
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

5. Start the application

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm start
```

The app will be running on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
chat-app/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Usage

1. Register a new account or login with existing credentials
2. Upload your profile picture
3. Start chatting with other users in real-time
4. Logout when you're done

## License

This project is licensed under the MIT License.