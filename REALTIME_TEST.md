# Real-Time Chat Test Guide

## Testing Real-Time Functionality

### 1. Open Multiple Browsers/Tabs
- Open http://localhost:3000 in Chrome
- Open http://localhost:3000 in Firefox (या incognito mode में)

### 2. Create Two User Accounts
**User 1:**
- Username: user1
- Email: user1@test.com
- Password: password123

**User 2:**
- Username: user2
- Email: user2@test.com  
- Password: password123

### 3. Test Real-Time Features

#### ✅ Instant Messaging
1. Login से user1 (first browser में)
2. Login से user2 (second browser में)
3. User1 से user2 को message send करें
4. Message instantly दिखना चाहिए दूसरे browser में without refresh

#### ✅ Online/Offline Status
1. दोनों users online status दिखना चाहिए (green dot)
2. एक browser close करें
3. दूसरे में user offline होना चाहिए (gray dot)

#### ✅ Typing Indicator
1. Message type करें (but send नहीं करें)
2. दूसरे user को typing indicator दिखना चाहिए
3. Type करना बंद करें तो typing indicator गायब हो जाना चाहिए

#### ✅ Message Delivery Status
1. Message send करें
2. Console में देखें: "Message delivered" या "User offline" status
3. Database में भी save होना चाहिए

### 4. Console Logs देखें
F12 → Console में:
- ✅ Connected to chat server
- 📨 Message received
- 🟢 User came online  
- 🔴 User went offline
- 💾 Message saved to database

### 5. Connection Recovery Test
1. Backend server stop करें (Ctrl+C)
2. Frontend में disconnect message दिखेगा
3. Backend restart करें
4. Automatically reconnect होना चाहिए

## Expected Real-Time Features:
- ⚡ Instant message delivery
- 🟢 Live online/offline status
- ⌨️ Typing indicators  
- 🔄 Auto-reconnection
- 📱 Mobile responsive
- 🔊 Message notifications (console)