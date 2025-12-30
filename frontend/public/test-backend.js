// Test backend connectivity
// Open browser console and run: testBackend()

window.testBackend = async function() {
  const API_URL = 'https://chatappweb-ihc9.onrender.com';
  
  console.log('🔍 Testing backend connectivity...');
  
  try {
    // Test basic connectivity
    console.log('📡 Testing basic connectivity...');
    const basicResponse = await fetch(API_URL, { 
      mode: 'no-cors',
      method: 'GET'
    });
    console.log('✅ Basic connectivity works');
    
    // Test API endpoint
    console.log('📡 Testing API endpoint...');
    const apiResponse = await fetch(`${API_URL}/api/auth/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (apiResponse.ok) {
      const data = await apiResponse.text();
      console.log('✅ API endpoint works:', data);
    } else {
      console.log('❌ API endpoint returned:', apiResponse.status, apiResponse.statusText);
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('💡 This appears to be a CORS issue. The backend needs to be configured to allow requests from localhost:3000');
    } else if (error.message.includes('NetworkError')) {
      console.log('💡 This appears to be a network connectivity issue. The backend server might be down or sleeping.');
    }
  }
};

console.log('🛠️ Backend test function loaded. Run testBackend() in console to test connectivity.');