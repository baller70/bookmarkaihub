/**
 * Abacus AI API Client
 * Provides a client for interacting with the Abacus AI API for chat completion requests.
 */

export interface AbacusAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AbacusAIRequest {
  model: string;
  messages: AbacusAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface AbacusAIResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a request to the Abacus AI API
 * @param prompt - The user prompt to send
 * @param options - Optional configuration (model, maxTokens, temperature)
 * @returns The AI-generated response text
 */
export async function sendAbacusAIRequest(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const apiKey = process.env.ABACUSAI_API_KEY;
  const apiEndpoint = process.env.ABACUSAI_API_ENDPOINT || 'https://api.abacus.ai';

  if (!apiKey) {
    throw new Error('ABACUSAI_API_KEY is not configured');
  }

  const requestBody: AbacusAIRequest = {
    model: options.model || 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: options.maxTokens || 1000,
    temperature: options.temperature ?? 0.7,
  };

  try {
    const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Abacus AI API error: ${response.status} - ${errorText}`);
    }

    const data: AbacusAIResponse = await response.json();

    // Extract the assistant's message from the response
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Abacus AI');
    }

    return content;
  } catch (error) {
    console.error('Error calling Abacus AI:', error);
    throw error;
  }
}
