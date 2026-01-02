// Simple debug function to test chat functionality
// Add this to your browser console to debug

window.debugChat = {
  // Test if socket is connected
  testSocket: () => {
    console.log('Socket connected:', window.socketService?.isConnected);
    console.log('Socket object:', window.socketService?.socket);
  },
  
  // Test message sending
  testSendMessage: (message = "Test message") => {
    const event = new CustomEvent('debugSendMessage', {
      detail: { message }
    });
    window.dispatchEvent(event);
  },
  
  // Clear local storage
  clearAuth: () => {
    localStorage.clear();
    console.log('Auth cleared, please refresh and login again');
  },
  
  // Check current user
  checkUser: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('User:', user ? JSON.parse(user) : 'Missing');
  }
};

console.log('Debug tools loaded. Use window.debugChat.* functions to test.');