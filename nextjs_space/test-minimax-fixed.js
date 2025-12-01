require('dotenv').config();
const { sendMinimaxRequest } = require('./lib/minimax-client.ts');

console.log('Testing FIXED Minimax API with official format...\n');
console.log('API Key (first 50 chars):', process.env.MINIMAX_API_KEY ? process.env.MINIMAX_API_KEY.substring(0, 50) : 'NOT SET');
console.log('API Endpoint:', process.env.MINIMAX_API_ENDPOINT);

// Test with the correct format
const testRequest = async () => {
  try {
    console.log('\n🔄 Sending test request to Minimax...');
    const response = await sendMinimaxRequest('Hello! Please respond with a short greeting.');
    console.log('\n✅ SUCCESS! Minimax API is working!');
    console.log('Response:', response);
  } catch (error) {
    console.log('\n❌ FAILED');
    console.error('Error:', error.message);
  }
};

testRequest();
