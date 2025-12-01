/**
 * Minimax AI API Client
 * Handles all LLM requests using Minimax's API
 */

export interface MinimaxMessage {
  sender_type: 'USER' | 'BOT'
  sender_name: string
  text: string
}

export interface MinimaxRequest {
  model?: string
  messages: MinimaxMessage[]
  tokens_to_generate?: number
  temperature?: number
  top_p?: number
}

export interface MinimaxResponse {
  choices: Array<{
    messages: Array<{
      sender_type: string
      text: string
    }>
  }>
  usage?: {
    total_tokens: number
  }
}

/**
 * Send a chat completion request to Minimax API
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
  const apiEndpoint = process.env.MINIMAX_API_ENDPOINT || 'https://api.minimax.chat/v1/text/chatcompletion_v2'

  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY is not configured')
  }

  const requestBody: MinimaxRequest = {
    model: options.model || 'abab6.5s-chat',
    messages: [
      {
        sender_type: 'USER',
        sender_name: 'User',
        text: prompt,
      },
    ],
    tokens_to_generate: options.maxTokens || 1024,
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

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Minimax API')
    }

    const botMessage = data.choices[0].messages.find((m) => m.sender_type === 'BOT')
    if (!botMessage) {
      throw new Error('No bot message in Minimax response')
    }

    return botMessage.text
  } catch (error) {
    console.error('Error calling Minimax API:', error)
    throw error
  }
}
