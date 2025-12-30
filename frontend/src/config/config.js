// Configuration for the application
const config = {
  // Backend API URL
  API_URL: process.env.REACT_APP_API_URL || 
           (process.env.NODE_ENV === 'production' 
             ? 'https://chatappweb-ihc9.onrender.com' 
             : 'http://localhost:5000'),
  
  // Socket server URL (same as API URL for this application)
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 
              (process.env.NODE_ENV === 'production' 
                ? 'https://chatappweb-ihc9.onrender.com' 
                : 'http://localhost:5000')
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Frontend Config:', config);
}

export default config;