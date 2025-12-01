require('dotenv').config();

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

console.log('Testing Minimax API with different endpoints...');
console.log('API Key (first 50 chars):', MINIMAX_API_KEY ? MINIMAX_API_KEY.substring(0, 50) : 'NOT SET');

// Try the text/chatcompletion endpoint (v1)
const testEndpoint1 = 'https://api.minimax.chat/v1/text/chatcompletion';

// Try the chatcompletion_v2 endpoint
const testEndpoint2 = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

// Try with different request formats
const requestBody1 = {
  model: 'abab6.5s-chat',
  messages: [
    {
      sender_type: 'USER',
      sender_name: 'User',
      text: 'Hello, test message'
    }
  ],
  tokens_to_generate: 50,
  temperature: 0.7
};

const requestBody2 = {
  model: 'abab6.5-chat',
  messages: [
    { role: 'user', content: 'Hello, test message' }
  ],
  max_tokens: 50,
  temperature: 0.7
};

async function testEndpoint(url, body, name) {
  console.log('\n=== Testing:', name, '===');
  console.log('URL:', url);
  console.log('Body:', JSON.stringify(body, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    try {
      const json = JSON.parse(text);
      if (json.base_resp && json.base_resp.status_code !== 1000) {
        console.log('❌ Error:', json.base_resp.status_msg);
      } else if (json.choices) {
        console.log('✅ SUCCESS!');
      }
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

(async () => {
  await testEndpoint(testEndpoint1, requestBody1, 'v1/chatcompletion with sender_type format');
  await testEndpoint(testEndpoint2, requestBody1, 'v2/chatcompletion with sender_type format');
  await testEndpoint(testEndpoint1, requestBody2, 'v1/chatcompletion with role format');
  await testEndpoint(testEndpoint2, requestBody2, 'v2/chatcompletion with role format');
})();
