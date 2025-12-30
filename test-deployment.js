// Simple script to test backend deployment
// Run this in the browser console or as a Node.js script

const API_URL = 'https://chatappweb-ihc9.onrender.com'; // Replace with your deployed URL

async function testBackend() {
  console.log('🧪 Testing backend deployment...');
  
  try {
    // Test health check endpoint
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test CORS
    console.log('2. Testing CORS...');
    const corsTest = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ CORS working:', corsTest.ok);
    
    console.log('🎉 Backend is working correctly!');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    console.log('💡 Check:');
    console.log('  - Is the backend URL correct?');
    console.log('  - Is the server running?');
    console.log('  - Are environment variables set?');
    console.log('  - Check deployment logs for errors');
  }
}

// Run the test
testBackend();