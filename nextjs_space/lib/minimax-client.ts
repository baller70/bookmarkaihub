/**
 * Minimax AI API Client
 * Handles all LLM requests using Minimax's official API format
 * Documentation: https://platform.minimax.io/docs/api-reference/text-post
 */

export interface MinimaxMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  name?: string
}

export interface MinimaxRequest {
  model: string
  messages: MinimaxMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
}

export interface MinimaxResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Send a chat completion request to Minimax API using official format
 * @param prompt - The user message/prompt
 * @param options - Optional configuration (model, maxTokens, temperature)
 * @returns The AI-generated response text
 */
export async function sendMinimaxRequest(
  prompt: string,
  options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY
  // Use the official Minimax API endpoint
  const apiEndpoint = process.env.MINIMAX_API_ENDPOINT || 'https://api.minimax.io/v1/text/chatcompletion_v2'

  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY is not configured')
  }

  // Use official Minimax request format
  const requestBody: MinimaxRequest = {
    model: options.model || 'MiniMax-Text-01', // Use official model name
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: options.maxTokens || 1024,
    temperature: options.temperature !== undefined ? options.temperature : 0.7,
    top_p: 0.95,
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Minimax API error:', response.status, errorText)
      throw new Error(`Minimax API request failed: ${response.status} ${errorText}`)
    }

    const data: MinimaxResponse = await response.json()

    // Use official response format: choices[0].message.content
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Minimax API')
    }

    const assistantMessage = data.choices[0]?.message?.content
    if (!assistantMessage) {
      throw new Error('No content in Minimax response')
    }

    return assistantMessage
  } catch (error) {
    console.error('Error calling Minimax API:', error)
    throw error
  }
}
