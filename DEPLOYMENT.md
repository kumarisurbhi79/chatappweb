# Deployment Setup Guide

## Backend Deployment (Render/Heroku)

### 1. Environment Variables
Set these environment variables in your deployment platform:

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
FRONTEND_URL=https://your-frontend-app.netlify.app
NODE_ENV=production
PORT=5000
```

### 2. MongoDB Atlas Configuration
- Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) for deployment
- Or add your deployment platform's IP addresses to the whitelist
- Use a strong password for your database user

### 3. For Render Deployment
1. Connect your GitHub repository
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Add all environment variables in the Environment section

### 4. For Heroku Deployment
1. Create a new Heroku app
2. Add environment variables using `heroku config:set`
3. Deploy using Git or GitHub integration

## Frontend Deployment (Netlify/Vercel)

### 1. Update Frontend Configuration
Make sure your frontend is configured to use the deployed backend URL:

In `frontend/src/config/config.js`:
```javascript
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://your-backend-app.render.com',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'https://your-backend-app.render.com'
};
```

### 2. Set Environment Variables
For Netlify/Vercel, set:
```
REACT_APP_API_URL=https://your-backend-app.render.com
REACT_APP_SOCKET_URL=https://your-backend-app.render.com
```

## Important Notes

1. **CORS Configuration**: The backend now automatically uses the FRONTEND_URL environment variable
2. **Socket.io**: Updated to work with production URLs
3. **Database**: Ensure MongoDB Atlas is properly configured for production
4. **HTTPS**: Most deployment platforms require HTTPS for WebSocket connections
5. **Error Handling**: Added proper error handling for missing environment variables

## Testing Deployment

1. Deploy backend first and test the API endpoints
2. Update frontend configuration with deployed backend URL
3. Deploy frontend and test the complete application
4. Test real-time chat functionality
5. Verify user authentication works correctly

## Troubleshooting

- Check deployment logs for any environment variable errors
- Ensure MongoDB connection string is correct
- Verify CORS settings match your frontend URL
- Test API endpoints manually using tools like Postman
- Check browser console for WebSocket connection errors