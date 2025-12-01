/**
 * OpenAI API Client
 * Provides a client for interacting with the OpenAI API for chat completion requests.
 */

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenAIResponse {
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
 * Send a request to the OpenAI API
 * @param prompt - The user prompt to send
 * @param options - Optional configuration (model, maxTokens, temperature)
 * @returns The AI-generated response text
 */
export async function sendOpenAIRequest(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const requestBody: OpenAIRequest = {
    model: options.model || 'gpt-4o-mini',
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data: OpenAIResponse = await response.json();

    // Extract the assistant's message from the response
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}
