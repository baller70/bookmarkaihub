require('dotenv').config();

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_API_ENDPOINT = process.env.MINIMAX_API_ENDPOINT || 'https://api.minimax.chat/v1/text/chatcompletion_v2';

console.log('Testing Minimax API...');
console.log('API Key exists:', !!MINIMAX_API_KEY);
console.log('API Endpoint:', MINIMAX_API_ENDPOINT);
console.log('API Key (first 50 chars):', MINIMAX_API_KEY ? MINIMAX_API_KEY.substring(0, 50) : 'NOT SET');

const testPrompt = `Given this bookmark:
Title: Google Drive
URL: https://drive.google.com

Generate:
1. A concise 1-2 sentence description (max 150 characters)
2. 3-5 relevant tags (comma-separated, lowercase, single words or short phrases)

Format your response EXACTLY like this:
DESCRIPTION: [your description here]
TAGS: tag1, tag2, tag3, tag4, tag5`;

const requestBody = {
  model: 'abab6.5s-chat',
  messages: [
    {
      sender_type: 'USER',
      sender_name: 'User',
      text: testPrompt,
    },
  ],
  tokens_to_generate: 200,
  temperature: 0.7,
  top_p: 0.95,
};

fetch(MINIMAX_API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${MINIMAX_API_KEY}`,
  },
  body: JSON.stringify(requestBody),
})
  .then(response => {
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    return response.text();
  })
  .then(text => {
    console.log('\nResponse body:', text);
    try {
      const data = JSON.parse(text);
      console.log('\nParsed JSON:', JSON.stringify(data, null, 2));
      
      if (data.choices && data.choices[0] && data.choices[0].messages) {
        const botMessage = data.choices[0].messages.find(m => m.sender_type === 'BOT');
        if (botMessage) {
          console.log('\n✅ SUCCESS! Bot response:', botMessage.text);
        }
      }
    } catch (e) {
      console.error('\n❌ Failed to parse JSON:', e.message);
    }
  })
  .catch(error => {
    console.error('\n❌ API call failed:', error.message);
  });
