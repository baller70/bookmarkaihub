const fetch = require('node-fetch');

async function testAbacusAI() {
  const apiKey = "55c4881ab1f3449f809a292cf79b04b5";
  const apiEndpoint = "https://apps.abacus.ai";

  const requestBody = {
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: 'Say hello in one sentence.',
      },
    ],
    max_tokens: 50,
    temperature: 0.7,
  };

  try {
    console.log('Testing Abacus AI API...');
    console.log('Endpoint:', `${apiEndpoint}/v1/chat/completions`);
    console.log('API Key (first 20 chars):', apiKey.substring(0, 20) + '...');

    const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('\n✅ SUCCESS!');
    console.log('Response:', JSON.stringify(data, null, 2));

    const content = data.choices?.[0]?.message?.content;
    if (content) {
      console.log('\n📝 AI Response:', content);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

testAbacusAI();
